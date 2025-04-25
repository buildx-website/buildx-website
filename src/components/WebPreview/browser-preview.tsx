"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { AlertCircle, ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Input } from "../ui/input";
import { SelectPort } from "./select-port";
import { ContainerPort } from "@/types/types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface BrowserPreviewProps {
  containerPort: ContainerPort[];
  height?: string;
  width?: string;
}

export function BrowserPreview({ containerPort, height, width }: BrowserPreviewProps) {
  const [selectedPort, setSelectedPort] = useState<number>(3000);
  const [path, setPath] = useState<string>("/");
  const [isLoading, setIsLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<{ code: number; message: string } | null>(null);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (containerPort.length > 0) {
      loadContent();
    }
  }, []);

  const loadContent = async () => {
    const portConfig = containerPort.find(item => Object.keys(item)[0] === selectedPort.toString());
    if (!portConfig) return;
    
    const baseUrl = portConfig[selectedPort];
    const fullUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    const url = `${fullUrl.replace(/\/$/, "")}${path}`;
    
    try {
      setIsLoading(true);
      setError(null);
      
      setIframeSrc(url);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  return (
    <div
      className="flex flex-col border border-border rounded-lg overflow-hidden bg-background"
      style={{ height, width }}
    >
      {/* Navigation Bar */}
      <div className="flex items-center px-2 py-2 border-b border-border bg-black/40">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={goBack} disabled={historyIndex <= 0} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goForward} disabled={historyIndex >= history.length - 1} className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <SelectPort value={selectedPort} onChange={handlePortChange} />
        </div>

        <form onSubmit={navigate} className="flex-1 mx-2">
          <Input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </form>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
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
            </p>
          </div>
        )}
      </div>
    </div>
  );
}