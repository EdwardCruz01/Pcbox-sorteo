import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const runtimeEnv = import.meta.env || {};
const siteBase =
  runtimeEnv.BASE_URL ||
  (window.location.pathname.startsWith("/Pcbox-sorteo/") ? "/Pcbox-sorteo/" : "/");
const asset = (name) => `${siteBase}assets/${name}`;
const heroImage = asset("hero-sorteo.jpg");
const logoImage = asset("logo-shucuy-regalon.png");
const officialBannerImage = asset("banner-gran-sorteo.jpg");
const raffleCardBannerImage = asset("flyer-tarjeta-sorteo.png");
const productsLogoImage = asset("logo-pcbox-productos.png");
const officialQrImage = asset("qr-yape-oficial.jpg");
const prizePrinterImage = asset("premio-impresora-epson-l3310.png");
const prizeTabletImage = asset("premio-tablet-samsung-tab-a11.png");
const prizeHeadsetImage = asset("premio-audifono-logitech-g635.png");
const prizeKeyboardImage = asset("premio-teclado-antryx-zigra-evo.png");
const prizeSpeakerImage = asset("premio-parlante-hal-fiesta-ha-r63.png");
const majorPrizeImage = asset("premio-mayor-setup-antryx.png");

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
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;
const RECEIPT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
const FIXED_DRAW_DATE = "2026-09-23T23:59:59-05:00";
let countdownTimer = null;

