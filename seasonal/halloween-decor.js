const sectionDecorations = [
  [
    "sorteos",
    [
      ["web left upper", "telarana_esquina.png"],
      ["web right upper", "telarana_esquina.png"],
      ["pumpkin left lower", "calabaza_feliz.png"],
      ["pumpkin right lower", "calabaza_feliz.png"],
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
      ["pumpkin left lower", "calabaza_feliz.png"],
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
      ["pumpkin right lower", "calabaza_feliz.png"],
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

function decorativeImage(className, source) {
  const image = document.createElement("img");
  image.className = className;
  image.src = source;
  image.alt = "";
  image.decoding = "async";
  image.loading = className.includes("halloween-flight-ghost") ? "eager" : "lazy";
  image.draggable = false;
  return image;
}

export function mountHalloweenDecor({ config, asset }) {
  if (!config.halloweenEnabled) return () => {};

  const layer = document.createElement("div");
  layer.className = `halloween-decor${config.animationsEnabled ? "" : " halloween-static"}`;
  layer.setAttribute("aria-hidden", "true");
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
  let started = false;
  let timerId;
  let activeFlight;
  let flightCount = 0;
  const mobileViewport = window.matchMedia("(max-width: 700px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clearFlightTimer() {
    window.clearTimeout(timerId);
    timerId = undefined;
  }

  function stopFlight() {
    activeFlight?.remove();
    activeFlight = undefined;
  }

  function canFly() {
    return (
      config.animationsEnabled &&
      !reducedMotion.matches &&
      !document.hidden &&
      window.scrollY > 80 &&
      !document.body.classList.contains("halloween-promo-open") &&
      !document.body.classList.contains("policy-view") &&
      !document.querySelector("#modal-root")?.hasChildNodes()
    );
  }

  function flyGhost() {
    if (activeFlight || !canFly()) return;
    flightCount += 1;
    const flight = document.createElement("div");
    flight.className = mobileViewport.matches
      ? "halloween-flight halloween-flight-across"
      : `halloween-flight ${flightCount % 2 ? "flight-left" : "flight-right"}`;
    flight.setAttribute("aria-hidden", "true");
    flight.append(
      decorativeImage("halloween-flight-ghost", asset("halloween/fantasma_saludando.png")),
    );
    activeFlight = flight;
    layer.append(flight);
    flight.addEventListener(
      "animationend",
      () => {
        if (activeFlight === flight) activeFlight = undefined;
        flight.remove();
      },
      { once: true },
    );
  }

  function scheduleFlight() {
    if (
      timerId ||
      !started ||
      !config.animationsEnabled ||
      reducedMotion.matches ||
      document.hidden
    )
      return;
    timerId = window.setTimeout(() => {
      timerId = undefined;
      flyGhost();
      scheduleFlight();
    }, 5000);
  }

  function onScroll() {
    const nextScrollY = window.scrollY;
    const movingDown = nextScrollY > lastScrollY + 2;
    lastScrollY = nextScrollY;
    if (nextScrollY <= 80) {
      started = false;
      clearFlightTimer();
      return;
    }
    if (
      !started &&
      movingDown &&
      document.getElementById("sorteos")?.getBoundingClientRect().top < window.innerHeight * 0.8
    ) {
      started = true;
      flyGhost();
      scheduleFlight();
    }
  }

  function onVisibilityChange() {
    if (document.hidden) {
      clearFlightTimer();
      stopFlight();
    } else {
      scheduleFlight();
    }
  }

  function onMotionChange() {
    if (reducedMotion.matches) {
      clearFlightTimer();
      stopFlight();
    } else {
      scheduleFlight();
    }
  }

  if (config.animationsEnabled) {
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionChange);
  }
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.querySelector(".halloween-scene")?.classList.add("is-visible");
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
    clearFlightTimer();
    stopFlight();
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.removeEventListener("change", onMotionChange);
    sections.forEach((section) => {
      section.classList.remove("halloween-scene-host");
      section.querySelector(".halloween-scene")?.remove();
    });
    layer.remove();
  };
}
