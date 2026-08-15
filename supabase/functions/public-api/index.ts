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

const names = [
  "JOSE LUIS",
  "MARIA ELENA",
  "CARLOS ALBERTO",
  "ANA LUCIA",
  "JORGE ENRIQUE",
  "ROSA MERCEDES",
  "MIGUEL ANGEL",
  "CLAUDIA PATRICIA",
  "LUIS FERNANDO",
  "SANDRA MILAGROS",
];
const surnames = [
  "QUISPE",
  "MAMANI",
  "ROJAS",
  "TORRES",
  "VASQUEZ",
  "HUAMAN",
  "CASTILLO",
  "FLORES",
  "RAMIREZ",
  "SANCHEZ",
  "CHAVEZ",
  "GUTIERREZ",
];

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

function padron(dni: string) {
  const digits = dni.split("").map(Number);
  const sum = digits.reduce((total, digit) => total + digit, 0);
  const year = 1970 + (sum % 32);
  const month = String((digits[2] % 12) + 1).padStart(2, "0");
  const day = String((digits[3] % 27) + 1).padStart(2, "0");
  return {
    dni,
    nombreCompleto: `${surnames[digits[0] % surnames.length]} ${surnames[(digits[1] + 3) % surnames.length]} ${names[sum % names.length]}`,
    fechaNacimiento: `${year}-${month}-${day}`,
    simulado: true,
  };
}

function age(date: string) {
  const birth = new Date(`${date}T00:00:00Z`);
  const today = new Date();
  let result = today.getUTCFullYear() - birth.getUTCFullYear();
  const month = today.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && today.getUTCDate() < birth.getUTCDate())) result -= 1;
  return result;
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

async function createRegistration(data: Record<string, unknown>) {
  if (
    !validDni(data.dni) ||
    typeof data.raffleId !== "string" ||
    typeof data.fullName !== "string" ||
    typeof data.birthDate !== "string" ||
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

  const person = padron(data.dni);
  if (
    age(person.fechaNacimiento) < 18 ||
    person.fechaNacimiento !== data.birthDate ||
    normalizeText(data.fullName) !== normalizeText(person.nombreCompleto)
  )
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
  if (fileError || !files?.some((file) => file.name === fileName))
    throw new Error("No encontramos el comprobante subido.");

  const amount = Number(raffle.ticket_price) * data.quantity;
  const { data: registration, error } = await admin
    .from("registrations")
    .insert({
      raffle_id: data.raffleId,
      dni: data.dni,
      full_name: data.fullName,
      birth_date: data.birthDate,
      phone: data.phone,
      email: data.email || null,
      quantity: data.quantity,
      amount,
      receipt_url: data.receiptPath,
      status: "pendiente",
    })
    .select("id, status, amount, quantity")
    .single();
  if (error) throw error;
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
        if (!validDni(body.dni)) throw new Error("El DNI debe tener 8 dígitos.");
        const person = padron(body.dni);
        return json({
          ...person,
          edad: age(person.fechaNacimiento),
          mayorDeEdad: age(person.fechaNacimiento) >= 18,
        });
      }
      case "crear-inscripcion":
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
