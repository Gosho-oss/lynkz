import { useState } from "react";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AdminSwitcherProps {
  isAdmin: boolean;
  onAdminModeChange: (enabled: boolean, password: string) => void;
  isAdminMode: boolean;
}

export default function AdminSwitcher({ isAdmin, onAdminModeChange, isAdminMode }: AdminSwitcherProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAdmin) return null;

  const handleAdminToggle = () => {
    if (isAdminMode) {
      // Turn off admin mode
      onAdminModeChange(false, "");
    } else {
      // Show password dialog
      setShowDialog(true);
    }
  };

  const handleVerifyPassword = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.valid) {
        onAdminModeChange(true, password);
        setShowDialog(false);
        setPassword("");
        toast({
          title: "Admin Mode Enabled",
          description: "You now have access to admin features",
        });
      } else {
        toast({
          title: "Invalid Password",
          description: "The admin password you entered is incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify admin password",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <Button
        variant={isAdminMode ? "default" : "outline"}
        size="sm"
        onClick={handleAdminToggle}
        className={isAdminMode ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white" : ""}
      >
        <Crown className="w-4 h-4 mr-2" />
        {isAdminMode ? "Exit Admin Mode" : "Admin Mode"}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Enter Admin Password
            </DialogTitle>
            <DialogDescription>
              Please enter the admin password to access admin features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                placeholder="Enter admin password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyPassword} disabled={!password || isVerifying}>
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
