import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const runtimeEnv = import.meta.env || {};
const asset = (name) => `/assets/${name}`;
const heroImage = asset("hero-sorteo.jpg");
const flyer001 = asset("flyer-001.jpg");
const flyer003 = asset("flyer-003.jpg");
const flyer007 = asset("flyer-007-1.jpg");
const flyer028 = asset("flyer-028.jpg");
const flyer033 = asset("flyer-033.jpg");
const flyer042 = asset("flyer-042.jpg");
const flyer048 = asset("flyer-048.jpg");
const flyer054 = asset("flyer-054-1.jpg");
const flyer071 = asset("flyer-071.jpg");

const SUPABASE_URL =
  runtimeEnv.VITE_SUPABASE_URL ||
  window.PCBOX_SUPABASE_URL ||
  "https://eskfubdoqbkrdxvlvlti.supabase.co";
const SUPABASE_KEY =
  runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  window.PCBOX_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_rl8urEEsWLfVYfPhfOHAfA_-L3ouO5o";
const API_URL =
  runtimeEnv.VITE_PUBLIC_API_URL || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/public-api` : "");
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

const flyers = [
  [flyer042, "Tablets PC BOX"],
  [flyer048, "Silla gaming premium RGB"],
  [flyer054, "Cámaras de vigilancia"],
  [flyer071, "Crédito a sola firma en PC BOX"],
  [flyer001, "Epson"],
  [flyer003, "Impresora Epson L3250 multifuncional"],
  [flyer007, "Tu DNI te regala un crédito"],
  [flyer028, "Tarjeta de video ROG Strix RTX 4090"],
  [flyer033, "Enfriamiento líquido"],
];
const brands = [
  "EPSON",
  "Canon",
  "HP",
  "Lenovo",
  "NVIDIA",
  "AMD",
  "CORSAIR",
  "ANTRYX",
  "HIKVISION",
];
const defaultRaffle = {
  id: "demo",
  demo: true,
  title: "Gran Sorteo Laptop Gamer ASUS ROG",
  description: "Participa por una laptop gamer de última generación y más premios tecnológicos.",
  details:
    "Sorteo con 5 premios. Cada ticket cuesta S/ 5. La inscripción se valida tras la aprobación del comprobante de Yape.",
  ticket_price: 5,
  draw_date: null,
  status: "activo",
  image_url: heroImage,
  prizes: [
    {
      id: "1",
      position: 1,
      name: "Laptop Gamer ASUS ROG RTX 4060",
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "2",
      position: 2,
      name: 'Monitor Gamer 27" 165Hz',
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "3",
      position: 3,
      name: "Teclado mecánico RGB + Mouse",
      winner_ticket_number: null,
      winner_name: null,
    },
  ],
};

const state = {
  raffles: [],
  dataError: "",
  activeRaffle: null,
  flyerTimer: null,
  registration: {
    step: 0,
    accepted: false,
    dni: "",
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    quantity: 1,
    file: null,
  },
};

const app = document.querySelector("#app");
const toastRegion = document.querySelector("#toast");

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[character],
  );
}

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "Fecha por anunciar";
  return new Date(value).toLocaleDateString("es-PE", { dateStyle: "long" });
}

function ageFromDate(value) {
  const birth = new Date(`${value}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function showToast(message, type = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

async function publicApi(action, payload) {
  if (!API_URL)
    throw new Error("Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "No pudimos completar la operación.");
  return result;
}

function renderApp() {
  app.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="#inicio" data-nav><span class="brand-mark">PB</span><span>PC <span class="gradient-text">BOX</span><small>Sorteos</small></span></a>
        <button class="menu-button" id="menu-button" aria-label="Abrir menú" aria-expanded="false">☰</button>
        <nav class="nav" id="site-nav" aria-label="Navegación principal">
          <a href="#inicio" data-nav>Inicio</a>
          <a href="#sorteos" data-nav>Sorteos</a>
          <a href="#participantes" data-nav>Participantes</a>
          <a href="#ganadores" data-nav>Ganadores</a>
          <a href="#notificaciones" data-nav>Notificaciones</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="hero" id="inicio">
        <img class="hero-media" src="${heroImage}" alt="Premio: setup gamer completo con silla, laptop e impresora" />
        <span class="neon left" aria-hidden="true"></span><span class="neon right" aria-hidden="true"></span>
        <div class="container hero-content">
          <span class="eyebrow">✦ Sorteos verificados</span>
          <h1>Gana un <span class="gradient-text">setup gamer</span> completo</h1>
          <p class="hero-copy">Silla gamer, laptop, impresora y más premios aparte. Inscríbete con tu DNI, paga tu ticket por Yape y recibe tus números de la suerte.</p>
          <div class="actions"><a class="button" href="#sorteos" data-nav>Ver sorteos activos →</a><a class="button secondary" href="#participantes" data-nav>Consultar mis tickets</a></div>
        </div>
      </section>

      <section class="section" id="sorteos">
        <div class="container">
          <div class="section-heading"><div><h2>Sorteos activos</h2><p>Elige tu sorteo y asegura tus tickets antes del cierre.</p></div></div>
          <div id="data-notice"></div><div class="raffle-grid" id="raffle-grid"></div>
        </div>
      </section>

      <section class="section compact border" id="como-participar">
        <div class="container"><div class="section-heading"><div><h2>¿Cómo participar?</h2><p>Cinco pasos, menos de dos minutos.</p></div></div><ol class="steps">
          <li class="step"><span class="step-icon">✓</span><h3>Valida tu DNI</h3><p>Confirmamos tu mayoría de edad.</p></li>
          <li class="step"><span class="step-icon">#</span><h3>Elige tickets</h3><p>Más tickets, más oportunidades.</p></li>
          <li class="step"><span class="step-icon">S/</span><h3>Paga con Yape</h3><p>Escanea el QR por el monto exacto.</p></li>
          <li class="step"><span class="step-icon">↑</span><h3>Sube captura</h3><p>Adjunta tu comprobante.</p></li>
          <li class="step"><span class="step-icon">★</span><h3>Recibe números</h3><p>Se asignan desde el 100.</p></li>
        </ol></div>
      </section>

      <section class="section" id="tienda"><div class="container"><div class="section-heading"><div><h2>Nuestra tienda</h2><p>Flyers destacados que rotan suavemente para mostrar nuestras categorías.</p></div></div><div class="store-grid"><div class="flyer-grid flyer-rotator">${flyers
        .slice(0, 3)
        .map(
          ([src, alt], index) =>
            `<figure class="flyer" data-flyer-slot="${index}"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`,
        )
        .join(
          "",
        )}</div><aside class="card credit-card"><span class="credit-label">Crédito directo</span><h3>Solicita tu <span class="gradient-text">crédito a sola firma</span></h3><p>Llévate tu laptop, PC gamer o impresora hoy mismo. Escríbenos por WhatsApp.</p><a class="button success" href="https://wa.me/51973604479?text=Hola%20PC%20BOX%2C%20quiero%20solicitar%20mi%20cr%C3%A9dito%20a%20sola%20firma." target="_blank" rel="noopener">◉ Solicitar por WhatsApp</a><p class="phone">+51 973 604 479</p></aside></div></div></section>

      <section class="section compact border" id="marcas"><div class="container"><div class="section-heading"><div><h2>Representantes oficiales</h2><p>Trabajamos con las marcas líderes en tecnología.</p></div></div></div><div class="brands"><div class="brands-track"><ul class="brands-list">${brands.map((brand) => `<li>${brand}</li>`).join("")}</ul><ul class="brands-list" aria-hidden="true">${brands.map((brand) => `<li>${brand}</li>`).join("")}</ul></div></div></section>

      <section class="section compact" id="notificaciones"><div class="container notify-wrap"><div><p class="notify-title">♧ Recibir notificaciones</p><h2 style="margin-top:8px">No te pierdas el próximo sorteo</h2><p class="muted" style="margin-top:7px">Déjanos un correo o celular y te avisaremos de nuevos sorteos, resultados y ofertas.</p></div><form class="notify-form" id="notify-form"><input class="field" name="fullName" placeholder="Tu nombre" required /><input class="field" name="email" type="email" placeholder="Correo" /><input class="field" name="phone" inputmode="tel" placeholder="Celular" /><button class="button" type="submit">Avisarme</button></form></div></section>

      <section class="section compact border" id="participantes"><div class="container"><div class="section-heading"><div><h2>Consulta tu inscripción</h2><p>Ingresa tu DNI para ver el estado de tu comprobante y tus tickets.</p></div></div><form class="actions" id="participant-form"><input class="field" style="max-width:290px;letter-spacing:.18em" name="dni" inputmode="numeric" maxlength="8" placeholder="Tu DNI" required /><button class="button" type="submit">Buscar</button></form><div id="participant-results"></div></div></section>

      <section class="section compact" id="ganadores"><div class="container"><div class="section-heading"><div><h2>Ganadores</h2><p>Resultados publicados de nuestros sorteos realizados.</p></div></div><div id="winner-results"></div></div></section>
    </main>

    <footer class="site-footer"><div class="container footer-inner"><div class="footer-copy"><span class="brand-mark footer-mark">PB</span><span>Tecnología smart: laptops, PCs gamer, componentes y accesorios. Sorteos verificados para nuestros clientes.</span></div><nav class="footer-nav"><a href="#sorteos" data-nav>Sorteos activos</a><a href="#participantes" data-nav>Consultar mi inscripción</a><a href="#ganadores" data-nav>Ganadores</a><a href="#notificaciones" data-nav>Recibir notificaciones</a><span>Pagos únicamente por Yape</span></nav></div><div class="copyright">© ${new Date().getFullYear()} PC BOX Tecnología Smart. Todos los derechos reservados.</div></footer>
    <div id="modal-root"></div>`;

  document.querySelector("#menu-button").addEventListener("click", () => {
    const nav = document.querySelector("#site-nav");
    const open = nav.classList.toggle("open");
    document.querySelector("#menu-button").setAttribute("aria-expanded", String(open));
  });
  document
    .querySelectorAll("[data-nav]")
    .forEach((link) =>
      link.addEventListener("click", () =>
        document.querySelector("#site-nav").classList.remove("open"),
      ),
    );
  document.querySelector("#notify-form").addEventListener("submit", handleNotify);
  document.querySelector("#participant-form").addEventListener("submit", handleParticipantSearch);
  document.querySelector("#raffle-grid").addEventListener("click", handleRaffleAction);
  renderRaffles();
  renderWinners();
  startFlyerRotation();
}

function renderRaffles() {
  const active = state.raffles.filter((raffle) => raffle.status === "activo");
  const list = active.length ? active : [defaultRaffle];
  const grid = document.querySelector("#raffle-grid");
  const notice = document.querySelector("#data-notice");
  notice.innerHTML = state.dataError
    ? `<p class="notice">${escapeHtml(state.dataError)}</p>`
    : state.raffles.length === 0
      ? `<p class="notice">Mostrando la ficha de ejemplo. El administrador todavía no ha publicado un sorteo activo.</p>`
      : "";
  grid.innerHTML = list.length
    ? list
        .map(
          (raffle) => `
    <article class="card raffle-card">
      <img class="raffle-image" src="${escapeHtml(raffle.image_url || heroImage)}" alt="${escapeHtml(raffle.title)}" loading="lazy" />
      <div class="raffle-body"><div class="raffle-title-row"><h3>${escapeHtml(raffle.title)}</h3><span class="price">${money(raffle.ticket_price)}</span></div>
      <p class="raffle-description">${escapeHtml(raffle.description || "Participa en este sorteo verificado de PC BOX.")}</p>
      <ul class="prize-list">${(raffle.prizes || [])
        .slice(0, 5)
        .map(
          (prize) =>
            `<li><span class="prize-number">${prize.position}</span>${escapeHtml(prize.name)}</li>`,
        )
        .join("")}</ul>
      <p class="draw-date">◷ ${raffle.draw_date ? `Sorteo: ${formatDate(raffle.draw_date)}` : "Fecha por anunciar"}</p>
      <div class="card-actions"><button class="button" data-action="register" data-id="${escapeHtml(raffle.id)}" ${raffle.demo ? "disabled" : ""}>Inscribirme</button><button class="button secondary" data-action="info" data-id="${escapeHtml(raffle.id)}">Ver información</button></div></div>
    </article>`,
        )
        .join("")
    : `<p class="empty">No hay sorteos activos en este momento. ¡Vuelve pronto!</p>`;
}

function renderWinners() {
  const winners = state.raffles.filter((raffle) =>
    (raffle.prizes || []).some((prize) => prize.winner_ticket_number),
  );
  document.querySelector("#winner-results").innerHTML = winners.length
    ? winners
        .map(
          (raffle) =>
            `<article class="card result-card"><div class="result-header"><div><h3>${escapeHtml(raffle.title)}</h3><p class="muted">Sorteado el ${formatDate(raffle.draw_date)}</p></div></div><ul class="prize-list">${raffle.prizes
              .filter((prize) => prize.winner_ticket_number)
              .map(
                (prize) =>
                  `<li><span class="prize-number">★</span><span>${escapeHtml(prize.name)} · <strong>${escapeHtml(prize.winner_name || "Ganador publicado")}</strong></span><span class="ticket">#${prize.winner_ticket_number}</span></li>`,
              )
              .join("")}</ul></article>`,
        )
        .join("")
    : `<p class="empty">Todavía no hay ganadores publicados. ¡El próximo puedes ser tú!</p>`;
}

function startFlyerRotation() {
  if (state.flyerTimer) window.clearInterval(state.flyerTimer);
  let rotation = 0;
  state.flyerTimer = window.setInterval(() => {
    rotation += 1;
    document.querySelectorAll("[data-flyer-slot]").forEach((slot) => {
      const slotIndex = Number(slot.dataset.flyerSlot || 0);
      const [source, alt] = flyers[(rotation + slotIndex) % flyers.length];
      const image = slot.querySelector("img");
      if (!image) return;
      slot.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = source;
        image.alt = alt;
        slot.classList.remove("is-changing");
      }, 650);
    });
  }, 6500);
}

function findRaffle(id) {
  return state.raffles.find((raffle) => raffle.id === id) || (id === "demo" ? defaultRaffle : null);
}

function handleRaffleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const raffle = findRaffle(button.dataset.id);
  if (!raffle) return;
  if (button.dataset.action === "info") showInfoModal(raffle);
  if (button.dataset.action === "register") openRegistration(raffle);
}

function showInfoModal(raffle) {
  const modalRoot = document.querySelector("#modal-root");
  modalRoot.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal" role="dialog" aria-modal="true" aria-labelledby="info-title"><button class="modal-close" data-close-modal aria-label="Cerrar">×</button><h2 id="info-title">${escapeHtml(raffle.title)}</h2><p class="muted" style="margin-top:13px">${escapeHtml(raffle.details || raffle.description || "Conoce los detalles de este sorteo.")}</p><div class="person-box"><div class="total-row"><span>Precio por ticket</span><strong>${money(raffle.ticket_price)}</strong></div><div class="total-row"><span>Fecha del sorteo</span><strong>${formatDate(raffle.draw_date)}</strong></div></div><ol class="info-list">${(raffle.prizes || []).map((prize) => `<li>${escapeHtml(prize.name)}</li>`).join("")}</ol><p class="notice">El comprobante se revisa antes de asignar los números de ticket.</p><button class="button full" data-close-modal>Entendido</button></section></div>`;
  bindModalClose();
}

function bindModalClose() {
  const root = document.querySelector("#modal-root");
  root.querySelectorAll("[data-close-modal]").forEach((element) =>
    element.addEventListener("click", (event) => {
      if (event.target === element || element.dataset.closeModal !== undefined) root.innerHTML = "";
    }),
  );
  root.querySelector(".modal").addEventListener("click", (event) => event.stopPropagation());
}

function openRegistration(raffle) {
  state.activeRaffle = raffle;
  state.registration = {
    step: 0,
    accepted: false,
    dni: "",
    name: "",
    birthDate: "",
    phone: "",
    email: "",
    quantity: 1,
    file: null,
  };
  renderRegistrationModal();
}

function renderRegistrationModal() {
  const { activeRaffle: raffle, registration: form } = state;
  const root = document.querySelector("#modal-root");
  const title =
    form.step === 5 ? "¡Inscripción enviada!" : `Inscripción · ${escapeHtml(raffle.title)}`;
  let content = "";
  if (form.step === 0)
    content = `<div class="terms"><strong>Términos y condiciones</strong><p>1. Participación exclusiva para mayores de 18 años con DNI vigente.</p><p>2. Cada ticket cuesta ${money(raffle.ticket_price)} y se paga únicamente por Yape.</p><p>3. La inscripción queda en revisión hasta validar el comprobante.</p><p>4. Los tickets se asignan de forma correlativa desde el 100 al aprobar.</p><p>5. Los resultados se publican en esta página.</p></div><label class="check-row"><input type="checkbox" id="terms-check" ${form.accepted ? "checked" : ""} /> He leído y acepto los términos y condiciones.</label><button class="button full" id="continue-terms" ${form.accepted ? "" : "disabled"}>Aceptar y continuar</button>`;
  if (form.step === 1)
    content = `<form id="dni-form"><label class="form-label">Número de DNI<input class="field" name="dni" inputmode="numeric" maxlength="8" placeholder="12345678" value="${escapeHtml(form.dni)}" required /></label><p class="muted" style="margin-top:10px;font-size:12px">Validamos tu identidad y mayoría de edad.</p><button class="button full" type="submit">Validar DNI</button></form>`;
  if (form.step === 2)
    content = `<form id="person-form"><div class="person-box"><p class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.12em">Datos validados</p><p class="person-name">${escapeHtml(form.name)}</p><p class="muted">DNI ${escapeHtml(form.dni)}</p></div><div class="form-grid"><label class="form-label">Nombre completo<input class="field" name="name" value="${escapeHtml(form.name)}" readonly /></label><label class="form-label">Fecha de nacimiento<input class="field" name="birthDate" type="date" value="${escapeHtml(form.birthDate)}" readonly /></label><label class="form-label">Celular<input class="field" name="phone" inputmode="tel" maxlength="20" placeholder="999 999 999" required /></label><label class="form-label">Correo (opcional)<input class="field" name="email" type="email" maxlength="160" placeholder="correo@ejemplo.com" /></label></div><button class="button full" type="submit">Continuar</button></form>`;
  if (form.step === 3)
    content = `<div class="total-box"><p class="muted" style="text-align:center;text-transform:uppercase;font-size:11px;letter-spacing:.12em">Cantidad de tickets</p><div class="quantity"><button class="round-button" data-quantity="minus" type="button">−</button><strong>${form.quantity}</strong><button class="round-button" data-quantity="plus" type="button">+</button></div><div class="total-row"><span>Precio por ticket</span><span>${money(raffle.ticket_price)}</span></div><div class="total-row"><span>Tickets</span><span>× ${form.quantity}</span></div><div class="total-row final"><span>Total</span><span class="gradient-text">${money(Number(raffle.ticket_price) * form.quantity)}</span></div></div><button class="button full" id="go-payment">Pagar ${money(Number(raffle.ticket_price) * form.quantity)}</button>`;
  if (form.step === 4)
    content = `<div class="qr-card"><div class="qr-title">YAPE</div><p style="font-size:11px;opacity:.75">PC BOX TECNOLOGÍA SMART</p>${makeQrSvg(`PCB-${raffle.id.slice(0, 4)}-${form.dni}`, 21)}<strong style="font-size:24px">${money(Number(raffle.ticket_price) * form.quantity)}</strong><p style="font-size:11px;opacity:.7">QR de demostración. Reemplázalo por el QR real.</p></div><form id="receipt-form"><label class="upload-label" for="receipt"><strong>${form.file ? escapeHtml(form.file.name) : "Toca para elegir tu captura de Yape"}</strong><span>JPG, PNG, WEBP, HEIC o PDF · máximo 10 MB</span></label><input class="sr-only" id="receipt" type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/pdf" required /><button class="button full" type="submit">Enviar comprobante</button></form>`;
  if (form.step === 5)
    content = `<div class="success"><strong>Inscripción en revisión</strong><p>Tu comprobante fue enviado. Cuando el administrador lo apruebe recibirás tus tickets desde el 100.</p></div><p class="muted" style="margin-top:15px;text-align:center">Consulta tu estado con el DNI <strong>${escapeHtml(form.dni)}</strong>.</p><a class="button full" href="#participantes" data-close-modal>Ver mi inscripción</a>`;
  root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="registration-title"><button class="modal-close" data-close-registration aria-label="Cerrar">×</button><h2 id="registration-title">${title}</h2>${form.step < 5 ? `<div class="progress">${[0, 1, 2, 3, 4].map((step) => `<span class="${step <= form.step ? "on" : ""}"></span>`).join("")}</div>` : ""}${content}</section></div>`;
  bindRegistrationEvents();
}

function bindRegistrationEvents() {
  const root = document.querySelector("#modal-root");
  root.querySelector("[data-close-registration]").addEventListener("click", () => {
    root.innerHTML = "";
  });
  if (state.registration.step === 0) {
    root.querySelector("#terms-check").addEventListener("change", (event) => {
      state.registration.accepted = event.target.checked;
      root.querySelector("#continue-terms").disabled = !state.registration.accepted;
    });
    root.querySelector("#continue-terms").addEventListener("click", () => {
      state.registration.step = 1;
      renderRegistrationModal();
    });
  }
  const dniForm = root.querySelector("#dni-form");
  if (dniForm) dniForm.addEventListener("submit", handleDniValidation);
  const personForm = root.querySelector("#person-form");
  if (personForm)
    personForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(personForm);
      state.registration.phone = String(data.get("phone") || "").trim();
      state.registration.email = String(data.get("email") || "").trim();
      if (state.registration.phone.length < 6)
        return showToast("Ingresa un celular válido.", "error");
      state.registration.step = 3;
      renderRegistrationModal();
    });
  const goPayment = root.querySelector("#go-payment");
  if (goPayment)
    goPayment.addEventListener("click", () => {
      state.registration.step = 4;
      renderRegistrationModal();
    });
  root.querySelectorAll("[data-quantity]").forEach((button) =>
    button.addEventListener("click", () => {
      state.registration.quantity = Math.max(
        1,
        Math.min(50, state.registration.quantity + (button.dataset.quantity === "plus" ? 1 : -1)),
      );
      renderRegistrationModal();
    }),
  );
  const receiptForm = root.querySelector("#receipt-form");
  if (receiptForm) {
    root.querySelector("#receipt").addEventListener("change", (event) => {
      state.registration.file = event.target.files?.[0] || null;
      renderRegistrationModal();
    });
    receiptForm.addEventListener("submit", handleReceiptSubmit);
  }
  const successLink = root.querySelector("[data-close-modal]");
  if (successLink)
    successLink.addEventListener("click", () => {
      root.innerHTML = "";
    });
}

async function handleDniValidation(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const dni = String(data.get("dni") || "").replace(/\D/g, "");
  if (!/^\d{8}$/.test(dni)) return showToast("Ingresa un DNI válido de 8 dígitos.", "error");
  try {
    const result = await publicApi("consultar-dni", { dni });
    if (!result.mayorDeEdad) throw new Error("Debes ser mayor de edad para participar.");
    state.registration.dni = dni;
    state.registration.name = result.nombreCompleto;
    state.registration.birthDate = result.fechaNacimiento;
    state.registration.step = 2;
    renderRegistrationModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleReceiptSubmit(event) {
  event.preventDefault();
  const file = state.registration.file;
  if (!file) return showToast("Adjunta la captura de tu Yape.", "error");
  if (!RECEIPT_TYPES.includes(file.type))
    return showToast("Formato de comprobante no permitido.", "error");
  if (file.size > MAX_RECEIPT_BYTES) return showToast("El comprobante supera los 10 MB.", "error");
  if (!supabase) return showToast("Supabase no está configurado en este entorno.", "error");
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  button.textContent = "Enviando…";
  try {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${state.registration.dni}/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage
      .from("comprobantes")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) throw upload.error;
    await publicApi("crear-inscripcion", {
      raffleId: state.activeRaffle.id,
      dni: state.registration.dni,
      fullName: state.registration.name,
      birthDate: state.registration.birthDate,
      phone: state.registration.phone,
      email: state.registration.email,
      quantity: state.registration.quantity,
      receiptPath: path,
    });
    state.registration.step = 5;
    renderRegistrationModal();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Enviar comprobante";
    showToast(error.message, "error");
  }
}

function makeQrSvg(seed, size = 21) {
  let hash = 7;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 100003;
  const cells = [];
  for (let i = 0; i < size * size; i += 1) {
    hash = (hash * 1103515245 + 12345) % 2147483648;
    cells.push((hash >> 8) % 100 < 46);
  }
  const marker = (row, column, originRow, originColumn) => {
    const rr = row - originRow;
    const cc = column - originColumn;
    return (
      rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)
    );
  };
  const inMarker = (row, column) =>
    (row < 7 && column < 7) || (row < 7 && column >= size - 7) || (row >= size - 7 && column < 7);
  let rects = "";
  for (let index = 0; index < cells.length; index += 1) {
    const row = Math.floor(index / size);
    const column = index % size;
    const active = inMarker(row, column)
      ? marker(row, column, row < 7 ? 0 : size - 7, column < 7 ? 0 : size - 7)
      : cells[index];
    if (active) rects += `<rect x="${column}" y="${row}" width="1" height="1"/>`;
  }
  return `<svg class="qr-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Código QR Yape de demostración" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#fff"/>${rects}</svg>`;
}

async function handleNotify(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const payload = {
    fullName: String(data.get("fullName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
  };
  if (!payload.email && !payload.phone) return showToast("Ingresa tu correo o celular.", "error");
  try {
    await publicApi("suscribir-notificaciones", payload);
    event.currentTarget.reset();
    showToast("Listo. Te avisaremos de nuevos sorteos y ofertas.", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleParticipantSearch(event) {
  event.preventDefault();
  const dni = String(new FormData(event.currentTarget).get("dni") || "").replace(/\D/g, "");
  const results = document.querySelector("#participant-results");
  if (!/^\d{8}$/.test(dni)) return showToast("Ingresa un DNI válido de 8 dígitos.", "error");
  results.innerHTML = `<p class="empty">Consultando…</p>`;
  try {
    const data = await publicApi("consultar-inscripciones", { dni });
    results.innerHTML = data.inscripciones?.length
      ? data.inscripciones.map(renderRegistrationResult).join("")
      : `<p class="empty">No encontramos inscripciones con ese DNI.</p>`;
  } catch (error) {
    results.innerHTML = "";
    showToast(error.message, "error");
  }
}

function renderRegistrationResult(item) {
  const status =
    item.estado === "aprobado" ? "approved" : item.estado === "rechazado" ? "rejected" : "pending";
  const label =
    item.estado === "aprobado"
      ? "Aprobado"
      : item.estado === "rechazado"
        ? "Rechazado"
        : "En revisión";
  return `<article class="card result-card"><div class="result-header"><div><h3>${escapeHtml(item.sorteo)}</h3><p class="muted">${escapeHtml(item.nombre)} · ${formatDate(item.fecha)}</p></div><span class="status ${status}">${label}</span></div><div class="total-row"><span>Tickets</span><strong>${item.cantidad}</strong><span>Monto</span><strong>${money(item.monto)}</strong></div>${item.tickets?.length ? `<p class="muted" style="margin-top:15px;font-size:12px">Tus números</p><div class="ticket-list">${item.tickets.map((ticket) => `<span class="ticket">${ticket}</span>`).join("")}</div>` : `<p class="muted" style="margin-top:15px;font-size:12px">Tus números se asignarán cuando el administrador apruebe el comprobante.</p>`}</article>`;
}

async function loadData() {
  if (!supabase) {
    state.dataError = "Modo visual: conecta Supabase para cargar sorteos y permitir inscripciones.";
    renderRaffles();
    return;
  }
  const { data, error } = await supabase
    .from("raffles")
    .select(
      "id, title, description, details, ticket_price, draw_date, status, image_url, prizes(id, position, name, winner_ticket_number, winner_name)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    state.dataError =
      "No se pudo conectar con Supabase. Revisa las variables VITE_ y las políticas públicas.";
    renderRaffles();
    return;
  }
  state.raffles = (data || []).map((raffle) => ({
    ...raffle,
    ticket_price: Number(raffle.ticket_price),
    prizes: (raffle.prizes || []).sort((a, b) => a.position - b.position),
  }));
  state.dataError = "";
  renderRaffles();
  renderWinners();
}

renderApp();
loadData();
