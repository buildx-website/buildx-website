"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { FaExclamationCircle, FaSpinner, FaExternalLinkAlt, FaSync } from "react-icons/fa";
import { ContainerPort } from "@/types/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface VideoPreviewProps {
  containerPort: ContainerPort[];
  height?: string;
  width?: string;
  outputVideoUrl: string | null;
}

export function VideoPreview({ containerPort, height, width, outputVideoUrl }: VideoPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<{ code: number; message: string; action?: string } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);


  useEffect(() => {
    if (containerPort.length > 0) {
      loadContent();
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 30;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const loadContent = async () => {
    const hostname = containerPort[0]["8000"];
    const url = `https://${hostname}${outputVideoUrl}`;

    try {
      setIsLoading(true);
      setError(null);
      setIframeSrc(url);

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      setIsLoading(false);
    } catch (err) {
      console.error("Error setting up preview:", err);
      setError({
        code: 500,
        message: "Error setting up preview. Please try again."
      });
      setIsLoading(false);
    }
  };

  const refresh = () => {
    loadContent();
  };

  const handleIframeError = () => {
    setError({
      code: 503,
      message: "The site might not be accessible over HTTPS. Try opening it in a new window.",
      action: "open_new_window"
    });
  };

  const openInNewTab = () => {
    if (!iframeSrc) return;
    window.open(iframeSrc, '_blank');
  };

  return (
    <div
      className="flex flex-col border border-border rounded-lg overflow-hidden bg-background"
      style={{ height, width }}
    >
      <div className="flex flex-col border-b border-border bg-black/40">
        <div className="h-[2px] w-full bg-transparent">
          {loadingProgress > 0 && (
            <div 
              className="h-full bg-blue-500 transition-all duration-200 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          )}
        </div>

        <div className="flex justify-between p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              className="h-8 w-8 relative"
            >
              <FaSync className={`h-4 w-4 transition-transform duration-300 ${isLoading ? 'hidden' : ''}`} />
              <FaSpinner className={`h-4 w-4 absolute ${isLoading ? 'block animate-spin' : 'hidden'}`} />
            </Button>

            {/* Add the external link button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openInNewTab}
              disabled={!iframeSrc}
              className="h-8 w-8 ml-1"
              title="Open in new tab"
            >
              <FaExternalLinkAlt className="h-4 w-4" />
            </Button>

        </div>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden">
          <>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full p-6">
                <Alert variant="destructive" className="max-w-md">
                  <FaExclamationCircle className="h-4 w-4" />
                  <AlertTitle>Error {error.code}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                  {error.code === 503 && (
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
                        <FaSync className="h-4 w-4" /> Retry Connection
                      </Button>
                      {error.action === "open_new_window" && (
                        <Button variant="outline" size="sm" onClick={openInNewTab} className="ml-2 gap-2">
                          <FaExternalLinkAlt className="h-4 w-4" /> Open in New Window
                        </Button>
                      )}
                    </div>
                  )}
                </Alert>
              </div>
            )}

            {!isLoading && !error && iframeSrc && (
              <iframe
                src={iframeSrc}
                className="w-full h-full border-0"
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-forms"
                title="Browser Preview"
              />
            )}

            {!isLoading && !error && !iframeSrc && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No content to display. Please select a port and navigate to a path.
                  Or check if the application is running.
                  <br />
                  <span className="text-sm text-gray-500">Tip: Refresh the page.</span>
                </p>
              </div>
            )}
          </>
      </div>
    </div>
  );
}