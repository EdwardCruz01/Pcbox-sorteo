const mobileDecorations = [
  ["web web-left", "telarana_esquina.png"],
  ["web web-right", "telarana_esquina.png"],
  ["bats", "murcielagos.png"],
  ["ghost", "fantasma_saludando.png"],
  ["pumpkin", "calabaza_feliz.png"],
];

const sectionDecorations = [
  [
    "sorteos",
    [
      ["web left upper", "telarana_esquina.png"],
      ["web right upper", "telarana_esquina.png"],
      ["pumpkin left lower", "calabaza_feliz.png"],
      ["bats right middle", "murcielagos.png"],
    ],
  ],
  [
    "como-participar",
    [
      ["web right upper", "telarana_esquina.png"],
      ["pumpkin right lower", "calabaza_feliz.png"],
    ],
  ],
  [
    "pagos",
    [
      ["web left upper", "telarana_esquina.png"],
      ["sparkles right middle", "particulas_magicas.png"],
    ],
  ],
  [
    "tienda",
    [
      ["bats left upper", "murcielagos.png"],
      ["pumpkin right lower", "calabaza_feliz.png"],
    ],
  ],
  [
    "mis-tickets",
    [
      ["web left upper", "telarana_esquina.png"],
      ["pumpkin right lower", "calabaza_feliz.png"],
    ],
  ],
  [
    "ganadores",
    [
      ["web right upper", "telarana_esquina.png"],
      ["ghost left lower", "fantasma_saludando.png"],
    ],
  ],
  [
    "soporte",
    [
      ["web left upper", "telarana_esquina.png"],
      ["pumpkin right lower", "calabaza_feliz.png"],
    ],
  ],
];

const flightSections = new Set(["sorteos", "pagos", "tienda", "mis-tickets"]);

function decorativeImage(className, source) {
  const image = document.createElement("img");
  image.className = className;
  image.src = source;
  image.alt = "";
  image.decoding = "async";
  image.loading = "lazy";
  image.draggable = false;
  return image;
}

export function mountHalloweenDecor({ config, asset }) {
  if (!config.halloweenEnabled) return () => {};

  const layer = document.createElement("div");
  layer.className = `halloween-decor${config.animationsEnabled ? "" : " halloween-static"}`;
  layer.setAttribute("aria-hidden", "true");
  mobileDecorations.forEach(([name, file]) => {
    layer.append(decorativeImage(`halloween-decor-item ${name}`, asset(`halloween/${file}`)));
  });
  document.body.append(layer);

  const sections = [];
  sectionDecorations.forEach(([id, decorations]) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.add("halloween-scene-host");
    const scene = document.createElement("div");
    scene.className = `halloween-scene${config.animationsEnabled ? "" : " halloween-static"}`;
    scene.setAttribute("aria-hidden", "true");
    decorations.forEach(([name, file]) => {
      scene.append(decorativeImage(`halloween-scene-item ${name}`, asset(`halloween/${file}`)));
    });
    section.append(scene);
    sections.push(section);
  });

  let observer;
  let lastScrollY = window.scrollY;
  let movingDown = false;
  let flightActive = false;
  const flownSections = new Set();
  const motionAllowed =
    config.animationsEnabled && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    const nextScrollY = window.scrollY;
    if (Math.abs(nextScrollY - lastScrollY) > 2) movingDown = nextScrollY > lastScrollY;
    lastScrollY = nextScrollY;
  }

  function flyGhost(sectionId) {
    flightActive = true;
    flownSections.add(sectionId);
    const flight = document.createElement("div");
    flight.className = `halloween-flight ${flownSections.size % 2 ? "flight-left" : "flight-right"}`;
    flight.setAttribute("aria-hidden", "true");
    flight.append(
      decorativeImage("halloween-flight-ghost", asset("halloween/fantasma_saludando.png")),
    );
    layer.append(flight);
    flight.addEventListener(
      "animationend",
      () => {
        flight.remove();
        flightActive = false;
      },
      { once: true },
    );
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelector(".halloween-scene")?.classList.add("is-visible");
          if (
            motionAllowed &&
            flightSections.has(entry.target.id) &&
            movingDown &&
            window.scrollY > 80 &&
            !flightActive &&
            !flownSections.has(entry.target.id) &&
            !document.body.classList.contains("halloween-promo-open")
          )
            flyGhost(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.05 },
    );
    sections.forEach((section) => observer.observe(section));
  } else {
    sections.forEach((section) =>
      section.querySelector(".halloween-scene")?.classList.add("is-visible"),
    );
  }

  return () => {
    observer?.disconnect();
    window.removeEventListener("scroll", onScroll);
    sections.forEach((section) => {
      section.classList.remove("halloween-scene-host");
      section.querySelector(".halloween-scene")?.remove();
    });
    layer.remove();
  };
}
