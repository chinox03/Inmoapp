import React, { useState } from 'react';
import { Upload, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { simulateOCR } from './ocrService';
import { OCRResult } from './types';

interface DocumentUploadProps {
  onOCRComplete: (result: OCRResult) => void;
}

export function DocumentUpload({ onOCRComplete }: DocumentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande. Máximo 5MB');
      return;
    }

    setError(null);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);

    try {
      const result = await simulateOCR(file);
      setOcrResult(result);
      onOCRComplete(result);
    } catch (err) {
      setError('Error al procesar el documento. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="document-upload"
          />
          <label htmlFor="document-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Cargar documento de identificación
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  INE, licencia de conducir o pasaporte
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Formato JPG, PNG - Máximo 5MB
                </p>
              </div>
              <Button type="button" variant="primary">
                Seleccionar archivo
              </Button>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                ) : ocrResult ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : null}
                <div>
                  <p className="font-semibold text-gray-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-600">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Cambiar
              </Button>
            </div>

            {previewUrl && (
              <div className="mt-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-contain bg-gray-50 rounded"
                />
              </div>
            )}

            {isProcessing && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <p className="text-sm text-blue-800">
                    Procesando documento con OCR...
                  </p>
                </div>
              </div>
            )}

            {ocrResult && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-800">
                      Documento procesado exitosamente
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Confianza: {(ocrResult.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="mt-2 text-xs text-green-800 space-y-1">
                      <p>
                        <span className="font-semibold">Nombre:</span>{' '}
                        {ocrResult.firstName} {ocrResult.lastName}
                      </p>
                      <p>
                        <span className="font-semibold">Documento:</span>{' '}
                        {ocrResult.documentNumber}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
