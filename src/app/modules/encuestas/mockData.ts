import { TipoEncuesta, SurveyTemplate } from './types';

export const TIPOS_ENCUESTA: TipoEncuesta[] = [
  {
    id: 'satisfaccion-servicios',
    nombre: 'Satisfacción con Servicios',
    descripcion: 'Evalúa la satisfacción del residente con los servicios del residencial',
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo calificaría la limpieza de las áreas comunes?',
        tipo: 'escala',
        escala_min: 1,
        escala_max: 5,
      },
      {
        id: 'p2',
        texto: '¿Está satisfecho con el servicio de seguridad?',
        tipo: 'si_no',
      },
      {
        id: 'p3',
        texto: '¿Cómo califica el mantenimiento de las instalaciones?',
        tipo: 'opcion_multiple',
        opciones: ['Excelente', 'Bueno', 'Regular', 'Malo', 'Muy malo'],
      },
      {
        id: 'p4',
        texto: '¿Qué tan rápido se resuelven sus solicitudes de mantenimiento?',
        tipo: 'opcion_multiple',
        opciones: ['Muy rápido (24 horas)', 'Rápido (2-3 días)', 'Normal (1 semana)', 'Lento (más de 1 semana)'],
      },
      {
        id: 'p5',
        texto: '¿Recomendaría este residencial a otras personas?',
        tipo: 'si_no',
      },
      {
        id: 'p6',
        texto: '¿Qué servicio le gustaría que mejoráramos?',
        tipo: 'texto_corto',
      },
    ],
  },
  {
    id: 'seguridad-residencial',
    nombre: 'Seguridad Residencial',
    descripcion: 'Evalúa la percepción de seguridad y control de accesos',
    preguntas: [
      {
        id: 'p1',
        texto: '¿Se siente seguro viviendo en este residencial?',
        tipo: 'escala',
        escala_min: 1,
        escala_max: 5,
      },
      {
        id: 'p2',
        texto: '¿El personal de seguridad es atento y profesional?',
        tipo: 'si_no',
      },
      {
        id: 'p3',
        texto: '¿Cómo califica el control de acceso de visitantes?',
        tipo: 'opcion_multiple',
        opciones: ['Excelente', 'Bueno', 'Regular', 'Malo'],
      },
      {
        id: 'p4',
        texto: '¿Ha experimentado algún incidente de seguridad en los últimos 6 meses?',
        tipo: 'si_no',
      },
      {
        id: 'p5',
        texto: '¿Las cámaras de seguridad funcionan correctamente?',
        tipo: 'opcion_multiple',
        opciones: ['Sí, todas funcionan', 'La mayoría funciona', 'Algunas no funcionan', 'No sé'],
      },
      {
        id: 'p6',
        texto: '¿Qué aspecto de seguridad debería mejorarse?',
        tipo: 'texto_corto',
      },
    ],
  },
  {
    id: 'areas-comunes',
    nombre: 'Uso de Áreas Comunes',
    descripcion: 'Evalúa la satisfacción con áreas comunes y amenidades',
    preguntas: [
      {
        id: 'p1',
        texto: '¿Con qué frecuencia utiliza las áreas comunes?',
        tipo: 'opcion_multiple',
        opciones: ['Diariamente', 'Varias veces por semana', 'Una vez por semana', 'Raramente', 'Nunca'],
      },
      {
        id: 'p2',
        texto: '¿Cómo califica el estado del salón de eventos?',
        tipo: 'escala',
        escala_min: 1,
        escala_max: 5,
      },
      {
        id: 'p3',
        texto: '¿El sistema de reservas de áreas comunes es fácil de usar?',
        tipo: 'si_no',
      },
      {
        id: 'p4',
        texto: '¿Cómo califica la piscina y sus instalaciones?',
        tipo: 'opcion_multiple',
        opciones: ['Excelente', 'Bueno', 'Regular', 'Malo', 'No la uso'],
      },
      {
        id: 'p5',
        texto: '¿Las áreas de juegos infantiles están en buen estado?',
        tipo: 'opcion_multiple',
        opciones: ['Excelente estado', 'Buen estado', 'Necesita mantenimiento', 'No hay', 'No las uso'],
      },
      {
        id: 'p6',
        texto: '¿Qué amenidad adicional le gustaría que tuviera el residencial?',
        tipo: 'texto_corto',
      },
    ],
  },
  {
    id: 'comunicacion-administracion',
    nombre: 'Comunicación y Administración',
    descripcion: 'Evalúa la comunicación con la administración del residencial',
    preguntas: [
      {
        id: 'p1',
        texto: '¿Cómo califica la comunicación de la administración?',
        tipo: 'escala',
        escala_min: 1,
        escala_max: 5,
      },
      {
        id: 'p2',
        texto: '¿Recibe información oportuna sobre eventos y avisos importantes?',
        tipo: 'si_no',
      },
      {
        id: 'p3',
        texto: '¿Qué medio de comunicación prefiere para recibir información?',
        tipo: 'opcion_multiple',
        opciones: ['WhatsApp', 'Correo electrónico', 'SMS', 'App móvil', 'Llamada telefónica', 'Cartelera física'],
      },
      {
        id: 'p4',
        texto: '¿El personal administrativo responde rápido a sus consultas?',
        tipo: 'opcion_multiple',
        opciones: ['Siempre', 'Casi siempre', 'A veces', 'Raramente', 'Nunca'],
      },
      {
        id: 'p5',
        texto: '¿Asiste a las reuniones de residentes?',
        tipo: 'opcion_multiple',
        opciones: ['Siempre', 'Frecuentemente', 'Ocasionalmente', 'Nunca'],
      },
      {
        id: 'p6',
        texto: '¿Qué sugerencia tiene para mejorar la comunicación?',
        tipo: 'texto_corto',
      },
    ],
  },
];

export const MOCK_SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'template-1',
    name: 'Encuesta de Satisfacción General',
    createdAt: new Date(2024, 10, 15).toISOString(),
    questions: [
      {
        id: 'q1',
        text: '¿Qué tan satisfecho está con nuestro servicio?',
        type: 'rating_scale',
      },
      {
        id: 'q2',
        text: '¿Cuántas veces ha utilizado nuestros servicios este mes?',
        type: 'numeric',
      },
      {
        id: 'q3',
        text: '¿Qué aspecto podríamos mejorar?',
        type: 'free_text',
      },
      {
        id: 'q4',
        text: 'Califique la calidad de atención',
        type: 'star_rating',
      },
      {
        id: 'q5',
        text: '¿Cuál es su área de interés principal?',
        type: 'multiple_choice',
        options: ['Mantenimiento', 'Seguridad', 'Amenidades', 'Administración'],
      },
    ],
  },
];
