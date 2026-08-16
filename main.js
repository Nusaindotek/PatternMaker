```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 10 — main.js
 * ============================================================
 *
 * APPLICATION CONTROLLER
 *
 * Tugas utama:
 * - Membuat measurement fields dinamis
 * - Mengatur mode Newbie / Tailor / Expert
 * - Membaca Body Profile
 * - Menjalankan Pattern Registry
 * - Menghubungkan legacy bodice + sleeve
 * - Menampilkan preview Full / Open
 * - Menghubungkan Fabric Engine
 * - Menjalankan Nesting Engine
 *
 * Engine pattern tidak ditulis di sini.
 * Controller hanya mengatur alur data.
 *
 * ============================================================
 */


/* ============================================================
   IMPORT CORE
   ============================================================ */

import {
    PatternMakerMeasurementSchema
} from "./engine/measurement-schema.js";


import {
    PatternMakerProfile
} from "./engine/profile.js";


import {
    PatternMakerGarment
} from "./engine/garment.js";


import {
    PatternMakerMeasurements
} from "./engine/measurements.js";


import {
    PatternMakerPatternRegistry
} from "./engine/pattern-registry.js";


import {
    PatternMakerLegacyAdapters
} from "./engine/legacy-pattern-adapter.js";


/*
 * Legacy engines yang sudah memakai export ES Module.
 */

import {
    makeBodice
} from "./engine/bodice.js";


import {
    makeSleeve
} from "./engine/sleeve.js";


import {
    renderPattern
} from "./engine/geometry.js";


import {
    createFabric
} from "./engine/fabric.js";


import {
    nestPieces,
    getNestingSummary,
    validateNesting
} from "./engine/nesting.js";


/* ============================================================
   ALIAS
   ============================================================ */

const Schema =
    window.PatternMakerMeasurementSchema ||
    PatternMakerMeasurementSchema;


const Profile =
    window.PatternMakerProfile ||
    PatternMakerProfile;


const Garment =
    window.PatternMakerGarment ||
    PatternMakerGarment;


const Measurements =
    window.PatternMakerMeasurements ||
    PatternMakerMeasurements;


const Registry =
    window.PatternMakerPatternRegistry ||
    PatternMakerPatternRegistry;


const Legacy =
    window.PatternMakerLegacyAdapters ||
    PatternMakerLegacyAdapters;


/* ============================================================
   GLOBAL STATE
   ============================================================ */

const AppState = {

    mode:
        "tailor",

    garment:
        "tshirt",

    profile:
        null,

    measurements:
        null,

    bodice:
        null,

    sleeve:
        null,

    patternResult:
        null,

    fabric:
        null,

    nesting:
        null,

    svg:
        "",

    initialized:
        false,

    isGenerating:
        false

};


/* ============================================================
   DOM HELPER
   ============================================================ */

function el(id) {

    return document.getElementById(id);

}


/* ============================================================
   SAFE NUMBER
   ============================================================ */

function number(
    id,
    fallback = 0
) {

    const node =
        el(id);


    if (!node) {

        return fallback;

    }


    const value =
        Number(
            node.value
        );


    return Number.isFinite(value)
        ? value
        : fallback;

}


/* ============================================================
   STATUS
   ============================================================ */

function setStatus(
    message,
    type = ""
) {

    const node =
        el("resultStatus");


    if (!node) {

        return;

    }


    node.textContent =
        message;


    node.className =
        "status";


    if (type) {

        node.classList.add(
            type
        );

    }

}


/* ============================================================
   DRAFT STATUS
   ============================================================ */

function setDraftStatus(
    message,
    type = ""
) {

    const node =
        el("draftEngineStatus");


    if (!node) {

        return;

    }


    node.textContent =
        message;


    node.className =
        "status";


    if (type) {

        node.classList.add(
            type
        );

    }

}


/* ============================================================
   MODE
   ============================================================ */

const MODE_DEFINITIONS = {

    newbie: {

        label:
            "Newbie — Mudah",

        description:
            "Tampilan sederhana untuk pengguna yang baru belajar membuat pola."

    },


    tailor: {

        label:
            "Tailor — Lengkap",

        description:
            "Kontrol ukuran, fitting dan konstruksi untuk penggunaan tailor."

    },


    expert: {

        label:
            "Expert / Garment — Profesional",

        description:
            "Kontrol profesional untuk patternmaking, fabric dan produksi."

    }

};


/* ============================================================
   APPLY MODE
   ============================================================ */

function applyMode(
    mode
) {

    if (
        !MODE_DEFINITIONS[mode]
    ) {

        mode =
            "tailor";

    }


    AppState.mode =
        mode;


    document.body.classList.remove(
        "mode-newbie",
        "mode-tailor",
        "mode-expert"
    );


    document.body.classList.add(
        `mode-${mode}`
    );


    const description =
        el("modeDescription");


    if (
        description
    ) {

        description.textContent =
            MODE_DEFINITIONS[
                mode
            ].description;

    }


    const result =
        el("modeResult");


    if (
        result
    ) {

        result.textContent =
            `Mode kerja: ${MODE_DEFINITIONS[mode].label}`;

    }


    /*
     * Newbie:
     * lebih sedikit kontrol.
     */

    if (
        mode === "newbie"
    ) {

        if (
            el("fit")
        ) {

            el("fit").value =
                "regular";

        }


        if (
            el("dart")
        ) {

            el("dart").value =
                "none";

        }

    }


    return mode;

}


/* ============================================================
   GARMENT
   ============================================================ */

function getSelectedGarment() {

    const node =
        el("garmentType");


    if (
        !node ||
        !node.value
    ) {

        return "custom";

    }


    return node.value;

}


/* ============================================================
   RENDER MEASUREMENT FIELD
   ============================================================ */

function renderMeasurementFields() {

    const container =
        el("measurementFields");


    if (!container) {

        return;

    }


    AppState.garment =
        getSelectedGarment();


    const garment =
        Garment.getGarment(
            AppState.garment
        );


    if (!garment) {

        container.innerHTML = "";

        return;

    }


    const measurementIds = [
        ...new Set([

            ...garment.requiredMeasurements,

            ...garment.optionalMeasurements

        ])

    ];


    let html = "";


    measurementIds.forEach(
        measurementId => {

            const definition =
                Schema.getMeasurementDefinition(
                    measurementId
                );


            if (!definition) {

                return;

            }


            const existing =
                AppState.profile &&
                AppState.profile.hasMeasurement(
                    measurementId
                )
                    ? AppState.profile.getMeasurement(
                        measurementId,
                        getUnit()
                    )
                    : "";


            const value =
                existing === null
                    ? ""
                    : existing;


            const required =
                garment.requiredMeasurements
                    .includes(
                        measurementId
                    );


            html += `

                <div class="measurement-field">

                    <label
                        for="${measurementId}"
                    >
                        ${definition.label}
                        ${required ? "*" : ""}
                    </label>

                    <input
                        id="${measurementId}"
                        data-measurement="${measurementId}"
                        type="number"
                        min="${getDisplayMin(definition)}"
                        max="${getDisplayMax(definition)}"
                        step="0.1"
                        value="${value}"
                        placeholder="${definition.label}"
                    >

                    <small>
                        ${definition.unit}
                        ${required ? " • wajib" : " • opsional"}
                    </small>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;


    updateMeasurementStatus();

}


