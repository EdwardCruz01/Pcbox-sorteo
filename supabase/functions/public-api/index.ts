import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const apiPeruToken = Deno.env.get("APIPERU_TOKEN") ?? "";
const apiPeruDniUrl = "https://api.apiperu.dev/dni";
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  pdf: "application/pdf",
};
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function validDni(dni: unknown): dni is string {
  return typeof dni === "string" && /^\d{8}$/.test(dni);
}
function validEmail(email: unknown) {
  return (
    email === "" ||
    email == null ||
    (typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160)
  );
}
function validPhone(phone: unknown) {
  return typeof phone === "string" && /^\+?\d[\d\s-]{7,18}$/.test(phone);
}

function requestAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs = 10 * 60 * 1000,
) {
  const key = `${scope}:${requestAddress(request)}`;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit)
    throw new Error("Demasiadas solicitudes. Intenta nuevamente en unos minutos.");
  current.count += 1;
}

async function createReceiptUpload(data: Record<string, unknown>, request: Request) {
  enforceRateLimit(request, "receipt-upload", 12);
  if (!validDni(data.dni)) throw new Error("El DNI debe tener 8 dígitos.");
  const extension = typeof data.extension === "string" ? data.extension.toLowerCase() : "";
  const contentType = typeof data.contentType === "string" ? data.contentType.toLowerCase() : "";
  if (!/^(jpg|jpeg|png|webp|heic|pdf)$/.test(extension) || RECEIPT_TYPES[extension] !== contentType)
    throw new Error("Formato de comprobante no permitido.");
  const path = `${data.dni}/${crypto.randomUUID()}.${extension}`;
  const { data: signed, error } = await admin.storage
    .from("comprobantes")
    .createSignedUploadUrl(path);
  if (error || !signed?.token) throw new Error("No pudimos preparar la subida del comprobante.");
  return { path, token: signed.token };
}

async function consultDni(dni: string) {
  if (!apiPeruToken) throw new Error("La validación de DNI no está configurada en Supabase.");
  const response = await fetch(apiPeruDniUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiPeruToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dni }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true || !payload?.data?.nombre_completo) {
    throw new Error(payload?.message || "No encontramos datos para ese DNI.");
  }
  return {
    dni,
    nombreCompleto: String(payload.data.nombre_completo),
    fechaNacimiento: "",
    mayorDeEdad: null,
    fuente: "ApiPeruDev",
  };
}

async function createRegistration(data: Record<string, unknown>) {
  if (
    !validDni(data.dni) ||
    typeof data.raffleId !== "string" ||
    typeof data.fullName !== "string" ||
    typeof data.birthDate !== "string" ||
    data.adultConfirmed !== true ||
    data.termsAccepted !== true ||
    !validPhone(data.phone) ||
    !validEmail(data.email) ||
    typeof data.quantity !== "number" ||
    !Number.isInteger(data.quantity) ||
    data.quantity < 1 ||
    data.quantity > 50 ||
    typeof data.receiptPath !== "string"
  )
    throw new Error("Datos de inscripción inválidos.");
  const receiptMatch = data.receiptPath.match(
    /^(\d{8})\/([a-f0-9-]{8,64})\.(jpg|jpeg|png|webp|heic|pdf)$/i,
  );
  if (!receiptMatch || receiptMatch[1] !== data.dni)
    throw new Error("Ruta de comprobante inválida.");

  const person = await consultDni(data.dni);
  if (normalizeText(data.fullName) !== normalizeText(person.nombreCompleto))
    throw new Error("Los datos no coinciden con el DNI validado.");

  const { data: raffle, error: raffleError } = await admin
    .from("raffles")
    .select("id, ticket_price, status")
    .eq("id", data.raffleId)
    .maybeSingle();
  if (raffleError) throw raffleError;
  if (!raffle || raffle.status !== "activo")
    throw new Error("Este sorteo no admite inscripciones.");

  const fileName = data.receiptPath.split("/")[1];
  const { data: files, error: fileError } = await admin.storage
    .from("comprobantes")
    .list(data.dni, { search: fileName });
  const receipt = files?.find((file) => file.name === fileName);
  const receiptSize = Number(receipt?.metadata?.size ?? receipt?.metadata?.sizeBytes ?? 0);
  if (fileError || !receipt) throw new Error("No encontramos el comprobante subido.");
  if (receiptSize > MAX_RECEIPT_BYTES) {
    await admin.storage.from("comprobantes").remove([data.receiptPath]);
    throw new Error("El comprobante supera los 5 MB.");
  }
  if (
    !receipt?.metadata?.mimetype ||
    RECEIPT_TYPES[data.receiptPath.split(".").pop()?.toLowerCase() || ""] !==
      receipt.metadata.mimetype
  )
    throw new Error("No encontramos el comprobante subido.");

  const amount = Number(raffle.ticket_price) * data.quantity;
  const { data: registration, error } = await admin
    .from("registrations")
    .insert({
      raffle_id: data.raffleId,
      dni: data.dni,
      full_name: data.fullName,
      birth_date: data.birthDate || null,
      phone: data.phone,
      email: data.email || null,
      quantity: data.quantity,
      amount,
      receipt_url: data.receiptPath,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      status: "pendiente",
    })
    .select("id, status, amount, quantity")
    .single();
  if (error) {
    await admin.storage.from("comprobantes").remove([data.receiptPath]);
    throw error;
  }
  return registration;
}

