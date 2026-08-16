```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 16 — main.js
 * ============================================================
 *
 * UNIVERSAL APPLICATION CONTROLLER
 *
 * Tugas:
 * - Mengatur UI
 * - Membuat Body Profile
 * - Validasi ukuran
 * - Routing garment ke Pattern Engine
 * - Menormalkan hasil engine menjadi Production Geometry
 * - Menampilkan Full / Open Preview
 *
 * ============================================================
 */

"use strict";


/* ============================================================
   GLOBAL DEPENDENCIES
   ============================================================ */

const Schema =
    window.PatternMakerMeasurementSchema;

const Profile =
    window.PatternMakerProfile;

const Garment =
    window.PatternMakerGarment;

const Measurements =
    window.PatternMakerMeasurements;

const Registry =
    window.PatternMakerPatternRegistry;

const ProductionGeometry =
    window.PatternMakerProductionGeometry;

const ShirtEngine =
    window.PatternMakerShirtEngine;

const DressEngine =
    window.PatternMakerDressEngine;


/* ============================================================
   DEPENDENCY CHECK
   ============================================================ */

function validateDependencies() {

    const required = {
        Schema,
        Profile,
        Garment,
        Measurements,
        Registry,
        ProductionGeometry
    };


    const missing =
        Object.entries(required)
            .filter(([, value]) => !value)
            .map(([key]) => key);


    if (missing.length) {

        throw new Error(
            "Dependency PatternMaker belum tersedia: " +
            missing.join(", ")
        );

    }

}


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const AppState = {

    initialized: false,

    generating: false,

    mode: "tailor",

    garment: "tshirt",

    profile: null,

    measurements: null,

    fabric: null,

    engineResult: null,

    productionPattern: null,

    error: null

};


/* ============================================================
   DOM
   ============================================================ */

function $(id) {

    return document.getElementById(id);

}


/* ============================================================
   STATUS
   ============================================================ */

function setStatus(message, type = "") {

    const node =
        $("resultStatus");


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


function setDraftStatus(message, type = "") {

    const node =
        $("draftEngineStatus");


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

const MODES = {

    newbie: {

        label: "Newbie — Mudah",

        description:
            "Workflow sederhana dengan parameter utama."

    },

    tailor: {

        label: "Tailor — Lengkap",

        description:
            "Kontrol ukuran, fitting dan konstruksi."

    },

    expert: {

        label: "Expert / Garment — Profesional",

        description:
            "Kontrol patternmaking dan produksi."

    }

};


function applyMode(mode) {

    if (!MODES[mode]) {

        mode = "tailor";

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
        $("modeDescription");


    if (description) {

        description.textContent =
            MODES[mode].description;

    }


    const modeResult =
        $("modeResult");


    if (modeResult) {

        modeResult.textContent =
            `Mode kerja: ${MODES[mode].label}`;

    }

}


/* ============================================================
   CURRENT VALUES
   ============================================================ */

function getGarmentId() {

    return (
        $("garmentType")?.value ||
        "custom"
    );

}


function getCategory() {

    return (
        $("category")?.value ||
        "custom"
    );

}


function getUnit() {

    return (
        $("sizeSystem")?.value ||
        "cm"
    );

}


/* ============================================================
   MEASUREMENT FIELDS
   ============================================================ */

function renderMeasurementFields() {

    const container =
        $("measurementFields");


    if (!container) {

        return;

    }


    const garmentId =
        getGarmentId();


    const garment =
        Garment.getGarment(
            garmentId
        );


    if (!garment) {

        container.innerHTML =
            "";

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


    let html =
        "";


    ids.forEach(
        measurementId => {

            const definition =
                Schema.getMeasurementDefinition(
                    measurementId
                );


            if (!definition) {

                return;

            }


            let existing =
                "";


            if (
                AppState.profile &&
                AppState.profile.hasMeasurement(
                    measurementId
                )
            ) {

                const value =
                    AppState.profile.getMeasurement(
                        measurementId,
                        unit
                    );


                if (value !== null) {

                    existing =
                        Number(value)
                            .toFixed(1);

                }

            }


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
                        min="0"
                        step="0.1"
                        value="${existing}"
                    >


                    <small>
                        ${unit}
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
   MEASUREMENT STATUS
   ============================================================ */

function updateMeasurementStatus() {

    const node =
        $("measurementStatus");


    if (!node) {

        return;

    }


    const garment =
        Garment.getGarment(
            getGarmentId()
        );


    if (!garment) {

        node.className =
            "status error";


        node.textContent =
            "Jenis pakaian tidak ditemukan.";


        return;

    }


    node.className =
        "status";


    node.textContent =

        `${garment.requiredMeasurements.length} ` +
        `ukuran wajib untuk ${garment.label}.`;

}


/* ============================================================
   GARMENT INFORMATION
   ============================================================ */

function updateGarmentInformation() {

    const note =
        $("garmentNote");


    const garment =
        Garment.getGarment(
            getGarmentId()
        );


    if (
        note &&
        garment
    ) {

        note.textContent =

            `${garment.label} • ` +
            `Engine: ${garment.patternEngine}`;

    }


    updateMeasurementStatus();

}


/* ============================================================
   COLLECT MEASUREMENTS
   ============================================================ */

function collectMeasurementInput() {

    const garmentId =
        getGarmentId();


    const garment =
        Garment.getGarment(
            garmentId
        );


    if (!garment) {

        throw new Error(
            "Garment tidak ditemukan."
        );

    }


    const unit =
        getUnit();


    const values =
        {};


    const allIds = [
        ...new Set([
            ...garment.requiredMeasurements,
            ...garment.optionalMeasurements
        ])
    ];


    allIds.forEach(
        measurementId => {

            const node =
                $(measurementId);


            if (
                !node ||
                node.value === ""
            ) {

                return;

            }


            const value =
                Number(
                    node.value
                );


            if (!Number.isFinite(value)) {

                throw new Error(
                    `${measurementId} harus berupa angka.`
                );

            }


            const cm =
                Schema.measurementToCm(
                    value,
                    unit
                );


            const valid =
                Schema.validateMeasurementValue(
                    measurementId,
                    cm
                );


            if (!valid.valid) {

                throw new Error(
                    valid.message
                );

            }


            values[
                measurementId
            ] =
                value;

        }
    );


    const missing =
        garment.requiredMeasurements.filter(
            id =>
                values[id] === undefined
        );


    if (missing.length) {

        const labels =
            missing.map(
                id => {

                    const definition =
                        Schema.getMeasurementDefinition(
                            id
                        );


                    return definition
                        ? definition.label
                        : id;

                }
            );


        throw new Error(
            "Ukuran wajib belum lengkap: " +
            labels.join(", ")
        );

    }


    return {

        values,

        unit

    };

}


/* ============================================================
   BODY PROFILE
   ============================================================ */

function createCurrentProfile() {

    const input =
        collectMeasurementInput();


    const age =
        $("age") &&
        $("age").value !== ""
            ? Number($("age").value)
            : null;


    const profile =
        Profile.createBodyProfile({

            name:
                `${Schema.getCategoryLabel(
                    getCategory()
                )} Profile`,

            category:
                getCategory(),

            age,

            unit:
                input.unit,

            source:
                "universal-ui"

        });


    Object.entries(
        input.values
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
        {
            ...profile.measurements
        };


    Measurements.setProfile(
        profile
    );


    return profile;

}


/* ============================================================
   FABRIC
   ============================================================ */

function getFabricKey() {

    return (
        $("fabric")?.value ||
        "cotton"
    );

}


function createFabricData() {

    const material =
        getFabricKey();


    const width =
        Math.max(
            1,
            Number(
                $("fabricWidth")?.value ||
                150
            )
        );


    const length =
        Math.max(
            1,
            Number(
                $("fabricLength")?.value ||
                200
            )
        );


    const stretch =
        $("stretch")?.value ||
        "medium";


    const direction =
        $("stretchDirection")?.value ||
        "crosswise";


    const ease =
        Number(
            $("ease")?.value ||
            0
        );


    const seam =
        Number(
            $("seam")?.value ||
            0
        );


    AppState.fabric = {

        material,

        width,

        length,

        stretch,

        stretchDirection:
            direction,

        ease,

        seam

    };


    return AppState.fabric;

}


/* ============================================================
   FABRIC RESULT
   ============================================================ */

function renderFabricResult() {

    const container =
        $("fabricResult");


    if (!container) {

        return;

    }


    const fabric =
        AppState.fabric;


    if (!fabric) {

        return;

    }


    container.innerHTML = `

        <div class="kv">

            <b>
                Material
            </b>

            <span>
                ${fabric.material}
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
                Ease
            </b>

            <span>
                ${fabric.ease} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Seam
            </b>

            <span>
                ${fabric.seam} cm
            </span>

        </div>

    `;

}


/* ============================================================
   UNIVERSAL ENGINE CONTEXT
   ============================================================ */

function createEngineContext(
    garment
) {

    return {

        garment,

        garmentId:
            garment.id,

        measurements:
            Measurements.getLegacyMeasurements(
                garment.id
            ),

        profile:
            AppState.profile,

        fabric:
            AppState.fabric,

        mode:
            AppState.mode,

        options: {

            seamAllowance:
                Number(
                    $("addSeam")?.value === "no"
                        ? 0
                        : $("seam")?.value || 0
                ),

            grainline:
                $("addGrainline")?.value !== "no",

            notches:
                $("addNotches")?.value !== "no",

            negativeEase:
                Number(
                    $("negativeEase")?.value ||
                    0
                ),

            gap:
                8

        }

    };

}


/* ============================================================
   RUN ENGINE
   ============================================================ */

function runPatternEngine(
    garment
) {

    const context =
        createEngineContext(
            garment
        );


    /*
     * 1. Registry
     */

    const engineInfo =
        Registry.getGarmentEngineInfo(
            garment.id
        );


    /*
     * 2. GARMENT ENGINE
     */

    let result;


    if (
        garment.patternEngine ===
        "shirt"
    ) {

        if (
            !ShirtEngine ||
            typeof ShirtEngine.generate !==
            "function"
        ) {

            throw new Error(
                "Shirt Engine belum tersedia."
            );

        }


        result =
            ShirtEngine.generate(
                context
            );

    }
    else if (
        garment.patternEngine ===
        "dress"
    ) {

        if (
            !DressEngine ||
            typeof DressEngine.generate !==
            "function"
        ) {

            throw new Error(
                "Dress Engine belum tersedia."
            );

        }


        result =
            DressEngine.generate(
                context
            );

    }
    else if (
        garment.patternEngine ===
        "bodice"
    ) {

        /*
         * Untuk bodice-family kita masih
         * menggunakan legacy adapter.
         */

        const registryResult =
            Registry.generatePattern({

                garmentId:
                    garment.id,

                mode:
                    AppState.mode

            });


        if (!registryResult.success) {

            throw new Error(
                registryResult.message
            );

        }


        result =
            runLegacyBodiceFamily(
                context
            );

    }
    else {

        throw new Error(

            `${garment.label} menggunakan engine ` +
            `"${garment.patternEngine}", ` +
            `tetapi engine tersebut belum tersedia.`

        );

    }


    AppState.engineResult =
        result;


    return {

        result,

        engineInfo

    };

}


/* ============================================================
   LEGACY BODICE FAMILY
   ============================================================ */

function runLegacyBodiceFamily(
    context
) {

    const measurements =
        context.measurements;


    /*
     * BODICE
     */

    let bodice;


    if (
        typeof window.makeBodice ===
        "function"
    ) {

        bodice =
            window.makeBodice(
                measurements
            );

    }
    else if (
        window.PatternMakerBodiceEngine &&
        typeof window.PatternMakerBodiceEngine
            .makeBodice === "function"
    ) {

        bodice =
            window.PatternMakerBodiceEngine.makeBodice(
                measurements
            );

    }
    else {

        throw new Error(
            "Bodice Engine tidak tersedia."
        );

    }


    /*
     * SLEEVE
     */

    const sleeveMeasurements = {

        ...measurements,

        fabric:
            getFabricKey().toLowerCase().includes("rib")
                ? "rib"
                : "woven",

        negativeEase:
            context.options.negativeEase

    };


    let sleeve;


    if (
        typeof window.makeSleeve ===
        "function"
    ) {

        sleeve =
            window.makeSleeve(
                sleeveMeasurements,
                bodice
            );

    }
    else if (
        window.PatternMakerSleeveEngine &&
        typeof window.PatternMakerSleeveEngine
            .makeSleeve === "function"
    ) {

        sleeve =
            window.PatternMakerSleeveEngine.makeSleeve(
                sleeveMeasurements,
                bodice
            );

    }
    else {

        throw new Error(
            "Sleeve Engine tidak tersedia."
        );

    }


    /*
     * Convert legacy result into
     * standard Production Geometry.
     */

    const pattern =
        ProductionGeometry.createProductionPattern({

            bodice,

            sleeve,

            seamAllowance:
                context.options.seamAllowance,

            grainline:
                context.options.grainline,

            notches:
                context.options.notches,

            gap:
                context.options.gap

        });


    return {

        type:
            "bodice-family",

        engine:
            "bodice",

        bodice,

        sleeve,

        pieces:
            pattern.pieces,

        metadata:
            {

                garment:
                    context.garment.id,

                fullOpen:
                    true

            }

    };

}


/* ============================================================
   NORMALIZE ENGINE RESULT
   ============================================================ */

function normalizeEngineResult(
    engineResult
) {

    if (
        !engineResult
    ) {

        throw new Error(
            "Pattern engine tidak menghasilkan result."
        );

    }


    /*
     * Engine Shirt/Dress sudah mengembalikan
     * pieces standar.
     */

    if (
        Array.isArray(
            engineResult.pieces
        )
    ) {

        return {

            pieces:
                engineResult.pieces,

            metadata:
                engineResult.metadata ||
                {},

            source:
                engineResult.source ||
                "pattern-engine"

        };

    }


    throw new Error(
        "Pattern engine result tidak memiliki pieces."
    );

}


/* ============================================================
   BUILD PRODUCTION PATTERN
   ============================================================ */

function buildProductionPattern(
    engineResult
) {

    const normalized =
        normalizeEngineResult(
            engineResult
        );


    const pattern = {

        pieces:
            normalized.pieces,

        metadata:
            {

                ...normalized.metadata,

                generatedAt:
                    new Date().toISOString(),

                unit:
                    "cm",

                scale:
                    1,

                fullOpen:
                    true

            }

    };


    const validation =
        ProductionGeometry
            .validateProductionPattern(
                pattern
            );


    if (
        !validation.valid
    ) {

        throw new Error(

            "Production Geometry tidak valid: " +
            validation.errors.join("; ")

        );

    }


    AppState.productionPattern =
        pattern;


    return pattern;

}


/* ============================================================
   FULL / OPEN PREVIEW
   ============================================================ */

function renderPreview(
    pattern
) {

    const svg =
        $("patternPreview");


    if (
        !svg
    ) {

        return;

    }


    const bounds =
        ProductionGeometry.getPatternBounds(
            pattern
        );


    const padding =
        10;


    const width =
        Math.max(
            100,
            bounds.width +
            padding * 2
        );


    const height =
        Math.max(
            70,
            bounds.height +
            padding * 2
        );


    svg.innerHTML =
        "";


    svg.setAttribute(
        "viewBox",
        `${bounds.minX - padding} ` +
        `${bounds.minY - padding} ` +
        `${width} ${height}`
    );


    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );


    /*
     * Background
     */

    const ns =
        "http://www.w3.org/2000/svg";


    const bg =
        document.createElementNS(
            ns,
            "rect"
        );


    bg.setAttribute(
        "x",
        bounds.minX - padding
    );


    bg.setAttribute(
        "y",
        bounds.minY - padding
    );


    bg.setAttribute(
        "width",
        width
    );


    bg.setAttribute(
        "height",
        height
    );


    bg.setAttribute(
        "fill",
        "#fafafa"
    );


    svg.appendChild(
        bg
    );


    /*
     * PIECES
     */

    pattern.pieces.forEach(
        piece => {

            const polygon =
                document.createElementNS(
                    ns,
                    "polygon"
                );


            polygon.setAttribute(
                "points",

                piece.points
                    .map(
                        p =>
                            `${p[0]},${p[1]}`
                    )
                    .join(" ")
            );


            polygon.setAttribute(
                "fill",
                "#ffffff"
            );


            polygon.setAttribute(
                "stroke",
                "#172033"
            );


            polygon.setAttribute(
                "stroke-width",
                "0.5"
            );


            svg.appendChild(
                polygon
            );


            const b =
                piece.bounds ||
                ProductionGeometry.getBounds(
                    piece.points
                );


            /*
             * LABEL
             */

            const label =
                document.createElementNS(
                    ns,
                    "text"
                );


            label.setAttribute(
                "x",
                (
                    b.minX +
                    b.maxX
                ) / 2
            );


            label.setAttribute(
                "y",
                b.minY - 2
            );


            label.setAttribute(
                "text-anchor",
                "middle"
            );


            label.setAttribute(
                "font-size",
                "3"
            );


            label.setAttribute(
                "font-weight",
                "700"
            );


            label.textContent =
                piece.label ||
                piece.name;


            svg.appendChild(
                label
            );


            /*
             * GRAINLINE
             */

            if (
                piece.grainline &&
                piece.grainline.length >= 2 &&
                (
                    $("addGrainline")?.value !== "no"
                )
            ) {

                const grain =
                    document.createElementNS(
                        ns,
                        "line"
                    );


                grain.setAttribute(
                    "x1",
                    piece.grainline[0][0]
                );


                grain.setAttribute(
                    "y1",
                    piece.grainline[0][1]
                );


                grain.setAttribute(
                    "x2",
                    piece.grainline[1][0]
                );


                grain.setAttribute(
                    "y2",
                    piece.grainline[1][1]
                );


                grain.setAttribute(
                    "stroke",
                    "#667085"
                );


                grain.setAttribute(
                    "stroke-width",
                    "0.3"
                );


                grain.setAttribute(
                    "stroke-dasharray",
                    "2 1"
                );


                svg.appendChild(
                    grain
                );

            }


            /*
             * NOTCH
             */

            if (
                piece.notches &&
                piece.notches.length
            ) {

                piece.notches.forEach(
                    notch => {

                        const mark =
                            document.createElementNS(
                                ns,
                                "line"
                            );


                        mark.setAttribute(
                            "x1",
                            notch[0] - 1
                        );


                        mark.setAttribute(
                            "y1",
                            notch[1] - 1
                        );


                        mark.setAttribute(
                            "x2",
                            notch[0] + 1
                        );


                        mark.setAttribute(
                            "y2",
                            notch[1] + 1
                        );


                        mark.setAttribute(
                            "stroke",
                            "#b42318"
                        );


                        mark.setAttribute(
                            "stroke-width",
                            "0.4"
                        );


                        svg.appendChild(
                            mark
                        );

                    }
                );

            }

        }
    );

}


/* ============================================================
   RESULT INFO
   ============================================================ */

function renderResultInfo() {

    const container =
        $("resultInfo");


    if (!container) {

        return;

    }


    const garment =
        Garment.getGarment(
            AppState.garment
        );


    const category =
        Schema.getCategoryLabel(
            getCategory()
        );


    const age =
        AppState.profile &&
        AppState.profile.age !== null
            ? `${AppState.profile.age} tahun`
            : "-";


    const pieces =
        AppState.productionPattern
            ? AppState.productionPattern.pieces.length
            : 0;


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
                ${AppState.fabric?.material || "-"}
            </span>

        </div>


        <div class="kv">

            <b>
                Unit
            </b>

            <span>
                cm internal
            </span>

        </div>


        <div class="kv">

            <b>
                Pattern Pieces
            </b>

            <span>
                ${pieces}
            </span>

        </div>

    `;

}


