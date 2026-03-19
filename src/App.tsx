import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ResidencialProvider } from './contexts/ResidencialContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './app/auth/LoginPage';
import { RegisterInfoPage } from './app/auth/RegisterInfoPage';
import { UnauthorizedPage } from './app/auth/UnauthorizedPage';
import { NotFoundPage } from './app/auth/NotFoundPage';
import { DashboardLayout } from './app/dashboard/DashboardLayout';

const DashboardHome = React.lazy(() => import('./app/dashboard/DashboardHome').then(m => ({ default: m.DashboardHome })));
const ResidencialesPage = React.lazy(() => import('./app/modules/residenciales/ResidencialesPage').then(m => ({ default: m.ResidencialesPage })));
const UsuariosPage = React.lazy(() => import('./app/modules/usuarios/UsuariosPage').then(m => ({ default: m.UsuariosPage })));
const ResidentesPage = React.lazy(() => import('./app/modules/residentes/ResidentesPage').then(m => ({ default: m.ResidentesPage })));
const AuditoriaPage = React.lazy(() => import('./app/modules/auditoria/AuditoriaPage').then(m => ({ default: m.AuditoriaPage })));
const EstadosPage = React.lazy(() => import('./app/modules/estados/EstadosPage').then(m => ({ default: m.EstadosPage })));
const PagosPage = React.lazy(() => import('./app/modules/pagos/PagosPage').then(m => ({ default: m.PagosPage })));
const AmonestacionesPage = React.lazy(() => import('./app/modules/amonestaciones/AmonestacionesPage').then(m => ({ default: m.AmonestacionesPage })));
const EspaciosPage = React.lazy(() => import('./app/modules/espacios/EspaciosPage').then(m => ({ default: m.EspaciosPage })));
const ReservasPage = React.lazy(() => import('./app/modules/reservas/ReservasPage').then(m => ({ default: m.ReservasPage })));
const AccesosPage = React.lazy(() => import('./app/modules/accesos/AccesosPage').then(m => ({ default: m.AccesosPage })));
const MudanzasPage = React.lazy(() => import('./app/modules/mudanzas/MudanzasPage').then(m => ({ default: m.MudanzasPage })));
const EncuestasPage = React.lazy(() => import('./app/modules/encuestas/EncuestasPage').then(m => ({ default: m.EncuestasPage })));
const CalendarioPage = React.lazy(() => import('./app/modules/calendario/CalendarioPage').then(m => ({ default: m.CalendarioPage })));
const VisitasPage = React.lazy(() => import('./app/modules/visitas/VisitasPage').then(m => ({ default: m.VisitasPage })));
const EntregasPage = React.lazy(() => import('./app/modules/entregas/EntregasPage'));
const GarantiasPage = React.lazy(() => import('./app/modules/garantias/GarantiasPage'));
const ProspectosPage = React.lazy(() => import('./app/modules/prospectos/ProspectosPage').then(m => ({ default: m.ProspectosPage })));
const NegociosPage = React.lazy(() => import('./app/modules/negocios/NegociosPage').then(m => ({ default: m.NegociosPage })));
const ReservasComercialesPage = React.lazy(() => import('./app/modules/reservas-comerciales/ReservasComercialesPage').then(m => ({ default: m.ReservasComercialesPage })));
const PCVPage = React.lazy(() => import('./app/modules/pcv/PCVPage').then(m => ({ default: m.PCVPage })));
const ComisionesPage = React.lazy(() => import('./app/modules/comisiones/ComisionesPage').then(m => ({ default: m.ComisionesPage })));
const InsightsPage = React.lazy(() => import('./app/modules/insights/InsightsPage').then(m => ({ default: m.InsightsPage })));

const PageLoader = () => (
  <div className="flex items-center justify-center h-full min-h-[200px]">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ResidencialProvider>
            <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-info" element={<RegisterInfoPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Suspense fallback={<PageLoader />}><DashboardHome /></Suspense>} />
              <Route
                path="residenciales"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN']}>
                    <Suspense fallback={<PageLoader />}><ResidencialesPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN']}>
                    <Suspense fallback={<PageLoader />}><UsuariosPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="residentes"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN_RESIDENCIAL']}>
                    <Suspense fallback={<PageLoader />}><ResidentesPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route
                path="auditoria"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN_RESIDENCIAL']}>
                    <Suspense fallback={<PageLoader />}><AuditoriaPage /></Suspense>
                  </ProtectedRoute>
                }
              />
              <Route path="estados" element={<Suspense fallback={<PageLoader />}><EstadosPage /></Suspense>} />
              <Route path="mi-estado" element={<Suspense fallback={<PageLoader />}><EstadosPage /></Suspense>} />
              <Route path="pagos" element={<Suspense fallback={<PageLoader />}><PagosPage /></Suspense>} />
              <Route path="amonestaciones" element={<Suspense fallback={<PageLoader />}><AmonestacionesPage /></Suspense>} />
              <Route path="mis-amonestaciones" element={<Suspense fallback={<PageLoader />}><AmonestacionesPage /></Suspense>} />
              <Route path="espacios" element={<Suspense fallback={<PageLoader />}><EspaciosPage /></Suspense>} />
              <Route path="reservas" element={<Suspense fallback={<PageLoader />}><ReservasPage /></Suspense>} />
              <Route path="mis-reservas" element={<Suspense fallback={<PageLoader />}><ReservasPage /></Suspense>} />
              <Route path="accesos" element={<Suspense fallback={<PageLoader />}><AccesosPage /></Suspense>} />
              <Route path="mis-accesos" element={<Suspense fallback={<PageLoader />}><AccesosPage /></Suspense>} />
              <Route path="mudanzas" element={<Suspense fallback={<PageLoader />}><MudanzasPage /></Suspense>} />
              <Route path="mis-mudanzas" element={<Suspense fallback={<PageLoader />}><MudanzasPage /></Suspense>} />
              <Route path="encuestas" element={<Suspense fallback={<PageLoader />}><EncuestasPage /></Suspense>} />
              <Route path="calendario" element={<Suspense fallback={<PageLoader />}><CalendarioPage /></Suspense>} />
              <Route path="visitas" element={<Suspense fallback={<PageLoader />}><VisitasPage /></Suspense>} />
              <Route path="entregas" element={<Suspense fallback={<PageLoader />}><EntregasPage /></Suspense>} />
              <Route path="garantias" element={<Suspense fallback={<PageLoader />}><GarantiasPage /></Suspense>} />
              <Route path="prospectos" element={<Suspense fallback={<PageLoader />}><ProspectosPage /></Suspense>} />
              <Route path="negocios" element={<Suspense fallback={<PageLoader />}><NegociosPage /></Suspense>} />
              <Route path="reservas-comerciales" element={<Suspense fallback={<PageLoader />}><ReservasComercialesPage /></Suspense>} />
              <Route path="pcv" element={<Suspense fallback={<PageLoader />}><PCVPage /></Suspense>} />
              <Route path="comisiones" element={<Suspense fallback={<PageLoader />}><ComisionesPage /></Suspense>} />
              <Route
                path="insights"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN_RESIDENCIAL']}>
                    <Suspense fallback={<PageLoader />}><InsightsPage /></Suspense>
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ResidencialProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
