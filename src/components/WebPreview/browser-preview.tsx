"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { AlertCircle, ArrowLeft, ArrowRight, Loader, RefreshCw, Lock, Globe, ExternalLink } from "lucide-react";
import { Input } from "../ui/input";
import { SelectPort } from "./select-port";
import { ContainerPort } from "@/types/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { BuildLoader } from "./build-loader";

interface BrowserPreviewProps {
  containerPort: ContainerPort[];
  height?: string;
  width?: string;
  building?: boolean;
}

export function BrowserPreview({ containerPort, height, width, building }: BrowserPreviewProps) {
  const [selectedPort, setSelectedPort] = useState<number>(3000);
  const [path, setPath] = useState<string>("/");
  const [isLoading, setIsLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSecure, setIsSecure] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
    const portConfig = containerPort.find(item => Object.keys(item)[0] === selectedPort.toString());
    if (!portConfig) return;

    const baseUrl = portConfig[selectedPort];
    const fullUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    const url = `${fullUrl.replace(/\/$/, "")}${path}`;

    try {
      setIsLoading(true);
      setError(null);
      setIsSecure(url.includes('https'));
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

  const navigate = (e: React.FormEvent) => {
    e.preventDefault();

    // Update history
    if (history.length === 0 || history[historyIndex] !== path) {
      const newHistory = historyIndex < history.length - 1
        ? [...history.slice(0, historyIndex + 1), path]
        : [...history, path];

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    loadContent();
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPath(history[historyIndex - 1]);
      loadContent();
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPath(history[historyIndex + 1]);
      loadContent();
    }
  };

  const refresh = () => {
    loadContent();
  };

  const handlePortChange = (newPort: number) => {
    setSelectedPort(newPort);
    setPath("/");
    setHistory([]);
    setHistoryIndex(-1);
    setIframeSrc(null);
    setError(null);

    setTimeout(() => {
      loadContent();
    }, 0);
  };

  const handleIframeError = () => {
    setError({
      code: 503,
      message: "Failed to load the content. The site may be unavailable or blocking embedding."
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

        <div className="flex items-center px-2 py-2">
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={goBack} disabled={historyIndex <= 0} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goForward} disabled={historyIndex >= history.length - 1} className="h-8 w-8">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              className="h-8 w-8 relative"
            >
              <RefreshCw className={`h-4 w-4 transition-transform duration-300 ${isLoading ? 'hidden' : ''}`} />
              <Loader className={`h-4 w-4 absolute ${isLoading ? 'block animate-spin' : 'hidden'}`} />
            </Button>
            <SelectPort value={selectedPort} onChange={handlePortChange} />
          </div>

          <div className="flex-1 mx-2 flex items-center bg-black/20 rounded-md px-2 border border-border">
            <div className="flex items-center">
              {isSecure ? (
                <Lock className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400 mr-1" />
              )}
            </div>
            
            <form onSubmit={navigate} className="flex-1">
              <Input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 px-1"
                placeholder="Enter URL"
              />
            </form>

            {/* Add the external link button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openInNewTab}
              disabled={!iframeSrc}
              className="h-8 w-8 ml-1"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {isLoading && (
              <div className="ml-2">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden">
        {building ? (
          <BuildLoader />
        ) : (
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
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error {error.code}</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                  {error.code === 503 && (
                    <Button variant="outline" size="sm" onClick={refresh} className="mt-4 gap-2">
                      <RefreshCw className="h-4 w-4" /> Retry Connection
                    </Button>
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
        )}
      </div>
    </div>
  );
}