/* ============================================================
   DISPLAY MIN
   ============================================================ */

function getDisplayMin(
    definition
) {

    const unit =
        getUnit();


    return Number(
        Schema.measurementFromCm(
            definition.min,
            unit
        ).toFixed(2)
    );

}


/* ============================================================
   DISPLAY MAX
   ============================================================ */

function getDisplayMax(
    definition
) {

    const unit =
        getUnit();


    return Number(
        Schema.measurementFromCm(
            definition.max,
            unit
        ).toFixed(2)
    );

}


/* ============================================================
   UNIT
   ============================================================ */

function getUnit() {

    const node =
        el("sizeSystem");


    return (
        node &&
        node.value
    )
        ? node.value
        : "cm";

}


/* ============================================================
   COLLECT MEASUREMENTS
   ============================================================ */

function collectMeasurementInputs() {

    const garmentId =
        getSelectedGarment();


    const garment =
        Garment.getGarment(
            garmentId
        );


    if (!garment) {

        throw new Error(
            "Jenis pakaian tidak ditemukan."
        );

    }


    const unit =
        getUnit();


    const measurements = {};


    const required =
        garment.requiredMeasurements;


    const all =
        [
            ...new Set([
                ...garment.requiredMeasurements,
                ...garment.optionalMeasurements
            ])
        ];


    all.forEach(
        measurementId => {

            const node =
                el(
                    measurementId
                );


            if (
                !node ||
                node.value === ""
            ) {

                return;

            }


            const raw =
                Number(
                    node.value
                );


            if (
                !Number.isFinite(raw)
            ) {

                throw new Error(
                    `${measurementId} harus berupa angka.`
                );

            }


            const cm =
                Schema.measurementToCm(
                    raw,
                    unit
                );


            const validation =
                Schema.validateMeasurementValue(
                    measurementId,
                    cm
                );


            if (
                !validation.valid
            ) {

                throw new Error(
                    validation.message
                );

            }


            measurements[
                measurementId
            ] =
                raw;

        }
    );


    /*
     * Required check.
     */

    const missing = [];


    required.forEach(
        measurementId => {

            if (
                measurements[
                    measurementId
                ] === undefined
            ) {

                const definition =
                    Schema.getMeasurementDefinition(
                        measurementId
                    );


                missing.push(
                    definition
                        ? definition.label
                        : measurementId
                );

            }

        }
    );


    if (
        missing.length
    ) {

        throw new Error(

            "Ukuran wajib belum lengkap: " +
            missing.join(", ")

        );

    }


    return {

        unit,

        measurements

    };

}


/* ============================================================
   BUILD BODY PROFILE
   ============================================================ */

function buildBodyProfile() {

    const input =
        collectMeasurementInputs();


    const category =
        el("category")
            ? el("category").value
            : "custom";


    const age =
        el("age") &&
        el("age").value !== ""
            ? Number(
                el("age").value
            )
            : null;


    const profile =
        Profile.createBodyProfile({

            name:
                `${Schema.getCategoryLabel(category)} Profile`,

            category,

            age,

            unit:
                input.unit,

            source:
                "universal-ui"

        });


    Object.entries(
        input.measurements
    )
    .forEach(
        ([id, value]) => {

            profile.setMeasurement(
                id,
                value,
                input.unit
            );

        }
    );


    AppState.profile =
        profile;


    AppState.measurements =
        profile.measurements;


    /*
     * Sinkronkan profile ke measurement bridge.
     */

    Measurements.setProfile(
        profile
    );


    return profile;

}


/* ============================================================
   MEASUREMENT STATUS
   ============================================================ */

