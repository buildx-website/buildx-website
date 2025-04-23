"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { Input } from "../ui/input";
import { SelectPort } from "./select-port";
import { tunnelConnection } from "@/lib/worker-config";

interface BrowserPreviewProps {
  containerId: string;
  initialPort: number;
  height?: string;
  width?: string;
}

export function BrowserPreview({ containerId, initialPort, height, width }: BrowserPreviewProps) {
  const [port, setPort] = useState(initialPort);
  const [inputPort, setInputPort] = useState<number>(initialPort);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeSrc, setIframeSrc] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<number[]>([initialPort]);
  const [path, setPath] = useState<string>("/");
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  useEffect(() => {
    console.log("iframeSrc", iframeSrc);
  }, [iframeSrc])


  async function getUrlFromPort(containerId: string, port: number) {
    const data = await tunnelConnection(containerId, port);
    if (data.url) {
      const url = data.url.replace(/\/$/, "");
      console.log(port, url);
      return `${url}${path}`;
    }
    return "";
  }

  function goBack() {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setPort(history[currentHistoryIndex - 1]);
      setInputPort(history[currentHistoryIndex - 1]);
    }
  }

  function goForward() {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setPort(history[currentHistoryIndex + 1]);
      setInputPort(history[currentHistoryIndex + 1]);
    }
  }

  function refresh() {
    // Instead of directly accessing contentWindow.location.reload()
    if (iframeSrc) {
      // Force refresh by temporarily clearing and resetting the src
      setIframeSrc('');
      setTimeout(() => {
        setIframeSrc(iframeSrc);
      }, 50);
    }
  }

  function navigate(e: React.FormEvent) {
    e.preventDefault();
    const portNumber = inputPort;
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return;
    }

    if (inputPort && !history.includes(inputPort)) {
      setHistory([...history, inputPort]);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
    setPort(inputPort);
  }

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

  useEffect(() => {
    async function updateIframeSrc() {
      const url = await getUrlFromPort(containerId, port);
      setIframeSrc(url);
    }
    updateIframeSrc();
  }, [containerId, port, path]);

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
            onChange={(newPort) => {
              setInputPort(newPort);
              setPort(newPort);
              if (!history.includes(newPort)) {
                setHistory([...history, newPort]);
                setCurrentHistoryIndex(currentHistoryIndex + 1);
              }
            }}
          />
        </div>

        <form onSubmit={navigate} className="flex-1 mx-2">
          <Input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            src={iframeSrc}
          />
        </form>
      </div>

      {/* Content area */}
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
  )
}


