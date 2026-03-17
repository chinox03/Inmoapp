import { Resident, Visit } from './types';

export const MOCK_RESIDENTS: Resident[] = [
  {
    id: 'r1',
    name: 'Juan Pérez García',
    unitNumber: 'Apto 101',
    residencialId: '1',
    residencialName: 'Arcos Santa Maria I',
    phone: '6621-1234'
  },
  {
    id: 'r2',
    name: 'María González López',
    unitNumber: 'Apto 102',
    residencialId: '1',
    residencialName: 'Arcos Santa Maria I',
    phone: '6621-5678'
  },
  {
    id: 'r3',
    name: 'Carlos López Ramírez',
    unitNumber: 'Apto 205',
    residencialId: '2',
    residencialName: 'Arcos Santa Maria II',
    phone: '6622-9012'
  },
  {
    id: 'r4',
    name: 'Ana Martínez Sánchez',
    unitNumber: 'Apto 303',
    residencialId: '2',
    residencialName: 'Arcos Santa Maria II',
    phone: '6622-3456'
  },
  {
    id: 'r5',
    name: 'Luis Rodríguez Castro',
    unitNumber: 'Casa 12',
    residencialId: '3',
    residencialName: 'Villa del Sol',
    phone: '6623-7890'
  },
  {
    id: 'r6',
    name: 'Sofia Hernández Morales',
    unitNumber: 'Casa 15',
    residencialId: '3',
    residencialName: 'Villa del Sol',
    phone: '6623-1234'
  },
  {
    id: 'r7',
    name: 'Pedro Sánchez Torres',
    unitNumber: 'Lote 8',
    residencialId: '4',
    residencialName: 'Las Colinas',
    phone: '6624-5678'
  },
  {
    id: 'r8',
    name: 'Laura Flores Ruiz',
    unitNumber: 'Apto 401',
    residencialId: '4',
    residencialName: 'Las Colinas',
    phone: '6624-9012'
  },
  {
    id: 'r9',
    name: 'Miguel Ramírez Díaz',
    unitNumber: 'Apto 501',
    residencialId: '5',
    residencialName: 'Jardines del Norte',
    phone: '6625-3456'
  },
  {
    id: 'r10',
    name: 'Carmen Flores Vega',
    unitNumber: 'Apto 502',
    residencialId: '5',
    residencialName: 'Jardines del Norte',
    phone: '6625-7890'
  },
  {
    id: 'r11',
    name: 'Roberto Castro Núñez',
    unitNumber: 'Apto 601',
    residencialId: '6',
    residencialName: 'Costa Verde',
    phone: '6626-1234'
  },
  {
    id: 'r12',
    name: 'Patricia Morales León',
    unitNumber: 'Apto 602',
    residencialId: '6',
    residencialName: 'Costa Verde',
    phone: '6626-5678'
  },
  {
    id: 'r13',
    name: 'Fernando Silva Ortiz',
    unitNumber: 'Apto 103',
    residencialId: '1',
    residencialName: 'Arcos Santa Maria I',
    phone: '6621-2345'
  },
  {
    id: 'r14',
    name: 'Isabel Gutiérrez Ramos',
    unitNumber: 'Apto 204',
    residencialId: '2',
    residencialName: 'Arcos Santa Maria II',
    phone: '6622-6789'
  },
  {
    id: 'r15',
    name: 'Jorge Mendoza Vargas',
    unitNumber: 'Casa 18',
    residencialId: '3',
    residencialName: 'Villa del Sol',
    phone: '6623-4567'
  }
];

