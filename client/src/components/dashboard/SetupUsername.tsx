import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Link2, Loader2, Check, X } from "lucide-react";
import type { FirebaseUser } from "@/lib/firebase";

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and dashes"),
});

type UsernameForm = z.infer<typeof usernameSchema>;

interface SetupUsernameProps {
  firebaseUser: FirebaseUser;
  onComplete: () => Promise<void>;
}

export default function SetupUsername({ firebaseUser, onComplete }: SetupUsernameProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UsernameForm>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const username = form.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  // Check username availability
  const { data: usernameCheck, isLoading: checkingUsername } = useQuery<{ available: boolean }>({
    queryKey: ["/api/users/check-username", debouncedUsername],
    enabled: debouncedUsername.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(debouncedUsername),
  });

  const onSubmit = async (data: UsernameForm) => {
    if (usernameCheck && !usernameCheck.available) {
      form.setError("username", { message: "This username is already taken" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          username: data.username,
          displayName: firebaseUser.displayName || data.username,
          avatarUrl: firebaseUser.photoURL,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "Welcome to Lynkz!",
          description: "Your account is ready. Let's set up your profile.",
        });
        await onComplete();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create account");
      }
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const showUsernameStatus = debouncedUsername.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(debouncedUsername);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Choose your username</CardTitle>
          <CardDescription>
            This will be your unique profile URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="yourname"
                          className="min-h-12 pr-10"
                          data-testid="input-setup-username"
                          {...field}
                        />
                        {showUsernameStatus && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {checkingUsername ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : usernameCheck?.available ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Your profile will be at <span className="font-medium">lynkz.io/u/{field.value || "yourname"}</span>
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full min-h-12"
                disabled={isSubmitting || (showUsernameStatus && !usernameCheck?.available)}
                data-testid="button-setup-continue"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
