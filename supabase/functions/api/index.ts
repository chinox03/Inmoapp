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
    const url = new URL(req.url);
    const pathParts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
    const resource = pathParts[0] || "";
    const resourceId = pathParts[1] || "";

    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("Apikey") || req.headers.get("apikey");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    let userId: string | null = null;
    let userRole: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return errorResponse("Invalid or expired token", 401);
      }
      userId = user.id;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("rol")
        .eq("id", userId)
        .maybeSingle();

      userRole = profile?.rol || null;
    }

    if (!userId) {
      return errorResponse("Authentication required", 401);
    }

    if (!["SUPERADMIN", "ADMIN_RESIDENCIAL"].includes(userRole || "")) {
      return errorResponse("Insufficient permissions", 403);
    }

    switch (resource) {
      case "prospectos":
        return handleProspectos(req, supabaseAdmin, resourceId, userRole!);
      case "negocios":
        return handleNegocios(req, supabaseAdmin, resourceId, userRole!);
      case "webhooks":
        return handleWebhooks(req, supabaseAdmin, resourceId, userRole!);
      default:
        return errorResponse("Resource not found", 404);
    }
  } catch (err) {
    console.error("API error:", err);
    return errorResponse("Internal server error", 500);
  }
});

async function handleProspectos(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  id: string,
  role: string
) {
  const method = req.method;

  if (method === "GET") {
    if (id) {
      const { data, error } = await supabase
        .from("prospectos")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return errorResponse(error.message);
      if (!data) return errorResponse("Prospecto not found", 404);
      return jsonResponse(data);
    }

    const url = new URL(req.url);
    const estado = url.searchParams.get("estado");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = supabase
      .from("prospectos")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (estado) query = query.eq("estado", estado);

    const { data, error, count } = await query;
    if (error) return errorResponse(error.message);

    return jsonResponse({ data, total: count, limit, offset });
  }

  if (method === "POST") {
    const body = await req.json();
    const { nombre, apellido, email, telefono, origen, interes, proyecto, estado } = body;

    if (!nombre || !email) {
      return errorResponse("nombre and email are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format");
    }

    const { data, error } = await supabase
      .from("prospectos")
      .insert([{
        nombre,
        apellido: apellido || "",
        email,
        telefono: telefono || "",
        origen: origen || "API",
        interes: interes || "",
        proyecto: proyecto || "",
        estado: estado || "Nuevo",
      }])
      .select()
      .single();

    if (error) return errorResponse(error.message);

    await dispatchWebhook(supabase, "prospecto.created", data);

    return jsonResponse(data, 201);
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("prospectos")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);

    await dispatchWebhook(supabase, "prospecto.updated", data);

    return jsonResponse(data);
  }

  if (method === "DELETE" && id) {
    if (role !== "SUPERADMIN") {
      return errorResponse("Only SUPERADMIN can delete prospectos", 403);
    }
    const { error } = await supabase.from("prospectos").delete().eq("id", id);
    if (error) return errorResponse(error.message);

    await dispatchWebhook(supabase, "prospecto.deleted", { id });

    return jsonResponse({ success: true });
  }

  return errorResponse("Method not allowed", 405);
}

