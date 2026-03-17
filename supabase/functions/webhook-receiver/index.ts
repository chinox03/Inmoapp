import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Only POST is allowed", 405);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname
      .replace(/^\/webhook-receiver\/?/, "")
      .split("/")
      .filter(Boolean);
    const action = pathParts[0] || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();

    switch (action) {
      case "lead":
        return handleIncomingLead(supabase, body);
      case "pago-notificacion":
        return handlePaymentNotification(supabase, body);
      default:
        return errorResponse("Unknown webhook action: " + action, 404);
    }
  } catch (err) {
    console.error("Webhook receiver error:", err);
    return errorResponse("Internal server error", 500);
  }
});

async function handleIncomingLead(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
) {
  const nombre = String(body.nombre || body.first_name || body.name || "").trim();
  const apellido = String(body.apellido || body.last_name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const telefono = String(body.telefono || body.phone || "").trim();
  const origen = String(body.origen || body.source || "API").trim();
  const interes = String(body.interes || body.interest || "").trim();
  const proyecto = String(body.proyecto || body.project || "").trim();

  if (!nombre) {
    return errorResponse("nombre (or name/first_name) is required");
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format");
    }
  }

  const { data, error } = await supabase
    .from("prospectos")
    .insert([{
      nombre,
      apellido,
      email,
      telefono,
      origen,
      interes,
      proyecto,
      estado: "Nuevo",
    }])
    .select()
    .single();

  if (error) {
    return errorResponse("Failed to create lead: " + error.message, 500);
  }

  return jsonResponse({ success: true, prospecto_id: data.id }, 201);
}

async function handlePaymentNotification(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
) {
  const referencia = String(body.referencia || body.reference || "").trim();
  const monto = Number(body.monto || body.amount || 0);
  const estado = String(body.estado || body.status || "").trim();

  if (!referencia) {
    return errorResponse("referencia (or reference) is required");
  }

  await supabase.from("audit_log").insert([{
    entidad: "pago_webhook",
    entidad_id: referencia,
    accion: "CREATE",
    diff: { monto, estado, raw_payload: body },
  }]);

  return jsonResponse({
    success: true,
    message: "Payment notification received and logged",
    referencia,
  });
}