function updateMeasurementStatus() {

    const node =
        el("measurementStatus");


    if (!node) {

        return;

    }


    try {

        const garmentId =
            getSelectedGarment();


        const garment =
            Garment.getGarment(
                garmentId
            );


        if (!garment) {

            node.textContent =
                "Garment tidak ditemukan.";

            node.className =
                "status error";

            return;

        }


        const count =
            garment.requiredMeasurements.length;


        node.textContent =
            `${count} ukuran wajib untuk ${garment.label}.`;


        node.className =
            "status";

    }
    catch (
        error
    ) {

        node.textContent =
            error.message;


        node.className =
            "status error";

    }

}


/* ============================================================
   PROFILE / GARMENT NOTE
   ============================================================ */

function updateGarmentInformation() {

    const garmentId =
        getSelectedGarment();


    const garment =
        Garment.getGarment(
            garmentId
        );


    const note =
        el("garmentNote");


    if (
        note &&
        garment
    ) {

        note.textContent =
            `${garment.label} • Engine: ${garment.patternEngine}`;

    }


    updateMeasurementStatus();

}


/* ============================================================
   FABRIC KEY NORMALIZER
   ============================================================ */

function normalizeFabricKey(
    value
) {

    const key =
        String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");


    const map = {

        "sublime_jersey":
            "sublime_jersey",

        "rib_knit":
            "rib_knit",

        "cotton":
            "cotton",

        "cotton_combed":
            "cotton",

        "jersey":
            "sublime_jersey",

        "french_terry":
            "woven",

        "fleece":
            "woven",

        "linen":
            "woven",

        "rayon":
            "woven",

        "denim":
            "woven",

        "polyester":
            "woven",

        "knit":
            "rib_knit",

        "custom":
            "woven"

    };


    return (
        map[key] ||
        "woven"
    );

}


/* ============================================================
   BUILD FABRIC
   ============================================================ */

function buildFabric() {

    const fabricValue =
        el("fabric")
            ? el("fabric").value
            : "cotton";


    const width =
        Math.max(
            0,
            number(
                "fabricWidth",
                150
            )
        );


    const length =
        Math.max(
            0,
            number(
                "fabricLength",
                200
            )
        );


    const fabric =
        createFabric({

            material:
                normalizeFabricKey(
                    fabricValue
                ),

            width,

            length,

            /*
             * UI universal versi pertama
             * belum menyediakan selvedge field.
             */

            selvedgeLeft:
                0,

            selvedgeRight:
                0

        });


    AppState.fabric =
        fabric;


    return fabric;

}


/* ============================================================
   FABRIC RESULT
   ============================================================ */

function renderFabricResult(
    fabric
) {

    const container =
        el("fabricResult");


    if (
        !container ||
        !fabric
    ) {

        return;

    }


    container.innerHTML = `

        <div class="kv">

            <b>
                Material
            </b>

            <span>
                ${fabric.materialName}
            </span>

        </div>

        <div class="kv">

            <b>
                Lebar Kain
            </b>

            <span>
                ${fabric.width} cm
            </span>

        </div>

        <div class="kv">

            <b>
                Lebar Efektif
            </b>

            <span>
                ${fabric.effectiveWidth} cm
            </span>

        </div>

        <div class="kv">

            <b>
                Panjang Kain
            </b>

            <span>
                ${fabric.length} cm
            </span>

        </div>

        <div class="kv">

            <b>
                Stretch
            </b>

            <span>
                ${fabric.stretch}
            </span>

        </div>

        <div class="kv">

            <b>
                Arah Stretch
            </b>

            <span>
                ${fabric.stretchDirection}
            </span>

        </div>

        <div class="kv">

            <b>
                Rotasi
            </b>

            <span>
                ${fabric.allowedRotation.join(", ")}°
            </span>

        </div>

    `;

}


/* ============================================================
   PATTERN PIECE BOUNDS
   ============================================================ */

function getBounds(
    points
) {

    const xs =
        points.map(
            p => p[0]
        );


    const ys =
        points.map(
            p => p[1]
        );


    return {

        minX:
            Math.min(
                ...xs
            ),

        maxX:
            Math.max(
                ...xs
            ),

        minY:
            Math.min(
                ...ys
            ),

        maxY:
            Math.max(
                ...ys
            )

    };

}


/* ============================================================
   LEGACY PIECE EXTRACTION
   ============================================================ */

function extractLegacyPieces() {

    const pieces = [];


    if (
        !AppState.bodice ||
        !AppState.sleeve
    ) {

        return pieces;

    }


    const bodice =
        AppState.bodice;


    const sleeve =
        AppState.sleeve;


    /*
     * FRONT
     */

    if (
        bodice.front
    ) {

        const points = [

            bodice.front.A,
            bodice.front.B,
            bodice.front.C,
            bodice.front.D,
            bodice.front.E,
            bodice.front.F

        ];


        const bounds =
            getBounds(
                points
            );


        pieces.push({

            name:
                "Front",

            type:
                "bodice-front",

            points,

            width:
                bounds.maxX -
                bounds.minX,

            height:
                bounds.maxY -
                bounds.minY,

            quantity:
                1,

            allowedRotation:
                AppState.fabric?.allowedRotation ||
                [0]

        });

    }


    /*
     * BACK
     */

    if (
        bodice.back
    ) {

        const points = [

            bodice.back.A,
            bodice.back.B,
            bodice.back.C,
            bodice.back.D,
            bodice.back.E,
            bodice.back.F

        ];


        const bounds =
            getBounds(
                points
            );


        pieces.push({

            name:
                "Back",

            type:
                "bodice-back",

            points,

            width:
                bounds.maxX -
                bounds.minX,

            height:
                bounds.maxY -
                bounds.minY,

            quantity:
                1,

            allowedRotation:
                AppState.fabric?.allowedRotation ||
                [0]

        });

    }


    /*
     * SLEEVE
     */

    if (
        sleeve
    ) {

        const points = [

            sleeve.left,
            sleeve.leftCap,
            sleeve.top,
            sleeve.rightCap,
            sleeve.right,
            sleeve.bottomRight,
            sleeve.bottomLeft

        ];


        const bounds =
            getBounds(
                points
            );


        pieces.push({

            name:
                "Sleeve",

            type:
                "sleeve",

            points,

            width:
                bounds.maxX -
                bounds.minX,

            height:
                bounds.maxY -
                bounds.minY,

            quantity:
                2,

            allowedRotation:
                AppState.fabric?.allowedRotation ||
                [0]

        });

    }


    return pieces;

}


