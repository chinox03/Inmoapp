import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-100 p-6 rounded-full mb-6">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Acceso Denegado
              </h2>

              <p className="text-gray-600 max-w-md mb-6">
                No tienes permisos para acceder a esta sección. Si crees que esto es un error,
                contacta a tu administrador.
              </p>

              <Button onClick={() => navigate('/dashboard')}>
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