async function handleNegocios(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  id: string,
  role: string
) {
  const method = req.method;

  if (method === "GET") {
    if (id) {
      const { data, error } = await supabase
        .from("negocios")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return errorResponse(error.message);
      if (!data) return errorResponse("Negocio not found", 404);
      return jsonResponse(data);
    }

    const url = new URL(req.url);
    const etapa = url.searchParams.get("etapa");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = supabase
      .from("negocios")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (etapa) query = query.eq("etapa", etapa);

    const { data, error, count } = await query;
    if (error) return errorResponse(error.message);

    return jsonResponse({ data, total: count, limit, offset });
  }

  if (method === "POST") {
    const body = await req.json();
    const { prospecto_nombre, email, telefono, proyecto, tipo_interes } = body;

    if (!prospecto_nombre || !email) {
      return errorResponse("prospecto_nombre and email are required");
    }

    const record: Record<string, unknown> = {
      prospecto_nombre,
      email,
      telefono: telefono || "",
      unidad: body.unidad || "",
      proyecto: proyecto || "",
      tipo_interes: tipo_interes || "",
      etapa: body.etapa || "Interesado",
      valor: body.valor || 0,
      actividades: body.actividades || [],
      notas: body.notas || [],
    };

    if (body.prospecto_id) {
      record.prospecto_id = body.prospecto_id;
    }

    const { data, error } = await supabase
      .from("negocios")
      .insert([record])
      .select()
      .single();

    if (error) return errorResponse(error.message);

    await dispatchWebhook(supabase, "negocio.created", data);

    return jsonResponse(data, 201);
  }

  if (method === "PUT" && id) {
    const body = await req.json();

    const oldData = await supabase.from("negocios").select("etapa").eq("id", id).maybeSingle();
    const previousEtapa = oldData.data?.etapa;

    const { data, error } = await supabase
      .from("negocios")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);

    if (previousEtapa && body.etapa && previousEtapa !== body.etapa) {
      await dispatchWebhook(supabase, "negocio.stage_changed", {
        ...data,
        previous_etapa: previousEtapa,
      });
    } else {
      await dispatchWebhook(supabase, "negocio.updated", data);
    }

    return jsonResponse(data);
  }

  if (method === "DELETE" && id) {
    if (role !== "SUPERADMIN") {
      return errorResponse("Only SUPERADMIN can delete negocios", 403);
    }
    const { error } = await supabase.from("negocios").delete().eq("id", id);
    if (error) return errorResponse(error.message);

    await dispatchWebhook(supabase, "negocio.deleted", { id });

    return jsonResponse({ success: true });
  }

  return errorResponse("Method not allowed", 405);
}

async function handleWebhooks(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  id: string,
  role: string
) {
  if (role !== "SUPERADMIN") {
    return errorResponse("Only SUPERADMIN can manage webhooks", 403);
  }

  const method = req.method;

  if (method === "GET") {
    if (id) {
      const { data, error } = await supabase
        .from("webhook_endpoints")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) return errorResponse(error.message);
      if (!data) return errorResponse("Webhook not found", 404);
      return jsonResponse(data);
    }

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }

  if (method === "POST") {
    const body = await req.json();
    if (!body.nombre || !body.url || !body.eventos?.length) {
      return errorResponse("nombre, url, and eventos are required");
    }

    try {
      new URL(body.url);
    } catch {
      return errorResponse("Invalid URL format");
    }

    const { data, error } = await supabase
      .from("webhook_endpoints")
      .insert([{
        nombre: body.nombre,
        url: body.url,
        eventos: body.eventos,
        headers: body.headers || {},
        secret: body.secret || null,
        activo: body.activo !== false,
      }])
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return jsonResponse(data, 201);
  }

  if (method === "PUT" && id) {
    const body = await req.json();
    const { data, error } = await supabase
      .from("webhook_endpoints")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return errorResponse(error.message);
    return jsonResponse(data);
  }

  if (method === "DELETE" && id) {
    const { error } = await supabase.from("webhook_endpoints").delete().eq("id", id);
    if (error) return errorResponse(error.message);
    return jsonResponse({ success: true });
  }

  return errorResponse("Method not allowed", 405);
}

async function dispatchWebhook(
  supabase: ReturnType<typeof createClient>,
  evento: string,
  payload: unknown
) {
  try {
    const { data: endpoints } = await supabase
      .from("webhook_endpoints")
      .select("*")
      .eq("activo", true)
      .contains("eventos", [evento]);

    if (!endpoints?.length) return;

    for (const endpoint of endpoints) {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(endpoint.headers || {}),
      };

      if (endpoint.secret) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(endpoint.secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const payloadStr = JSON.stringify({ evento, data: payload, timestamp: new Date().toISOString() });
        const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadStr));
        const hex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
        headers["X-Webhook-Signature"] = `sha256=${hex}`;
      }

      const body = JSON.stringify({
        evento,
        data: payload,
        timestamp: new Date().toISOString(),
      });

      let statusCode = 0;
      let responseBody = "";
      let errorMsg = "";
      let exitoso = false;

      try {
        const response = await fetch(endpoint.url, {
          method: "POST",
          headers,
          body,
          signal: AbortSignal.timeout(10000),
        });
        statusCode = response.status;
        responseBody = await response.text().catch(() => "");
        exitoso = response.ok;
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : String(err);
      }

      await supabase.from("webhook_logs").insert([{
        endpoint_id: endpoint.id,
        evento,
        payload: { evento, data: payload },
        status_code: statusCode || null,
        response_body: responseBody.substring(0, 1000),
        error: errorMsg || null,
        intentos: 1,
        exitoso,
      }]);
    }
  } catch (err) {
    console.error("Webhook dispatch error:", err);
  }
}