export const MOCK_VISITS: Visit[] = [
  {
    id: 'v1',
    timestamp: new Date(2024, 10, 21, 9, 15).toISOString(),
    visitorFirstName: 'Ricardo',
    visitorLastName: 'Delgado Montoya',
    visitorDocumentNumber: 'DEMR850425HDF',
    residentId: 'r1',
    residentName: 'Juan Pérez García',
    unitNumber: 'Apto 101',
    residencialName: 'Arcos Santa Maria I',
    visitPurpose: 'Visita familiar',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 21, 11, 30).toISOString(),
    status: 'completed'
  },
  {
    id: 'v2',
    timestamp: new Date(2024, 10, 21, 10, 45).toISOString(),
    visitorFirstName: 'Andrea',
    visitorLastName: 'Santos Cruz',
    visitorDocumentNumber: 'SACA920315MDF',
    residentId: 'r3',
    residentName: 'Carlos López Ramírez',
    unitNumber: 'Apto 205',
    residencialName: 'Arcos Santa Maria II',
    visitPurpose: 'Entrega de paquete',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 21, 11, 0).toISOString(),
    status: 'completed'
  },
  {
    id: 'v3',
    timestamp: new Date(2024, 10, 21, 14, 20).toISOString(),
    visitorFirstName: 'Gabriel',
    visitorLastName: 'Rojas Mejía',
    visitorDocumentNumber: 'ROMG880712HDF',
    residentId: 'r5',
    residentName: 'Luis Rodríguez Castro',
    unitNumber: 'Casa 12',
    residencialName: 'Villa del Sol',
    visitPurpose: 'Mantenimiento de aire acondicionado',
    registeredBy: 'Guardia López',
    status: 'active'
  },
  {
    id: 'v4',
    timestamp: new Date(2024, 10, 21, 15, 10).toISOString(),
    visitorFirstName: 'Valentina',
    visitorLastName: 'Jiménez Reyes',
    visitorDocumentNumber: 'JIRV950220MDF',
    residentId: 'r7',
    residentName: 'Pedro Sánchez Torres',
    unitNumber: 'Lote 8',
    residencialName: 'Las Colinas',
    visitPurpose: 'Visita social',
    registeredBy: 'Guardia López',
    status: 'active'
  },
  {
    id: 'v5',
    timestamp: new Date(2024, 10, 21, 16, 0).toISOString(),
    visitorFirstName: 'Héctor',
    visitorLastName: 'Domínguez Peña',
    visitorDocumentNumber: 'DOPH870530HDF',
    residentId: 'r9',
    residentName: 'Miguel Ramírez Díaz',
    unitNumber: 'Apto 501',
    residencialName: 'Jardines del Norte',
    visitPurpose: 'Reunión de negocios',
    registeredBy: 'Guardia Martínez',
    status: 'active'
  },
  {
    id: 'v6',
    timestamp: new Date(2024, 10, 20, 8, 30).toISOString(),
    visitorFirstName: 'Mónica',
    visitorLastName: 'Vega Silva',
    visitorDocumentNumber: 'VESM920810MDF',
    residentId: 'r2',
    residentName: 'María González López',
    unitNumber: 'Apto 102',
    residencialName: 'Arcos Santa Maria I',
    visitPurpose: 'Visita familiar',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 20, 12, 15).toISOString(),
    status: 'completed'
  },
  {
    id: 'v7',
    timestamp: new Date(2024, 10, 20, 13, 45).toISOString(),
    visitorFirstName: 'Javier',
    visitorLastName: 'Torres Blanco',
    visitorDocumentNumber: 'TOBJ880315HDF',
    residentId: 'r4',
    residentName: 'Ana Martínez Sánchez',
    unitNumber: 'Apto 303',
    residencialName: 'Arcos Santa Maria II',
    visitPurpose: 'Servicio de plomería',
    registeredBy: 'Guardia López',
    exitTime: new Date(2024, 10, 20, 16, 30).toISOString(),
    status: 'completed'
  },
  {
    id: 'v8',
    timestamp: new Date(2024, 10, 19, 11, 0).toISOString(),
    visitorFirstName: 'Daniela',
    visitorLastName: 'Ramos Ochoa',
    visitorDocumentNumber: 'RAOD950522MDF',
    residentId: 'r6',
    residentName: 'Sofia Hernández Morales',
    unitNumber: 'Casa 15',
    residencialName: 'Villa del Sol',
    visitPurpose: 'Visita social',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 19, 15, 20).toISOString(),
    status: 'completed'
  },
  {
    id: 'v9',
    timestamp: new Date(2024, 10, 19, 9, 30).toISOString(),
    visitorFirstName: 'Ernesto',
    visitorLastName: 'Cabrera León',
    visitorDocumentNumber: 'CALE860720HDF',
    residentId: 'r8',
    residentName: 'Laura Flores Ruiz',
    unitNumber: 'Apto 401',
    residencialName: 'Las Colinas',
    visitPurpose: 'Entrega de muebles',
    registeredBy: 'Guardia López',
    exitTime: new Date(2024, 10, 19, 10, 45).toISOString(),
    status: 'completed'
  },
  {
    id: 'v10',
    timestamp: new Date(2024, 10, 18, 16, 15).toISOString(),
    visitorFirstName: 'Beatriz',
    visitorLastName: 'Fuentes Carrillo',
    visitorDocumentNumber: 'FUCB900615MDF',
    residentId: 'r10',
    residentName: 'Carmen Flores Vega',
    unitNumber: 'Apto 502',
    residencialName: 'Jardines del Norte',
    visitPurpose: 'Visita familiar',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 18, 19, 45).toISOString(),
    status: 'completed'
  },
  {
    id: 'v11',
    timestamp: new Date(2024, 10, 18, 14, 0).toISOString(),
    visitorFirstName: 'Sergio',
    visitorLastName: 'Molina Ponce',
    visitorDocumentNumber: 'MOPS870925HDF',
    residentId: 'r11',
    residentName: 'Roberto Castro Núñez',
    unitNumber: 'Apto 601',
    residencialName: 'Costa Verde',
    visitPurpose: 'Instalación de internet',
    registeredBy: 'Guardia López',
    exitTime: new Date(2024, 10, 18, 17, 30).toISOString(),
    status: 'completed'
  },
  {
    id: 'v12',
    timestamp: new Date(2024, 10, 17, 10, 30).toISOString(),
    visitorFirstName: 'Claudia',
    visitorLastName: 'Paredes Ávila',
    visitorDocumentNumber: 'PAAC930410MDF',
    residentId: 'r12',
    residentName: 'Patricia Morales León',
    unitNumber: 'Apto 602',
    residencialName: 'Costa Verde',
    visitPurpose: 'Visita social',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 17, 14, 0).toISOString(),
    status: 'completed'
  },
  {
    id: 'v13',
    timestamp: new Date(2024, 10, 17, 8, 45).toISOString(),
    visitorFirstName: 'Raúl',
    visitorLastName: 'Navarro Guzmán',
    visitorDocumentNumber: 'NAGR851118HDF',
    residentId: 'r13',
    residentName: 'Fernando Silva Ortiz',
    unitNumber: 'Apto 103',
    residencialName: 'Arcos Santa Maria I',
    visitPurpose: 'Servicio técnico',
    registeredBy: 'Guardia López',
    exitTime: new Date(2024, 10, 17, 11, 30).toISOString(),
    status: 'completed'
  },
  {
    id: 'v14',
    timestamp: new Date(2024, 10, 16, 15, 20).toISOString(),
    visitorFirstName: 'Liliana',
    visitorLastName: 'Campos Arroyo',
    visitorDocumentNumber: 'CAAL940228MDF',
    residentId: 'r14',
    residentName: 'Isabel Gutiérrez Ramos',
    unitNumber: 'Apto 204',
    residencialName: 'Arcos Santa Maria II',
    visitPurpose: 'Visita familiar',
    registeredBy: 'Guardia Martínez',
    exitTime: new Date(2024, 10, 16, 18, 40).toISOString(),
    status: 'completed'
  },
  {
    id: 'v15',
    timestamp: new Date(2024, 10, 16, 12, 0).toISOString(),
    visitorFirstName: 'Manuel',
    visitorLastName: 'Ibarra Castro',
    visitorDocumentNumber: 'IACM880505HDF',
    residentId: 'r15',
    residentName: 'Jorge Mendoza Vargas',
    unitNumber: 'Casa 18',
    residencialName: 'Villa del Sol',
    visitPurpose: 'Entrega de compra en línea',
    registeredBy: 'Guardia López',
    exitTime: new Date(2024, 10, 16, 12, 20).toISOString(),
    status: 'completed'
  }
];

export const MOCK_OCR_RESPONSES = [
  {
    firstName: 'Roberto',
    lastName: 'Campos Navarro',
    documentNumber: 'CANR910625HDF'
  },
  {
    firstName: 'Diana',
    lastName: 'Méndez Aguilar',
    documentNumber: 'MEAD890415MDF'
  },
  {
    firstName: 'Alberto',
    lastName: 'Vázquez Luna',
    documentNumber: 'VALA930820HDF'
  },
  {
    firstName: 'Carolina',
    lastName: 'Ortiz Hernández',
    documentNumber: 'ORHC940712MDF'
  }
];
