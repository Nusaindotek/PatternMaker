/* =========================================================
   PatternMaker
   SVG GEOMETRY ENGINE V1.7
   ---------------------------------------------------------
   Fungsi:
   - Menggambar pola depan (Lipat & Full)
   - Menggambar pola belakang (Lipat & Full)
   - Menggambar pola lengan
   - Menampilkan ukuran pola
   - Menampilkan grainline
   - Menampilkan informasi drafting
   - Menjaga teks agar tidak menutupi pola
========================================================= */


/* =========================================================
   FORMAT ANGKA
========================================================= */

function formatNumber(value, digits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "0";
  }
  return number.toFixed(digits);
}


/* =========================================================
   GRID
========================================================= */

function createGrid(width, height) {
  let output = "";
  const gridSize = 5;

  for (let x = 0; x <= width; x += gridSize) {
    output += `
      <line
        class="grid"
        x1="${x}"
        y1="0"
        x2="${x}"
        y2="${height}"
      />
    `;
  }

  for (let y = 0; y <= height; y += gridSize) {
    output += `
      <line
        class="grid"
        x1="0"
        y1="${y}"
        x2="${width}"
        y2="${y}"
      />
    `;
  }

  return output;
}


/* =========================================================
   BODICE PATH (MODE LIPAT / HALF)
========================================================= */

function createBodicePath(points, front = true) {
  if (!points) return "";

  const { A, B, C, D, E, F } = points;
  if (!A || !B || !C || !D || !E || !F) return "";

  const neckDepth = front ? 4.5 : 2.5;

  return `
    M ${A[0]} ${A[1] + neckDepth}
    L ${A[0]} ${F[1]}
    L ${E[0]} ${E[1]}
    L ${D[0]} ${D[1]}
    C ${D[0]} ${D[1] - 2.4}, ${C[0] + 1.1} ${C[1] + 0.5}, ${C[0]} ${C[1]}
    L ${B[0]} ${B[1]}
    Q ${A[0] + neckDepth * 0.85} ${A[1]}, ${A[0]} ${A[1] + neckDepth}
  `;
}


/* =========================================================
   BODICE PATH (MODE FULL / TANPA LIPATAN)
========================================================= */

function createFullBodicePath(points, front = true) {
  if (!points) return "";

  const { A, B, C, D, E, F } = points;
  if (!A || !B || !C || !D || !E || !F) return "";

  const neckDepth = front ? 4.5 : 2.5;
  const centerX = A[0];

  // Helper pencerminan koordinat X terhadap garis tengah A[0]
  const mirrorX = (x) => centerX - (x - centerX);

  return `
    M ${centerX} ${A[1] + neckDepth}
    L ${centerX} ${F[1]}
    L ${E[0]} ${E[1]}
    L ${D[0]} ${D[1]}
    C ${D[0]} ${D[1] - 2.4}, ${C[0] + 1.1} ${C[1] + 0.5}, ${C[0]} ${C[1]}
    L ${B[0]} ${B[1]}
    Q ${centerX + neckDepth * 0.85} ${A[1]}, ${centerX} ${A[1] + neckDepth}
    Q ${mirrorX(centerX + neckDepth * 0.85)} ${A[1]}, ${mirrorX(B[0])} ${B[1]}
    L ${mirrorX(C[0])} ${C[1]}
    C ${mirrorX(C[0] + 1.1)} ${C[1] + 0.5}, ${mirrorX(D[0])} ${D[1] - 2.4}, ${mirrorX(D[0])} ${D[1]}
    L ${mirrorX(E[0])} ${E[1]}
    L ${mirrorX(F[0])} ${F[1]}
    L ${centerX} ${F[1]}
    Z
  `;
}


/* =========================================================
   SLEEVE PATH
========================================================= */

