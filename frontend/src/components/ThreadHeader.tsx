import { useState } from "react";
import {
  Bookmark,
  BookOpen,
  Share2,
  Link2,
  Globe,
  Lock,
  Bell,
  BellOff,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ThreadHeaderProps {
  title: string;
  onToggleReferences: () => void;
  showReferences: boolean;
  onSave: () => void;
  onUnsave: () => void;
  isSaved: boolean;
}

const ThreadHeader = ({ title, onToggleReferences, showReferences, onSave, onUnsave, isSaved }: ThreadHeaderProps) => {
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [visibility, setVisibility] = useState("private");
  const [confirmUnsubOpen, setConfirmUnsubOpen] = useState(false);

  const handleSubscribeClick = () => {
    if (isSubscribed) {
      setConfirmUnsubOpen(true);
    } else {
      setIsSubscribed(true);
      toast.success("Subscribed");
    }
  };

  const confirmUnsubscribe = () => {
    setIsSubscribed(false);
    setConfirmUnsubOpen(false);
    toast.success("Unsubscribed");
  };

  const handleSave = () => {
    if (isSaved) {
      onUnsave();
      toast.success("Thread unsaved");
    } else {
      onSave();
      toast.success("Thread saved to Library");
    }
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied");
  };
  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex-1" />

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSubscribeClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isSubscribed
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  : "bg-transparent text-foreground border-border hover:bg-accent"
              }`}
            >
              {isSubscribed ? (
                <Bell className="w-3.5 h-3.5 fill-current" strokeWidth={2.5} />
              ) : (
                <Bell className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
              <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
            </button>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSave}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSaved
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  aria-label={isSaved ? "Saved" : "Save"}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                </button>
              </TooltipTrigger>
              <TooltipContent>{isSaved ? "Saved" : "Save"}</TooltipContent>
            </Tooltip>

            <button
              onClick={onToggleReferences}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                showReferences
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">References</span>
            </button>

            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <button
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Share</TooltipContent>
              </Tooltip>
              <PopoverContent align="end" className="w-56 p-3 space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Visibility</p>
                  <RadioGroup value={visibility} onValueChange={setVisibility} className="gap-2">
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="private" id="private" className="mt-0.5" />
                      <Label htmlFor="private" className="text-xs cursor-pointer">
                        <div className="flex items-center gap-1 text-foreground">
                          <Lock className="w-3 h-3" /> Private
                        </div>
                        <span className="text-muted-foreground">Only visible to you</span>
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem value="public" id="public" className="mt-0.5" />
                      <Label htmlFor="public" className="text-xs cursor-pointer">
                        <div className="flex items-center gap-1 text-foreground">
                          <Globe className="w-3 h-3" /> Public
                        </div>
                        <span className="text-muted-foreground">Visible to anyone with a link</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-t border-border pt-2 space-y-1">
                  <button
                    onClick={handleShareX}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share to X
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Copy thread link
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmUnsubOpen} onOpenChange={setConfirmUnsubOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsubscribe from this thread?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll stop receiving updates for this thread. You can subscribe again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnsubscribe}>Unsubscribe</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default ThreadHeader;
