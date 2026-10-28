const decorations = [
  ["web web-left", "telarana_esquina.png"],
  ["web web-right", "telarana_esquina.png"],
  ["bats", "murcielagos.png"],
  ["ghost", "fantasma_saludando.png"],
  ["pumpkin", "calabaza_feliz.png"],
  ["sparkles", "particulas_magicas.png"],
];

export function mountHalloweenDecor({ config, asset }) {
  if (!config.halloweenEnabled) return () => {};

  const layer = document.createElement("div");
  layer.className = `halloween-decor${config.animationsEnabled ? "" : " halloween-static"}`;
  layer.setAttribute("aria-hidden", "true");

  for (const [className, filename] of decorations) {
    const image = document.createElement("img");
    image.className = `halloween-decor-item ${className}`;
    image.src = asset(`halloween/${filename}`);
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    layer.append(image);
  }

  document.body.append(layer);
  return () => layer.remove();
}
