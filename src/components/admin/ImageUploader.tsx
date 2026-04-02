'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { upload } from '@vercel/blob/client';
import { UploadIcon, CloseIcon } from '@/components/ui/icons';

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  aspectRatio?: string;
  accept?: string;
  objectFit?: 'cover' | 'contain';
  hint?: string;
}

function isSvg(url: string) {
  return url.toLowerCase().includes('.svg') || url.toLowerCase().startsWith('data:image/svg');
}

export default function ImageUploader({
  value, onChange, onRemove,
  folder = 'uploads', label = 'Image',
  aspectRatio = 'aspect-video', accept = 'image/*',
  objectFit = 'cover', hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setUploading(true); setError(''); setProgress(10);
    try {
      // Sanitize filename and prefix with folder
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const pathname = `${folder}/${Date.now()}-${safeName}`;

      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.min(99, Math.round(percentage)));
        },
      });
      setProgress(100);
      onChange(blob.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false); setProgress(0);
    }
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>}
      <div
        className={`relative ${aspectRatio} w-full rounded-xl border-2 border-dashed border-gray-600 overflow-hidden cursor-pointer hover:border-amber-500 transition-colors group`}
        onClick={() => (!value || error) && inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => e.preventDefault()}
      >
        {value ? (
          <>
            {isSvg(value) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Preview" className={`absolute inset-0 w-full h-full ${objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} />
            ) : (
              <Image src={value} alt="Preview" fill className={objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'} unoptimized />
            )}
            {error ? (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 p-3">
                <p className="text-xs font-semibold text-red-400 text-center leading-snug">⚠️ {error}</p>
                <button type="button" onClick={e => { e.stopPropagation(); setError(''); inputRef.current?.click(); }}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                  Réessayer
                </button>
              </div>
            ) : uploading ? (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-amber-400">{progress}%</p>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur transition-colors">
                  Changer
                </button>
                {onRemove && (
                  <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-amber-400 transition-colors p-4">
            {uploading ? (
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-medium text-amber-400">{progress}%</p>
              </div>
            ) : error ? (
              <div className="text-center px-3">
                <p className="text-2xl mb-1">⚠️</p>
                <p className="text-xs font-semibold text-red-400 leading-snug">{error}</p>
                <p className="text-xs text-gray-500 mt-1">Cliquer pour réessayer</p>
              </div>
            ) : (
              <>
                <UploadIcon className="w-10 h-10 mb-2" />
                <p className="text-sm font-semibold">Glisser-déposer ou cliquer</p>
                <p className="text-xs mt-0.5 opacity-60">{hint || 'JPG, PNG, WebP, GIF, SVG · max 5MB'}</p>
              </>
            )}
          </div>
        )}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Ou coller une URL directement..."
          className="admin-input text-xs flex-1"
          onClick={e => e.stopPropagation()}
        />
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="px-3 py-2 bg-gray-700 hover:bg-red-600/80 text-gray-300 hover:text-white rounded-xl transition-colors text-xs font-semibold">
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}
