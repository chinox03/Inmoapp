export type WarrantyStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'resolved';

export type TeamType = 'customer_experience' | 'operations' | 'construction' | 'finishing';

export type RejectionReason =
  | 'out_of_warranty'
  | 'customer_damage'
  | 'normal_wear'
  | 'incomplete_info'
  | 'duplicate'
  | 'other';

export type ClaimType =
  | 'door_frame'
  | 'door'
  | 'floor'
  | 'window'
  | 'electrical'
  | 'plumbing'
  | 'water_pressure'
  | 'water_temperature'
  | 'humidity'
  | 'leak'
  | 'paint'
  | 'tiles'
  | 'other';

export type ProblemLocation =
  | 'master_bedroom'
  | 'secondary_bedroom_1'
  | 'secondary_bedroom_2'
  | 'secondary_bedroom_3'
  | 'living_room'
  | 'dining_room'
  | 'kitchen'
  | 'master_bathroom'
  | 'secondary_bathroom'
  | 'guest_bathroom'
  | 'internal_garden'
  | 'external_garden'
  | 'backyard'
  | 'front_yard'
  | 'garage'
  | 'balcony'
  | 'terrace'
  | 'laundry_room'
  | 'storage'
  | 'hallway'
  | 'stairs';

export interface WarrantyFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  uploadedAt: string;
}

export interface ClaimItem {
  id: string;
  claimType: ClaimType;
  location: ProblemLocation;
  description: string;
  files: WarrantyFile[];
  resolutionStatus?: 'compliant' | 'non_compliant';
  resolutionNotes?: string;
  resolutionImages?: WarrantyFile[];
}

export interface StatusHistory {
  id: string;
  status: WarrantyStatus;
  timestamp: string;
  changedBy: string;
  notes?: string;
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  residencialId: string;
  residencialName: string;
  unitNumber: string;
  residentId: string;
  residentName: string;
  residentPhone: string;
  claims: ClaimItem[];
  status: WarrantyStatus;
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  estimatedCompletionDate?: string;
  assignedTeam?: TeamType;
  scheduledVisitDate?: string;
  rejectionReason?: RejectionReason;
  rejectionNotes?: string;
  signature?: string;
  statusHistory: StatusHistory[];
}

export interface WarrantyFormData {
  residencialId: string;
  unitNumber: string;
  residentId: string;
  claims: Omit<ClaimItem, 'id'>[];
}