/* ============================================================
   SVG FULL / OPEN PREVIEW
   ============================================================ */

/*
 * geometry.js lama menghasilkan preview yang:
 *
 * FRONT — FOLD
 * BACK  — FOLD
 *
 * Untuk PatternMaker Universal kita tidak ingin
 * hasil terlipat.
 *
 * Controller ini membuat SVG open-view tambahan
 * dari geometry hasil bodice/sleeve.
 *
 * Engine lama tetap dipertahankan.
 */

function createOpenPreview(
    bodice,
    sleeve,
    measurements
) {

    if (
        !bodice ||
        !sleeve
    ) {

        return "";

    }


    const margin =
        8;


    const pieces = [];


    /*
     * FRONT
     */

    if (
        bodice.front
    ) {

        pieces.push({

            name:
                "FRONT",

            type:
                "front",

            points: [

                bodice.front.A,
                bodice.front.B,
                bodice.front.C,
                bodice.front.D,
                bodice.front.E,
                bodice.front.F

            ]

        });

    }


    /*
     * BACK
     */

    if (
        bodice.back
    ) {

        pieces.push({

            name:
                "BACK",

            type:
                "back",

            points: [

                bodice.back.A,
                bodice.back.B,
                bodice.back.C,
                bodice.back.D,
                bodice.back.E,
                bodice.back.F

            ]

        });

    }


    /*
     * SLEEVE LEFT
     */

    pieces.push({

        name:
            "SLEEVE L",

        type:
            "sleeve",

        points: [

            sleeve.left,
            sleeve.leftCap,
            sleeve.top,
            sleeve.rightCap,
            sleeve.right,
            sleeve.bottomRight,
            sleeve.bottomLeft

        ]

    });


    /*
     * SLEEVE RIGHT
     *
     * Mirror sederhana terhadap sumbu lokal sleeve.
     */

    const sleevePoints = [

        sleeve.left,
        sleeve.leftCap,
        sleeve.top,
        sleeve.rightCap,
        sleeve.right,
        sleeve.bottomRight,
        sleeve.bottomLeft

    ];


    const sleeveBounds =
        getBounds(
            sleevePoints
        );


    const center =
        (
            sleeveBounds.minX +
            sleeveBounds.maxX
        ) / 2;


    const mirrored =
        sleevePoints.map(
            point => [

                center -
                    (
                        point[0] -
                        center
                    ),

                point[1]

            ]
        );


    pieces.push({

        name:
            "SLEEVE R",

        type:
            "sleeve",

        points:
            mirrored

    });


    /*
     * CALCULATE GLOBAL BOUNDS
     */

    let currentX =
        0;


    const positioned = [];


    pieces.forEach(
        piece => {

            const bounds =
                getBounds(
                    piece.points
                );


            const width =
                bounds.maxX -
                bounds.minX;


            const height =
                bounds.maxY -
                bounds.minY;


            const y =
                margin;


            const x =
                currentX +
                margin -
                bounds.minX;


            const transformed =
                piece.points.map(
                    point => [

                        point[0] + x,

                        point[1] + y -
                            bounds.minY

                    ]
                );


            positioned.push({

                ...piece,

                points:
                    transformed,

                width,

                height

            });


            currentX +=
                width +
                12;

        }
    );


    /*
     * GLOBAL VIEWBOX
     */

    const all =
        positioned.flatMap(
            piece =>
                piece.points
        );


    const finalBounds =
        getBounds(
            all
        );


    const width =
        Math.max(
            120,
            finalBounds.maxX +
            margin
        );


    const height =
        Math.max(
            70,
            finalBounds.maxY +
            margin
        );


    let svg = `

        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 ${width} ${height}"
            width="${width}cm"
            height="${height}cm"
            preserveAspectRatio="xMidYMid meet"
        >

        <rect
            x="0"
            y="0"
            width="${width}"
            height="${height}"
            fill="#fafafa"
        />

    `;


    positioned.forEach(
        piece => {

            const points =
                piece.points
                    .map(
                        point =>
                            `${point[0]},${point[1]}`
                    )
                    .join(" ");


            svg += `

                <polygon
                    points="${points}"
                    fill="white"
                    stroke="#172033"
                    stroke-width="0.35"
                />

            `;


            const bounds =
                getBounds(
                    piece.points
                );


            const centerX =
                (
                    bounds.minX +
                    bounds.maxX
                ) / 2;


            svg += `

                <text
                    x="${centerX}"
                    y="${Math.max(3, bounds.minY - 1.5)}"
                    text-anchor="middle"
                    font-size="2.8"
                    font-weight="700"
                    fill="#172033"
                >
                    ${piece.name}
                </text>

            `;


            /*
             * GRAINLINE
             */

            const grainX =
                centerX;


            svg += `

                <line
                    x1="${grainX}"
                    y1="${bounds.minY + 4}"
                    x2="${grainX}"
                    y2="${bounds.maxY - 4}"
                    stroke="#667085"
                    stroke-width="0.25"
                    stroke-dasharray="2 1.5"
                />

            `;

        }
    );


    svg += `

        <text
            x="${margin}"
            y="${height - 2}"
            font-size="2.5"
            fill="#667085"
        >
            PatternMaker Universal • Full / Open • Unit: cm
        </text>

        </svg>

    `;


    return svg;

}


