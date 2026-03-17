import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  preview?: string;
  onClear?: () => void;
  label?: string;
  error?: string;
}

export function FileUpload({
  onFileSelect,
  accept = 'image/*,.pdf',
  maxSize = 5 * 1024 * 1024,
  preview,
  onClear,
  label = 'Subir archivo',
  error,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > maxSize) {
      alert(`El archivo es demasiado grande. Tamaño máximo: ${maxSize / 1024 / 1024}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const isImage = preview && (preview.endsWith('.jpg') || preview.endsWith('.png') || preview.endsWith('.jpeg') || preview.startsWith('data:image'));
  const isPDF = preview && preview.endsWith('.pdf');

  if (preview) {
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        )}
        <div className="border border-gray-300 rounded-lg p-4">
          {isImage && (
            <div className="mb-3">
              <img src={preview} alt="Preview" className="max-h-48 rounded-lg mx-auto" />
            </div>
          )}
          {isPDF && (
            <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg mb-3">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Archivo cargado</span>
            {onClear && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-1" />
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        } ${error ? 'border-red-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra un archivo aquí o{' '}
            <button
              type="button"
              onClick={handleClick}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              selecciona uno
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Máximo {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
