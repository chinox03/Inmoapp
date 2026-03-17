import React, { useState } from 'react';
import { X, Plus, Trash2, Star, Hash, Type, BarChart3, CheckSquare } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

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

interface CreateSurveyModalProps {
  onClose: () => void;
  onSave: (survey: SurveyTemplate) => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: 'rating_scale', label: 'Escala 1-10', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'numeric', label: 'Numérico', icon: <Hash className="h-4 w-4" /> },
  { value: 'free_text', label: 'Texto Libre', icon: <Type className="h-4 w-4" /> },
  { value: 'star_rating', label: 'Estrellas', icon: <Star className="h-4 w-4" /> },
  { value: 'multiple_choice', label: 'Opción Múltiple', icon: <CheckSquare className="h-4 w-4" /> },
];

export function CreateSurveyModal({ onClose, onSave }: CreateSurveyModalProps) {
  const [surveyName, setSurveyName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', type: 'rating_scale', options: [] },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addQuestion = () => {
    if (questions.length >= 8) {
      setErrors({ ...errors, maxQuestions: 'Solo se permiten 8 preguntas por encuesta' });
      return;
    }
    const newQuestion: Question = {
      id: `${Date.now()}`,
      text: '',
      type: 'rating_scale',
      options: [],
    };
    setQuestions([...questions, newQuestion]);
    setErrors({ ...errors, maxQuestions: '' });
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      setErrors({ ...errors, minQuestions: 'Debe haber al menos 1 pregunta' });
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
    setErrors({ ...errors, minQuestions: '' });
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const updated = { ...q, [field]: value };
          if (field === 'type' && value !== 'multiple_choice') {
            updated.options = [];
          }
          if (field === 'type' && value === 'multiple_choice' && !updated.options?.length) {
            updated.options = ['', ''];
          }
          return updated;
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
          if (newOptions.length < 2) {
            setErrors({ ...errors, [`q${questionId}_options`]: 'Debe haber al menos 2 opciones' });
          } else {
            const newErrors = { ...errors };
            delete newErrors[`q${questionId}_options`];
            setErrors(newErrors);
          }
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!surveyName.trim()) {
      newErrors.surveyName = 'El nombre de la encuesta es obligatorio';
    }

    questions.forEach((q, index) => {
      if (!q.text.trim()) {
        newErrors[`q${q.id}_text`] = `La pregunta ${index + 1} es obligatoria`;
      }

      if (q.type === 'multiple_choice') {
        if (!q.options || q.options.length < 2) {
          newErrors[`q${q.id}_options`] = 'Debe haber al menos 2 opciones';
        } else {
          const emptyOptions = q.options.filter((opt) => !opt.trim());
          if (emptyOptions.length > 0) {
            newErrors[`q${q.id}_options`] = 'Todas las opciones deben tener texto';
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const survey: SurveyTemplate = {
      id: `survey-${Date.now()}`,
      name: surveyName,
      questions: questions,
      createdAt: new Date().toISOString(),
    };

    onSave(survey);
  };

  const getQuestionTypeIcon = (type: QuestionType) => {
    return QUESTION_TYPES.find((t) => t.value === type)?.icon;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Encuesta</h2>
            <p className="text-sm text-gray-600 mt-1">
              Diseña tu encuesta telefónica con hasta 8 preguntas
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nombre de la Encuesta <span className="text-red-600">*</span>
              </label>
              <Input
                type="text"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Ej: Satisfacción del Cliente Q4 2024"
                className="text-base"
              />
              {errors.surveyName && (
                <p className="text-xs text-red-600 mt-1">{errors.surveyName}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Preguntas ({questions.length}/8)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Agrega entre 1 y 8 preguntas para tu encuesta
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  disabled={questions.length >= 8}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Pregunta
                </Button>
              </div>

              {errors.maxQuestions && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">{errors.maxQuestions}</p>
                </div>
              )}

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-700">
                        Pregunta {index + 1}
                      </h4>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Texto de la pregunta <span className="text-red-600">*</span>
                        </label>
                        <Input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                          placeholder="Escribe tu pregunta aquí..."
                        />
                        {errors[`q${question.id}_text`] && (
                          <p className="text-xs text-red-600 mt-1">
                            {errors[`q${question.id}_text`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo de pregunta <span className="text-red-600">*</span>
                        </label>
                        <Select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, 'type', e.target.value as QuestionType)
                          }
                        >
                          {QUESTION_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                        {getQuestionTypeIcon(question.type)}
                        <span>
                          {question.type === 'rating_scale' && 'El residente responderá con escala del 1 al 10'}
                          {question.type === 'numeric' && 'El residente ingresará un número'}
                          {question.type === 'free_text' && 'El residente escribirá texto libre'}
                          {question.type === 'star_rating' && 'El residente calificará con 1 a 5 estrellas'}
                          {question.type === 'multiple_choice' && 'El residente seleccionará una opción'}
                        </span>
                      </div>

                      {question.type === 'multiple_choice' && (
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Opciones <span className="text-red-600">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              + Agregar opción
                            </button>
                          </div>

                          <div className="space-y-2">
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 font-medium w-6">
                                  {optIndex + 1}.
                                </span>
                                <Input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateOption(question.id, optIndex, e.target.value)
                                  }
                                  placeholder={`Opción ${optIndex + 1}`}
                                  className="text-sm"
                                />
                                {question.options && question.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => removeOption(question.id, optIndex)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          {errors[`q${question.id}_options`] && (
                            <p className="text-xs text-red-600 mt-1">
                              {errors[`q${question.id}_options`]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {questions.length} {questions.length === 1 ? 'pregunta agregada' : 'preguntas agregadas'}
            </p>
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar Encuesta
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
