import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ShowImageProps {
  src: string;
  alt?: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function ShowImage({ src, alt = "", className = "", onError }: ShowImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
    setScale(1);
    setRotation(0);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(false);
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer hover:opacity-95 transition-opacity`}
        onClick={handleOpen}
        onError={onError}
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
        >
          {/* Controls Bar */}
          <div 
            className="absolute top-6 right-6 flex items-center gap-2.5 z-[10000] bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={zoomIn}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all duration-200 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all duration-200 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={rotate}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 rounded-full transition-all duration-200 cursor-pointer"
              title="Rotate"
            >
              <RotateCw size={18} />
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <button
              onClick={handleClose}
              className="p-2 bg-red-500/80 hover:bg-red-500 hover:text-white active:scale-95 text-white/90 rounded-full transition-all duration-200 cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image Container */}
          <div className="max-w-[90vw] max-h-[90vh] overflow-hidden flex items-center justify-center p-4">
            <img
              src={src}
              alt={alt}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              onError={onError}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ShowImage;
