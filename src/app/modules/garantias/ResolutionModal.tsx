import React, { useState, useRef } from 'react';
import { X, Check, X as XIcon, Upload } from 'lucide-react';
import { WarrantyClaim, ClaimItem, WarrantyFile } from './types';
import { CLAIM_TYPE_LABELS, LOCATION_LABELS } from './constants';
import { Button } from '../../../components/ui/Button';

interface ResolutionModalProps {
  warranty: WarrantyClaim;
  onClose: () => void;
  onResolve: (data: {
    claims: ClaimItem[];
    signature: string;
  }) => void;
}

export function ResolutionModal({ warranty, onClose, onResolve }: ResolutionModalProps) {
  const [claims, setClaims] = useState<ClaimItem[]>(
    warranty.claims.map((claim) => ({
      ...claim,
      resolutionStatus: undefined,
      resolutionNotes: '',
      resolutionImages: [],
    }))
  );
  const [signature, setSignature] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const allResolved = claims.every((claim) => claim.resolutionStatus);
  const canSubmit = allResolved && signature;

  const handleClaimStatusChange = (index: number, status: 'compliant' | 'non_compliant') => {
    const newClaims = [...claims];
    newClaims[index] = { ...newClaims[index], resolutionStatus: status };
    setClaims(newClaims);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const newClaims = [...claims];
    newClaims[index] = { ...newClaims[index], resolutionNotes: notes };
    setClaims(newClaims);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      const newImages: WarrantyFile[] = files.map((file) => ({
        id: `img-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: 'image',
        uploadedAt: new Date().toISOString(),
      }));

      const newClaims = [...claims];
      newClaims[index] = {
        ...newClaims[index],
        resolutionImages: [...(newClaims[index].resolutionImages || []), ...newImages],
      };
      setClaims(newClaims);
    }
  };

  const removeImage = (claimIndex: number, imageId: string) => {
    const newClaims = [...claims];
    newClaims[claimIndex] = {
      ...newClaims[claimIndex],
      resolutionImages: (newClaims[claimIndex].resolutionImages || []).filter((img) => img.id !== imageId),
    };
    setClaims(newClaims);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      setSignature(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignature(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onResolve({
      claims,
      signature: signature!,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Resolver Garantía
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {warranty.claimNumber} - {warranty.residentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Complete la evaluación de cada problema reportado y capture la firma del residente al finalizar.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Problemas Reportados ({claims.length})
            </h3>

            {claims.map((claim, index) => (
              <div key={claim.id} className="border border-gray-300 rounded-lg p-5 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Problema #{index + 1}
                    </h4>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{CLAIM_TYPE_LABELS[claim.claimType]}</span> -{' '}
                      {LOCATION_LABELS[claim.location]}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">{claim.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado de Resolución
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleClaimStatusChange(index, 'compliant')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                          claim.resolutionStatus === 'compliant'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
                        <Check className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">Conforme</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClaimStatusChange(index, 'non_compliant')}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                          claim.resolutionStatus === 'non_compliant'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-300 hover:border-red-300'
                        }`}
                      >
                        <XIcon className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-medium">No Conforme</span>
                      </button>
                    </div>
                  </div>

                  {claim.resolutionStatus && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          value={claim.resolutionNotes}
                          onChange={(e) => handleNotesChange(index, e.target.value)}
                          placeholder="Detalles de la resolución..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fotos de Evidencia
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {(claim.resolutionImages || []).map((img) => (
                            <div key={img.id} className="relative group">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                                <span className="text-xs text-gray-600">IMG</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index, img.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleFileUpload(index, e)}
                              className="hidden"
                            />
                            <Upload className="h-5 w-5 text-gray-400" />
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Firma del Residente
            </h3>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full cursor-crosshair touch-none"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Firme dentro del recuadro usando el mouse o su dedo
                </p>
                {signature && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSignature}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {claims.filter((c) => c.resolutionStatus).length}/{claims.length} problemas evaluados
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Completar Resolución'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