function createSleevePath(s) {
  if (!s) return "";

  const hasControls =
    s.leftControl1 &&
    s.leftControl2 &&
    s.rightControl1 &&
    s.rightControl2;

  if (hasControls) {
    return `
      M ${s.left[0]} ${s.left[1]}
      L ${s.leftCap[0]} ${s.leftCap[1]}
      C ${s.leftControl1[0]} ${s.leftControl1[1]}, ${s.leftControl2[0]} ${s.leftControl2[1]}, ${s.top[0]} ${s.top[1]}
      C ${s.rightControl1[0]} ${s.rightControl1[1]}, ${s.rightControl2[0]} ${s.rightControl2[1]}, ${s.rightCap[0]} ${s.rightCap[1]}
      L ${s.right[0]} ${s.right[1]}
      L ${s.bottomRight[0]} ${s.bottomRight[1]}
      L ${s.bottomLeft[0]} ${s.bottomLeft[1]}
      L ${s.left[0]} ${s.left[1]}
      Z
    `;
  }

  return `
    M ${s.left[0]} ${s.left[1]}
    L ${s.leftCap[0]} ${s.leftCap[1]}
    C ${s.leftCap[0] + 3} ${s.leftCap[1] - 3}, ${s.top[0] - 2} ${s.top[1] + 1}, ${s.top[0]} ${s.top[1]}
    C ${s.top[0] + 2} ${s.top[1] + 1}, ${s.rightCap[0] - 3} ${s.rightCap[1] - 3}, ${s.rightCap[0]} ${s.rightCap[1]}
    L ${s.right[0]} ${s.right[1]}
    L ${s.bottomRight[0]} ${s.bottomRight[1]}
    L ${s.bottomLeft[0]} ${s.bottomLeft[1]}
    L ${s.left[0]} ${s.left[1]}
    Z
  `;
}


/* =========================================================
   GRAINLINE
========================================================= */

function createGrainline(x, y1, y2, label = "GRAIN") {
  return `
    <line
      class="grain"
      x1="${x}"
      y1="${y1}"
      x2="${x}"
      y2="${y2}"
      marker-start="url(#grainArrow)"
      marker-end="url(#grainArrow)"
    />
    <text
      class="grainText"
      x="${x + 1.8}"
      y="${(y1 + y2) / 2}"
    >
      ${label}
    </text>
  `;
}


/* =========================================================
   DIMENSIONS & LABELS
========================================================= */

function createHorizontalDimension(x1, x2, y, text) {
  if (!Number.isFinite(x1) || !Number.isFinite(x2) || !Number.isFinite(y)) return "";
  return `
    <line
      class="dimension"
      x1="${x1}"
      y1="${y}"
      x2="${x2}"
      y2="${y}"
      marker-start="url(#dimensionArrow)"
      marker-end="url(#dimensionArrow)"
    />
    <text
      class="dimensionText"
      x="${(x1 + x2) / 2}"
      y="${y - 1.5}"
      text-anchor="middle"
    >
      ${text}
    </text>
  `;
}

function createLabel(text, x, y, anchor = "start") {
  return `
    <text class="label" x="${x}" y="${y}" text-anchor="${anchor}">
      ${text}
    </text>
  `;
}

function createSmallText(text, x, y, anchor = "start") {
  return `
    <text class="small" x="${x}" y="${y}" text-anchor="${anchor}">
      ${text}
    </text>
  `;
}


/* =========================================================
   BODICE INFORMATION
========================================================= */

function createBodiceInformation(bodice, measurements) {
  if (!bodice) return "";
  let output = "";

  if (Number.isFinite(Number(bodice.bustQ))) {
    const front = bodice.front;
    const bustY = front.D ? front.D[1] : 20;
    output += createHorizontalDimension(
      front.A[0],
      front.A[0] + bodice.bustQ,
      bustY + 3,
      `1/4 dada ${formatNumber(bodice.bustQ)} cm`
    );
  }

  if (Number.isFinite(Number(bodice.waistQ))) {
    const front = bodice.front;
    output += createHorizontalDimension(
      front.F[0],
      front.F[0] + bodice.waistQ,
      front.F[1] + 3,
      `1/4 pinggang ${formatNumber(bodice.waistQ)} cm`
    );
  }

  return output;
}


/* =========================================================
   MAIN SVG RENDERER
========================================================= */

