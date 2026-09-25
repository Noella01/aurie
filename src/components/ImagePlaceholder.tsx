import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react';

interface ImagePlaceholderProps {
  imageUrl?: string;
  alt: string;
  category?: string;
  aspectRatio?: 'portrait' | 'square' | 'wide';
  className?: string;
  allowEdit?: boolean;
  onImageChange?: (newUrl: string) => void;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  imageUrl,
  alt,
  category = 'Collection',
  aspectRatio = 'portrait',
  className = '',
  allowEdit = true,
  onImageChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  const aspectClasses = {
    portrait: 'aspect-[3/4]',
    square: 'aspect-square',
    wide: 'aspect-[16/9]'
  }[aspectRatio];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onImageChange?.(reader.result);
          setIsEditing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUrl = () => {
    if (inputUrl.trim()) {
      onImageChange?.(inputUrl.trim());
      setInputUrl('');
      setIsEditing(false);
    }
  };

  if (imageUrl) {
    return (
      <div className={`relative group overflow-hidden bg-[#151515] ${aspectClasses} ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {allowEdit && onImageChange && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0A0A]/90 hover:bg-black text-[#F5F5F5] text-xs px-2.5 py-1.5 rounded border border-[#2A2A2A] flex items-center gap-1.5 backdrop-blur-sm"
            title="Change photo"
          >
            <Camera size={13} />
            <span>Change</span>
          </button>
        )}

        {isEditing && (
          <div className="absolute inset-0 bg-black/90 p-4 flex flex-col justify-center items-center z-20 backdrop-blur-sm animate-fade-in">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-2 right-2 text-neutral-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Upload or Paste Picture</p>
            <input
              type="text"
              placeholder="Paste image URL here..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] text-xs px-2.5 py-1.5 rounded text-white mb-2 focus:outline-none focus:border-white"
            />
            <div className="flex gap-2 w-full">
              <button
                onClick={handleSaveUrl}
                className="flex-1 bg-white text-black text-xs font-semibold py-1.5 rounded hover:bg-neutral-200"
              >
                Save URL
              </button>
              <label className="flex-1 cursor-pointer bg-[#2A2A2A] text-white text-xs font-medium py-1.5 rounded text-center hover:bg-neutral-700 flex items-center justify-center gap-1">
                <Upload size={12} />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative group bg-[#151515] border border-[#2A2A2A] ${aspectClasses} ${className} flex flex-col items-center justify-center text-center p-4 transition-colors duration-300 hover:border-[#404040] select-none`}
    >
      {/* Sleek architectural framing */}
      <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#333333]" />
      <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#333333]" />
      <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-[#333333]" />
      <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-[#333333]" />

      <div className="flex flex-col items-center gap-2 max-w-[85%]">
        <div className="w-10 h-10 rounded-full border border-[#2A2A2A] bg-[#1C1C1C] flex items-center justify-center text-[#A0A0A0] group-hover:text-white transition-colors">
          <ImageIcon size={18} strokeWidth={1.5} />
        </div>
        <div className="text-[10px] tracking-[0.25em] text-[#A0A0A0] uppercase">
          {category}
        </div>
        <div className="text-xs font-medium text-neutral-300 line-clamp-1">
          {alt}
        </div>
        <div className="text-[9px] uppercase tracking-widest text-[#707070] mt-0.5">
          [ Photo Ready to Add ]
        </div>
      </div>

      {allowEdit && onImageChange && (
        <button
          onClick={() => setIsEditing(true)}
          className="mt-3 opacity-80 group-hover:opacity-100 transition-all bg-[#1C1C1C] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded border border-[#2A2A2A] flex items-center gap-1.5"
        >
          <Camera size={12} />
          <span>Add Picture</span>
        </button>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-[#0A0A0A]/95 p-4 flex flex-col justify-center items-center z-20 backdrop-blur-sm">
          <button
            onClick={() => setIsEditing(false)}
            className="absolute top-3 right-3 text-neutral-400 hover:text-white"
          >
            <X size={16} />
          </button>
          <p className="text-[11px] uppercase tracking-widest text-neutral-300 font-semibold mb-2">
            Add Garment Photo
          </p>
          <p className="text-[10px] text-neutral-400 mb-3">
            Choose a photo from your device or paste a link
          </p>
          <input
            type="text"
            placeholder="Paste image link (https://...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-[#1C1C1C] border border-[#2A2A2A] text-xs px-3 py-2 rounded text-white mb-2 focus:outline-none focus:border-white"
          />
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={handleSaveUrl}
              className="flex-1 bg-white text-black text-xs font-semibold py-2 rounded hover:bg-neutral-200 transition-colors"
            >
              Save Link
            </button>
            <label className="flex-1 cursor-pointer bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-medium py-2 rounded text-center flex items-center justify-center gap-1 transition-colors">
              <Upload size={13} />
              <span>Upload File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
