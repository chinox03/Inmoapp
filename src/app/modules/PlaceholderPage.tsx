import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Info } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-6 rounded-full mb-6">
              <Info className="h-12 w-12 text-blue-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Funcionalidad en Desarrollo
            </h2>

            <p className="text-gray-600 max-w-md mb-2">
              Esta funcionalidad estará disponible en la siguiente fase del proyecto.
            </p>

            {description && (
              <p className="text-gray-500 text-sm max-w-md mb-6">
                {description}
              </p>
            )}

            <Button onClick={() => navigate('/dashboard')}>
              Volver al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
