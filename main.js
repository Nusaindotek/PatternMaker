/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * KODE 27 — main.js
 * ============================================================
 *
 * UNIVERSAL APPLICATION CONTROLLER
 *
 * QUALITY GATE:
 *
 * UI
 *  ↓
 * Profile
 *  ↓
 * Garment
 *  ↓
 * Pattern Engine
 *  ↓
 * Base Pattern
 *  ↓
 * Seam Production
 *  ↓
 * Cutting Geometry
 *  ↓
 * Production Validator
 *  ↓
 * Full / Open Preview
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

const SeamProduction =
    window.PatternMakerSeamProduction;

const ProductionValidator =
    window.PatternMakerProductionValidator;


/* ============================================================
   DEPENDENCY VALIDATION
   ============================================================ */

function validateDependencies() {

    const required = {

        Schema,

        Profile,

        Garment,

        Measurements,

        Registry,

        ProductionGeometry,

        SeamProduction,

        ProductionValidator

    };


    const missing =
        Object.entries(
            required
        )
        .filter(
            ([, value]) =>
                !value
        )
        .map(
            ([key]) =>
                key
        );


    if (
        missing.length
    ) {

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

    initialized:
        false,

    generating:
        false,

    mode:
        "tailor",

    garment:
        "tshirt",

    profile:
        null,

    measurements:
        null,

    fabric:
        null,

    engineResult:
        null,

    basePattern:
        null,

    productionPattern:
        null,

    cuttingPattern:
        null,

    productionValidation:
        null,

    error:
        null

};


/* ============================================================
   DOM HELPER
   ============================================================ */

function $(id) {

    return document.getElementById(
        id
    );

}


/* ============================================================
   STATUS
   ============================================================ */

function setStatus(
    message,
    type = ""
) {

    const node =
        $("resultStatus");


    if (
        !node
    ) {

        return;

    }


    node.textContent =
        message;


    node.className =
        "status";


    if (
        type
    ) {

        node.classList.add(
            type
        );

    }

}


function setDraftStatus(
    message,
    type = ""
) {

    const node =
        $("draftEngineStatus");


    if (
        !node
    ) {

        return;

    }


    node.textContent =
        message;


    node.className =
        "status";


    if (
        type
    ) {

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

        label:
            "Newbie — Mudah",

        description:
            "Workflow sederhana dengan parameter utama."

    },

    tailor: {

        label:
            "Tailor — Lengkap",

        description:
            "Kontrol ukuran, fitting dan konstruksi."

    },

    expert: {

        label:
            "Expert / Garment — Profesional",

        description:
            "Kontrol patternmaking, marker dan produksi."

    }

};


function applyMode(
    mode
) {

    if (
        !MODES[mode]
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
        $("modeDescription");


    if (
        description
    ) {

        description.textContent =
            MODES[
                mode
            ].description;

    }


    const modeResult =
        $("modeResult");


    if (
        modeResult
    ) {

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


    if (
        !container
    ) {

        return;

    }


    const garment =
        Garment.getGarment(
            getGarmentId()
        );


    if (
        !garment
    ) {

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


            if (
                !definition
            ) {

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


                if (
                    value !== null
                ) {

                    existing =
                        Number(
                            value
                        )
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

                        ${
                            required
                                ? " • wajib"
                                : " • opsional"
                        }

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


    if (
        !node
    ) {

        return;

    }


    const garment =
        Garment.getGarment(
            getGarmentId()
        );


    if (
        !garment
    ) {

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


    if (
        !garment
    ) {

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
                $(
                    measurementId
                );


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


            if (
                !Number.isFinite(
                    value
                )
            ) {

                throw new Error(

                    `${measurementId} harus berupa angka.`

                );

            }


            const cm =
                Schema.measurementToCm(
                    value,
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


            values[
                measurementId
            ] =
                value;

        }
    );


    const missing =
        garment.requiredMeasurements
            .filter(
                id =>
                    values[id] === undefined
            );


    if (
        missing.length
    ) {

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

            ? Number(
                $("age").value
            )

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

function getFabricData() {

    const material =
        $("fabric")?.value ||
        "cotton";


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


    const stretchDirection =
        $("stretchDirection")?.value ||
        "crosswise";


    const ease =
        Number(
            $("ease")?.value ||
            0
        );


    const seam =
        $("addSeam")?.value === "no"

            ? 0

            : Number(
                $("seam")?.value ||
                0
            );


    AppState.fabric = {

        material,

        width,

        length,

        stretch,

        stretchDirection,

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


    if (
        !container ||
        !AppState.fabric
    ) {

        return;

    }


    const fabric =
        AppState.fabric;


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
                Seam Allowance
            </b>

            <span>
                ${fabric.seam} cm
            </span>

        </div>

    `;

}


/* ============================================================
   ENGINE CONTEXT
   ============================================================ */

function createEngineContext(
    garment
) {

    const measurements =
        Measurements.getLegacyMeasurements(
            garment.id
        );


    return {

        garment,

        garmentId:
            garment.id,

        measurements,

        profile:
            AppState.profile,

        fabric:
            AppState.fabric,

        mode:
            AppState.mode,

        options: {

            seamAllowance:
                AppState.fabric?.seam ||
                0,

            ease:
                AppState.fabric?.ease ||
                0,

            grainline:
                $("addGrainline")?.value !==
                "no",

            notches:
                $("addNotches")?.value !==
                "no",

            waistband:
                true,

            gap:
                8

        }

    };

}


/* ============================================================
   ENGINE RESOLUTION
   ============================================================ */

function resolveRegisteredEngine(
    engineId
) {

    const engine =
        Registry.getEngine(
            engineId
        );


    if (
        engine &&
        typeof engine.generate ===
            "function"
    ) {

        return engine;

    }


    return null;

}


/* ============================================================
   BODICE FAMILY
   ============================================================ */

function generateBodiceFamily(
    context
) {

    const measurements =
        context.measurements;


    if (
        typeof window.makeBodice !==
        "function"
    ) {

        throw new Error(
            "makeBodice tidak tersedia."
        );

    }


    const bodice =
        window.makeBodice(
            measurements
        );


    if (
        !bodice
    ) {

        throw new Error(
            "Bodice engine tidak menghasilkan pattern."
        );

    }


    let sleeve =
        null;


    if (
        context.garment.features?.sleeve
    ) {

        if (
            typeof window.makeSleeve !==
            "function"
        ) {

            throw new Error(
                "makeSleeve tidak tersedia."
            );

        }


        const sleeveMeasurements = {

            ...measurements,

            fabric:
                String(
                    context.fabric?.material ||
                    ""
                )
                .toLowerCase()
                .includes("rib")

                    ? "rib"

                    : "woven",

            negativeEase:
                0

        };


        sleeve =
            window.makeSleeve(

                sleeveMeasurements,

                bodice

            );

    }


    const pattern =
        ProductionGeometry
            .createProductionPattern({

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

        pieces:
            pattern.pieces,

        metadata: {

            garment:
                context.garment.id,

            fullOpen:
                true

        }

    };

}


/* ============================================================
   RUN PATTERN ENGINE
   ============================================================ */

function runPatternEngine(
    garment
) {

    const context =
        createEngineContext(
            garment
        );


    if (
        garment.patternEngine ===
        "bodice"
    ) {

        return generateBodiceFamily(
            context
        );

    }


    const engine =
        resolveRegisteredEngine(
            garment.patternEngine
        );


    if (
        !engine
    ) {

        throw new Error(

            `${garment.label} menggunakan engine ` +
            `"${garment.patternEngine}", ` +
            `tetapi engine belum terdaftar.`

        );

    }


    const result =
        engine.generate(
            context
        );


    if (
        !result
    ) {

        throw new Error(

            `${garment.label} engine tidak menghasilkan result.`

        );

    }


    return result;

}


/* ============================================================
   BASE PATTERN
   ============================================================ */

function normalizeBasePattern(
    result
) {

    if (
        !result ||
        !Array.isArray(
            result.pieces
        )
    ) {

        throw new Error(

            "Pattern engine menghasilkan data " +
            "tanpa pieces."

        );

    }


    const pattern = {

        pieces:
            result.pieces,

        metadata: {

            ...(result.metadata || {}),

            generatedAt:
                new Date()
                    .toISOString(),

            unit:
                "cm",

            scale:
                1,

            fullOpen:
                true,

            geometryType:
                "BASE_PATTERN"

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

            "Base pattern tidak valid: " +
            validation.errors.join("; ")

        );

    }


    AppState.basePattern =
        pattern;


    return pattern;

}


/* ============================================================
   SEAM PRODUCTION
   ============================================================ */

function buildProductionPattern(
    basePattern
) {

    const defaultSeam =
        AppState.fabric?.seam ||
        0;


    const seamPattern =
        SeamProduction.applySeamAllowance(

            basePattern,

            {

                defaultSeam

            }

        );


    const seamValidation =
        SeamProduction.validateSeamPattern(
            seamPattern
        );


    if (
        !seamValidation.valid
    ) {

        throw new Error(

            "Seam allowance gagal dibuat."

        );

    }


    AppState.productionPattern =
        seamPattern;


    return seamPattern;

}


/* ============================================================
   CUTTING GEOMETRY
   ============================================================ */

function createCuttingPattern(
    productionPattern
) {

    const cuttingPattern =
        SeamProduction.toCuttingGeometry(
            productionPattern
        );


    const validation =
        ProductionGeometry
            .validateProductionPattern(
                cuttingPattern
            );


    if (
        !validation.valid
    ) {

        throw new Error(

            "Cutting geometry tidak valid: " +
            validation.errors.join("; ")

        );

    }


    AppState.cuttingPattern =
        cuttingPattern;


    return cuttingPattern;

}


/* ============================================================
   PRODUCTION QUALITY GATE
   ============================================================ */

function validateCuttingForProduction(
    cuttingPattern
) {

    const result =
        ProductionValidator
            .validateForProduction(

                cuttingPattern,

                {

                    requireCutPoints:
                        true,

                    requireSeam:
                        true

                }

            );


    AppState.productionValidation =
        result;


    return result;

}


/* ============================================================
   VALIDATION MESSAGE
   ============================================================ */

function getValidationErrorMessage(
    validation
) {

    if (
        !validation ||
        !validation.errors ||
        !validation.errors.length
    ) {

        return "Production geometry tidak valid.";

    }


    const messages =
        validation.errors
            .slice(
                0,
                5
            )
            .map(
                error => {

                    if (
                        typeof error ===
                        "string"
                    ) {

                        return error;

                    }


                    return (

                        error.message ||
                        error.check ||
                        "Geometri tidak valid."

                    );

                }
            );


    const extra =
        validation.errors.length >
        5

            ? ` +${validation.errors.length - 5} masalah lainnya.`

            : "";


    return (

        "Pola ditahan sebelum produksi: " +
        messages.join(" | ") +
        extra

    );

}


/* ============================================================
   PREVIEW
   ============================================================ */

function renderPreview(
    pattern
) {

    const svg =
        $("patternPreview");


    if (
        !svg ||
        !pattern
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


    const ns =
        "http://www.w3.org/2000/svg";


    /*
     * Background
     */

    const background =
        document.createElementNS(

            ns,

            "rect"

        );


    background.setAttribute(
        "x",
        bounds.minX - padding
    );


    background.setAttribute(
        "y",
        bounds.minY - padding
    );


    background.setAttribute(
        "width",
        width
    );


    background.setAttribute(
        "height",
        height
    );


    background.setAttribute(
        "fill",
        "#fafafa"
    );


    svg.appendChild(
        background
    );


    /*
     * Production status overlay.
     */

    const validation =
        AppState.productionValidation;


    if (
        validation &&
        !validation.valid
    ) {

        const warning =
            document.createElementNS(
                ns,
                "text"
            );


        warning.setAttribute(
            "x",
            bounds.minX
        );


        warning.setAttribute(
            "y",
            bounds.minY
        );


        warning.setAttribute(
            "font-size",
            "3.5"
        );


        warning.setAttribute(
            "font-weight",
            "700"
        );


        warning.textContent =
            "GEOMETRY INVALID — PRODUKSI DITAHAN";


        svg.appendChild(
            warning
        );

    }


    /*
     * Pieces.
     */

    pattern.pieces.forEach(
        piece => {

            const points =
                piece.cutPoints &&
                piece.cutPoints.length >= 3

                    ? piece.cutPoints

                    : piece.points;


            const polygon =
                document.createElementNS(

                    ns,

                    "polygon"

                );


            polygon.setAttribute(

                "points",

                points
                    .map(
                        point =>
                            `${point[0]},${point[1]}`
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


            polygon.setAttribute(
                "vector-effect",
                "non-scaling-stroke"
            );


            svg.appendChild(
                polygon
            );


            /*
             * Bounds.
             */

            const pieceBounds =
                ProductionGeometry.getBounds(
                    points
                );


            /*
             * Label.
             */

            const label =
                document.createElementNS(

                    ns,

                    "text"

                );


            label.setAttribute(

                "x",

                (
                    pieceBounds.minX +
                    pieceBounds.maxX
                ) / 2

            );


            label.setAttribute(

                "y",

                pieceBounds.minY - 2

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
             * Grainline.
             */

            if (
                $("addGrainline")?.value !==
                    "no" &&
                piece.grainline &&
                piece.grainline.length >= 2
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
             * Notches.
             */

            if (
                $("addNotches")?.value !==
                    "no" &&
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


            /*
             * Drill points.
             */

            if (
                piece.drillPoints &&
                piece.drillPoints.length
            ) {

                piece.drillPoints.forEach(
                    point => {

                        const circle =
                            document.createElementNS(

                                ns,

                                "circle"

                            );


                        circle.setAttribute(
                            "cx",
                            point[0]
                        );


                        circle.setAttribute(
                            "cy",
                            point[1]
                        );


                        circle.setAttribute(
                            "r",
                            "1"
                        );


                        circle.setAttribute(
                            "fill",
                            "none"
                        );


                        circle.setAttribute(
                            "stroke",
                            "#344054"
                        );


                        circle.setAttribute(
                            "stroke-width",
                            "0.3"
                        );


                        svg.appendChild(
                            circle
                        );

                    }
                );

            }

        }
    );

}


/* ============================================================
   RESULT INFORMATION
   ============================================================ */

function renderResultInfo() {

    const container =
        $("resultInfo");


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
            getCategory()
        );


    const age =
        AppState.profile &&
        AppState.profile.age !== null

            ? `${AppState.profile.age} tahun`

            : "-";


    const basePieces =
        AppState.basePattern
            ? AppState.basePattern.pieces.length
            : 0;


    const productionPieces =
        AppState.cuttingPattern
            ? AppState.cuttingPattern.pieces.length
            : 0;


    const seam =
        AppState.fabric?.seam ??
        0;


    const validation =
        AppState.productionValidation;


    const validationText =
        !validation

            ? "Belum divalidasi"

            : validation.valid

                ? "LULUS"

                : "DITAHAN";


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
                Base Pieces
            </b>

            <span>
                ${basePieces}
            </span>

        </div>


        <div class="kv">

            <b>
                Cutting Pieces
            </b>

            <span>
                ${productionPieces}
            </span>

        </div>


        <div class="kv">

            <b>
                Seam Allowance
            </b>

            <span>
                ${seam} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Production Validation
            </b>

            <span>
                ${validationText}
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


    if (
        !garment
    ) {

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
        id => {

            if (
                !AppState.profile.hasMeasurement(
                    id
                )
            ) {

                return;

            }


            const definition =
                Schema.getMeasurementDefinition(
                    id
                );


            const value =
                AppState.profile.getMeasurement(
                    id,
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


    AppState.error =
        null;


    try {

        AppState.garment =
            getGarmentId();


        const garment =
            Garment.getGarment(
                AppState.garment
            );


        if (
            !garment
        ) {

            throw new Error(
                "Jenis pakaian tidak ditemukan."
            );

        }


        /*
         * STEP 1
         */

        setStatus(
            "Memvalidasi ukuran..."
        );


        createCurrentProfile();


        /*
         * STEP 2
         */

        const profileValidation =
            Garment.validateProfileForGarment(

                AppState.profile,

                AppState.garment

            );


        if (
            !profileValidation.valid
        ) {

            throw new Error(

                "Ukuran wajib belum lengkap: " +

                profileValidation.missing
                    .map(
                        item =>
                            item.label
                    )
                    .join(", ")

            );

        }


        /*
         * STEP 3
         */

        getFabricData();

        renderFabricResult();


        /*
         * STEP 4
         */

        setDraftStatus(

            `Menjalankan ${garment.label} engine...`

        );


        const engineResult =
            runPatternEngine(
                garment
            );


        /*
         * STEP 5
         */

        setDraftStatus(
            "Memvalidasi base pattern..."
        );


        const basePattern =
            normalizeBasePattern(
                engineResult
            );


        /*
         * STEP 6
         */

        setDraftStatus(
            "Menerapkan seam allowance..."
        );


        const productionPattern =
            buildProductionPattern(
                basePattern
            );


        /*
         * STEP 7
         */

        setDraftStatus(
            "Membentuk cutting boundary..."
        );


        const cuttingPattern =
            createCuttingPattern(
                productionPattern
            );


        /*
         * STEP 8
         * QUALITY GATE
         */

        setDraftStatus(
            "Memvalidasi geometri produksi..."
        );


        const productionValidation =
            validateCuttingForProduction(
                cuttingPattern
            );


        /*
         * STOP ON ERROR
         */

        if (
            !productionValidation.valid
        ) {

            renderPreview(
                cuttingPattern
            );


            renderResultInfo();

            renderMeasurementsResult();


            throw new Error(

                getValidationErrorMessage(
                    productionValidation
                )

            );

        }


        /*
         * STEP 9
         * PREVIEW ONLY AFTER QUALITY GATE
         */

        renderPreview(
            cuttingPattern
        );


        /*
         * STEP 10
         */

        renderResultInfo();

        renderMeasurementsResult();


        /*
         * STEP 11
         */

        const seamSummary =
            SeamProduction.getSeamSummary(
                productionPattern
            );


        setDraftStatus(

            `Drafting selesai • ` +
            `${garment.label} • ` +
            `${cuttingPattern.pieces.length} potongan • ` +
            `Seam ${seamSummary.averageSeam} cm • ` +
            `VALIDATED`,

            "ok"

        );


        setStatus(

            `Pola berhasil dibuat dan ` +
            `lulus validasi produksi • ` +
            `${Schema.getCategoryLabel(
                getCategory()
            )} • ` +
            `${garment.label}`,

            "ok"

        );

    }
    catch (
        error
    ) {

        console.error(
            "PatternMaker error:",
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
   GARMENT CHANGE
   ============================================================ */

function handleGarmentChange() {

    AppState.garment =
        getGarmentId();


    invalidateGeneratedPattern();


    renderMeasurementFields();


    updateGarmentInformation();


    setDraftStatus(

        "Jenis pakaian berubah. " +
        "Periksa ukuran kembali."

    );

}


/* ============================================================
   UNIT CHANGE
   ============================================================ */

function handleUnitChange() {

    invalidateGeneratedPattern();


    renderMeasurementFields();

}


/* ============================================================
   MEASUREMENT CHANGE
   ============================================================ */

function handleMeasurementChange() {

    invalidateGeneratedPattern();


    setDraftStatus(

        "Ukuran berubah. " +
        "Buat pola kembali."

    );

}


/* ============================================================
   INVALIDATE GENERATED DATA
   ============================================================ */

function invalidateGeneratedPattern() {

    AppState.profile =
        null;


    AppState.measurements =
        null;


    AppState.engineResult =
        null;


    AppState.basePattern =
        null;


    AppState.productionPattern =
        null;


    AppState.cuttingPattern =
        null;


    AppState.productionValidation =
        null;

}


/* ============================================================
   PRODUCTION SETTING CHANGE
   ============================================================ */

function handleProductionSettingChange() {

    AppState.productionPattern =
        null;


    AppState.cuttingPattern =
        null;


    AppState.productionValidation =
        null;


    if (
        AppState.basePattern
    ) {

        setDraftStatus(

            "Pengaturan produksi berubah. " +
            "Buat pola kembali untuk memperbarui geometry."

        );

    }

}


/* ============================================================
   FIT PREVIEW
   ============================================================ */

function fitPreview() {

    const svg =
        $("patternPreview");


    if (
        !svg
    ) {

        return;

    }


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
        !AppState.cuttingPattern
    ) {

        return;

    }


    renderPreview(
        AppState.cuttingPattern
    );


    fitPreview();

}


/* ============================================================
   RESET
   ============================================================ */

function resetApplication() {

    invalidateGeneratedPattern();


    AppState.fabric =
        null;


    AppState.error =
        null;


    if (
        $("userMode")
    ) {

        $("userMode").value =
            "tailor";

    }


    if (
        $("category")
    ) {

        $("category").value =
            "child";

    }


    if (
        $("sizeSystem")
    ) {

        $("sizeSystem").value =
            "cm";

    }


    if (
        $("garmentType")
    ) {

        $("garmentType").value =
            "tshirt";

    }


    if (
        $("age")
    ) {

        $("age").value =
            "";

    }


    if (
        $("fabric")
    ) {

        $("fabric").value =
            "cotton";

    }


    if (
        $("fabricWidth")
    ) {

        $("fabricWidth").value =
            "150";

    }


    if (
        $("fabricLength")
    ) {

        $("fabricLength").value =
            "200";

    }


    if (
        $("stretch")
    ) {

        $("stretch").value =
            "medium";

    }


    if (
        $("stretchDirection")
    ) {

        $("stretchDirection").value =
            "crosswise";

    }


    if (
        $("ease")
    ) {

        $("ease").value =
            "2";

    }


    if (
        $("seam")
    ) {

        $("seam").value =
            "1";

    }


    if (
        $("patternTolerance")
    ) {

        $("patternTolerance").value =
            "0";

    }


    if (
        $("addSeam")
    ) {

        $("addSeam").value =
            "yes";

    }


    if (
        $("addNotches")
    ) {

        $("addNotches").value =
            "yes";

    }


    if (
        $("addGrainline")
    ) {

        $("addGrainline").value =
            "yes";

    }


    if (
        $("patternPreview")
    ) {

        $("patternPreview").innerHTML =
            "";


        $("patternPreview").setAttribute(
            "viewBox",
            "0 0 1000 620"
        );

    }


    if (
        $("resultInfo")
    ) {

        $("resultInfo").innerHTML =
            "";

    }


    if (
        $("resultMeasurements")
    ) {

        $("resultMeasurements").innerHTML =
            "";

    }


    applyMode(
        "tailor"
    );


    renderMeasurementFields();

    updateGarmentInformation();


    setStatus(

        "Masukkan ukuran kemudian tekan " +
        "BUAT POLA."

    );


    setDraftStatus(
        "Engine drafting siap."
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


    [

        "seam",
        "addSeam",
        "addNotches",
        "addGrainline",
        "patternTolerance"

    ]
    .forEach(
        id => {

            $(id)?.addEventListener(

                "change",

                handleProductionSettingChange

            );

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

        "Masukkan ukuran kemudian tekan " +
        "BUAT POLA."

    );


    setDraftStatus(
        "Engine drafting siap."
    );


    console.log(
        "PatternMaker Universal initialized.",
        AppState
    );

}


/* ============================================================
   START
   ============================================================ */

initializeApplication();


/* ============================================================
   PUBLIC API
   ============================================================ */

window.PatternMakerApp = {

    state:
        AppState,

    initialize:
        initializeApplication,

    generatePattern,

    renderMeasurementFields,

    renderPreview,

    reset:
        resetApplication,

    fitPreview,

    openPreview,

    buildProductionPattern,

    createCuttingPattern,

    validateCuttingForProduction

};
