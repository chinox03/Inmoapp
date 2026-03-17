export interface ContableWebhookPayload {
  residencialId: string;
  residenteId: string;
  tipo: 'pago' | 'estado_cuenta' | 'amonestacion';
  monto?: number;
  descripcion: string;
  fecha: Date;
  metadata?: Record<string, unknown>;
}

export async function postToContableWebhook(_payload: ContableWebhookPayload): Promise<void> {
  // Webhook dispatching is now handled server-side via the Edge Function
  // webhook dispatcher. Configure endpoints in the webhook_endpoints table.
  // This client-side function is a no-op kept for backward compatibility.
}