/* ============================================================
   RENDER PREVIEW
   ============================================================ */

function renderPreview() {

    if (
        !AppState.bodice ||
        !AppState.sleeve
    ) {

        return;

    }


    const svg =
        createOpenPreview(

            AppState.bodice,

            AppState.sleeve,

            AppState.measurements

        );


    AppState.svg =
        svg;


    const preview =
        el("patternPreview");


    if (
        !preview
    ) {

        return;

    }


    preview.innerHTML =
        svg;


    /*
     * SVG yang dimasukkan sebagai innerHTML
     * mempunyai SVG root sendiri.
     *
     * Supaya tetap cocok dalam UI,
     * gunakan object wrapper bila browser memerlukannya.
     */

    const svgNode =
        preview.querySelector(
            "svg"
        );


    if (
        svgNode
    ) {

        svgNode.setAttribute(
            "width",
            "100%"
        );

        svgNode.setAttribute(
            "height",
            "100%"
        );

        svgNode.setAttribute(
            "preserveAspectRatio",
            "xMidYMid meet"
        );

    }

}


/* ============================================================
   RESULT INFORMATION
   ============================================================ */

function renderResultInformation() {

    const container =
        el("resultInfo");


    if (
        !container
    ) {

        return;

    }


    const garment =
        Garment.getGarment(
            AppState.garment
        );


    const category =
        Schema.getCategoryLabel(
            el("category")
                ? el("category").value
                : "custom"
        );


    const material =
        AppState.fabric
            ? AppState.fabric.materialName
            : "-";


    const age =
        el("age") &&
        el("age").value !== ""
            ? `${el("age").value} tahun`
            : "-";


    container.innerHTML = `

        <div class="kv">

            <b>
                Kategori
            </b>

            <span>
                ${category}
            </span>

        </div>


        <div class="kv">

            <b>
                Jenis Pakaian
            </b>

            <span>
                ${garment?.label || "-"}
            </span>

        </div>


        <div class="kv">

            <b>
                Umur
            </b>

            <span>
                ${age}
            </span>

        </div>


        <div class="kv">

            <b>
                Material
            </b>

            <span>
                ${material}
            </span>

        </div>


        <div class="kv">

            <b>
                Unit
            </b>

            <span>
                ${getUnit()}
            </span>

        </div>


        <div class="kv">

            <b>
                Seam Allowance
            </b>

            <span>
                ${number("seam", 1)} cm
            </span>

        </div>

    `;

}


/* ============================================================
   RESULT MEASUREMENTS
   ============================================================ */

