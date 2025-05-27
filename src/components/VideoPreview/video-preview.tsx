"use client";

import React from 'react';

interface VideoPreviewProps {
  videoUrl: string | null;
  width?: string;
  height?: string;
  building?: boolean; // To show a loading state or placeholder
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, width = "100%", height = "100%", building }) => {
  if (building) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Rendering video...</p>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-800 text-white">
        <p>No video to display. Render a scene to see the preview.</p>
      </div>
    );
  }

  return (
    <div style={{ width, height }} className="bg-black flex items-center justify-center">
      <video key={videoUrl} controls autoPlay muted loop className="max-w-full max-h-full">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}; 