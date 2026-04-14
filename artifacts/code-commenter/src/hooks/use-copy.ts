import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCopy() {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback((text: string, description?: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: description || "The text has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch((err) => {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "An error occurred while copying to clipboard.",
      });
      console.error('Failed to copy text: ', err);
    });
  }, [toast]);

  return { isCopied, copyToClipboard };
}
