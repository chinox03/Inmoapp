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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Authentication required", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user: callerUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !callerUser) {
      return errorResponse("Invalid or expired token", 401);
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("rol")
      .eq("id", callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.rol !== "SUPERADMIN") {
      return errorResponse("Only SUPERADMIN can manage users", 403);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname
      .replace(/^\/user-management\/?/, "")
      .split("/")
      .filter(Boolean);
    const userId = pathParts[0] || "";

    if (req.method === "GET") {
      return await handleGetUsers(supabaseAdmin, userId, url);
    }

    if (req.method === "POST") {
      return await handleCreateUser(supabaseAdmin, req);
    }

    if (req.method === "PUT" && userId) {
      return await handleUpdateUser(supabaseAdmin, req, userId);
    }

    if (req.method === "DELETE" && userId) {
      return await handleDeleteUser(supabaseAdmin, userId);
    }

    return errorResponse("Method not allowed", 405);
  } catch (err) {
    console.error("User management error:", err);
    return errorResponse("Internal server error", 500);
  }
});

async function handleGetUsers(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  url: URL,
) {
  if (userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, residencial:residenciales(nombre)")
      .eq("id", userId)
      .maybeSingle();

    if (error) return errorResponse(error.message);
    if (!data) return errorResponse("User not found", 404);
    return jsonResponse(data);
  }

  const rol = url.searchParams.get("rol");
  const estado = url.searchParams.get("estado");
  const residencialId = url.searchParams.get("residencial_id");

  let query = supabase
    .from("profiles")
    .select("*, residencial:residenciales(nombre)")
    .order("created_at", { ascending: false });

  if (rol) query = query.eq("rol", rol);
  if (estado) query = query.eq("estado", estado);
  if (residencialId) query = query.eq("residencial_id", residencialId);

  const { data, error } = await query;
  if (error) return errorResponse(error.message);

  return jsonResponse(data || []);
}

async function handleCreateUser(
  supabase: ReturnType<typeof createClient>,
  req: Request,
) {
  const body = await req.json();
  const { email, password, nombre, apellido, telefono, rol, residencial_id, unidad } = body;

  if (!email || !password || !nombre || !rol) {
    return errorResponse(
      "email, password, nombre, and rol are required",
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return errorResponse("Invalid email format");
  }

  if (password.length < 6) {
    return errorResponse("Password must be at least 6 characters");
  }

  const validRoles = [
    "SUPERADMIN",
    "ADMIN_RESIDENCIAL",
    "IT",
    "SEGURIDAD",
    "RESIDENTE",
  ];
  if (!validRoles.includes(rol)) {
    return errorResponse(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return errorResponse(authError.message);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authData.user.id,
    nombre,
    apellido: apellido || "",
    telefono: telefono || "",
    rol,
    residencial_id: residencial_id || null,
    unidad: unidad || null,
    estado: "activo",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    return errorResponse(profileError.message);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, residencial:residenciales(nombre)")
    .eq("id", authData.user.id)
    .maybeSingle();

  return jsonResponse(
    { ...profile, email: authData.user.email },
    201,
  );
}

async function handleUpdateUser(
  supabase: ReturnType<typeof createClient>,
  req: Request,
  userId: string,
) {
  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.nombre !== undefined) updates.nombre = body.nombre;
  if (body.apellido !== undefined) updates.apellido = body.apellido;
  if (body.telefono !== undefined) updates.telefono = body.telefono;
  if (body.rol !== undefined) updates.rol = body.rol;
  if (body.residencial_id !== undefined)
    updates.residencial_id = body.residencial_id || null;
  if (body.unidad !== undefined) updates.unidad = body.unidad || null;
  if (body.estado !== undefined) updates.estado = body.estado;

  if (Object.keys(updates).length === 0 && !body.email && !body.password) {
    return errorResponse("No updates provided");
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) return errorResponse(error.message);
  }

  if (body.email || body.password) {
    const authUpdates: Record<string, unknown> = {};
    if (body.email) authUpdates.email = body.email;
    if (body.password) authUpdates.password = body.password;

    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      authUpdates,
    );
    if (error) return errorResponse(error.message);
  }

  if (body.estado === "inactivo") {
    await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "876000h",
    });
  } else if (body.estado === "activo") {
    await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, residencial:residenciales(nombre)")
    .eq("id", userId)
    .maybeSingle();

  return jsonResponse(profile);
}

async function handleDeleteUser(
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return errorResponse("User not found", 404);
  }

  if (profile.rol === "SUPERADMIN") {
    return errorResponse("Cannot delete SUPERADMIN users", 403);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ estado: "inactivo" })
    .eq("id", userId);

  if (profileError) return errorResponse(profileError.message);

  await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
  });

  return jsonResponse({ success: true, message: "User deactivated" });
}
