import React, { useRef, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { X, Plus } from 'lucide-react';

registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateSize
);

interface ImageUploaderProps {
  onImagesChange: (images: string[]) => void;
  existingImages?: string[];
  maxFileSize?: string;
}

export default function ImageUploader({ 
  onImagesChange, 
  existingImages = [],
  maxFileSize = '5MB'
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  const handleFilesUpdate = (fileItems: any[]) => {
    const newImages = fileItems.map(fileItem => {
      if (typeof fileItem.file === 'string') {
        return fileItem.file;
      }
      return URL.createObjectURL(fileItem.file);
    });
    
    setImages(newImages);
    onImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="filepond-wrapper">
        <FilePond
          onupdatefiles={handleFilesUpdate}
          acceptedFileTypes={['image/*']}
          labelIdle='<div class="flex flex-col items-center gap-2"><Plus className="h-8 w-8 text-indigo-500" /><p class="text-sm font-semibold text-slate-700">Görselleri Sürükleyip Bırakın veya Tıklayın</p><p class="text-xs text-slate-500">Sınırsız sayıda görsel yükleyebilirsiniz (Max 5MB her bir dosya)</p></div>'
          maxFileSize={maxFileSize}
          credits={false}
          instantUpload={false}
          allowMultiple={true}
          allowReorder={true}
        />
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            Yüklenen Görseller ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-400 transition-all bg-slate-50"
              >
                <img
                  src={image}
                  alt={`Görsel ${index + 1}`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Hata';
                  }}
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs p-2 text-center font-semibold">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.filepond--drop-label) {
          @apply flex items-center justify-center flex-col gap-2 cursor-pointer;
        }
        :global(.filepond--root) {
          @apply rounded-xl border-2 border-dashed border-indigo-300;
        }
        :global(.filepond--root.filepond--hoover) {
          @apply border-indigo-500 bg-indigo-50/30;
        }
      `}</style>
    </div>
  );
}
