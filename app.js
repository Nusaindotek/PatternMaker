import { getMeasurements } from "./engine/measurements.js";
import { makeBodice } from "./engine/bodice.js";
import { makeSleeve } from "./engine/sleeve.js";
import { renderPattern } from "./engine/geometry.js";

let lastSvg = "";


/* =========================
   GENERATE PATTERN
========================= */

function generatePattern() {

  const measurements = getMeasurements();

  const bodice = makeBodice(measurements);

  const sleeve = makeSleeve(
    measurements,
    bodice
  );

  lastSvg = renderPattern(
    bodice,
    sleeve,
    measurements
  );


  document.getElementById("canvasWrap").innerHTML = lastSvg;


  document.getElementById("status").textContent =
    `Bodice + Sleeve • Usia ${measurements.age} tahun • ` +
    `${measurements.fabric === "rib" ? "Rib Knit" : "Woven"} • ` +
    `Seam ${measurements.seam} cm`;


  document.getElementById("info").innerHTML =
    `
    <small>

    Armhole:
    ${bodice.armholeLength.toFixed(1)} cm

    <br>

    Sleeve Cap:
    ${sleeve.capLength.toFixed(1)} cm

    <br>

    Sleeve Ease:
    ${sleeve.capEase.toFixed(1)} cm

    </small>
    `;
}


/* =========================
   GENERATE BUTTON
========================= */

document
  .getElementById("generate")
  .addEventListener(
    "click",
    generatePattern
  );


/* =========================
   DOWNLOAD SVG
========================= */

document
  .getElementById("download")
  .addEventListener(
    "click",
    () => {

      if (!lastSvg) {
        generatePattern();
      }


      const blob = new Blob(
        [lastSvg],
        {
          type: "image/svg+xml"
        }
      );


      const url =
        URL.createObjectURL(blob);


      const link =
        document.createElement("a");


      link.href = url;

      link.download =
        "PatternMaker-V1.2-Bodice-Sleeve.svg";


      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);


      setTimeout(
        () => {
          URL.revokeObjectURL(url);
        },
        500
      );

    }
  );


/* =========================
   START APPLICATION
========================= */

generatePattern();
