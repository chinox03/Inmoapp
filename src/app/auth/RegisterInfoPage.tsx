import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Info, Mail } from 'lucide-react';

export function RegisterInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Info className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro por Invitación
          </h1>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Acceso Restringido</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              El portal de residentes funciona con un sistema de registro por invitación.
              Solo los administradores del sistema pueden crear nuevas cuentas de usuario.
            </p>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary-900 mb-2">
                ¿Cómo obtener acceso?
              </h3>
              <ul className="list-disc list-inside text-primary-800 space-y-1 text-sm">
                <li>Contacta a tu administrador de residencial</li>
                <li>Proporciona tu información personal (nombre, correo, teléfono)</li>
                <li>Espera a recibir un correo con tus credenciales de acceso</li>
                <li>Usa las credenciales proporcionadas para iniciar sesión</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Contacto de Soporte</p>
                <p className="text-sm text-gray-600">
                  Para dudas o soporte técnico, contacta a:{' '}
                  <a
                    href="mailto:admin@conversion.tech"
                    className="text-primary-500 hover:text-primary-600"
                  >
                    admin@conversion.tech
                  </a>
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/login">
                <Button className="w-full">
                  Volver al Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
