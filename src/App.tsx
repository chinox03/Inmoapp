import React from 'react';
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
import { DashboardHome } from './app/dashboard/DashboardHome';
import { ResidencialesPage } from './app/modules/residenciales/ResidencialesPage';
import { UsuariosPage } from './app/modules/usuarios/UsuariosPage';
import { ResidentesPage } from './app/modules/residentes/ResidentesPage';
import { AuditoriaPage } from './app/modules/auditoria/AuditoriaPage';
import { EstadosPage } from './app/modules/estados/EstadosPage';
import { PagosPage } from './app/modules/pagos/PagosPage';
import { AmonestacionesPage } from './app/modules/amonestaciones/AmonestacionesPage';
import { EspaciosPage } from './app/modules/espacios/EspaciosPage';
import { ReservasPage } from './app/modules/reservas/ReservasPage';
import { AccesosPage } from './app/modules/accesos/AccesosPage';
import { MudanzasPage } from './app/modules/mudanzas/MudanzasPage';
import { EncuestasPage } from './app/modules/encuestas/EncuestasPage';
import { CalendarioPage } from './app/modules/calendario/CalendarioPage';
import { VisitasPage } from './app/modules/visitas/VisitasPage';
import EntregasPage from './app/modules/entregas/EntregasPage';
import GarantiasPage from './app/modules/garantias/GarantiasPage';
import { ProspectosPage } from './app/modules/prospectos/ProspectosPage';
import { NegociosPage } from './app/modules/negocios/NegociosPage';
import { ReservasComercialesPage } from './app/modules/reservas-comerciales/ReservasComercialesPage';
import { PCVPage } from './app/modules/pcv/PCVPage';
import { ComisionesPage } from './app/modules/comisiones/ComisionesPage';
import { InsightsPage } from './app/modules/insights/InsightsPage';

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
              <Route index element={<DashboardHome />} />
              <Route
                path="residenciales"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN']}>
                    <ResidencialesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="usuarios"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN']}>
                    <UsuariosPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="residentes"
                element={
                  <ProtectedRoute requiredRoles={['ADMIN_RESIDENCIAL']}>
                    <ResidentesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="auditoria"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN_RESIDENCIAL']}>
                    <AuditoriaPage />
                  </ProtectedRoute>
                }
              />
              <Route path="estados" element={<EstadosPage />} />
              <Route path="mi-estado" element={<EstadosPage />} />
              <Route path="pagos" element={<PagosPage />} />
              <Route path="amonestaciones" element={<AmonestacionesPage />} />
              <Route path="mis-amonestaciones" element={<AmonestacionesPage />} />
              <Route path="espacios" element={<EspaciosPage />} />
              <Route path="reservas" element={<ReservasPage />} />
              <Route path="mis-reservas" element={<ReservasPage />} />
              <Route path="accesos" element={<AccesosPage />} />
              <Route path="mis-accesos" element={<AccesosPage />} />
              <Route path="mudanzas" element={<MudanzasPage />} />
              <Route path="mis-mudanzas" element={<MudanzasPage />} />
              <Route path="encuestas" element={<EncuestasPage />} />
              <Route path="calendario" element={<CalendarioPage />} />
              <Route path="visitas" element={<VisitasPage />} />
              <Route path="entregas" element={<EntregasPage />} />
              <Route path="garantias" element={<GarantiasPage />} />
              <Route path="prospectos" element={<ProspectosPage />} />
              <Route path="negocios" element={<NegociosPage />} />
              <Route path="reservas-comerciales" element={<ReservasComercialesPage />} />
              <Route path="pcv" element={<PCVPage />} />
              <Route path="comisiones" element={<ComisionesPage />} />
              <Route
                path="insights"
                element={
                  <ProtectedRoute requiredRoles={['SUPERADMIN', 'ADMIN_RESIDENCIAL']}>
                    <InsightsPage />
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
