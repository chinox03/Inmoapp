import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/database.types';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.rol)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
