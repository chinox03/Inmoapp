import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  itemName: string;
  description?: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar Eliminacion',
  itemName,
  description,
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Estas a punto de eliminar: <span className="font-bold">{itemName}</span>
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {description || 'El registro sera archivado y podra ser recuperado posteriormente por un administrador.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
