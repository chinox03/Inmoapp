import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Ticket } from './types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { format } from 'date-fns';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
}

export function TicketModal({ ticket, onClose }: TicketModalProps) {
  const getStatusConfig = (status: Ticket['status']) => {
    switch (status) {
      case 'open':
        return { label: 'Abierto', icon: Clock, color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { label: 'En Progreso', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' };
      case 'resolved':
        return { label: 'Resuelto', icon: CheckCircle, color: 'bg-green-100 text-green-800' };
    }
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">Alta</Badge>;
      case 'medium':
        return <Badge variant="warning">Media</Badge>;
      case 'low':
        return <Badge variant="default">Baja</Badge>;
    }
  };

  const statusConfig = getStatusConfig(ticket.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${statusConfig.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ticket #{ticket.id}
              </h2>
              <p className="text-sm text-gray-500">
                Generado el {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Estado</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig.label}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Prioridad</p>
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Información de la Entrega</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Residencial:</span>
                  <span className="text-gray-900 font-medium">{ticket.residencialName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Unidad:</span>
                  <span className="text-gray-900 font-medium">{ticket.unitNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Propietario:</span>
                  <span className="text-gray-900 font-medium">{ticket.residentName}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Puntos Pendientes ({ticket.pendingItems.length})
              </h3>
              <ul className="space-y-2">
                {ticket.pendingItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {ticket.resolvedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Resuelto el {format(new Date(ticket.resolvedAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary">
            Imprimir Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