const officialFlyerFiles = [
  "001.jpg",
  "002.jpg",
  "004.jpg",
  "007-1.jpg",
  "007.jpg",
  "008.jpg",
  "010.jpg",
  "012.jpg",
  "013.jpg",
  "018.jpg",
  "020.jpg",
  "025.jpg",
  "029.jpg",
  "031.jpg",
  "033.jpg",
  "034.jpg",
  "039.jpg",
  "041.jpg",
  "042.jpg",
  "044.jpg",
  "046.jpg",
  "049.jpg",
  "051.jpg",
  "052.jpg",
  "054-1.jpg",
  "054.jpg",
  "056.jpg",
  "061.jpg",
  "064.jpg",
  "065.jpg",
  "067.jpg",
  "071.jpg",
];
const flyers = officialFlyerFiles.map((filename) => [
  asset(`Banners oficiales/${filename}`),
  `Banner oficial ${filename}`,
]);
const prizePresentation = {
  1: {
    image: majorPrizeImage,
    description: "Un espacio completo para trabajar, estudiar y jugar con comodidad.",
  },
  2: {
    image: prizePrinterImage,
    description: "Impresora multifuncional EcoTank para tus trabajos y proyectos.",
  },
  3: {
    image: prizeTabletImage,
    description: "Tablet práctica para entretenimiento, estudio y navegación diaria.",
  },
  4: {
    image: prizeHeadsetImage,
    description: "Audio inmersivo y micrófono para tus partidas y reuniones.",
  },
  5: {
    image: prizeKeyboardImage,
    description: "Teclado mecánico con iluminación RGB para completar tu setup.",
  },
  6: {
    image: prizeSpeakerImage,
    description: "Sonido potente para disfrutar tus momentos favoritos.",
  },
};
const distributorLogos = [
  [asset("logo-epson.png"), "Epson"],
  [asset("logo-canon.png"), "Canon"],
  [asset("logo-hp.png"), "HP"],
  [asset("logo-lenovo.png"), "Lenovo"],
  [asset("logo-nvidia.png"), "NVIDIA"],
  [asset("logo-amd.png"), "AMD Radeon Graphics"],
  [asset("logo-corsair.png"), "Corsair"],
  [asset("logo-antryx.png"), "Antryx"],
  [asset("logo-hikvision.png"), "Hikvision"],
];
const defaultRaffle = {
  id: "demo",
  demo: true,
  title: "1° Gran Sorteo del Shucuy Regalon",
  description: "El próximo PC profesional puede ser tuyo junto a cinco premios tecnológicos.",
  details:
    "Sorteo con 6 premios. Cada ticket cuesta S/ 5. La inscripción se valida tras la aprobación del comprobante de Yape.",
  ticket_price: 5,
  draw_date: FIXED_DRAW_DATE,
  status: "activo",
  image_url: officialBannerImage,
  prizes: [
    {
      id: "1",
      position: 1,
      name: "PC Gamer profesional + silla gaming + mesa elevable",
      description: "Un espacio completo para trabajar, estudiar y jugar con comodidad.",
      image_url: majorPrizeImage,
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "2",
      position: 2,
      name: "Impresora Epson L3310",
      description: "Impresora multifuncional EcoTank para tus trabajos y proyectos.",
      image_url: prizePrinterImage,
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "3",
      position: 3,
      name: "Tablet Samsung Tab A11",
      description: "Tablet práctica para entretenimiento, estudio y navegación diaria.",
      image_url: prizeTabletImage,
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "4",
      position: 4,
      name: "Audífono profesional Logitech G635",
      description: "Audio inmersivo y micrófono para tus partidas y reuniones.",
      image_url: prizeHeadsetImage,
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "5",
      position: 5,
      name: "Teclado gamer mecánico Antryx Zigra Evo",
      description: "Teclado mecánico con iluminación RGB para completar tu setup.",
      image_url: prizeKeyboardImage,
      winner_ticket_number: null,
      winner_name: null,
    },
    {
      id: "6",
      position: 6,
      name: "Parlante Halion Fiesta HA-R63",
      description: "Sonido potente para disfrutar tus momentos favoritos.",
      image_url: prizeSpeakerImage,
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
    open: false,
    step: 0,
    accepted: false,
    dni: "",
    name: "",
    birthDate: "",
    adultConfirmed: false,
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

function receiptExtension(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return /^(jpg|jpeg|png|webp|heic|pdf)$/.test(extension) ? extension : "";
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
        <a class="brand" href="#inicio" data-nav><img class="brand-logo" src="${logoImage}" alt="El Shucuy Regalon" /><span class="brand-copy">El <span class="gradient-text">Shucuy Regalon</span><small class="brand-slogan">Pa salado mi causa, Yo no</small></span></a>
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
        <img class="hero-media" src="${officialBannerImage}" alt="Gran sorteo de setup gamer completo de El Shucuy Regalon" />
        <div class="container hero-content">
          <span class="eyebrow">✦ El Shucuy Regalon</span>
          <p class="hero-copy">Participa por un PC gamer profesional y cinco premios tecnológicos adicionales. Compra tus tickets por Yape y recibe tus números después de la validación.</p>
          <div class="actions"><a class="button" href="#sorteos" data-nav>Participar ahora →</a><a class="button secondary" href="#mis-tickets" data-nav>Mis tickets</a></div>
        </div>
      </section>

      <section class="section" id="sorteos">
        <div class="container">
          <div class="section-heading"><div><h2>Sorteo activo</h2><p>Conoce el sorteo vigente y asegura tus tickets antes del cierre.</p></div></div>
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

      <section class="section" id="tienda"><div class="container"><div class="section-heading"><div class="store-heading"><img class="store-logo" src="${productsLogoImage}" alt="PCBOX Tecnología Smart" /><h2>Nuestros Productos</h2></div></div><div class="store-grid"><div class="flyer-grid flyer-rotator">${flyers
        .slice(0, 3)
        .map(
          ([src, alt], index) =>
            `<figure class="flyer" data-flyer-slot="${index}"><img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" /></figure>`,
        )
        .join(
          "",
        )}</div><aside class="card credit-card"><h3>Solicita tu <span class="gradient-text">catálogo</span></h3><p>Tenemos crédito a sola firma. Escríbenos por WhatsApp.</p><a class="button success" href="https://wa.me/51973604479?text=Hola%20PC%20BOX%2C%20quiero%20solicitar%20el%20cat%C3%A1logo.%20Tengo%20inter%C3%A9s%20en%20el%20cr%C3%A9dito%20a%20sola%20firma." target="_blank" rel="noopener">◉ Solicitar por WhatsApp</a><p class="phone">+51 973 604 479</p></aside></div></div></section>

      <section class="section compact border" id="marcas"><div class="container"><div class="section-heading"><div><h2>Distribuidores Autorizados</h2></div></div></div><div class="brands"><div class="brands-track"><ul class="brands-list">${distributorLogos.map(([src, name]) => `<li><img src="${src}" alt="${name}" loading="lazy" /></li>`).join("")}</ul><ul class="brands-list" aria-hidden="true">${distributorLogos.map(([src, name]) => `<li><img src="${src}" alt="${name}" loading="lazy" /></li>`).join("")}</ul></div></div></section>

      <section class="section compact" id="notificaciones"><div class="container notify-wrap"><div><p class="notify-title">♧ Recibir notificaciones</p><h2 style="margin-top:8px">No te pierdas el próximo sorteo</h2><p class="muted" style="margin-top:7px">Déjanos un correo o celular y te avisaremos de nuevos sorteos, resultados y ofertas.</p></div><form class="notify-form" id="notify-form"><input class="field" name="fullName" placeholder="Tu nombre" required /><input class="field" name="email" type="email" placeholder="Correo" /><input class="field" name="phone" inputmode="tel" placeholder="Celular" /><button class="button" type="submit">Avisarme</button></form></div></section>

      <section class="section compact border" id="participantes"><div class="container"><div class="section-heading"><div><h2>Consulta tu inscripción</h2><p>Ingresa tu DNI para ver el estado de tu comprobante y tus tickets.</p></div></div><form class="actions" id="participant-form"><input class="field" style="max-width:290px;letter-spacing:.18em" name="dni" inputmode="numeric" maxlength="8" placeholder="Tu DNI" required /><button class="button" type="submit">Buscar</button></form><div id="participant-results"></div></div></section>

      <section class="section compact" id="ganadores"><div class="container"><div class="section-heading"><div><h2>Ganadores</h2><p>Resultados publicados de nuestros sorteos realizados.</p></div></div><div id="winner-results"></div></div></section>
    </main>

    <footer class="site-footer"><div class="container footer-inner"><div class="footer-copy"><img class="brand-logo footer-logo" src="${logoImage}" alt="El Shucuy Regalon" /><span>El Shucuy Regalon: sorteos verificados y atención cercana para nuestros clientes.</span></div><nav class="footer-nav"><a href="#sorteos" data-nav>Sorteos activos</a><a href="#participantes" data-nav>Consultar mi inscripción</a><a href="#ganadores" data-nav>Ganadores</a><span>Pagos únicamente por Yape</span></nav></div><div class="copyright">© ${new Date().getFullYear()} El Shucuy Regalon. Todos los derechos reservados.</div></footer>
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
  document.querySelector(".participate-button")?.addEventListener("click", (event) => {
    event.preventDefault();
    if (!state.activeRaffle || state.activeRaffle.demo)
      return showToast("El sorteo todavía no está publicado.", "error");
    openRegistration(state.activeRaffle);
  });
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
  let currentSet = flyers.slice(0, 3);
  state.flyerTimer = window.setInterval(() => {
    const slots = [...document.querySelectorAll("[data-flyer-slot]")];
    if (!slots.length) return;
    const previousSources = new Set(currentSet.map(([source]) => source));
    const available = flyers.filter(([source]) => !previousSources.has(source));
    const pool = [...(available.length >= slots.length ? available : flyers)];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
    }
    const nextSet = pool.slice(0, slots.length);
    slots.forEach((slot) => {
      const image = slot.querySelector("img");
      if (image) slot.classList.add("is-changing");
    });
    window.setTimeout(() => {
      slots.forEach((slot, index) => {
        const image = slot.querySelector("img");
        if (!image || !nextSet[index]) return;
        image.src = nextSet[index][0];
        image.alt = nextSet[index][1];
        slot.classList.remove("is-changing");
      });
      currentSet = nextSet;
    }, 900);
  }, 3000);
}

function findRaffle(id) {
  return state.raffles.find((raffle) => raffle.id === id) || (id === "demo" ? defaultRaffle : null);
}

function handleRaffleAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "toggle-prizes") {
    const panel = document.querySelector(`[data-prizes-panel="${button.dataset.id}"]`);
    if (!panel) return;
    const isOpen = !panel.hidden;
    panel.hidden = isOpen;
    button.setAttribute("aria-expanded", String(!isOpen));
    button.innerHTML = isOpen
      ? `Ver premios (${button.dataset.count}) <span>⌄</span>`
      : `Ocultar premios <span>⌃</span>`;
    return;
  }
  const raffle = findRaffle(button.dataset.id);
  if (!raffle) return;
  if (button.dataset.action === "info") showInfoModal(raffle);
  if (button.dataset.action === "register") openRegistration(raffle);
}

