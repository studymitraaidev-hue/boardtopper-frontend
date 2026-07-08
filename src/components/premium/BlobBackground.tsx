
// src/components/premium/BlobBackground.tsx
import React from 'react';

export const BlobBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-300/20 blur-[100px] animate-blob-float" />
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-purple-300/20 blur-[100px] animate-blob-float" style={{ animationDelay: '-4s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[450px] h-[450px] rounded-full bg-pink-300/15 blur-[100px] animate-blob-float" style={{ animationDelay: '-8s' }} />
      <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-300/10 blur-[80px] animate-blob-float" style={{ animationDelay: '-2s' }} />
    </div>
  );
};
