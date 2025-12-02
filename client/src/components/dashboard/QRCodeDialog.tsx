import { useState, useEffect } from "react";
import { QrCode, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QRCodeDialogProps {
  username: string;
}

export default function QRCodeDialog({ username }: QRCodeDialogProps) {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !qrCodeUrl) {
      fetchQRCode();
    }
  }, [open]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/qr/${username}`);
      if (!res.ok) throw new Error("Failed to generate QR code");
      const data = await res.json();
      setQrCodeUrl(data.qrCode);
      setProfileUrl(data.profileUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${username}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  const handleShare = async () => {
    if (navigator.share && profileUrl) {
      try {
        await navigator.share({
          title: `${username}'s Profile`,
          text: `Check out my profile on Lynkz!`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile QR Code</DialogTitle>
          <DialogDescription>
            Share your profile with a QR code
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {isLoading ? (
            <div className="w-64 h-64 flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">Generating...</p>
            </div>
          ) : qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <img 
                src={qrCodeUrl} 
                alt="Profile QR Code" 
                className="w-64 h-64"
              />
            </div>
          ) : null}
          
          {profileUrl && (
            <div className="w-full">
              <p className="text-sm text-muted-foreground text-center mb-2">
                Scan to visit
              </p>
              <div className="bg-muted px-3 py-2 rounded-md text-sm text-center break-all">
                {profileUrl}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
            disabled={!profileUrl}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            className="flex-1"
            onClick={handleDownload}
            disabled={!qrCodeUrl}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
