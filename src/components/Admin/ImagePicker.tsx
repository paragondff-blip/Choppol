import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, X, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react';

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  requiredWidth?: number;
  requiredHeight?: number;
  maxSizeKB?: number;
  aspectRatioLabel?: string;
}

export default function ImagePicker({ 
  label, 
  value, 
  onChange, 
  requiredWidth = 800, 
  requiredHeight = 800, 
  maxSizeKB = 200,
  aspectRatioLabel = "1:1"
}: ImagePickerProps) {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Size check
      if (file.size > maxSizeKB * 1024) {
        setError(`File is too large (${(file.size / 1024).toFixed(1)}KB). Maximum allowed is ${maxSizeKB}KB.`);
        resolve(false);
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;

        if (width < requiredWidth || height < requiredHeight) {
          setError(`Image dimensions are too small (${width}x${height}). Required minimum: ${requiredWidth}x${requiredHeight}.`);
          resolve(false);
        } else {
          setError(null);
          resolve(true);
        }
        URL.revokeObjectURL(img.src);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImage(file);
    if (isValid) {
      // In a production app, you would upload to a server/storage here.
      // For this implementation, we convert to Base64 to show immediate local persistence.
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    if (url.trim() === '') {
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <div className="flex bg-gray-100 p-0.5 rounded-lg">
          <button 
            type="button"
            onClick={() => setMode('url')} 
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${mode === 'url' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
          >
            URL
          </button>
          <button 
            type="button"
            onClick={() => setMode('file')} 
            className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${mode === 'file' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
          >
            PC UPLOAD
          </button>
        </div>
      </div>

      <div className="relative">
        {mode === 'url' ? (
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="url" 
              value={value.startsWith('data:') ? '' : value} 
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none transition focus:ring-2 ${error ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:ring-black'}`}
            />
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
            onDragLeave={() => setIsHovering(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsHovering(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                 const isValid = await validateImage(file);
                 if (isValid) {
                    const reader = new FileReader();
                    reader.onloadend = () => onChange(reader.result as string);
                    reader.readAsDataURL(file);
                 }
              }
            }}
            className={`group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all text-center
              ${isHovering ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <div className="flex flex-col items-center">
              <Upload className={`w-8 h-8 mb-2 transition ${isHovering ? 'scale-110' : 'group-hover:scale-110'} ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <p className="text-xs font-medium text-gray-600">Click to upload or drag & drop</p>
            </div>
          </div>
        )}

        {/* Validation Info Box */}
        <div className="mt-2 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">MIN: {requiredWidth}x{requiredHeight}px</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">MAX: {maxSizeKB}KB</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded">AR: {aspectRatioLabel}</span>
          </div>
          {value && !error && (
            <span className="flex items-center text-[10px] font-bold text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" /> VALID
            </span>
          )}
        </div>

        {error && (
          <p className="mt-2 text-xs font-bold text-red-600 flex items-center animate-bounce">
            <AlertCircle className="w-3 h-3 mr-1" /> {error}
          </p>
        )}

        {/* Preview Area */}
        {value && (
          <div className="mt-4 relative group aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button" 
              onClick={() => onChange('')} 
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
