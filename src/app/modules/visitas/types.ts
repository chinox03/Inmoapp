export interface OCRResult {
  firstName: string;
  lastName: string;
  documentNumber: string;
  confidence: number;
}

export interface Resident {
  id: string;
  name: string;
  unitNumber: string;
  residencialId: string;
  residencialName: string;
  phone?: string;
}

export interface Visit {
  id: string;
  timestamp: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorDocumentNumber: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  residencialName: string;
  visitPurpose: string;
  registeredBy: string;
  exitTime?: string;
  status: 'active' | 'completed';
}

export interface VisitFormData {
  visitorFirstName: string;
  visitorLastName: string;
  visitorDocumentNumber: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  residencialName?: string;
  visitPurpose: string;
}