function renderResultMeasurements() {

    const container =
        el("resultMeasurements");


    if (
        !container ||
        !AppState.profile
    ) {

        return;

    }


    const garment =
        Garment.getGarment(
            AppState.garment
        );


    if (
        !garment
    ) {

        return;

    }


    const ids = [
        ...new Set([

            ...garment.requiredMeasurements,

            ...garment.optionalMeasurements

        ])
    ];


    const unit =
        getUnit();


    container.innerHTML =
        "";


    ids.forEach(
        measurementId => {

            if (
                !AppState.profile.hasMeasurement(
                    measurementId
                )
            ) {

                return;

            }


            const definition =
                Schema.getMeasurementDefinition(
                    measurementId
                );


            const value =
                AppState.profile.getMeasurement(
                    measurementId,
                    unit
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "kv";


            row.innerHTML = `

                <b>
                    ${definition.label}
                </b>

                <span>
                    ${Number(value).toFixed(1)}
                    ${unit}
                </span>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* ============================================================
   GENERATE BODICE + SLEEVE
   ============================================================ */

function generateLegacyUpperBody() {

    /*
     * Pattern Registry dulu.
     *
     * Ini memastikan garment + measurement validation
     * berjalan melalui arsitektur Universal.
     */

    const registryResult =
        Registry.generatePattern({

            garmentId:
                AppState.garment,

            mode:
                AppState.mode

        });


    if (
        !registryResult.success
    ) {

        /*
         * Untuk garment yang engine-nya belum dibuat,
         * jangan berpura-pura berhasil.
         */

        throw new Error(
            registryResult.message ||
            "Pattern engine belum tersedia."
        );

    }


    const measurements =
        registryResult.context.measurements;


    /*
     * Legacy bodice engine
     */

    const bodice =
        makeBodice(
            measurements
        );


    /*
     * Legacy sleeve engine
     */

    const fabricType =
        normalizeFabricKey(
            el("fabric")
                ? el("fabric").value
                : "cotton"
        );


    const sleeveMeasurements = {

        ...measurements,

        fabric:
            fabricType,

        /*
         * Negative ease kompatibel dengan
         * engine lama.
         *
         * Untuk sekarang mengikuti input bila ada.
         */

        negativeEase:
            number(
                "negativeEase",
                0
            )

    };


    /*
     * Jika field negativeEase belum ada
     * pada UI baru, gunakan 0.
     */

    const sleeve =
        makeSleeve(

            sleeveMeasurements,

            bodice

        );


    AppState.bodice =
        bodice;


    AppState.sleeve =
        sleeve;


    AppState.patternResult =
        {

            engine:
                "legacy-bodice-sleeve",

            bodice,

            sleeve,

            measurements

        };


    return AppState.patternResult;

}


/* ============================================================
   GENERATE PATTERN
   ============================================================ */

async function generatePattern() {

    if (
        AppState.isGenerating
    ) {

        return;

    }


    AppState.isGenerating =
        true;


    try {

        setStatus(
            "Memvalidasi ukuran..."
        );


        AppState.garment =
            getSelectedGarment();


        /*
         * PROFILE
         */

        buildBodyProfile();


        /*
         * GARMENT
         */

        const garment =
            Garment.getGarment(
                AppState.garment
            );


        if (!garment) {

            throw new Error(
                "Jenis pakaian tidak ditemukan."
            );

        }


        /*
         * FABRIC
         */

        const fabric =
            buildFabric();


        renderFabricResult(
            fabric
        );


        /*
         * ENGINE ROUTING
         *
         * Baru bodice/sleeve yang sudah tersedia
         * yang benar-benar dapat dipanggil.
         */

        if (
            garment.patternEngine ===
            "bodice"
        ) {

            generateLegacyUpperBody();

        }
        else {

            throw new Error(

                `${garment.label} menggunakan ` +
                `engine "${garment.patternEngine}", ` +
                `tetapi engine tersebut belum diaktifkan ` +
                `pada tahap ini.`

            );

        }


        /*
         * PREVIEW
         */

        renderPreview();


        /*
         * RESULT
         */

        renderResultInformation();

        renderResultMeasurements();


        /*
         * DRAFT STATUS
         */

        setDraftStatus(

            `Drafting berhasil • ` +
            `${garment.label} • ` +
            `Front + Back + Sleeve`,

            "ok"

        );


        /*
         * MAIN STATUS
         */

        const category =
            Schema.getCategoryLabel(
                el("category")
                    ? el("category").value
                    : "custom"
            );


        setStatus(

            `Pola berhasil dibuat • ` +
            `${category} • ` +
            `${garment.label} • ` +
            `${fabric.materialName}`,

            "ok"

        );


        /*
         * AUTO SCROLL
         */

        const preview =
            el("patternPreview");


        if (
            preview
        ) {

            preview.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });

        }


    }
    catch (
        error
    ) {

        console.error(
            "PatternMaker generate error:",
            error
        );


        setDraftStatus(
            error.message ||
            "Drafting gagal.",
            "error"
        );


        setStatus(
            error.message ||
            "Gagal membuat pola.",
            "error"
        );

    }
    finally {

        AppState.isGenerating =
            false;

    }

}


/* ============================================================
   NESTING
   ============================================================ */

function optimizeFabric() {

    try {

        if (
            !AppState.fabric
        ) {

            buildFabric();

        }


        if (
            !AppState.bodice ||
            !AppState.sleeve
        ) {

            throw new Error(
                "Buat pola terlebih dahulu."
            );

        }


        const pieces =
            extractLegacyPieces();


        if (
            !pieces.length
        ) {

            throw new Error(
                "Pattern pieces belum tersedia."
            );

        }


        const seam =
            Math.max(
                0,
                number(
                    "seam",
                    AppState.fabric.defaultSeam
                )
            );


        const quantity =
            Math.max(
                1,
                number(
                    "garmentQuantity",
                    1
                )
            );


        const nesting =
            nestPieces(

                pieces,

                AppState.fabric,

                {

                    seam,

                    quantity,

                    strategy:
                        "area"

                }

            );


        const validation =
            validateNesting(
                nesting
            );


        AppState.nesting =
            nesting;


        renderNestingResult(
            nesting,
            validation
        );


        const summary =
            getNestingSummary(
                nesting
            );


        setStatus(

            `Nesting selesai • ` +
            `Kebutuhan kain ± ` +
            `${Number(summary.usedLength || 0).toFixed(1)} cm • ` +
            `Efisiensi ` +
            `${Number(summary.efficiency || 0).toFixed(1)}%`,

            validation.valid
                ? "ok"
                : "error"

        );


    }
    catch (
        error
    ) {

        console.error(
            "PatternMaker nesting error:",
            error
        );


        setStatus(
            error.message ||
            "Optimasi kain gagal.",
            "error"
        );

    }

}


/* ============================================================
   NESTING RESULT
   ============================================================ */

function renderNestingResult(
    nesting,
    validation
) {

    if (!nesting) {

        return;

    }


    const summary =
        getNestingSummary(
            nesting
        );


    /*
     * PatternMaker Universal belum menyediakan
     * elemen khusus nesting di index.html.
     *
     * Kita tetap memperbarui plotterStatus
     * agar data tidak hilang.
     */

    const status =
        el("plotterStatus");


    if (
        status
    ) {

        status.textContent =

            validation.valid

                ? `Nesting OK • ` +
                  `Panjang ± ${Number(summary.usedLength || 0).toFixed(1)} cm • ` +
                  `Efisiensi ${Number(summary.efficiency || 0).toFixed(1)}%`

                : "Nesting membutuhkan koreksi.";

    }

}


/* ============================================================
   FIT PREVIEW
   ============================================================ */

function fitPreview() {

    const preview =
        el("patternPreview");


    if (!preview) {

        return;

    }


    const svg =
        preview.querySelector(
            "svg"
        );


    if (!svg) {

        return;

    }


    svg.setAttribute(
        "width",
        "100%"
    );


    svg.setAttribute(
        "height",
        "100%"
    );


    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

}


/* ============================================================
   OPEN PREVIEW
   ============================================================ */

function openPreview() {

    if (
        !AppState.bodice ||
        !AppState.sleeve
    ) {

        return;

    }


    renderPreview();

    fitPreview();

}


/* ============================================================
   FABRIC INPUT BINDING
   ============================================================ */

function bindFabricInputs() {

    const ids = [

        "fabric",
        "fabricWidth",
        "fabricLength",
        "stretch",
        "stretchDirection",
        "ease",
        "seam"

    ];


    ids.forEach(
        id => {

            const node =
                el(id);


            if (!node) {

                return;

            }


            node.addEventListener(
                "input",
                () => {

                    if (
                        AppState.fabric
                    ) {

                        try {

                            const fabric =
                                buildFabric();

                            renderFabricResult(
                                fabric
                            );

                        }
                        catch (
                            error
                        ) {

                            console.warn(
                                error
                            );

                        }

                    }

                }
            );


            node.addEventListener(
                "change",
                () => {

                    if (
                        AppState.fabric
                    ) {

                        try {

                            const fabric =
                                buildFabric();

                            renderFabricResult(
                                fabric
                            );

                        }
                        catch (
                            error
                        ) {

                            console.warn(
                                error
                            );

                        }

                    }

                }
            );

        }
    );

}


/* ============================================================
   MEASUREMENT INPUT BINDING
   ============================================================ */

function bindMeasurementEvents() {

    document.addEventListener(
        "input",
        event => {

            const target =
                event.target;


            if (
                !target ||
                !target.dataset
            ) {

                return;

            }


            if (
                !target.dataset.measurement
            ) {

                return;

            }


            /*
             * Profile yang lama harus invalid.
             */

            AppState.profile =
                null;


            AppState.measurements =
                null;


            AppState.bodice =
                null;


            AppState.sleeve =
                null;


            AppState.patternResult =
                null;


            setDraftStatus(
                "Ukuran berubah • buat pola kembali."
            );


        }
    );

}


/* ============================================================
   MODE EVENTS
   ============================================================ */

function bindModeEvents() {

    const node =
        el("userMode");


    if (!node) {

        return;

    }


    node.addEventListener(
        "change",
        () => {

            applyMode(
                node.value
            );

        }
    );

}


/* ============================================================
   GARMENT EVENTS
   ============================================================ */

function bindGarmentEvents() {

    const node =
        el("garmentType");


    if (!node) {

        return;

    }


    node.addEventListener(
        "change",
        () => {

            AppState.garment =
                node.value;


            /*
             * Profile lama tidak boleh digunakan
             * setelah schema garment berubah.
             */

            AppState.profile =
                null;


            AppState.measurements =
                null;


            AppState.bodice =
                null;


            AppState.sleeve =
                null;


            renderMeasurementFields();

            updateGarmentInformation();


            setDraftStatus(
                "Jenis pakaian berubah • ukuran perlu diperiksa."
            );

        }
    );

}


/* ============================================================
   UNIT EVENTS
   ============================================================ */

function bindUnitEvents() {

    const node =
        el("sizeSystem");


    if (!node) {

        return;

    }


    node.addEventListener(
        "change",
        () => {

            const previousProfile =
                AppState.profile;


            renderMeasurementFields();


            /*
             * Jika profile ada,
             * renderMeasurementFields akan mengambil
             * nilai dalam unit baru.
             */

            if (
                previousProfile
            ) {

                AppState.profile =
                    previousProfile;

            }

        }
    );

}


/* ============================================================
   GENERATE BUTTON
   ============================================================ */

function bindActionButtons() {

    const generate =
        el("generateBtn");


    if (
        generate
    ) {

        generate.addEventListener(
            "click",
            generatePattern
        );

    }


    const optimize =
        el("optimizeBtn");


    if (
        optimize
    ) {

        optimize.addEventListener(
            "click",
            optimizeFabric
        );

    }


    const download =
        el("downloadBtn");


    if (
        download
    ) {

        download.addEventListener(
            "click",
            downloadSVG
        );

    }


    const reset =
        el("resetBtn");


    if (
        reset
    ) {

        reset.addEventListener(
            "click",
            resetApplication
        );

    }


    const fit =
        el("fitPreviewBtn");


    if (
        fit
    ) {

        fit.addEventListener(
            "click",
            fitPreview
        );

    }


    const open =
        el("openPreviewBtn");


    if (
        open
    ) {

        open.addEventListener(
            "click",
            openPreview
        );

    }


    /*
     * Export button belum dijalankan di KODE 10.
     *
     * Akan ditangani oleh export modules.
     */

}


/* ============================================================
   DOWNLOAD SVG LEGACY
   ============================================================ */

function downloadSVG() {

    if (
        !AppState.svg
    ) {

        generatePattern();

    }


    if (
        !AppState.svg
    ) {

        return;

    }


    const blob =
        new Blob(

            [
                AppState.svg
            ],

            {
                type:
                    "image/svg+xml"
            }

        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "PatternMaker-Universal-pattern.svg";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        500
    );

}


/* ============================================================
   RESET APPLICATION
   ============================================================ */

function resetApplication() {

    AppState.mode =
        "tailor";


    AppState.garment =
        "tshirt";


    AppState.profile =
        null;


    AppState.measurements =
        null;


    AppState.bodice =
        null;


    AppState.sleeve =
        null;


    AppState.patternResult =
        null;


    AppState.fabric =
        null;


    AppState.nesting =
        null;


    AppState.svg =
        "";


    /*
     * DEFAULT MODE
     */

    if (
        el("userMode")
    ) {

        el("userMode").value =
            "tailor";

    }


    /*
     * DEFAULT CATEGORY
     */

    if (
        el("category")
    ) {

        el("category").value =
            "child";

    }


    /*
     * DEFAULT UNIT
     */

    if (
        el("sizeSystem")
    ) {

        el("sizeSystem").value =
            "cm";

    }


    /*
     * DEFAULT GARMENT
     */

    if (
        el("garmentType")
    ) {

        el("garmentType").value =
            "tshirt";

    }


    /*
     * CLEAR AGE
     */

    if (
        el("age")
    ) {

        el("age").value =
            "";

    }


    /*
     * DEFAULT FABRIC
     */

    if (
        el("fabric")
    ) {

        el("fabric").value =
            "cotton";

    }


    if (
        el("fabricWidth")
    ) {

        el("fabricWidth").value =
            "150";

    }


    if (
        el("fabricLength")
    ) {

        el("fabricLength").value =
            "200";

    }


    if (
        el("stretch")
    ) {

        el("stretch").value =
            "medium";

    }


    if (
        el("stretchDirection")
    ) {

        el("stretchDirection").value =
            "crosswise";

    }


    if (
        el("ease")
    ) {

        el("ease").value =
            "2";

    }


    if (
        el("seam")
    ) {

        el("seam").value =
            "1";

    }


    /*
     * TAILOR
     */

    if (
        el("fit")
    ) {

        el("fit").value =
            "regular";

    }


    if (
        el("dart")
    ) {

        el("dart").value =
            "none";

    }


    if (
        el("hemExtra")
    ) {

        el("hemExtra").value =
            "2";

    }


    if (
        el("notch")
    ) {

        el("notch").value =
            "standard";

    }


    /*
     * EXPERT
     */

    if (
        el("patternScale")
    ) {

        el("patternScale").value =
            "1";

    }


    if (
        el("grading")
    ) {

        el("grading").value =
            "none";

    }


    if (
        el("nesting")
    ) {

        el("nesting").value =
            "off";

    }


    if (
        el("markerEfficiency")
    ) {

        el("markerEfficiency").value =
            "85";

    }


    if (
        el("productionType")
    ) {

        el("productionType").value =
            "sample";

    }


    if (
        el("tolerance")
    ) {

        el("tolerance").value =
            "2";

    }


    /*
     * DRAFTING
     */

    if (
        el("patternTolerance")
    ) {

        el("patternTolerance").value =
            "0";

    }


    if (
        el("addSeam")
    ) {

        el("addSeam").value =
            "yes";

    }


    if (
        el("addNotches")
    ) {

        el("addNotches").value =
            "yes";

    }


    if (
        el("addGrainline")
    ) {

        el("addGrainline").value =
            "yes";

    }


    /*
     * PREVIEW
     */

    if (
        el("patternPreview")
    ) {

        el("patternPreview").innerHTML =
            "";

    }


    /*
     * RESULTS
     */

    if (
        el("resultInfo")
    ) {

        el("resultInfo").innerHTML =
            "";

    }


    if (
        el("resultMeasurements")
    ) {

        el("resultMeasurements").innerHTML =
            "";

    }


    if (
        el("fabricResult")
    ) {

        el("fabricResult").innerHTML =
            "";

    }


    /*
     * UI
     */

    applyMode(
        "tailor"
    );


    renderMeasurementFields();

    updateGarmentInformation();


    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting belum dijalankan."
    );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeApplication() {

    if (
        AppState.initialized
    ) {

        return;

    }


    AppState.initialized =
        true;


    /*
     * MODE
     */

    applyMode(
        el("userMode")
            ? el("userMode").value
            : "tailor"
    );


    /*
     * GARMENT
     */

    AppState.garment =
        getSelectedGarment();


    /*
     * MEASUREMENTS
     */

    renderMeasurementFields();


    updateGarmentInformation();


    /*
     * FABRIC
     */

    const fabric =
        buildFabric();


    renderFabricResult(
        fabric
    );


    /*
     * BINDINGS
     */

    bindModeEvents();

    bindGarmentEvents();

    bindUnitEvents();

    bindMeasurementEvents();

    bindFabricInputs();

    bindActionButtons();


    /*
     * STATUS
     */

    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );


    console.log(
        "PatternMaker Universal Controller initialized."
    );


}


/* ============================================================
   MODULE READY
   ============================================================ */

window.addEventListener(

    "PatternMakerModulesReady",

    () => {

        initializeApplication();

    }

);


/*
 * Safety:
 * jika main.js dijalankan setelah event sudah lewat.
 */

if (
    window.PatternMakerMeasurementSchema &&
    window.PatternMakerProfile &&
    window.PatternMakerGarment &&
    window.PatternMakerMeasurements &&
    window.PatternMakerPatternRegistry
) {

    initializeApplication();

}
```