export function renderPattern(bodice, sleeve, measurements, options = { fullPattern: false }) {
  const isFull = options.fullPattern;
  
  // Lebar canvas disesuaikan jika mode Full agar tidak terpotong
  const width = isFull ? 180 : 140;
  const height = 72;

  const grid = createGrid(width, height);

  // Render path sesuai opsi fullPattern
  const frontPath = isFull
    ? createFullBodicePath(bodice.front, true)
    : createBodicePath(bodice.front, true);

  const backPath = isFull
    ? createFullBodicePath(bodice.back, false)
    : createBodicePath(bodice.back, false);

  const sleevePath = createSleevePath(sleeve);

  const armholeLength = Number(bodice.armholeLength) || 0;
  const negativeEase = Number(measurements?.negativeEase) || 0;
  const fabricName = measurements?.fabric || "";

  // Penyesuaian Garis Grainline
  const frontGrain = createGrainline(
    14,
    18,
    Math.min(38, 10 + Number(measurements?.bodyLength || 25))
  );

  const backGrain = createGrainline(
    isFull ? 75 : 59,
    18,
    Math.min(38, 10 + Number(measurements?.bodyLength || 25))
  );

  const sleeveGrain = createGrainline(
    isFull ? 135 : 108,
    19,
    45
  );

  const bodiceInfo = createBodiceInformation(bodice, measurements);

  // Dynamic Labels
  const labels = `
    ${createLabel(
      isFull ? "DEPAN — POTONG 1x (FULL)" : "DEPAN — POTONG 1x LIPATAN",
      10,
      57
    )}
    ${createLabel(
      isFull ? "BELAKANG — POTONG 1x (FULL)" : "BELAKANG — POTONG 1x LIPATAN",
      isFull ? 70 : 55,
      57
    )}
    ${createLabel(
      "LENGAN — POTONG 2",
      isFull ? 125 : 95,
      60
    )}
  `;

  const technicalInfo = `
    ${createSmallText("PatternMaker • Pola Anak • Satuan cm", 5, 5)}
    ${createSmallText(`Lingkar dada: ${formatNumber(measurements?.bust)} cm`, 5, 8)}
    ${createSmallText(`Lingkar pinggang: ${formatNumber(measurements?.waist)} cm`, 5, 11)}
    ${createSmallText(`Panjang badan: ${formatNumber(measurements?.bodyLength)} cm`, 48, 8)}
    ${createSmallText(`Lebar bahu: ${formatNumber(measurements?.shoulder)} cm`, 48, 11)}
  `;

  const bottomInfo = `
    ${createSmallText(`Kerung lengan: ${formatNumber(armholeLength)} cm`, 5, 66)}
    ${createSmallText(`Pengurangan ukuran: ${formatNumber(negativeEase)}%`, 45, 66)}
    ${createSmallText(fabricName, isFull ? 125 : 95, 66)}
  `;

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <style>
          .grid { stroke: #e8e8e8; stroke-width: 0.18; }
          .pattern { fill: rgba(210, 225, 235, 0.16); stroke: #222; stroke-width: 0.28; stroke-linejoin: round; stroke-linecap: round; }
          .grain { stroke: #333; stroke-width: 0.25; }
          .grainText { font-family: Arial, sans-serif; font-size: 1.7px; fill: #333; }
          .dimension { stroke: #777; stroke-width: 0.18; }
          .dimensionText { font-family: Arial, sans-serif; font-size: 1.7px; fill: #555; }
          .label { font-family: Arial, sans-serif; font-size: 2.0px; font-weight: 600; fill: #111; }
          .small { font-family: Arial, sans-serif; font-size: 1.55px; fill: #555; }
        </style>

        <marker id="grainArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto">
          <path d="M 0 10 L 5 0 L 10 10 Z" fill="#333" />
        </marker>

        <marker id="dimensionArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.2" markerHeight="2.2" orient="auto">
          <path d="M 0 5 L 10 0 L 10 10 Z" fill="#777" />
        </marker>
      </defs>

      ${grid}

      <!-- FRONT -->
      <path class="pattern" d="${frontPath}" />

      <!-- BACK -->
      <path class="pattern" d="${backPath}" />

      <!-- SLEEVE -->
      <path class="pattern" d="${sleevePath}" />

      <!-- GRAINLINES -->
      ${frontGrain}
      ${backGrain}
      ${sleeveGrain}

      <!-- DIMENSIONS & LABELS -->
      ${bodiceInfo}
      ${labels}
      ${technicalInfo}
      ${bottomInfo}

      <!-- SLEEVE CAP INFO -->
      ${
        sleeve && Number.isFinite(Number(sleeve.capEase))
          ? createSmallText(`Cap ease: ${formatNumber(sleeve.capEase)} cm`, isFull ? 125 : 95, 63)
          : ""
      }
    </svg>
  `;
}