/* ============================================================
   RESULT MEASUREMENTS
   ============================================================ */

function renderMeasurementsResult() {

    const container =
        $("resultMeasurements");


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


    if (!garment) {

        return;

    }


    const unit =
        getUnit();


    const ids = [

        ...new Set([

            ...garment.requiredMeasurements,

            ...garment.optionalMeasurements

        ])

    ];


    let html =
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


            html += `

                <div class="kv">

                    <b>
                        ${definition.label}
                    </b>

                    <span>
                        ${Number(value).toFixed(1)}
                        ${unit}
                    </span>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/* ============================================================
   GENERATE
   ============================================================ */

async function generatePattern() {

    if (
        AppState.generating
    ) {

        return;

    }


    AppState.generating =
        true;


    try {

        setStatus(
            "Memvalidasi ukuran..."
        );


        AppState.garment =
            getGarmentId();


        /*
         * PROFILE
         */

        createCurrentProfile();


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
         * VALIDATE
         */

        const validation =
            Garment.validateProfileForGarment(

                AppState.profile,

                AppState.garment

            );


        if (!validation.valid) {

            throw new Error(

                "Ukuran wajib belum lengkap: " +

                validation.missing
                    .map(
                        item =>
                            item.label
                    )
                    .join(", ")

            );

        }


        /*
         * FABRIC
         */

        createFabricData();

        renderFabricResult();


        /*
         * ENGINE
         */

        setDraftStatus(
            `Menjalankan ${garment.label} engine...`
        );


        const engine =
            runPatternEngine(
                garment
            );


        /*
         * PRODUCTION GEOMETRY
         */

        const production =
            buildProductionPattern(
                engine.result
            );


        /*
         * PREVIEW
         */

        renderPreview(
            production
        );


        /*
         * RESULTS
         */

        renderResultInfo();

        renderMeasurementsResult();


        /*
         * SUCCESS
         */

        setDraftStatus(

            `Drafting selesai • ` +
            `${garment.label} • ` +
            `${production.pieces.length} potongan • ` +
            `Full / Open`,

            "ok"

        );


        setStatus(

            `Pola berhasil dibuat • ` +
            `${Schema.getCategoryLabel(
                getCategory()
            )} • ` +
            `${garment.label}`,

            "ok"

        );

    }
    catch (error) {

        console.error(
            "PatternMaker generate error:",
            error
        );


        AppState.error =
            error;


        setDraftStatus(
            error.message ||
            "Drafting gagal.",
            "error"
        );


        setStatus(
            error.message ||
            "Pembuatan pola gagal.",
            "error"
        );

    }
    finally {

        AppState.generating =
            false;

    }

}


/* ============================================================
   FIT PREVIEW
   ============================================================ */

function fitPreview() {

    const preview =
        $("patternPreview");


    if (!preview) {

        return;

    }


    preview.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );

}


/* ============================================================
   OPEN PREVIEW
   ============================================================ */

function openPreview() {

    if (
        !AppState.productionPattern
    ) {

        return;

    }


    renderPreview(
        AppState.productionPattern
    );


    fitPreview();

}


/* ============================================================
   RESET
   ============================================================ */

function resetApplication() {

    AppState.profile =
        null;

    AppState.measurements =
        null;

    AppState.fabric =
        null;

    AppState.engineResult =
        null;

    AppState.productionPattern =
        null;

    AppState.error =
        null;


    if ($("userMode"))
        $("userMode").value = "tailor";


    if ($("category"))
        $("category").value = "child";


    if ($("sizeSystem"))
        $("sizeSystem").value = "cm";


    if ($("garmentType"))
        $("garmentType").value = "tshirt";


    if ($("age"))
        $("age").value = "";


    if ($("fabric"))
        $("fabric").value = "cotton";


    if ($("fabricWidth"))
        $("fabricWidth").value = "150";


    if ($("fabricLength"))
        $("fabricLength").value = "200";


    if ($("stretch"))
        $("stretch").value = "medium";


    if ($("stretchDirection"))
        $("stretchDirection").value = "crosswise";


    if ($("ease"))
        $("ease").value = "2";


    if ($("seam"))
        $("seam").value = "1";


    if ($("fit"))
        $("fit").value = "regular";


    if ($("dart"))
        $("dart").value = "none";


    if ($("patternTolerance"))
        $("patternTolerance").value = "0";


    if ($("addSeam"))
        $("addSeam").value = "yes";


    if ($("addNotches"))
        $("addNotches").value = "yes";


    if ($("addGrainline"))
        $("addGrainline").value = "yes";


    if ($("patternPreview"))
        $("patternPreview").innerHTML = "";


    if ($("resultInfo"))
        $("resultInfo").innerHTML = "";


    if ($("resultMeasurements"))
        $("resultMeasurements").innerHTML = "";


    applyMode(
        "tailor"
    );


    renderMeasurementFields();

    updateGarmentInformation();

    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );

}


/* ============================================================
   EVENT HANDLERS
   ============================================================ */

function handleGarmentChange() {

    AppState.garment =
        getGarmentId();


    AppState.profile =
        null;

    AppState.measurements =
        null;

    AppState.engineResult =
        null;

    AppState.productionPattern =
        null;


    renderMeasurementFields();

    updateGarmentInformation();


    setDraftStatus(
        "Jenis pakaian berubah. Periksa ukuran kembali."
    );

}


function handleUnitChange() {

    renderMeasurementFields();

}


function handleMeasurementChange() {

    AppState.profile =
        null;

    AppState.measurements =
        null;

    AppState.engineResult =
        null;

    AppState.productionPattern =
        null;


    setDraftStatus(
        "Ukuran berubah. Buat pola kembali."
    );

}


/* ============================================================
   BIND EVENTS
   ============================================================ */

function bindEvents() {

    $("userMode")?.addEventListener(
        "change",
        event =>
            applyMode(
                event.target.value
            )
    );


    $("garmentType")?.addEventListener(
        "change",
        handleGarmentChange
    );


    $("sizeSystem")?.addEventListener(
        "change",
        handleUnitChange
    );


    $("generateBtn")?.addEventListener(
        "click",
        generatePattern
    );


    $("resetBtn")?.addEventListener(
        "click",
        resetApplication
    );


    $("fitPreviewBtn")?.addEventListener(
        "click",
        fitPreview
    );


    $("openPreviewBtn")?.addEventListener(
        "click",
        openPreview
    );


    $("measurementFields")?.addEventListener(
        "input",
        event => {

            if (
                event.target?.dataset?.measurement
            ) {

                handleMeasurementChange();

            }

        }
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


    validateDependencies();


    AppState.initialized =
        true;


    AppState.mode =
        $("userMode")?.value ||
        "tailor";


    AppState.garment =
        getGarmentId();


    applyMode(
        AppState.mode
    );


    renderMeasurementFields();

    updateGarmentInformation();

    bindEvents();


    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );


    console.log(
        "PatternMaker Universal ready.",
        AppState
    );

}


/* ============================================================
   START
   ============================================================ */

initializeApplication();


/* ============================================================
   GLOBAL API
   ============================================================ */

window.PatternMakerApp = {

    state:
        AppState,

    initialize:
        initializeApplication,

    generatePattern,

    renderMeasurementFields,

    renderPreview,

    buildProductionPattern,

    reset:
        resetApplication,

    fitPreview,

    openPreview

};
```
