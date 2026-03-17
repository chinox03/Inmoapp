import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, Search, Plus, CreditCard as Edit, Trash2, Eye, Shield, Building2, Phone, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Dialog } from '../../../components/ui/Dialog';
import { UserRole } from '../../../types/database.types';
import { supabase } from '../../../lib/supabase';
import {
  UsuarioFromDB,
  getUsuariosFallback,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  CreateUsuarioPayload,
} from './service';

const ROL_LABELS: Record<UserRole, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN_RESIDENCIAL: 'Admin Residencial',
  IT: 'Soporte IT',
  SEGURIDAD: 'Seguridad',
  RESIDENTE: 'Residente',
};

const ROL_COLORS: Record<UserRole, 'danger' | 'info' | 'success' | 'warning' | 'default'> = {
  SUPERADMIN: 'danger',
  ADMIN_RESIDENCIAL: 'info',
  IT: 'warning',
  SEGURIDAD: 'success',
  RESIDENTE: 'default',
};

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterResidencial, setFilterResidencial] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UsuarioFromDB | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [residenciales, setResidenciales] = useState<Array<{ id: string; nombre: string }>>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'RESIDENTE' as UserRole,
    residencial_id: '',
    unidad: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsuariosFallback();
      setUsuarios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResidenciales = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('residenciales')
        .select('id, nombre')
        .order('nombre');
      if (data && data.length > 0) {
        setResidenciales(data);
      }
    } catch (err) {
      console.error('Error fetching residenciales:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios();
    fetchResidenciales();
  }, [fetchUsuarios, fetchResidenciales]);

  const filteredUsers = useMemo(() => {
    return usuarios.filter((user) => {
      const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.telefono || '').includes(searchTerm);

      const matchesRole = filterRole === 'all' || user.rol === filterRole;
      const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;
      const matchesResidencial = filterResidencial === 'all' || user.residencial_id === filterResidencial;

      return matchesSearch && matchesRole && matchesStatus && matchesResidencial;
    });
  }, [usuarios, searchTerm, filterRole, filterStatus, filterResidencial]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'RESIDENTE',
      residencial_id: '',
      unidad: '',
      estado: 'activo',
    });
    setFormError(null);
  };

  const handleViewDetails = (user: UsuarioFromDB) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEdit = (user: UsuarioFromDB) => {
    setSelectedUser(user);
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      password: '',
      telefono: user.telefono || '',
      rol: user.rol as UserRole,
      residencial_id: user.residencial_id || '',
      unidad: user.unidad || '',
      estado: (user.estado as 'activo' | 'inactivo') || 'activo',
    });
    setFormError(null);
    setShowEditModal(true);
  };

  const handleDelete = (user: UsuarioFromDB) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFormError(null);

    const payload: CreateUsuarioPayload = {
      email: formData.email,
      password: formData.password,
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      rol: formData.rol,
      residencial_id: formData.residencial_id || undefined,
      unidad: formData.unidad || undefined,
    };

    const result = await createUsuario(payload);

    if (!result.success) {
      setFormError(result.error || 'Error al crear usuario');
      setActionLoading(false);
      return;
    }

    handleCloseAddModal();
    await fetchUsuarios();
    setActionLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    setFormError(null);

    const updates: Record<string, unknown> = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
      rol: formData.rol,
      residencial_id: formData.residencial_id || null,
      unidad: formData.unidad || null,
      estado: formData.estado,
    };

    if (formData.email && formData.email !== selectedUser.email) {
      updates.email = formData.email;
    }
    if (formData.password) {
      updates.password = formData.password;
    }

    const result = await updateUsuario(selectedUser.id, updates);

    if (!result.success) {
      setFormError(result.error || 'Error al actualizar usuario');
      setActionLoading(false);
      return;
    }

    handleCloseEditModal();
    await fetchUsuarios();
    setActionLoading(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    const result = await deleteUsuario(selectedUser.id);

    if (!result.success) {
      setFormError(result.error || 'Error al desactivar usuario');
      setActionLoading(false);
      return;
    }

    setShowDeleteModal(false);
    setSelectedUser(null);
    await fetchUsuarios();
    setActionLoading(false);
  };

  const statsCards = [
    {
      title: 'Total Usuarios',
      value: usuarios.length,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Usuarios Activos',
      value: usuarios.filter((u) => u.estado === 'activo').length,
      icon: Shield,
      color: 'bg-green-500',
    },
    {
      title: 'Admins Residenciales',
      value: usuarios.filter((u) => u.rol === 'ADMIN_RESIDENCIAL').length,
      icon: Building2,
      color: 'bg-blue-600',
    },
    {
      title: 'Residentes',
      value: usuarios.filter((u) => u.rol === 'RESIDENTE').length,
      icon: Users,
      color: 'bg-gray-500',
    },
  ];

  const UserForm = ({ onSubmit, submitLabel, showPassword }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; showPassword: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {formError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="form-nombre" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <Input id="form-nombre" name="nombre" placeholder="Ej: Juan" value={formData.nombre} onChange={handleInputChange} required />
        </div>
        <div>
          <label htmlFor="form-apellido" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Apellido
          </label>
          <Input id="form-apellido" name="apellido" placeholder="Ej: Perez" value={formData.apellido} onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="form-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <Input id="form-email" name="email" type="email" placeholder="usuario@ejemplo.com" value={formData.email} onChange={handleInputChange} required />
        </div>
        {showPassword && (
          <div>
            <label htmlFor="form-password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {submitLabel === 'Crear Usuario' ? 'Contraseña' : 'Nueva Contraseña'} {submitLabel === 'Crear Usuario' && <span className="text-red-500">*</span>}
            </label>
            <Input
              id="form-password"
              name="password"
              type="password"
              placeholder={submitLabel === 'Crear Usuario' ? 'Mínimo 6 caracteres' : 'Dejar vacío para no cambiar'}
              value={formData.password}
              onChange={handleInputChange}
              required={submitLabel === 'Crear Usuario'}
            />
          </div>
        )}
        <div>
          <label htmlFor="form-telefono" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Telefono
          </label>
          <Input id="form-telefono" name="telefono" placeholder="+502 1234-5678" value={formData.telefono} onChange={handleInputChange} />
        </div>
        <div>
          <label htmlFor="form-rol" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Rol <span className="text-red-500">*</span>
          </label>
          <select
            id="form-rol"
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="RESIDENTE">Residente</option>
            <option value="ADMIN_RESIDENCIAL">Admin Residencial</option>
            <option value="SEGURIDAD">Seguridad</option>
            <option value="IT">Soporte IT</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
        <div>
          <label htmlFor="form-estado" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            id="form-estado"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        {(formData.rol === 'ADMIN_RESIDENCIAL' || formData.rol === 'RESIDENTE' || formData.rol === 'SEGURIDAD') && (
          <>
            <div>
              <label htmlFor="form-residencial" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Residencial
              </label>
              <select
                id="form-residencial"
                name="residencial_id"
                value={formData.residencial_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un residencial</option>
                {residenciales.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>
            {formData.rol === 'RESIDENTE' && (
              <div>
                <label htmlFor="form-unidad" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Unidad
                </label>
                <Input id="form-unidad" name="unidad" placeholder="Ej: Casa 5, Apto 201" value={formData.unidad} onChange={handleInputChange} />
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={showPassword && submitLabel === 'Crear Usuario' ? handleCloseAddModal : handleCloseEditModal} disabled={actionLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={actionLoading}>
          {actionLoading ? 'Procesando...' : submitLabel}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra todos los usuarios del sistema y sus permisos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsuarios} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre, email o telefono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los roles</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN_RESIDENCIAL">Admin Residencial</option>
                <option value="IT">Soporte IT</option>
                <option value="SEGURIDAD">Seguridad</option>
                <option value="RESIDENTE">Residente</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              {residenciales.length > 0 && (
                <select
                  value={filterResidencial}
                  onChange={(e) => setFilterResidencial(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los residenciales</option>
                  {residenciales.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Residencial</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Registro</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {user.nombre} {user.apellido}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.telefono || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={ROL_COLORS[user.rol as UserRole] || 'gray'}>
                          {ROL_LABELS[user.rol as UserRole] || user.rol}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {user.residencial?.nombre || '-'}
                        </p>
                        {user.unidad && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.unidad}</p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.estado === 'activo' ? 'success' : 'default'}>
                          {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('es-GT')
                            : '-'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.rol !== 'SUPERADMIN' && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Desactivar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detalles del Usuario">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedUser.nombre} {selectedUser.apellido}
                </h3>
                <Badge variant={ROL_COLORS[selectedUser.rol as UserRole] || 'gray'} className="mt-2">
                  {ROL_LABELS[selectedUser.rol as UserRole] || selectedUser.rol}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.email || '-'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
                <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedUser.telefono || '-'}</span>
                </div>
              </div>
              {selectedUser.residencial?.nombre && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Residencial</label>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{selectedUser.residencial.nombre}</span>
                  </div>
                </div>
              )}
              {selectedUser.unidad && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Unidad</label>
                  <p className="text-gray-900 dark:text-gray-100">{selectedUser.unidad}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                <Badge variant={selectedUser.estado === 'activo' ? 'green' : 'gray'}>
                  {selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Fecha de Registro</label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedUser.created_at
                    ? new Date(selectedUser.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '-'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>Cerrar</Button>
              <Button onClick={() => { setShowDetailModal(false); handleEdit(selectedUser); }}>Editar Usuario</Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog open={showAddModal} onClose={handleCloseAddModal} title="Nuevo Usuario">
        <UserForm onSubmit={handleSubmit} submitLabel="Crear Usuario" showPassword={true} />
      </Dialog>

      <Dialog open={showEditModal} onClose={handleCloseEditModal} title="Editar Usuario">
        <UserForm onSubmit={handleUpdate} submitLabel="Guardar Cambios" showPassword={true} />
      </Dialog>

      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmar Desactivacion">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Se desactivara al usuario{' '}
            <span className="font-semibold">{selectedUser?.nombre} {selectedUser?.apellido}</span>.
            No podra iniciar sesion hasta que sea reactivado.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>Cancelar</Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
              {actionLoading ? 'Procesando...' : 'Desactivar Usuario'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
