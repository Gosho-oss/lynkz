import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Loader2, Save } from "lucide-react";
import type { User } from "@shared/schema";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  user: User;
  onUpdate: () => Promise<void>;
}

export default function ProfileEditor({ user, onUpdate }: ProfileEditorProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const token = await getToken();
      return apiRequest("PATCH", "/api/users/me", data);
    },
    onSuccess: async () => {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      await onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploadingAvatar(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been changed.",
      });
      await onUpdate();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a photo to personalize your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage 
                  src={avatarPreview || user.avatarUrl || undefined} 
                  alt={user.displayName || user.username} 
                />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {(user.displayName || user.username || "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-testid="input-avatar-upload"
              />
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                data-testid="button-change-avatar"
              >
                {isUploadingAvatar ? "Uploading..." : "Change Photo"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your display name and bio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="min-h-12"
                        data-testid="input-display-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell visitors a bit about yourself..."
                        className="resize-none h-24"
                        data-testid="input-bio"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground text-right">
                      {field.value?.length || 0}/500
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="min-h-10"
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile URL</CardTitle>
          <CardDescription>
            Share this link with your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`${window.location.origin}/u/${user.username}`}
              className="min-h-12 bg-muted font-mono text-sm"
              data-testid="input-profile-url"
            />
            <Button
              variant="secondary"
              className="min-h-12"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
                toast({
                  title: "Copied!",
                  description: "Profile link copied to clipboard.",
                });
              }}
              data-testid="button-copy-url"
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
