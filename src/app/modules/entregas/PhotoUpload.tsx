import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedFile } from './types';
import { Button } from '../../../components/ui/Button';

interface PhotoUploadProps {
  photos: UploadedFile[];
  onChange: (photos: UploadedFile[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newPhotos: UploadedFile[] = Array.from(files).map((file) => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }));

    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId: string) => {
    onChange(photos.filter((p) => p.id !== photoId));
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Fotos de Respaldo
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-600 mb-1">
          Arrastra y suelta tus fotos aquí, o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500">
          PNG, JPG, JPEG hasta 10MB cada una
        </p>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={photo.name}>
                  {photo.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {photos.length} {photos.length === 1 ? 'foto cargada' : 'fotos cargadas'}
      </p>
    </div>
  );
}