function countdownTarget() {
  const configured = state.activeRaffle?.draw_date ? new Date(state.activeRaffle.draw_date) : null;
  if (
    configured &&
    !Number.isNaN(configured.getTime()) &&
    configured.getMonth() === 8 &&
    configured.getDate() === 23
  ) {
    return configured;
  }
  return new Date(FIXED_DRAW_DATE);
}

function updateCountdown() {
  const target = countdownTarget();
  const remaining = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const values = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
  document.querySelectorAll("[data-countdown]").forEach((counter) => {
    Object.entries(values).forEach(([unit, value]) => {
      const element = counter.querySelector(`[data-countdown-unit="${unit}"]`);
      if (element) element.textContent = String(value).padStart(2, "0");
    });
    const label = counter.querySelector("[data-countdown-label]");
    if (label) label.textContent = remaining ? "Cierre de ventas en" : "Sorteo en proceso";
  });
}

function startCountdown() {
  if (countdownTimer) window.clearInterval(countdownTimer);
  updateCountdown();
  countdownTimer = window.setInterval(updateCountdown, 1000);
}

function renderRaffleCardsV2() {
  const active = state.raffles.filter((raffle) => raffle.status === "activo");
  const list = active.length ? [active[0]] : [defaultRaffle];
  state.activeRaffle = list[0];
  const grid = document.querySelector("#raffle-grid");
  const notice = document.querySelector("#data-notice");
  if (!grid || !notice) return;
  notice.innerHTML = state.dataError
    ? `<p class="notice">${escapeHtml(state.dataError)}</p>`
    : state.raffles.length === 0
      ? `<p class="notice">El sorteo se activará cuando el administrador publique la fecha y sus premios.</p>`
      : "";
  grid.innerHTML = list
    .map((raffle) => {
      const prizes = (raffle.prizes || []).slice(0, 10);
      return `
        <article class="card raffle-showcase">
          <div class="raffle-showcase-visual">
            <img src="${raffleCardBannerImage}" alt="${escapeHtml(raffle.title)}" loading="lazy" />
          </div>
          <span class="showcase-price"><small>S/</small> ${Number(raffle.ticket_price || 5).toFixed(0)}<em>por ticket</em></span>
          <div class="raffle-showcase-body">
            <span class="showcase-kicker">✦ Sorteo activo</span>
            <div class="raffle-title-row"><h3>${escapeHtml(raffle.title)}</h3></div>
            <p class="raffle-description">${escapeHtml(raffle.description || "Participa por tecnología y premios increíbles para tu hogar.")}</p>
            <div class="showcase-meta"><span>◷ 23 de septiembre</span><span>✓ Tickets verificados</span></div>
            <div class="raffle-card-countdown hero-countdown" data-countdown><span class="countdown-label" data-countdown-label>Cierre de ventas en</span><div class="countdown-grid"><div><strong data-countdown-unit="days">00</strong><small>DÍAS</small></div><div><strong data-countdown-unit="hours">00</strong><small>HORAS</small></div><div><strong data-countdown-unit="minutes">00</strong><small>MIN</small></div><div><strong data-countdown-unit="seconds">00</strong><small>SEG</small></div></div></div>
            <button class="prize-toggle" data-action="toggle-prizes" data-id="${escapeHtml(raffle.id)}" data-count="${prizes.length}" aria-expanded="false">Ver premios (${prizes.length}) <span>⌄</span></button>
            <div class="prize-panel" data-prizes-panel="${escapeHtml(raffle.id)}" hidden>
              <p class="prize-panel-title">Premios incluidos</p>
              <div class="prize-cards">${prizes
                .map((prize) => {
                  const presentation = prizePresentation[prize.position] || {};
                  return `<article class="prize-card"><span class="prize-card-number">${prize.position}</span><img src="${escapeHtml(prize.position === 1 ? majorPrizeImage : prize.image_url || presentation.image || heroImage)}" alt="${escapeHtml(prize.name)}" loading="lazy" /><div><strong>${escapeHtml(prize.name)}</strong></div></article>`;
                })
                .join("")}</div>
            </div>
            <div class="card-actions"><button class="button full" data-action="register" data-id="${escapeHtml(raffle.id)}" ${raffle.demo ? "disabled" : ""}>PARTICIPAR <span>→</span></button><button class="button secondary full" data-action="info" data-id="${escapeHtml(raffle.id)}">Ver información</button></div>
          </div>
        </article>`;
    })
    .join("");
  updateCountdown();
}

