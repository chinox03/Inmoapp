import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Lock } from 'lucide-react';
import { z } from 'zod';
import { DEV_MODE_ENABLED } from '../../config/devMode';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage('');

    try {
      if (DEV_MODE_ENABLED) {
        setLoading(true);
        await signIn(email, password);
        navigate('/dashboard');
        return;
      }

      const validated = loginSchema.parse({ email, password });
      setLoading(true);

      await signIn(validated.email, validated.password);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as 'email' | 'password'] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        setErrorMessage(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {import.meta.env.VITE_TECH_BRAND}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Portal de Residentes</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Iniciar Sesión</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              <Input
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>¿No tienes cuenta?</p>
              <Link
                to="/register-info"
                className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Información sobre registro
              </Link>
            </div>

            {DEV_MODE_ENABLED && (
              <div className="mt-4 text-center text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                Modo desarrollo activo - autenticación deshabilitada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