async function findRegistrations(dni: string) {
  if (!validDni(dni)) throw new Error("El DNI debe tener 8 dígitos.");
  const { data: registrations, error } = await admin
    .from("registrations")
    .select(
      "id, full_name, quantity, amount, status, created_at, raffle_id, raffles(title, status, draw_date)",
    )
    .eq("dni", dni)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const ids = (registrations ?? []).map((registration) => registration.id);
  const { data: tickets, error: ticketError } = ids.length
    ? await admin
        .from("tickets")
        .select("registration_id, number")
        .in("registration_id", ids)
        .order("number")
    : { data: [], error: null };
  if (ticketError) throw ticketError;
  return (registrations ?? []).map((registration) => ({
    id: registration.id,
    nombre: registration.full_name,
    cantidad: registration.quantity,
    monto: Number(registration.amount),
    estado: registration.status,
    fecha: registration.created_at,
    sorteo: registration.raffles?.title ?? "Sorteo",
    sorteoEstado: registration.raffles?.status ?? "activo",
    fechaSorteo: registration.raffles?.draw_date ?? null,
    tickets: (tickets ?? [])
      .filter((ticket) => ticket.registration_id === registration.id)
      .map((ticket) => ticket.number),
  }));
}

async function handle(request: Request) {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método no permitido." }, 405);
  if (!supabaseUrl || !serviceRoleKey)
    return json({ error: "La función no tiene configurado Supabase en el servidor." }, 500);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    switch (body.action) {
      case "consultar-dni": {
        enforceRateLimit(request, "consult-dni", 20);
        if (!validDni(body.dni)) throw new Error("El DNI debe tener 8 dígitos.");
        return json(await consultDni(body.dni));
      }
      case "crear-upload":
        return json(await createReceiptUpload(body, request));
      case "crear-inscripcion":
        enforceRateLimit(request, "create-registration", 10);
        return json(await createRegistration(body));
      case "consultar-inscripciones":
        return json({ inscripciones: await findRegistrations(String(body.dni ?? "")) });
      case "suscribir-notificaciones": {
        if (
          typeof body.fullName !== "string" ||
          body.fullName.trim().length < 2 ||
          body.fullName.trim().length > 120 ||
          (!body.email && !body.phone) ||
          !validEmail(body.email) ||
          (body.phone && !validPhone(body.phone))
        )
          throw new Error("Ingresa un nombre y un correo o celular válido.");
        const email =
          typeof body.email === "string" && body.email ? body.email.trim().toLowerCase() : null;
        const phone =
          typeof body.phone === "string" && body.phone ? body.phone.replace(/[^\d+]/g, "") : null;
        const { error } = await admin
          .from("notification_subscribers")
          .upsert(
            { full_name: body.fullName.trim(), email, phone, active: true },
            { onConflict: email ? "email" : "phone" },
          );
        if (error) throw error;
        return json({ ok: true });
      }
      default:
        return json({ error: "Acción no reconocida." }, 400);
    }
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "No pudimos completar la solicitud." },
      400,
    );
  }
}

Deno.serve(handle);
