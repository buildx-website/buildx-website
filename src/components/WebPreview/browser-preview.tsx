"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Input } from "../ui/input";
import { SelectPort } from "./select-port";
import { ContainerPort } from "@/types/types";

interface BrowserPreviewProps {
  containerPort: ContainerPort[];
  height?: string;
  width?: string;
}

export function BrowserPreview({ containerPort, height, width }: BrowserPreviewProps) {
  const [inputPort, setInputPort] = useState<number>(3000);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
  const [path, setPath] = useState<string>("/");
  
  // Simple array of visited paths for current port only
  const [history, setHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  useEffect(() => {
    // Find the URL for the current port
    const portObject = containerPort.find(item => Object.keys(item)[0] === inputPort.toString());
    if (portObject) {
      // Get the full URL directly from the port object
      const baseUrl = portObject[inputPort];
      
      // Ensure it starts with http:// or https://
      let fullUrl;
      if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
        fullUrl = baseUrl;
      } else {
        fullUrl = `http://${baseUrl}`;
      }
      
      // Clean the URL and append the path
      const cleanUrl = fullUrl.replace(/\/$/, "");
      setIframeSrc(`${cleanUrl}${path}`);
    } else {
      setIframeSrc(undefined);
    }
  }, [containerPort, inputPort, path]);

  function goBack() {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setPath(history[currentHistoryIndex - 1]);
    }
  }

  function goForward() {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setPath(history[currentHistoryIndex + 1]);
    }
  }

  function refresh() {
    if (iframeSrc) {
      setIframeSrc('');
      setTimeout(() => {
        setIframeSrc(iframeSrc);
      }, 50);
    }
  }

  function navigate(e: React.FormEvent) {
    e.preventDefault();
    
    // Add new path to history only if it's different from current
    if (history.length === 0 || history[currentHistoryIndex] !== path) {
      if (currentHistoryIndex === history.length - 1) {
        // At the end of history, just append
        setHistory([...history, path]);
      } else {
        // In the middle of history, truncate forward history
        setHistory([...history.slice(0, currentHistoryIndex + 1), path]);
      }
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  }

  // When port changes, reset history
  const handlePortChange = (newPort: number) => {
    setInputPort(newPort);
    setPath("/");
    setHistory([]);
    setCurrentHistoryIndex(-1);
  };

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const script = iframe.contentWindow.document.createElement('script');
      script.textContent = `
        console.log = function() {
          window.parent.postMessage({
            type: 'console-log',
            message: Array.from(arguments).join(' ')
          }, '*');
          return Function.prototype.bind.call(console.log, console, ...arguments)();
        };
      `;
      iframe.contentWindow.document.head.appendChild(script);
    }
  };

  return (
    <div
      className="flex flex-col border border-border rounded-lg overflow-hidden bg-background"
      style={{ height, width }}
    >
      <div className="flex items-center px-2 py-2 border-b border-border bg-black/40">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={goBack} disabled={currentHistoryIndex <= 0} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            disabled={currentHistoryIndex >= history.length - 1}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refresh} className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <SelectPort
            value={inputPort}
            onChange={handlePortChange}
          />
        </div>

        <form onSubmit={navigate} className="flex-1 mx-2">
          <Input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </form>
      </div>

      <div className="flex-1 bg-white overflow-hidden">
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
          onLoad={handleIframeLoad}
          title="Preview"
        />
      </div>
    </div>
  );
}