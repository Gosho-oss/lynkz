import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link2, ArrowLeft, Loader2, Check, X } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and dashes"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const username = form.watch("username");
  const debouncedUsername = useDebounce(username, 500);

  // Check username availability
  const { data: usernameCheck, isLoading: checkingUsername } = useQuery<{ available: boolean }>({
    queryKey: ["/api/users/check-username", debouncedUsername],
    enabled: debouncedUsername.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(debouncedUsername),
  });

  const onSubmit = async (data: RegisterForm) => {
    if (usernameCheck && !usernameCheck.available) {
      form.setError("username", { message: "This username is already taken" });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail(data.email, data.password, data.username);
      toast({
        title: "Account created!",
        description: "Welcome to Lynkz. Let's set up your profile.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // After Google sign in, user might need to set username
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const showUsernameStatus = debouncedUsername.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(debouncedUsername);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-4 sm:px-8 h-16 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start sharing your links in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full min-h-12"
              onClick={handleGoogleSignIn}
              disabled={loading || isSubmitting}
              data-testid="button-google-signup"
            >
              <SiGoogle className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Email Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            data-testid="input-username"
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
                      <p className="text-xs text-muted-foreground">
                        Your profile will be at lynkz.io/u/{field.value || "yourname"}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="min-h-12"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          className="min-h-12"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          className="min-h-12"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full min-h-12"
                  disabled={loading || isSubmitting || (showUsernameStatus && !usernameCheck?.available)}
                  data-testid="button-register"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
            </Form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
