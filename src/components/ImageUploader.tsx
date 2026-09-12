import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  currentImageUrl?: string;
  fallbackEmoji?: string;
  onImageSelected: (dataUrl: string) => void;
  onImageRemoved: () => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUrl,
  fallbackEmoji = '📦',
  onImageSelected,
  onImageRemoved,
  label = 'Product Image from Computer',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resize image to ensure smooth localStorage persistence without quota overflow
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP, etc.)');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Target max dimension 500px for crisp grocery thumbnail & modal display
        const MAX_DIM = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onImageSelected(compressedDataUrl);
        } else {
          // Fallback to original data URL if canvas context unavailable
          onImageSelected(e.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setUploadError('Unable to read image file.');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Error reading file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-700">{label}</label>
        {currentImageUrl && (
          <button
            type="button"
            onClick={onImageRemoved}
            className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove Custom Image</span>
          </button>
        )}
      </div>

      {currentImageUrl ? (
        /* Image Preview Box */
        <div className="relative rounded-xl border border-stone-200 bg-stone-50 p-3 flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-stone-200 shadow-2xs shrink-0 flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              ✓ Custom photo active
            </p>
            <p className="text-[11px] text-stone-500">
              This photo will be displayed to customers in the catalog, cart, and receipts.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-emerald-700 px-2.5 py-1 rounded-md bg-white border border-stone-300 shadow-2xs cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Choose Another Photo</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone Upload Box supporting Drag & Drop and Click */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
              : 'border-stone-300 bg-stone-50/60 hover:border-emerald-500 hover:bg-stone-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-stone-800">
                <span className="text-emerald-700">Click to upload from computer</span> or drag & drop
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Supports JPG, PNG, WEBP, or GIF (Auto-optimized)
              </p>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
      )}
    </div>
  );
};