const TERMS_AND_CONDITIONS_HTML = `
  <p><strong>Documento legal que regula la participación en las promociones comerciales y sorteos organizados por CONSORCIO MORALES E &amp; L S.A.C. (RUC: 20614625989 ) a través del sitio premioslorenzo.com.</strong></p>
  <h3>1. Organización y Marco Legal</h3>
  <p>Razón social: CONSORCIO MORALES E &amp; L S.A.C.</p><p>RUC: 20614625989</p><p>Sitio oficial: premioslorenzo.com</p><p>Periodicidad: El lanzamiento de los sorteos será publicada y anunciada a través de nuestra red social oficial de Facebook: premioslorenzo.oficial. Todos los sorteos y promociones comerciales organizados por la empresa se rigen bajo la legislación peruana vigente, garantizando la equidad y transparencia en cada evento.</p>
  <h3>2. Participación y Registro</h3>
  <p>La participación es voluntaria y está sujeta al cumplimiento de los siguientes pasos:</p><ol><li>Realizar el pago previo del ticket (S/ 40.00 o S/ 60.00) dependiendo del tipo de sorteo.</li><li>Tomar una captura de pantalla o guardar el voucher físico del pago emitido por la entidad financiera.</li><li>Completar el formulario en la web oficial con datos reales, exactos y actualizados.</li><li>Al momento de darle click en &quot;SUBIR COMPROBANTE&quot;, usted está aceptando el cumplimientos de los presentes Términos y Condiciones y la Política de Privacidad.</li></ol><p>La participación está estrictamente limitada a personas mayores de 18 años. De comprobarse la falsedad en la declaración de edad o identidad, el ticket será invalidado sin derecho a reclamo o reembolso.</p>
  <h3>3. Validación y Seguridad de Tickets</h3>
  <ul><li>✅ Registro Correcto: Los tickets deben estar correctamente registrados en nuestra base de datos y no presentar alteraciones de ningún tipo.</li><li>❌ Prohibición de Manipulación: No se permite la alteración, falsificación o manipulación de tickets físicos ni digitales (incluyendo comprobantes de pago).</li><li>🔍 Vigencia: Solo participarán tickets válidos que estén correctamente registrados en el sistema hasta la fecha del sorteo.</li><li>🧾 Verificación Obligatoria: El ganador acepta de manera irrevocable la verificación de su identidad, información proporcionada y tickets registrados, asi como también la muestra de los comprobantes de pago, o cualquier otra evidencia que demuestre su ingreso al sorteo correspondiente. Antes de la entrega de cualquier premio.</li></ul>
  <h3>4. Cierre de Inscripciones</h3><p>El cierre de inscripciones y validación de tickets se realiza un (1) día antes de la fecha programada para el sorteo. Todo pago o registro posterior a este corte será asignado y registrado automáticamente para el sorteo del mes siguiente, sin excepciones.</p>
  <h3>5. Condiciones de Pagos</h3><ul><li>El valor oficial de cada ticket, según el tipo de sorteo, es de S/ 40.00 (Cuarenta y 00/100 Soles) o S/ 60.00 (Sesenta y 00/100 Soles), incluyendo los impuestos de ley.</li><li>Los comprobantes falsos, ilegibles o adulterados serán rechazados de inmediato y el participante será bloqueado de la plataforma.</li><li>No se realizan devoluciones por desistimiento, errores en la transferencia o equivocaciones en el registro cometidos por el participante.</li><li>La adquisición de un mayor número de tickets incrementa las probabilidades matemáticas, pero no garantiza bajo ninguna circunstancia la obtención de un premio.</li></ul>
  <h3>6. Premios y Reglas Especiales</h3><p>Los premios consisten en vehículos automotores y dinero en efectivo, cuyas especificaciones se publican previamente en la web oficial.</p><p><strong>Reglas de Asignación y Entrega:</strong></p><ul><li>🚫 Restricción de Premio Consuelo: El participante que tenga más tickets a su nombre y no ganó ningún otro premio exceptuando los premios en efectivo, será considerado ganador del &quot;PREMIO CONSUELO&quot;. Caso contrario, se pasa automáticamente al siguiente participante con mayor cantidad de tickets válidos.</li><li>⚖️ Caso de Empate: En caso de empate en la mayor cantidad de tickets adquiridos para una bonificación específica, el premio será dividido en dos partes iguales y entregado en efectivo a ambos participantes.</li><li>Naturaleza del Premio: Los premios son de carácter estrictamente personal e intransferible. No podrán ser endosados a terceros.</li></ul>
  <h3>7. Dinámica del Sorteo</h3><ul><li>Los sorteos se llevan a cabo de forma pública y cuentan con la presencia de un notario público, quien da fe y legalidad de los resultados.</li><li>La transmisión se realiza en vivo y en directo a través de la página oficial de Facebook de Premios Lorenzo.</li><li>⚖️ Decisión Final: La decisión del organizador, avalada por el notario público, respecto a la validez de los tickets y la declaración de los ganadores será final e inapelable.</li></ul>
  <h3>8. Protección de Datos Personales</h3><p>En estricto cumplimiento de la Ley N° 29733, Ley de Protección de Datos Personales, y su Reglamento (Decreto Supremo N° 003-2013-JUS), CONSORCIO MORALES E &amp; L S.A.C. garantiza la confidencialidad y seguridad de la información proporcionada:</p><ul><li>Consentimiento: Al registrarse, el participante otorga su consentimiento libre, previo, expreso, inequívoco e informado para el tratamiento de sus datos.</li><li>Finalidad: La información recopilada será utilizada exclusivamente para la validación de identidad, gestión del sorteo, contacto en caso de resultar ganador y fines estadísticos internos.</li><li>Almacenamiento: Los datos personales se almacenan de forma segura en nuestro banco de datos por un plazo legal de cinco (5) años.</li><li>Derechos ARCO: El usuario titular de los datos puede ejercer en cualquier momento sus derechos de Acceso, Rectificación, Cancelación y Oposición, enviando una solicitud formal a través de nuestros canales de contacto oficiales.</li></ul>
  <h3>9. Protección al Consumidor</h3><ul><li>Información Clara: Las reglas, fechas, costos y descripciones de los premios son exhibidas de manera clara, veraz y oportuna, evitando cualquier práctica engañosa.</li><li>Atención de Reclamos: Contamos con un Libro de Reclamaciones Virtual, conforme a la normativa de INDECOPI, a disposición de los usuarios para registrar cualquier insatisfacción o queja sobre el desarrollo del sorteo.</li><li>Publicidad: Toda publicidad emitida respecto a los sorteos respeta los principios de lealtad y veracidad comercial exigidos por la ley peruana.</li></ul>
  <h3>10. Responsabilidad y Prevención de Fraude</h3><ul><li>⚠️ Descalificación: Cualquier intento de fraude, suplantación de identidad, uso de bots, alteraciones de sistema o manipulación de datos resultará en la descalificación automática e inmediata del participante.</li><li>Acciones Legales: CONSORCIO MORALES E &amp; L S.A.C. se reserva el derecho absoluto de utilizar los datos recopilados para iniciar acciones legales, civiles o penales, ante las autoridades competentes (Ministerio Público, PNP) frente a indicios de fraude, estafa o lavado de activos.</li><li>Exoneración: La empresa no asume responsabilidad civil por interrupciones de conectividad, caídas del sistema bancario o errores tipográficos cometidos por el usuario durante su inscripción.</li></ul>
  <h3>11. Contacto y Atención al Cliente</h3><p>Para consultas, soporte técnico, ejercicio de derechos ARCO o acceso al Libro de Reclamaciones, por favor comuníquese mediante los canales oficiales publicados permanentemente en nuestra plataforma web: premioslorenzo.com.</p>
  <h3>12. Política de Entrega, Recojo y Envíos de Premios</h3><p>Premios Para garantizar la correcta adjudicación de los premios y establecer los parámetros de responsabilidad entre la empresa organizadora y los ganadores, se establecen los siguientes tres (3) puntos de obligatorio cumplimiento:</p><p><strong>• 12.1. Recojo presencial de premios de menor valor (Bienes Físicos):</strong></p><p>Para la entrega de premios físicos en especie, tales como teléfonos móviles (iPhones, smartphones), computadoras portátiles (laptops) u otros bienes equivalentes de menor denominación, el participante ganador titular deberá acercarse obligatoria y personalmente a la ubicación indicada por CONSORCIO MORALES E &amp; L S.A.C. La entrega se efectuará previa coordinación, siendo indispensable la presentación física de su Documento Nacional de Identidad (DNI) vigente y original para la firma del acta de recepción conforme.</p><p><strong>• 12.2. Exención de responsabilidad por envío de premios a domicilio (Uso de Courier):</strong></p><p>En el caso de que el ganador solicite voluntariamente y por conveniencia propia que un premio físico (iPhones, laptops, etc.) sea enviado a su domicilio, el ganador asume la total y absoluta responsabilidad sobre el estado, contenido e integridad física en el cual llegue el paquete. Consorcio Morales E &amp; L S.A.C. no asume, bajo ninguna circunstancia, la logística, plazos ni operatividad del servicio de courier o mensajería seleccionado. El ganador reconoce y acepta expresamente que, una vez que el premio es entregado a la empresa de transporte o courier en Lima, nuestra organización queda liberada de forma total y definitiva de cualquier tipo de responsabilidad civil o administrativa por robos, pérdidas, demoras, averías, daños o sustracciones que pudiera sufrir el paquete durante el trayecto, no habiendo lugar a reclamo o reposición por parte de la empresa organizadora.</p><p><strong>• 12.3. Trámite de cobro y firma presencial para premios mayores en efectivo (Superiores a S/ 5,000.00):</strong></p><p>Tratándose de premios en dinero en efectivo donde el monto a entregar sea igual o mayor a los S/ 5,000.00 (Cinco mil y 00/100 Soles), el participante ganador tendrá la obligación ineludible de acercarse presencialmente a la ubicación indicada por el área de atención al cliente de Premios Lorenzo). En dicha ubicación, se requerirá su presencia física (con DNI en mano) para efectuar el cobro, validar su identidad frente a la organización y realizar la firma obligatoria del documento legal o acta notarial correspondiente, en el cual se estipula de forma fehaciente que el participante ha recibido el premio en su totalidad. No se aceptarán firmas digitales o terceros sin representación notarial legalmente formalizada para este tipo de montos.</p>`;

