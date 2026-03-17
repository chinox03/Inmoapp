export interface Pregunta {
  id: string;
  texto: string;
  tipo: 'opcion_multiple' | 'escala' | 'texto_corto' | 'si_no';
  opciones?: string[];
  escala_min?: number;
  escala_max?: number;
}

export type QuestionType = 'rating_scale' | 'numeric' | 'free_text' | 'star_rating' | 'multiple_choice';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

export interface SurveyTemplate {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
}

export interface TipoEncuesta {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: Pregunta[];
}

export interface RespuestaEncuesta {
  pregunta_id: string;
  respuesta: string | number;
}

export interface Encuesta {
  id: string;
  residencial_id: string;
  residencial_nombre: string;
  residente_id: string;
  residente_nombre: string;
  residente_telefono: string;
  tipo_encuesta_id: string;
  tipo_encuesta_nombre: string;
  fecha_realizacion: string;
  realizada_por: string;
  duracion_minutos: number;
  respuestas: RespuestaEncuesta[];
  observaciones?: string;
}
