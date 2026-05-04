import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Clock, UserCog, Users, Calendar, MessageSquare, History, Check, Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/ui/Toast';
import {
  EntregaTicketDB,
  TicketHistorialEntry,
  TicketItemPendiente,
  TicketComentario,
  updateEntregaTicket,
  getTicketComentarios,
  addTicketComentario,
  getUsuariosAsignables,
} from './service';
import { getConfiguracionEntregas } from '../configuracion/service';

interface TicketDetailModalProps {
  ticket: EntregaTicketDB;
  onClose: () => void;
  onUpdated: () => void;
}

type Tab = 'detalle' | 'asignacion' | 'historial';

const PRIORITY_LABEL: Record<string, string> = { high: 'Alta', medium: 'Media', low: 'Baja' };
const STATUS_LABEL: Record<string, string> = {
  open: 'Abierto',
  assigned: 'Asignado',
  in_progress: 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export function TicketDetailModal({ ticket, onClose, onUpdated }: TicketDetailModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('detalle');
  const [saving, setSaving] = useState(false);

  const [items, setItems] = useState<TicketItemPendiente[]>(
    (ticket.items_pendientes || []).map((it: any, idx: number) =>
      typeof it === 'string'
        ? { id: `legacy-${idx}`, titulo: it, categoria: 'Pendiente', razon: '', resuelto: false }
        : it
    )
  );

  const [modo, setModo] = useState<'sistema' | 'libre'>(ticket.responsable_id ? 'sistema' : 'libre');
  const [responsableId, setResponsableId] = useState<string>(ticket.responsable_id || '');
  const [responsableNombre, setResponsableNombre] = useState<string>(ticket.responsable_nombre || '');
  const [equipo, setEquipo] = useState<string>(ticket.equipo_asignado || '');
  const [fechaCompromiso, setFechaCompromiso] = useState<string>(ticket.fecha_compromiso || '');
  const [descripcion, setDescripcion] = useState<string>(ticket.descripcion || '');

  const [equipos, setEquipos] = useState<string[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; nombre: string; rol: string }[]>([]);
  const [comentarios, setComentarios] = useState<TicketComentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');

  useEffect(() => {
    getConfiguracionEntregas().then((c) => setEquipos(c.equipos));
    getUsuariosAsignables().then(setUsuarios);
    getTicketComentarios(ticket.id).then(setComentarios);
  }, [ticket.id]);

  const historial = ticket.historial || [];

  const pushHistorial = (entry: Omit<TicketHistorialEntry, 'id' | 'timestamp' | 'usuario'>): TicketHistorialEntry[] => {
    return [
      ...historial,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        usuario: user?.nombre || 'Sistema',
        ...entry,
      },
    ];
  };

  const handleToggleItem = async (itemId: string) => {
    const nextItems = items.map((it) => (it.id === itemId ? { ...it, resuelto: !it.resuelto } : it));
    setItems(nextItems);
    const changed = nextItems.find((it) => it.id === itemId);
    const nuevoHistorial = pushHistorial({
      tipo: 'comentario',
      notas: `Item "${changed?.titulo}" marcado como ${changed?.resuelto ? 'resuelto' : 'pendiente'}`,
    });
    await updateEntregaTicket(ticket.id, { items_pendientes: nextItems, historial: nuevoHistorial }, user);
    onUpdated();
  };

  const handleSaveAsignacion = async () => {
    setSaving(true);
    const updates: any = {
      responsable_id: modo === 'sistema' ? responsableId || null : null,
      responsable_nombre: modo === 'sistema'
        ? usuarios.find((u) => u.id === responsableId)?.nombre || ''
        : responsableNombre,
      equipo_asignado: equipo,
      fecha_compromiso: fechaCompromiso || null,
      descripcion,
    };

    let nuevoHistorial = historial;
    const anteriorResp = ticket.responsable_nombre || 'Sin asignar';
    const nuevoResp = updates.responsable_nombre || 'Sin asignar';
    if (anteriorResp !== nuevoResp) {
      nuevoHistorial = [
        ...nuevoHistorial,
        {
          id: crypto.randomUUID(),
          tipo: 'asignacion',
          timestamp: new Date().toISOString(),
          usuario: user?.nombre || 'Sistema',
          from: anteriorResp,
          to: nuevoResp,
        },
      ];
    }

    if (ticket.estado === 'open' && (updates.responsable_id || updates.responsable_nombre)) {
      updates.estado = 'assigned';
      nuevoHistorial = [
        ...nuevoHistorial,
        {
          id: crypto.randomUUID(),
          tipo: 'estado',
          timestamp: new Date().toISOString(),
          usuario: user?.nombre || 'Sistema',
          from: 'open',
          to: 'assigned',
        },
      ];
    }

    updates.historial = nuevoHistorial;
    const res = await updateEntregaTicket(ticket.id, updates, user);
    setSaving(false);
    if (res.success) {
      showToast('Asignacion actualizada', 'success');
      onUpdated();
    } else {
      showToast(res.error || 'Error al actualizar', 'error');
    }
  };

  const handleChangeEstado = async (nuevoEstado: string) => {
    const nuevoHistorial = pushHistorial({
      tipo: 'estado',
      from: ticket.estado,
      to: nuevoEstado,
    });
    const updates: any = { estado: nuevoEstado, historial: nuevoHistorial };
    if (nuevoEstado === 'resolved') {
      updates.resuelto_en = new Date().toISOString();
      updates.fecha_resolucion = new Date().toISOString().split('T')[0];
    }
    const res = await updateEntregaTicket(ticket.id, updates, user);
    if (res.success) {
      showToast(`Estado actualizado a ${STATUS_LABEL[nuevoEstado]}`, 'success');
      onUpdated();
    }
  };

  const handleAddComentario = async () => {
    if (!nuevoComentario.trim()) return;
    const res = await addTicketComentario(ticket.id, nuevoComentario.trim(), user);
    if (res.success && res.data) {
      setComentarios([...comentarios, res.data]);
      setNuevoComentario('');
      const nuevoHistorial = pushHistorial({ tipo: 'comentario', notas: nuevoComentario.trim() });
      await updateEntregaTicket(ticket.id, { historial: nuevoHistorial }, user);
      onUpdated();
    }
  };

  const totalItems = items.length;
  const resueltos = items.filter((it) => it.resuelto).length;
  const todosResueltos = totalItems > 0 && resueltos === totalItems;

  const getStatusBadge = () => {
    switch (ticket.estado) {
      case 'open':
        return <Badge variant="info"><Clock className="h-3 w-3 mr-1 inline" />Abierto</Badge>;
      case 'assigned':
        return <Badge variant="info"><UserCog className="h-3 w-3 mr-1 inline" />Asignado</Badge>;
      case 'in_progress':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1 inline" />En Progreso</Badge>;
      case 'resolved':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1 inline" />Resuelto</Badge>;
      case 'closed':
        return <Badge variant="default">Cerrado</Badge>;
      default:
        return <Badge variant="default">{ticket.estado}</Badge>;
    }
  };

  const getPriorityBadge = () => {
    switch (ticket.prioridad) {
      case 'high':
        return <Badge variant="danger">Alta</Badge>;
      case 'medium':
        return <Badge variant="warning">Media</Badge>;
      case 'low':
        return <Badge variant="default">Baja</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {ticket.numero_ticket || `Ticket #${ticket.id.slice(0, 8)}`}
                </h2>
                {getStatusBadge()}
                {getPriorityBadge()}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Unidad {ticket.unidad} - {ticket.residente_nombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          {([
            { id: 'detalle', label: 'Detalle e Items', icon: CheckCircle },
            { id: 'asignacion', label: 'Asignacion', icon: UserCog },
            { id: 'historial', label: 'Historial y Comentarios', icon: History },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {tab === 'detalle' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Creado</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">
                    {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fecha Compromiso</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-1">
                    {ticket.fecha_compromiso
                      ? format(new Date(ticket.fecha_compromiso), 'dd/MM/yyyy')
                      : 'Sin definir'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Items Pendientes ({resueltos}/{totalItems} resueltos)
                  </h3>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: totalItems > 0 ? `${(resueltos / totalItems) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        item.resuelto
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                          item.resuelto
                            ? 'bg-green-500 border-green-500'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {item.resuelto && <Check className="h-3 w-3 text-white" />}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${item.resuelto ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {item.titulo}
                          </p>
                          <Badge variant="default">{item.categoria}</Badge>
                        </div>
                        {item.razon && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.razon}</p>
                        )}
                      </div>
                    </li>
                  ))}
                  {items.length === 0 && (
                    <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay items pendientes
                    </li>
                  )}
                </ul>
              </div>

              {ticket.descripcion && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Descripcion</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                    {ticket.descripcion}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {ticket.estado !== 'in_progress' && ticket.estado !== 'resolved' && ticket.estado !== 'closed' && (
                  <Button variant="outline" size="sm" onClick={() => handleChangeEstado('in_progress')}>
                    Marcar En Progreso
                  </Button>
                )}
                {ticket.estado !== 'resolved' && ticket.estado !== 'closed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleChangeEstado('resolved')}
                    disabled={!todosResueltos && items.length > 0}
                    title={!todosResueltos ? 'Resuelve todos los items pendientes primero' : ''}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Marcar Resuelto
                  </Button>
                )}
                {ticket.estado === 'resolved' && (
                  <Button variant="outline" size="sm" onClick={() => handleChangeEstado('closed')}>
                    Cerrar Ticket
                  </Button>
                )}
              </div>
            </div>
          )}

          {tab === 'asignacion' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Responsable
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModo('sistema')}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      modo === 'sistema'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Usuario del sistema
                  </button>
                  <button
                    type="button"
                    onClick={() => setModo('libre')}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      modo === 'libre'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <UserCog className="h-4 w-4 inline mr-2" />
                    Texto libre
                  </button>
                </div>
              </div>

              {modo === 'sistema' ? (
                <Select
                  label="Responsable"
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                >
                  <option value="">Seleccione un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.rol})
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label="Responsable (texto libre)"
                  value={responsableNombre}
                  onChange={(e) => setResponsableNombre(e.target.value)}
                  placeholder="Ej: Proveedor externo Juan Perez"
                />
              )}

              <Select label="Equipo Asignado" value={equipo} onChange={(e) => setEquipo(e.target.value)}>
                <option value="">Seleccione un equipo</option>
                {equipos.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </Select>

              <Input
                label="Fecha de Compromiso (SLA sugerido segun prioridad)"
                type="date"
                value={fechaCompromiso || ''}
                onChange={(e) => setFechaCompromiso(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripcion / Notas
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles adicionales sobre la asignacion..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="primary" onClick={handleSaveAsignacion} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Guardar Asignacion
                </Button>
              </div>
            </div>
          )}

          {tab === 'historial' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Agregar Comentario
                </h3>
                <div className="flex gap-2">
                  <textarea
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <Button variant="primary" onClick={handleAddComentario} disabled={!nuevoComentario.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Linea de Tiempo
                </h3>
                <div className="space-y-3">
                  {[...historial].reverse().map((h) => (
                    <div key={h.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        {h.tipo === 'estado' && <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {h.tipo === 'asignacion' && <UserCog className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {h.tipo === 'comentario' && <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {h.tipo === 'creacion' && <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        {h.tipo === 'resolucion' && <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{h.usuario}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(h.timestamp), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        {h.tipo === 'estado' && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Cambio estado: <span className="font-medium">{STATUS_LABEL[h.from || ''] || h.from}</span>
                            {' -> '}
                            <span className="font-medium">{STATUS_LABEL[h.to || ''] || h.to}</span>
                          </p>
                        )}
                        {h.tipo === 'asignacion' && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Reasignado: <span className="font-medium">{h.from}</span> {' -> '}{' '}
                            <span className="font-medium">{h.to}</span>
                          </p>
                        )}
                        {(h.tipo === 'comentario' || h.tipo === 'creacion' || h.tipo === 'resolucion') && h.notas && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{h.notas}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {historial.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Sin actividad</p>
                  )}
                </div>

                {comentarios.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Comentarios ({comentarios.length})
                    </h4>
                    <div className="space-y-2">
                      {comentarios.map((c) => (
                        <div key={c.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.autor_nombre}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.contenido}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
