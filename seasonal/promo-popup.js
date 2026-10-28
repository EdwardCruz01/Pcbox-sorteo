const SESSION_KEY = "pcbox-halloween-promo-seen-v1";
let seenWithoutStorage = false;

function seenThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return seenWithoutStorage;
  }
}

function markSeen() {
  seenWithoutStorage = true;
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // El bloqueo de almacenamiento no impide cerrar el anuncio.
  }
}

export function mountPromoPopup({ config, asset }) {
  if (!config.popupEnabled || !config.flyerFile) return () => {};
  if (config.popupFrequency === "session" && seenThisSession()) return () => {};

  const previousFocus = document.activeElement;
  const previousBodyTabindex = document.body.getAttribute("tabindex");
  const overlay = document.createElement("div");
  overlay.className = `halloween-promo${config.animationsEnabled ? "" : " halloween-static"}`;
  overlay.innerHTML = `
    <div class="halloween-promo-dialog" role="dialog" aria-modal="true" aria-label="Promoción de Halloween">
      <button class="halloween-promo-close" type="button" aria-label="Cerrar promoción">×</button>
      <img class="halloween-promo-flyer" alt="Flyer promocional del primer gran evento de Halloween" />
    </div>`;
  const image = overlay.querySelector(".halloween-promo-flyer");
  image.src = asset(config.flyerFile);

  const closeButton = overlay.querySelector(".halloween-promo-close");
  let closed = false;

  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", onKeyDown, true);
    overlay.remove();
    document.body.classList.remove("halloween-promo-open");
    if (
      previousFocus instanceof HTMLElement &&
      previousFocus.isConnected &&
      previousFocus !== document.body
    ) {
      previousFocus.focus({ preventScroll: true });
    } else {
      document.body.setAttribute("tabindex", "-1");
      document.body.focus({ preventScroll: true });
      if (previousBodyTabindex === null) document.body.removeAttribute("tabindex");
      else document.body.setAttribute("tabindex", previousBodyTabindex);
    }
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      // El botón de cierre es el único control dentro del diálogo.
      event.preventDefault();
      closeButton.focus();
    }
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  closeButton.addEventListener("click", close);
  document.addEventListener("keydown", onKeyDown, true);
  document.body.append(overlay);
  document.body.classList.add("halloween-promo-open");
  closeButton.focus({ preventScroll: true });
  if (config.popupFrequency === "session") markSeen();

  return close;
}
