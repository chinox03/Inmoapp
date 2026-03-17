import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';

interface DangerConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  itemName: string;
  warningMessage: string;
}

export function DangerConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Accion Peligrosa',
  itemName,
  warningMessage,
}: DangerConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const isMatch = confirmText.trim().toLowerCase() === itemName.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!isMatch) return;
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800 dark:text-red-200">
              {warningMessage}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Esta accion archivara el registro y todos sus datos asociados.
              Solo un administrador podra recuperarlo.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Escribe <span className="font-bold text-red-600 dark:text-red-400">"{itemName}"</span> para confirmar:
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={itemName}
            className="border-red-300 dark:border-red-700 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !isMatch}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Confirmar Eliminacion'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
