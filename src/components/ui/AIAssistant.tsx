import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Sparkles, Loader } from 'lucide-react';
import { Button } from './Button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  context?: string;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  'Analiza las tendencias de ventas del último trimestre',
  'Identifica los principales problemas de satisfacción del cliente',
  'Sugiere mejoras para optimizar el proceso de entrega',
  'Compara el rendimiento entre diferentes residenciales',
  'Predice las ventas para el próximo mes',
  'Qué factores afectan más la satisfacción del cliente',
];

const AI_RESPONSES: { [key: string]: string } = {
  default: `Con base en el análisis de los datos disponibles, he identificado varios insights clave:

• Las ventas han mostrado un crecimiento sostenido del 15% en los últimos 3 meses
• El tiempo promedio de conversión ha mejorado de 45 a 32 días
• Los residenciales con mayor satisfacción comparten características comunes en sus procesos de entrega

Te recomendaría enfocarte en:
1. Replicar las mejores prácticas de los residenciales top performers
2. Implementar seguimientos más frecuentes en la etapa de cotización
3. Optimizar los tiempos de respuesta en atención al cliente`,

  ventas: `Análisis de Tendencias de Ventas - Últimos 3 Meses:

HALLAZGOS CLAVE:
• Crecimiento mensual promedio: +18.5%
• Mejor mes: Febrero con $2.4M en ventas
• Tasa de conversión mejoró de 22% a 29%
• El canal digital genera 42% de los leads de calidad

INSIGHTS ACCIONABLES:
1. Los prospectos que reciben seguimiento dentro de las primeras 24hrs tienen 3.2x más probabilidad de cerrar
2. Las visitas virtuales han incrementado la conversión en un 35%
3. El precio promedio de venta subió 8% sin afectar el volumen

RECOMENDACIONES:
→ Invertir más en marketing digital (ROI actual: 4.2x)
→ Implementar sistema de respuesta rápida automatizada
→ Capacitar al equipo en técnicas de cierre consultivo`,

  satisfaccion: `Análisis de Satisfacción del Cliente:

MÉTRICAS ACTUALES:
• NPS Score: 68 (Bueno, pero mejorable)
• CSAT Promedio: 4.2/5.0
• Tasa de quejas: 12% (3% por encima del objetivo)

PROBLEMAS IDENTIFICADOS:
1. Tiempos de respuesta en garantías: 5.2 días (meta: 3 días)
2. Comunicación durante construcción: Principal motivo de insatisfacción
3. Procesos de entrega: 23% reportan inconformidades menores

FACTORES DE MAYOR IMPACTO:
• Comunicación proactiva (+15% en satisfacción)
• Resolución rápida de garantías (+22% en NPS)
• Calidad de acabados (+18% en recomendaciones)

PLAN DE ACCIÓN SUGERIDO:
→ Implementar notificaciones automáticas de avance de obra
→ Reducir SLA de garantías a 48hrs para casos críticos
→ Crear checklist de calidad pre-entrega más riguroso`,

  entregas: `Optimización del Proceso de Entrega:

ESTADO ACTUAL:
• Tiempo promedio de entrega: 4.2 horas
• Tasa de re-inspecciones: 18%
• Satisfacción post-entrega: 4.1/5.0

ÁREAS DE OPORTUNIDAD:
1. El 34% de los retrasos se deben a documentación incompleta
2. Las entregas matutinas tienen 25% menos incidencias
3. Los clientes prefieren recibir el checklist con 48hrs de anticipación

MEJORES PRÁCTICAS DETECTADAS:
• Residencial "Los Álamos": 0% re-inspecciones últimos 2 meses
  - Usa videos pre-entrega de cada unidad
  - Envía checklist digital 3 días antes
  - Asigna ingeniero dedicado por entrega

RECOMENDACIONES:
→ Digitalizar completamente el proceso de documentación
→ Implementar sistema de video-verificación pre-entrega
→ Establecer ventanas de entrega más específicas (2hrs vs 4hrs)
→ Crear paquete de bienvenida digital interactivo`,

  comparacion: `Análisis Comparativo entre Residenciales:

TOP PERFORMERS (Últimos 6 meses):

1. RESIDENCIAL VALLE ALTO
   • Ventas: $3.2M (+28% vs promedio)
   • NPS: 75
   • Tiempo de cierre: 26 días
   • Factores de éxito: Equipo comercial experimentado, showroom virtual 3D

2. RESIDENCIAL MONTAÑA AZUL
   • Ventas: $2.8M (+15% vs promedio)
   • NPS: 72
   • Tiempo de cierre: 29 días
   • Factores de éxito: Ubicación premium, financiamiento flexible

NECESITAN ATENCIÓN:

1. RESIDENCIAL COSTA VERDE
   • Ventas: $1.2M (-22% vs promedio)
   • NPS: 58
   • Problemas: Retrasos en construcción, comunicación deficiente
   • Plan: Reforzar equipo, implementar reportes semanales

INSIGHTS CLAVE:
• Los residenciales con NPS >70 venden 2.3x más unidades
• La inversión en tecnología (tours virtuales) genera ROI de 5.1x
• El tamaño del equipo no correlaciona con ventas, pero sí la experiencia

ACCIONES RECOMENDADAS:
→ Replicar modelo de Valle Alto en proyectos nuevos
→ Intervención urgente en Costa Verde
→ Programa de mentoring entre equipos`,

  prediccion: `Predicción de Ventas - Próximo Mes:

MODELO PREDICTIVO (Confianza: 87%):
• Ventas esperadas: $2.1M - $2.4M
• Unidades proyectadas: 18-22
• Tasa de conversión estimada: 26-30%

FACTORES CONSIDERADOS:
• Estacionalidad histórica (+12% vs mes anterior)
• Pipeline actual: 78 prospectos calificados
• Tendencia macro del sector: Positiva
• Lanzamiento de nuevo proyecto: +15% en tráfico esperado

ESCENARIOS:

OPTIMISTA ($2.4M - 110% del objetivo):
- Todos los negocios en "Cotización Formal" cierran
- Nuevo proyecto genera 5+ ventas adicionales
- Probabilidad: 35%

BASE ($2.2M - 100% del objetivo):
- Conversión normal del pipeline
- 3 ventas del nuevo proyecto
- Probabilidad: 55%

CONSERVADOR ($2.0M - 91% del objetivo):
- 2 negocios grandes se postponen
- Lanzamiento con menos impacto
- Probabilidad: 10%

ACCIONES PARA MAXIMIZAR RESULTADOS:
→ Seguimiento intensivo a 12 leads calificados
→ Campaña de re-engagement con prospectos fríos
→ Evento de pre-venta para nuevo proyecto
→ Incentivos especiales para cierres antes de fin de mes`,

  factores: `Factores que Impactan la Satisfacción del Cliente:

ANÁLISIS DE CORRELACIÓN (datos de 2,400+ clientes):

FACTORES DE ALTO IMPACTO (>40% de varianza):

1. COMUNICACIÓN PROACTIVA (r=0.78)
   • Clientes con updates semanales: NPS 73
   • Clientes sin updates regulares: NPS 52
   • Impacto: +40% en satisfacción

2. CUMPLIMIENTO DE TIEMPOS (r=0.72)
   • Entregas a tiempo: 94% de satisfacción
   • Retrasos <1 mes: 68% de satisfacción
   • Retrasos >1 mes: 31% de satisfacción

3. CALIDAD DE ACABADOS (r=0.69)
   • Sin defectos: NPS 82
   • 1-3 defectos menores: NPS 61
   • 4+ defectos: NPS 38

FACTORES DE IMPACTO MEDIO (20-40% de varianza):

4. Velocidad de respuesta (r=0.58)
5. Amabilidad del personal (r=0.51)
6. Transparencia en costos (r=0.48)

INSIGHTS SORPRENDENTES:
• El precio NO es un factor significativo (r=0.12)
• La experiencia del agente importa más que años de experiencia
• Clientes que visitan obra tienen +23% satisfacción

RECOMENDACIONES PRIORIZADAS:
1. Implementar sistema de comunicación automatizada (Quick Win)
2. Programa de capacitación en gestión de expectativas
3. Proceso de QA más riguroso pre-entrega
4. Dashboard de cliente para seguimiento de avances`,
};

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('venta') || lowerMessage.includes('tendencia')) {
    return AI_RESPONSES.ventas;
  }
  if (lowerMessage.includes('satisfaccion') || lowerMessage.includes('satisfacci') || lowerMessage.includes('problema')) {
    return AI_RESPONSES.satisfaccion;
  }
  if (lowerMessage.includes('entrega') || lowerMessage.includes('optimiza') || lowerMessage.includes('proceso')) {
    return AI_RESPONSES.entregas;
  }
  if (lowerMessage.includes('compar') || lowerMessage.includes('rendimiento') || lowerMessage.includes('residencial')) {
    return AI_RESPONSES.comparacion;
  }
  if (lowerMessage.includes('predic') || lowerMessage.includes('proximo') || lowerMessage.includes('próximo')) {
    return AI_RESPONSES.prediccion;
  }
  if (lowerMessage.includes('factor') || lowerMessage.includes('afecta')) {
    return AI_RESPONSES.factores;
  }

  return AI_RESPONSES.default;
}

export function AIAssistant({ context, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hola, soy tu asistente de análisis de datos. Tengo acceso a toda la información de la plataforma y puedo ayudarte a:

• Identificar tendencias y patrones en los datos
• Generar recomendaciones estratégicas
• Predecir comportamientos futuros
• Comparar métricas entre periodos
• Detectar oportunidades de mejora

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Asistente BI</h3>
            <p className="text-xs text-blue-100">Análisis inteligente de datos</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Analizando datos...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Preguntas sugeridas:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