function showPolicyModal(policy) {
  const content = {
    terms: ["Términos y condiciones", TERMS_AND_CONDITIONS_HTML],
    privacy: [
      "Política de privacidad",
      "<p>Usamos los datos entregados —DNI, nombre, celular, correo y comprobante— para validar la inscripción, asignar tickets, atender consultas y publicar resultados.</p><p>No vendemos tus datos. El acceso queda limitado al personal autorizado y a los servicios necesarios para operar la plataforma. Puedes solicitar actualización o eliminación de tus datos mediante Soporte.</p>",
    ],
    refunds: [
      "Política de devoluciones",
      "<p>Si el comprobante es rechazado antes de asignar tickets, la participación no se considera confirmada. Las solicitudes relacionadas con pagos duplicados, errores de monto o incidencias se revisan caso por caso con el comprobante correspondiente.</p><p>Escríbenos por Soporte antes de la fecha de cierre de ventas para que podamos revisar tu caso.</p>",
    ],
    news: [
      "Noticias",
      "<p>Aquí publicaremos novedades de sorteos, fechas de cierre, resultados y comunicados importantes de PC BOX.</p><p>Consulta también la sección Ganadores para ver los tickets premiados cuando el sorteo haya terminado.</p>",
    ],
    complaints: [
      "Libro de reclamaciones",
      "<p>Si deseas presentar una queja o reclamo, comunícate con Soporte indicando tu nombre, DNI, fecha de la operación y una descripción clara del caso. Te responderemos por el canal de atención de PC BOX.</p><p>Soporte: lunes a sábado por WhatsApp.</p>",
    ],
  };
  const selected = content[policy] || content.terms;
  const root = document.querySelector("#modal-root");
  root.innerHTML = `<div class="modal-backdrop policy-backdrop" data-close-policy><section class="modal policy-modal" role="dialog" aria-modal="true" aria-labelledby="policy-title"><button class="modal-close" data-close-policy aria-label="Cerrar">×</button><span class="showcase-kicker">El Shucuy Regalon · Información</span><h2 id="policy-title">${selected[0]}</h2><div class="policy-content">${selected[1]}</div><button class="button full" data-close-policy>Entendido</button></section></div>`;
  const closePolicy = () => {
    if (state.registration.open) renderRegistrationModal();
    else root.innerHTML = "";
  };
  root.querySelectorAll("[data-close-policy]").forEach((element) =>
    element.addEventListener("click", (event) => {
      if (!element.classList.contains("modal-backdrop") || event.target === element) closePolicy();
    }),
  );
  root.querySelector(".policy-modal").addEventListener("click", (event) => event.stopPropagation());
}

