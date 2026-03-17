import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { WarrantyFile } from './types';
import { Button } from '../../../components/ui/Button';

interface MediaUploadProps {
  files: WarrantyFile[];
  onChange: (files: WarrantyFile[]) => void;
}

export function MediaUpload({ files, onChange }: MediaUploadProps) {
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

  const getFileType = (fileName: string): 'image' | 'video' | 'document' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['mp4', 'mov', 'avi', 'wmv', 'webm'].includes(ext || '')) return 'video';
    return 'document';
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: WarrantyFile[] = Array.from(fileList).map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: getFileType(file.name),
      uploadedAt: new Date().toISOString(),
    }));

    onChange([...files, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    onChange(files.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (type: WarrantyFile['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-gray-400" />;
      case 'video':
        return <Video className="h-8 w-8 text-gray-400" />;
      case 'document':
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Fotos y Videos
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Arrastra y suelta tus archivos aquí, o haz clic para seleccionar
        </p>
        <p className="text-xs text-gray-500">
          Imágenes (JPG, PNG) o Videos (MP4, MOV) hasta 50MB cada uno
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                {getFileIcon(file.type)}
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {file.type === 'image' ? 'Imagen' : file.type === 'video' ? 'Video' : 'Documento'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        {files.length} {files.length === 1 ? 'archivo cargado' : 'archivos cargados'}
      </p>
    </div>
  );
}
