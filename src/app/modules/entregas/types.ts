export type CheckItemStatus = 'compliant' | 'non_compliant' | 'with_observations';

export interface CheckItem {
  id: string;
  label: string;
  status: CheckItemStatus | null;
  observations: string;
}

export interface Delivery {
  id: string;
  residencialId: string;
  residencialName: string;
  unitNumber: string;
  residentId: string;
  residentName: string;
  deliveryDate: string;
  checklistItems: CheckItem[];
  photos: UploadedFile[];
  signature: string | null;
  generalObservations: string;
  ticketId?: string;
  status: 'draft' | 'completed' | 'with_issues';
  createdAt: string;
  createdBy: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Ticket {
  id: string;
  deliveryId: string;
  unitNumber: string;
  residencialName: string;
  residentName: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  pendingItems: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface DeliveryFormData {
  residencialId: string;
  unitNumber: string;
  residentId: string;
  deliveryDate: string;
}