function enhancePublicLayout() {
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.classList.add("hero-ticket-banner");
    hero.innerHTML = `
      <img class="hero-media" src="${officialBannerImage}" alt="Banner oficial del Gran Sorteo de El Shucuy Regalon" />
      <div class="container hero-content">
        <div class="hero-countdown hero-countdown-centered" data-countdown><span class="countdown-label" data-countdown-label>Cierre de ventas en</span><div class="countdown-grid"><div><strong data-countdown-unit="days">00</strong><small>DÍAS</small></div><div><strong data-countdown-unit="hours">00</strong><small>HORAS</small></div><div><strong data-countdown-unit="minutes">00</strong><small>MIN</small></div><div><strong data-countdown-unit="seconds">00</strong><small>SEG</small></div></div></div>
      </div>`;
  }
  const ticketsSection = document.querySelector("#participantes");
  if (ticketsSection) ticketsSection.id = "mis-tickets";
  document.querySelectorAll('a[href="#participantes"]').forEach((link) => {
    link.href = "#mis-tickets";
    link.textContent = "Mis tickets";
  });
  document.querySelector('a[href="#notificaciones"]')?.remove();
  document.querySelector("#notificaciones")?.remove();
  const nav = document.querySelector("#site-nav");
  if (nav && !nav.querySelector('a[href="#soporte"]')) {
    const supportLink = document.createElement("a");
    supportLink.href = "#soporte";
    supportLink.dataset.nav = "";
    supportLink.textContent = "Soporte";
    supportLink.addEventListener("click", () => nav.classList.remove("open"));
    nav.append(supportLink);
  }
  const stepsSection = document.querySelector("#como-participar");
  if (stepsSection && !document.querySelector("#pagos")) {
    stepsSection.insertAdjacentHTML(
      "afterend",
      `
       <section class="section payment-section" id="pagos"><div class="container"><div class="section-heading"><div><span class="showcase-kicker">Método de pago</span><h2>Paga fácil y seguro por Yape</h2><p>Escanea el QR y realiza el pago exacto según la cantidad de tickets.</p></div></div><div class="payment-layout"><div class="payment-copy"><h3>Solo necesitas tu celular</h3><p>Elige tus tickets, paga por Yape y sube la captura del comprobante. Nuestro equipo revisará la operación antes de asignar tus números.</p><ul><li>✓ Pago únicamente por Yape</li><li>✓ Comprobante privado y protegido</li><li>✓ Tickets asignados al aprobar</li></ul></div><div class="payment-card"><div class="payment-tabs"><strong>Yape</strong><span>Plin</span></div><strong class="payment-number">902330511</strong><img class="official-qr" src="${officialQrImage}" alt="QR oficial de Yape y Plin de Grupo Big Store" /><span class="payment-hint">GRUPO BIG STORE E.I.R.L.</span></div></div><a class="button participate-button" href="#sorteos" data-nav>PARTICIPO</a></div></section>
       `,
    );
  }
  const storeSection = document.querySelector("#tienda");
  const creditCard = storeSection?.querySelector(".credit-card");
  if (storeSection && creditCard && !document.querySelector("#credito")) {
    const creditSection = document.createElement("section");
    creditSection.className = "section credit-section";
    creditSection.id = "credito";
    creditSection.innerHTML = '<div class="container"></div>';
    creditSection.firstElementChild.append(creditCard);
    storeSection.after(creditSection);
  }
  const footer = document.querySelector(".site-footer");
  if (footer) {
    footer.innerHTML = `
       <div class="container footer-inner"><div class="footer-copy"><img class="brand-logo footer-logo" src="${logoImage}" alt="El Shucuy Regalon" /><span>El Shucuy Regalon: sorteos verificados y atención cercana para nuestros clientes.</span></div><div class="footer-links"><a href="#sorteos" data-nav>Sorteos</a><a href="#mis-tickets" data-nav>Mis tickets</a><a href="#ganadores" data-nav>Ganadores</a><a href="#soporte" data-nav>Soporte</a></div></div>
      <div class="policy-bar"><div class="container"><a href="#politicas" data-policy="terms">Términos y condiciones</a><a href="#politicas" data-policy="privacy">Política de privacidad</a><a href="#politicas" data-policy="refunds">Política de devoluciones</a><a href="#politicas" data-policy="news">Noticias</a><a href="#politicas" data-policy="complaints">Libro de reclamaciones</a><a href="https://www.facebook.com/" target="_blank" rel="noopener">Facebook</a></div></div>
       <div class="copyright">© ${new Date().getFullYear()} El Shucuy Regalon. Todos los derechos reservados.</div>`;
    footer.querySelectorAll("[data-policy]").forEach((link) =>
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showPolicyModal(link.dataset.policy);
      }),
    );
  }
  if (!document.querySelector("#soporte")) {
    document
      .querySelector("main")
      .insertAdjacentHTML(
        "beforeend",
        '<section class="section support-section" id="soporte"><div class="container"><div class="support-panel"><div><span class="showcase-kicker">Atención El Shucuy Regalon</span><h2>¿Necesitas ayuda?</h2><p>Escríbenos de lunes a sábado al <strong>+51 973 604 479</strong> para resolver dudas sobre pagos, inscripciones o tickets.</p></div><a class="button" href="https://wa.me/51973604479?text=Hola%20El%20Shucuy%20Regalon%2C%20necesito%20soporte%20sobre%20el%20sorteo." target="_blank" rel="noopener">Hablar con soporte <span>→</span></a></div></div></section>',
      );
  }
  renderRaffleCardsV2();
  startCountdown();
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
    open: true,
    step: 0,
    accepted: false,
    dni: "",
    name: "",
    birthDate: "",
    adultConfirmed: false,
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
    content = `<div class="terms"><strong>Términos y condiciones</strong><p>Revisa el documento completo antes de continuar con tu inscripción.</p><button class="text-link" type="button" data-open-terms>Leer términos y condiciones</button></div><label class="check-row"><input type="checkbox" id="terms-check" ${form.accepted ? "checked" : ""} /> Confirmo que soy mayor de 18 años y acepto los <button class="inline-policy-link" type="button" data-open-terms>términos y condiciones</button>.</label><button class="button full" id="continue-terms" ${form.accepted ? "" : "disabled"}>Continuar</button>`;
  if (form.step === 1)
    content = `<form id="dni-form"><label class="form-label">Número de DNI<input class="field" name="dni" inputmode="numeric" maxlength="8" placeholder="12345678" value="${escapeHtml(form.dni)}" required /></label><p class="muted" style="margin-top:10px;font-size:12px">Validamos tu DNI y tus nombres registrados.</p><button class="button full" type="submit">Validar DNI</button></form>`;
  if (form.step === 2)
    content = `<form id="person-form"><div class="person-box"><p class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.12em">Datos validados por ApiPeruDev</p><p class="person-name">${escapeHtml(form.name)}</p><p class="muted">DNI ${escapeHtml(form.dni)}</p></div><div class="form-grid"><label class="form-label full">Nombre completo<input class="field" name="name" value="${escapeHtml(form.name)}" readonly /></label><label class="form-label">Celular<input class="field" name="phone" inputmode="tel" maxlength="20" placeholder="999 999 999" required /></label><label class="form-label">Correo (opcional)<input class="field" name="email" type="email" maxlength="160" placeholder="correo@ejemplo.com" /></label></div><button class="button full" type="submit">Continuar</button></form>`;
  if (form.step === 3)
    content = `<div class="total-box"><p class="muted" style="text-align:center;text-transform:uppercase;font-size:11px;letter-spacing:.12em">Cantidad de tickets</p><div class="quantity"><button class="round-button" data-quantity="minus" type="button">−</button><strong>${form.quantity}</strong><button class="round-button" data-quantity="plus" type="button">+</button></div><div class="total-row"><span>Precio por ticket</span><span>${money(raffle.ticket_price)}</span></div><div class="total-row"><span>Tickets</span><span>× ${form.quantity}</span></div><div class="total-row final"><span>Total</span><span class="gradient-text">${money(Number(raffle.ticket_price) * form.quantity)}</span></div></div><button class="button full" id="go-payment">Pagar ${money(Number(raffle.ticket_price) * form.quantity)}</button>`;
  if (form.step === 4)
    content = `<div class="qr-card"><div class="payment-tabs"><strong>Yape</strong><span>Plin</span></div><p class="payment-account">GRUPO BIG STORE E.I.R.L.</p><strong class="payment-number">902330511</strong><img class="registration-qr" src="${officialQrImage}" alt="QR oficial de Yape y Plin" /><strong style="font-size:24px">${money(Number(raffle.ticket_price) * form.quantity)}</strong><p style="font-size:11px;opacity:.7">Realiza el pago exacto y luego sube tu comprobante.</p></div><form id="receipt-form"><label class="upload-label" for="receipt"><strong>Subir</strong><span class="selected-file">${form.file ? escapeHtml(form.file.name) : "Selecciona tu comprobante"}</span></label><input class="sr-only" id="receipt" type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/pdf" required /><button class="button full" type="submit">Enviar comprobante</button></form>`;
  if (form.step === 5)
    content = `<div class="success"><strong>Inscripción en revisión</strong><p>Tu comprobante fue enviado. Cuando el administrador lo apruebe recibirás tus tickets desde el 100.</p></div><p class="muted" style="margin-top:15px;text-align:center">Consulta tu estado con el DNI <strong>${escapeHtml(form.dni)}</strong>.</p><a class="button full" href="#participantes" data-close-modal>Ver mi inscripción</a>`;
  root.innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="registration-title"><button class="modal-close" data-close-registration aria-label="Cerrar">×</button><h2 id="registration-title">${title}</h2>${form.step < 5 ? `<div class="progress">${[0, 1, 2, 3, 4].map((step) => `<span class="${step <= form.step ? "on" : ""}"></span>`).join("")}</div>` : ""}${content}</section></div>`;
  bindRegistrationEvents();
}

function bindRegistrationEvents() {
  const root = document.querySelector("#modal-root");
  root.querySelector("[data-close-registration]").addEventListener("click", () => {
    state.registration.open = false;
    root.innerHTML = "";
  });
  if (state.registration.step === 0) {
    root.querySelector("#terms-check").addEventListener("change", (event) => {
      state.registration.accepted = event.target.checked;
      root.querySelector("#continue-terms").disabled = !state.registration.accepted;
    });
    root.querySelector("#continue-terms").addEventListener("click", () => {
      state.registration.adultConfirmed = true;
      state.registration.step = 1;
      renderRegistrationModal();
    });
    root
      .querySelectorAll("[data-open-terms]")
      .forEach((link) => link.addEventListener("click", () => showPolicyModal("terms")));
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
      if (!state.registration.adultConfirmed)
        return showToast("Debes confirmar que eres mayor de 18 años.", "error");
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
    const input = root.querySelector("#receipt");
    input.addEventListener("change", (event) => {
      const file = event.target.files?.[0] || null;
      const extension = file ? receiptExtension(file) : "";
      if (file && (!RECEIPT_TYPES.includes(file.type) || !extension)) {
        state.registration.file = null;
        input.value = "";
        return showToast("Selecciona un comprobante válido.", "error");
      }
      if (file && file.size > MAX_RECEIPT_BYTES) {
        state.registration.file = null;
        input.value = "";
        return showToast("El comprobante supera los 5 MB.", "error");
      }
      state.registration.file = file;
      const selectedFile = root.querySelector(".selected-file");
      if (selectedFile) selectedFile.textContent = file ? file.name : "Selecciona tu comprobante";
    });
    receiptForm.addEventListener("submit", handleReceiptSubmit);
  }
  const successLink = root.querySelector("[data-close-modal]");
  if (successLink)
    successLink.addEventListener("click", () => {
      state.registration.open = false;
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
    if (result.mayorDeEdad === false) throw new Error("Debes ser mayor de edad para participar.");
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
  if (file.size > MAX_RECEIPT_BYTES) return showToast("El comprobante supera los 5 MB.", "error");
  if (!supabase) return showToast("Supabase no está configurado en este entorno.", "error");
  const button = event.currentTarget.querySelector("button");
  button.disabled = true;
  button.textContent = "Enviando…";
  try {
    const extension = receiptExtension(file);
    if (!extension) throw new Error("El comprobante debe tener un formato permitido.");
    const uploadTicket = await publicApi("crear-upload", {
      dni: state.registration.dni,
      extension,
      contentType: file.type,
    });
    const upload = await supabase.storage
      .from("comprobantes")
      .uploadToSignedUrl(uploadTicket.path, uploadTicket.token, file, {
        contentType: file.type,
        upsert: false,
      });
    if (upload.error) throw upload.error;
    await publicApi("crear-inscripcion", {
      raffleId: state.activeRaffle.id,
      dni: state.registration.dni,
      fullName: state.registration.name,
      birthDate: state.registration.birthDate,
      adultConfirmed: state.registration.adultConfirmed,
      termsAccepted: state.registration.accepted,
      phone: state.registration.phone,
      email: state.registration.email,
      quantity: state.registration.quantity,
      receiptPath: uploadTicket.path,
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
    renderRaffleCardsV2();
    return;
  }
  const { data, error } = await supabase
    .from("raffles")
    .select(
      "id, title, description, details, ticket_price, draw_date, status, image_url, prizes(id, position, name, image_url, winner_ticket_number, winner_name)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    state.dataError =
      "No se pudo conectar con Supabase. Revisa las variables VITE_ y las políticas públicas.";
    renderRaffleCardsV2();
    return;
  }
  state.raffles = (data || []).map((raffle) => ({
    ...raffle,
    ticket_price: Number(raffle.ticket_price),
    prizes: (raffle.prizes || []).sort((a, b) => a.position - b.position),
  }));
  state.dataError = "";
  renderRaffleCardsV2();
  renderWinners();
  updateCountdown();
}

renderApp();
enhancePublicLayout();
loadData();
