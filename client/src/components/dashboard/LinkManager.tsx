import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Plus, 
  GripVertical, 
  Pencil, 
  Trash2, 
  Loader2, 
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import type { Link as LinkType } from "@shared/schema";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  url: z.string().url("Please enter a valid URL"),
});

type LinkForm = z.infer<typeof linkSchema>;

interface LinkManagerProps {
  links: LinkType[];
  isLoading: boolean;
  onUpdate: () => void;
}

export default function LinkManager({ links, isLoading, onUpdate }: LinkManagerProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: { title: "", url: "" },
  });

  const editForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: { title: "", url: "" },
  });

  // Add link mutation
  const addLinkMutation = useMutation({
    mutationFn: async (data: LinkForm) => {
      return apiRequest("POST", "/api/links", {
        ...data,
        orderIndex: links.length,
      });
    },
    onSuccess: () => {
      toast({ title: "Link added", description: "Your new link is live." });
      addForm.reset();
      setIsAddDialogOpen(false);
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LinkType> }) => {
      return apiRequest("PATCH", `/api/links/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Link updated" });
      setEditingLink(null);
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Link deleted" });
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reorder links mutation
  const reorderLinksMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      return apiRequest("POST", "/api/links/reorder", { orderedIds });
    },
    onSuccess: () => {
      onUpdate();
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
  });

  const handleAddSubmit = (data: LinkForm) => {
    addLinkMutation.mutate(data);
  };

  const handleEditSubmit = (data: LinkForm) => {
    if (editingLink) {
      updateLinkMutation.mutate({ id: editingLink.id, data });
    }
  };

  const handleToggleActive = (link: LinkType) => {
    updateLinkMutation.mutate({ 
      id: link.id, 
      data: { isActive: !link.isActive } 
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteLinkMutation.mutate(id);
    }
  };

  const openEditDialog = (link: LinkType) => {
    setEditingLink(link);
    editForm.reset({ title: link.title, url: link.url });
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLinks = [...links];
    const draggedLink = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, draggedLink);

    // Update local state would go here if we had it
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      const orderedIds = links.map((l) => l.id);
      reorderLinksMutation.mutate(orderedIds);
    }
    setDraggedIndex(null);
  };

  // Sort links by orderIndex
  const sortedLinks = [...links].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Your Links</CardTitle>
            <CardDescription className="mt-1">
              Add and manage your links. Drag to reorder.
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-link">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Link</DialogTitle>
                <DialogDescription>
                  Add a link to your profile page.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Website"
                            className="min-h-12"
                            data-testid="input-link-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            className="min-h-12"
                            data-testid="input-link-url"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={addLinkMutation.isPending}
                      data-testid="button-save-link"
                    >
                      {addLinkMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Link"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : sortedLinks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-1">No links yet</p>
              <p className="text-sm">Add your first link to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLinks.map((link, index) => (
                <div
                  key={link.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover-elevate transition-all ${
                    draggedIndex === index ? "opacity-50" : ""
                  } ${!link.isActive ? "opacity-60" : ""}`}
                  data-testid={`link-item-${link.id}`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.isActive ?? false}
                      onCheckedChange={() => handleToggleActive(link)}
                      data-testid={`switch-link-active-${link.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(link)}
                      data-testid={`button-edit-link-${link.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-link-${link.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Link Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Update your link details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Website"
                        className="min-h-12"
                        data-testid="input-edit-link-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        className="min-h-12"
                        data-testid="input-edit-link-url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingLink(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateLinkMutation.isPending}
                  data-testid="button-update-link"
                >
                  {updateLinkMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
