/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 40 — main.js FULL
 * ============================================================
 *
 * APPLICATION CONTROLLER
 *
 * FLOW:
 *
 * SYSTEM AUDIT
 *      ↓
 * BODY PROFILE
 *      ↓
 * GARMENT
 *      ↓
 * MEASUREMENTS
 *      ↓
 * PATTERN ENGINE
 *      ↓
 * BASE PATTERN
 *      ↓
 * SEAM PRODUCTION
 *      ↓
 * CUTTING GEOMETRY
 *      ↓
 * PRODUCTION VALIDATOR
 *      ↓
 * OUTPUT AUDIT
 *      ↓
 * FULL PREVIEW
 *      ↓
 * NESTING / MARKER
 *      ↓
 * DXF / PLT / SVG
 *
 * IMPORTANT:
 *
 * main.js adalah controller.
 * Formula pola tetap berada di engine masing-masing.
 *
 * Jangan memasukkan formula drafting ke file ini.
 *
 * ============================================================
 */

"use strict";


/* ============================================================
   DEPENDENCIES
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

const NestingEngine =
    window.PatternMakerNestingEngine;

const NestingPreview =
    window.PatternMakerNestingPreview;

const DXF =
    window.PatternMakerDXF;

const Plotter =
    window.PatternMakerPlotter;

const SVG =
    window.PatternMakerSVG;

const OutputAudit =
    window.PatternMakerOutputAudit;

const UniversalGarmentAudit =
    window.PatternMakerUniversalGarmentAudit;

const UniversalAuditRunner =
    window.PatternMakerUniversalAuditRunner;


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

        ProductionValidator,

        NestingEngine,

        NestingPreview,

        DXF,

        Plotter,

        SVG,

        OutputAudit,

        UniversalGarmentAudit,

        UniversalAuditRunner

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

    exporting:
        false,

    nesting:
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

    outputAudit:
        null,

    startupAudit:
        null,

    nestingResult:
        null,

    lastExport:
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
   STATUS HELPERS
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


function setPlotterStatus(
    message,
    type = ""
) {

    const node =
        $("plotterStatus");


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


function setAuditStatus(
    message,
    type = ""
) {

    const node =
        $("auditStatus");


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


function setNestingStatus(
    message,
    type = ""
) {

    const node =
        $("nestingStatus");


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


function setSystemAuditStatus(
    message,
    type = ""
) {

    const node =
        $("systemAuditStatus");


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
   CURRENT UI VALUES
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
   MEASUREMENT FIELD RENDER
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

            ...(garment.requiredMeasurements || []),

            ...(garment.optionalMeasurements || [])

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
                typeof AppState.profile.hasMeasurement ===
                    "function" &&
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
                    value !== null &&
                    value !== undefined
                ) {

                    existing =
                        Number(
                            value
                        )
                        .toFixed(1);

                }

            }


            const required =
                (
                    garment.requiredMeasurements ||
                    []
                )
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


    const count =
        (
            garment.requiredMeasurements ||
            []
        ).length;


    node.textContent =

        `${count} ukuran wajib untuk ${garment.label}.`;

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

            ...(garment.requiredMeasurements || []),

            ...(garment.optionalMeasurements || [])

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
        (
            garment.requiredMeasurements ||
            []
        )
        .filter(
            id =>
                values[id] ===
                undefined
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


    if (
        age !== null &&
        (
            !Number.isFinite(age) ||
            age < 0
        )
    ) {

        throw new Error(
            "Umur tidak valid."
        );

    }


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
            ...(
                profile.measurements ||
                {}
            )
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


    if (
        !Number.isFinite(width) ||
        width <= 0
    ) {

        throw new Error(
            "Lebar kain tidak valid."
        );

    }


    if (
        !Number.isFinite(length) ||
        length <= 0
    ) {

        throw new Error(
            "Panjang kain tidak valid."
        );

    }


    if (
        !Number.isFinite(ease) ||
        ease < 0
    ) {

        throw new Error(
            "Ease tidak valid."
        );

    }


    if (
        !Number.isFinite(seam) ||
        seam < 0
    ) {

        throw new Error(
            "Seam allowance tidak valid."
        );

    }


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

    if (
        !Registry ||
        typeof Registry.getEngine !==
            "function"
    ) {

        return null;

    }


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


    if (
        !pattern ||
        !Array.isArray(
            pattern.pieces
        )
    ) {

        throw new Error(
            "Production geometry tidak menghasilkan pieces."
        );

    }


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
   BASE PATTERN NORMALIZATION
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

            "Pattern engine menghasilkan data tanpa pieces."

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
            validation.errors
                .map(
                    error =>
                        typeof error ===
                            "string"

                            ? error

                            : (
                                error.message ||
                                error.check ||
                                "Invalid geometry"
                            )
                )
                .join(
                    "; "
                )

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

            validation.errors
                .map(
                    error =>
                        typeof error ===
                            "string"

                            ? error

                            : (
                                error.message ||
                                error.check ||
                                "Invalid geometry"
                            )
                )
                .join(
                    "; "
                )

        );

    }


    AppState.cuttingPattern =
        cuttingPattern;


    return cuttingPattern;

}


/* ============================================================
   PRODUCTION VALIDATION
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
   OUTPUT AUDIT
   ============================================================ */

function auditOutputs(
    pattern
) {

    if (
        !OutputAudit
    ) {

        throw new Error(
            "Output Audit belum tersedia."
        );

    }


    const audit =
        OutputAudit.auditPattern(
            pattern
        );


    AppState.outputAudit =
        audit;


    return audit;

}


/* ============================================================
   OUTPUT AUDIT RENDER
   ============================================================ */

function renderAuditStatus(
    audit
) {

    const resultNode =
        $("resultAudit");


    const statusNode =
        $("auditStatus");


    if (
        statusNode
    ) {

        statusNode.className =
            "status";


        if (
            audit.valid
        ) {

            statusNode.classList.add(
                "ok"
            );


            statusNode.textContent =
                `LULUS • ${audit.checks.length} pemeriksaan`;

        }
        else {

            statusNode.classList.add(
                "error"
            );


            statusNode.textContent =
                `DITAHAN • ${audit.errors.length} error`;

        }

    }


    if (
        !resultNode
    ) {

        return;

    }


    const passed =
        audit.checks.filter(
            check =>
                check.passed
        ).length;


    const failed =
        audit.checks.filter(
            check =>
                !check.passed
        ).length;


    const warnings =
        audit.warnings.length;


    const summary =
        audit.summary;


    resultNode.innerHTML = `

        <div class="kv">

            <b>
                Status
            </b>

            <span>
                ${
                    audit.valid
                        ? "LULUS"
                        : "DITAHAN"
                }
            </span>

        </div>


        <div class="kv">

            <b>
                Checks
            </b>

            <span>
                ${audit.checks.length}
            </span>

        </div>


        <div class="kv">

            <b>
                Passed
            </b>

            <span>
                ${passed}
            </span>

        </div>


        <div class="kv">

            <b>
                Failed
            </b>

            <span>
                ${failed}
            </span>

        </div>


        <div class="kv">

            <b>
                Warnings
            </b>

            <span>
                ${warnings}
            </span>

        </div>


        <div class="kv">

            <b>
                Pieces
            </b>

            <span>
                ${summary?.pieceCount ?? "-"}
            </span>

        </div>

    `;


    if (
        audit.errors.length
    ) {

        const errorNote =
            document.createElement(
                "div"
            );


        errorNote.className =
            "measurement-note";


        errorNote.innerHTML =
            "<b>Error utama:</b> ";


        errorNote.append(

            audit.errors
                .slice(
                    0,
                    3
                )
                .map(
                    error => {

                        const span =
                            document.createElement(
                                "span"
                            );


                        span.textContent =

                            typeof error ===
                                "string"

                                ? error

                                : (
                                    error.message ||
                                    error.check ||
                                    "Error."
                                );


                        return span;

                    }
                )
                .reduce(
                    (
                        fragment,
                        node,
                        index
                    ) => {

                        if (
                            index > 0
                        ) {

                            fragment.append(
                                document.createTextNode(
                                    " • "
                                )
                            );

                        }


                        fragment.append(
                            node
                        );


                        return fragment;

                    },

                    document.createDocumentFragment()

                )

        );


        resultNode.appendChild(
            errorNote
        );

    }

}


/* ============================================================
   SYSTEM AUDIT
   ============================================================ */

function runStartupAudit() {

    if (
        !UniversalAuditRunner
    ) {

        const failure = {

            valid:
                false,

            errors: [

                {

                    check:
                        "Universal Audit Runner",

                    message:
                        "Universal Audit Runner belum tersedia."

                }

            ],

            warnings: [],

            checks: [],

            info: [],

            sections: {}

        };


        AppState.startupAudit =
            failure;


        return failure;

    }


    try {

        const report =
            UniversalAuditRunner.runFullAudit();


        AppState.startupAudit =
            report;


        return report;

    }
    catch (
        error
    ) {

        const report = {

            valid:
                false,

            errors: [

                {

                    check:
                        "Startup Audit",

                    message:
                        error.message

                }

            ],

            warnings: [],

            checks: [],

            info: [],

            sections: {}

        };


        AppState.startupAudit =
            report;


        return report;

    }

}


/* ============================================================
   SYSTEM AUDIT RENDER
   ============================================================ */

function renderStartupAudit(
    report
) {

    const node =
        $("systemAuditResult");


    if (
        !report
    ) {

        setSystemAuditStatus(
            "Audit sistem belum dijalankan."
        );


        return;

    }


    const errors =
        report.errors ||
        [];


    const warnings =
        report.warnings ||
        [];


    const checks =
        report.checks ||
        [];


    const passed =
        checks.filter(
            check =>
                check.passed
        ).length;


    const failed =
        checks.filter(
            check =>
                !check.passed
        ).length;


    if (
        report.valid
    ) {

        setSystemAuditStatus(

            `SYSTEM AUDIT — LULUS • ${passed}/${checks.length}`,

            "ok"

        );

    }
    else {

        setSystemAuditStatus(

            `SYSTEM AUDIT — ADA MASALAH • ${failed} failed`,

            "error"

        );

    }


    if (
        !node
    ) {

        return;

    }


    node.innerHTML = `

        <div class="kv">

            <b>
                Status
            </b>

            <span>
                ${
                    report.valid
                        ? "LULUS"
                        : "PERLU PERBAIKAN"
                }
            </span>

        </div>


        <div class="kv">

            <b>
                Total Check
            </b>

            <span>
                ${checks.length}
            </span>

        </div>


        <div class="kv">

            <b>
                Passed
            </b>

            <span>
                ${passed}
            </span>

        </div>


        <div class="kv">

            <b>
                Failed
            </b>

            <span>
                ${failed}
            </span>

        </div>


        <div class="kv">

            <b>
                Errors
            </b>

            <span>
                ${errors.length}
            </span>

        </div>


        <div class="kv">

            <b>
                Warnings
            </b>

            <span>
                ${warnings.length}
            </span>

        </div>

    `;


    /*
     * ERROR LIST
     */

    if (
        errors.length
    ) {

        const errorTitle =
            document.createElement(
                "strong"
            );


        errorTitle.textContent =
            "Error:";


        node.appendChild(
            errorTitle
        );


        const errorBox =
            document.createElement(
                "div"
            );


        errorBox.className =
            "audit-error-list";


        errors
            .slice(
                0,
                10
            )
            .forEach(
                error => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "measurement-note";


                    item.textContent =

                        typeof error ===
                            "string"

                            ? error

                            : (
                                error.message ||
                                error.check ||
                                "Error."
                            );


                    errorBox.appendChild(
                        item
                    );

                }
            );


        node.appendChild(
            errorBox
        );

    }


    /*
     * WARNING LIST
     */

    if (
        warnings.length
    ) {

        const warningTitle =
            document.createElement(
                "strong"
            );


        warningTitle.textContent =
            "Warning:";


        node.appendChild(
            warningTitle
        );


        const warningBox =
            document.createElement(
                "div"
            );


        warningBox.className =
            "audit-warning-list";


        warnings
            .slice(
                0,
                10
            )
            .forEach(
                warning => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "measurement-note";


                    item.textContent =

                        typeof warning ===
                            "string"

                            ? warning

                            : (
                                warning.message ||
                                warning.check ||
                                "Warning."
                            );


                    warningBox.appendChild(
                        item
                    );

                }
            );


        node.appendChild(
            warningBox
        );

    }

}


/* ============================================================
   NESTING CONFIG
   ============================================================ */

function getNestingConfig() {

    const fabricWidth =
        Number(
            $("fabricWidth")?.value ||
            150
        );


    const fabricLength =
        Number(
            $("fabricLength")?.value ||
            300
        );


    const gap =
        Number(
            $("nestingGap")?.value ||
            1
        );


    const edgeMargin =
        Number(
            $("nestingMargin")?.value ||
            1
        );


    const strategy =
        $("nestingStrategy")?.value ||
        "shelf";


    const rotation =
        $("nestingRotation")?.value ||
        "180";


    const respectGrainline =
        $("nestingGrainline")?.value !==
        "no";


    const allowRotation =
        rotation !==
        "0";


    return {

        fabricWidth:
            Number.isFinite(
                fabricWidth
            ) &&
            fabricWidth > 0
                ? fabricWidth
                : 150,

        fabricLength:
            Number.isFinite(
                fabricLength
            ) &&
            fabricLength > 0
                ? fabricLength
                : 300,

        gap:
            Number.isFinite(
                gap
            ) &&
            gap >= 0
                ? gap
                : 1,

        edgeMargin:
            Number.isFinite(
                edgeMargin
            ) &&
            edgeMargin >= 0
                ? edgeMargin
                : 1,

        strategy,

        allowRotation,

        rotationStep:
            180,

        respectGrainline,

        allowFlip:
            false,

        startX:
            1,

        startY:
            1

    };

}


/* ============================================================
   NESTING RESULT RENDER
   ============================================================ */

function renderNestingResult(
    nest
) {

    const container =
        $("nestingResult");


    if (
        !container ||
        !nest
    ) {

        return;

    }


    const summary =
        NestingEngine.getSummary(
            nest
        );


    container.innerHTML = `

        <div class="kv">

            <b>
                Status
            </b>

            <span>
                ${
                    summary.complete
                        ? "LENGKAP"
                        : "BELUM LENGKAP"
                }
            </span>

        </div>


        <div class="kv">

            <b>
                Pieces Terpasang
            </b>

            <span>
                ${summary.pieceCount}
            </span>

        </div>


        <div class="kv">

            <b>
                Belum Terpasang
            </b>

            <span>
                ${summary.unplacedCount}
            </span>

        </div>


        <div class="kv">

            <b>
                Lebar Kain
            </b>

            <span>
                ${summary.fabricWidth} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Marker Length
            </b>

            <span>
                ${summary.usedLength} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Utilization
            </b>

            <span>
                ${summary.utilization}%
            </span>

        </div>


        <div class="kv">

            <b>
                Unit
            </b>

            <span>
                ${summary.unit}
            </span>

        </div>

    `;


    if (
        nest.unplaced?.length
    ) {

        const note =
            document.createElement(
                "div"
            );


        note.className =
            "measurement-note";


        note.textContent =

            `${nest.unplaced.length} piece ` +
            "belum masuk marker. " +
            "Nesting v1 menggunakan bounding-box placement.";


        container.appendChild(
            note
        );

    }

}


/* ============================================================
   NESTING PREVIEW
   ============================================================ */

function renderNestingPreview(
    nest
) {

    if (
        !NestingPreview
    ) {

        throw new Error(
            "Nesting Preview engine belum tersedia."
        );

    }


    if (
        !nest
    ) {

        return;

    }


    NestingPreview.render(
        "nestingPreview",
        nest
    );


    NestingPreview.fit(
        "nestingPreview"
    );

}


/* ============================================================
   NESTING
   ============================================================ */

function runNesting() {

    if (
        AppState.nesting
    ) {

        return;

    }


    AppState.nesting =
        true;


    try {

        if (
            !AppState.cuttingPattern
        ) {

            throw new Error(

                "Cutting pattern belum tersedia. " +
                "Buat pola terlebih dahulu."

            );

        }


        /*
         * Production validation.
         */

        const validation =
            validateCuttingForProduction(
                AppState.cuttingPattern
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Nesting dihentikan karena " +
                "cutting geometry belum valid."

            );

        }


        /*
         * Output audit.
         */

        const audit =
            auditOutputs(
                AppState.cuttingPattern
            );


        renderAuditStatus(
            audit
        );


        if (
            !audit.valid
        ) {

            throw new Error(

                "Nesting dihentikan karena " +
                "output audit gagal."

            );

        }


        setNestingStatus(
            "Membuat marker..."
        );


        const config =
            getNestingConfig();


        const nest =
            NestingEngine.createNest(

                AppState.cuttingPattern,

                config

            );


        const nestValidation =
            NestingEngine.validateNest(
                nest
            );


        if (
            !nestValidation.valid
        ) {

            throw new Error(

                "Marker tidak valid: " +

                nestValidation.errors.join(
                    " | "
                )

            );

        }


        AppState.nestingResult =
            nest;


        renderNestingResult(
            nest
        );


        renderNestingPreview(
            nest
        );


        const summary =
            NestingEngine.getSummary(
                nest
            );


        if (
            summary.complete
        ) {

            setNestingStatus(

                `Marker selesai • ` +
                `${summary.pieceCount} pieces • ` +
                `${summary.usedLength} cm • ` +
                `${summary.utilization}% utilization`,

                "ok"

            );

        }
        else {

            setNestingStatus(

                `Marker parsial • ` +
                `${summary.unplacedCount} pieces belum terpasang`,

                "error"

            );

        }


        renderResultInfo();


        return nest;

    }
    catch (
        error
    ) {

        console.error(
            "Nesting error:",
            error
        );


        AppState.nestingResult =
            null;


        setNestingStatus(
            error.message ||
            "Nesting gagal.",
            "error"
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }
    finally {

        AppState.nesting =
            false;

    }

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
        ProductionGeometry
            .getPatternBounds(
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


    pattern.pieces.forEach(
        piece => {

            const points =
                piece.cutPoints &&
                piece.cutPoints.length >= 3

                    ? piece.cutPoints

                    : piece.points;


            if (
                !points ||
                points.length < 3
            ) {

                return;

            }


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


            const pieceBounds =
                ProductionGeometry
                    .getBounds(
                        points
                    );


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
                piece.name ||
                "PATTERN";


            svg.appendChild(
                label
            );


            /*
             * GRAINLINE
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
             * NOTCHES
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
             * DRILL POINTS
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


    const nesting =
        AppState.nestingResult;


    const nestingText =
        nesting

            ? (
                nesting.complete
                    ? "LENGKAP"
                    : "PARSIAL"
            )

            : "Belum dijalankan";


    const exportText =
        AppState.lastExport
            ? AppState.lastExport.filename
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


        <div class="kv">

            <b>
                Marker
            </b>

            <span>
                ${nestingText}
            </span>

        </div>


        <div class="kv">

            <b>
                Last Export
            </b>

            <span>
                ${exportText}
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

            ...(garment.requiredMeasurements || []),

            ...(garment.optionalMeasurements || [])

        ])

    ];


    let html =
        "";


    ids.forEach(
        id => {

            if (
                typeof AppState.profile.hasMeasurement !==
                    "function" ||
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
                        ${definition?.label || id}
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
   OUTPUT FILENAME
   ============================================================ */

function buildOutputFilename(
    extension
) {

    const garment =
        Garment.getGarment(
            AppState.garment
        );


    const category =
        getCategory();


    const age =
        AppState.profile &&
        AppState.profile.age !== null

            ? `-${AppState.profile.age}y`

            : "";


    const timestamp =
        new Date()
            .toISOString()
            .replace(
                /[:.]/g,
                "-"
            );


    return (

        `PatternMaker-` +
        `${category}-` +
        `${garment?.id || "pattern"}` +
        `${age}-` +
        `${timestamp}.` +
        extension

    );

}


/* ============================================================
   EXPORT QUALITY GATE
   ============================================================ */

function validateBeforeExport() {

    if (
        !AppState.cuttingPattern
    ) {

        throw new Error(

            "Belum ada cutting geometry. " +
            "Buat pola terlebih dahulu."

        );

    }


    const validation =
        ProductionValidator
            .validateForProduction(

                AppState.cuttingPattern,

                {

                    requireCutPoints:
                        true,

                    requireSeam:
                        true

                }

            );


    AppState.productionValidation =
        validation;


    if (
        !validation.valid
    ) {

        throw new Error(

            "Output produksi dihentikan karena " +
            "geometry belum lulus validasi."

        );

    }


    return validation;

}


/* ============================================================
   OUTPUT AUDIT GATE
   ============================================================ */

function validateOutputAudit() {

    if (
        !AppState.cuttingPattern
    ) {

        throw new Error(
            "Belum ada cuttingPattern untuk audit."
        );

    }


    const audit =
        auditOutputs(
            AppState.cuttingPattern
        );


    renderAuditStatus(
        audit
    );


    if (
        !audit.valid
    ) {

        throw new Error(

            "Output audit gagal. " +
            `${audit.errors.length} error ditemukan.`

        );

    }


    return audit;

}


/* ============================================================
   DXF EXPORT
   ============================================================ */

function exportDXF() {

    if (
        AppState.exporting
    ) {

        return;

    }


    AppState.exporting =
        true;


    try {

        setPlotterStatus(
            "Memvalidasi DXF..."
        );


        validateBeforeExport();

        validateOutputAudit();


        const info =
            DXF.getExportInfo();


        if (
            info.sourceUnit !== "cm" ||
            info.outputUnit !== "mm" ||
            Number(info.conversion) !== 10
        ) {

            throw new Error(

                "Konfigurasi DXF 1:1 tidak valid."

            );

        }


        const filename =
            buildOutputFilename(
                "dxf"
            );


        const result =
            DXF.downloadDXF(

                AppState.cuttingPattern,

                filename,

                {

                    includeGrainline:
                        $("addGrainline")?.value !== "no",

                    includeNotches:
                        $("addNotches")?.value !== "no",

                    includeDrillPoints:
                        true,

                    includeLabels:
                        true,

                    cutLayer:
                        "CUT",

                    labelHeight:
                        2.5

                }

            );


        AppState.lastExport = {

            ...result,

            format:
                "DXF R12",

            exportedAt:
                new Date()
                    .toISOString()

        };


        renderResultInfo();


        setPlotterStatus(

            `DXF R12 berhasil dibuat • ` +
            `1:1 • mm • ${filename}`,

            "ok"

        );


        setStatus(
            "Export DXF berhasil.",
            "ok"
        );


        return AppState.lastExport;

    }
    catch (
        error
    ) {

        console.error(
            "DXF export error:",
            error
        );


        setPlotterStatus(
            error.message,
            "error"
        );


        setStatus(
            error.message,
            "error"
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }
    finally {

        AppState.exporting =
            false;

    }

}


/* ============================================================
   PLOTTER CONFIG
   ============================================================ */

function getPlotterConfig() {

    const unitsPerMm =
        Number(
            $("plotterUnitsPerMm")?.value ||
            40
        );


    const originX =
        Number(
            $("plotterOriginX")?.value ||
            0
        );


    const originY =
        Number(
            $("plotterOriginY")?.value ||
            0
        );


    const flipY =
        $("plotterFlipY")?.value ===
        "yes";


    const cutPen =
        Number(
            $("plotterCutPen")?.value ||
            1
        );


    const grainlinePen =
        Number(
            $("plotterGrainPen")?.value ||
            2
        );


    const notchPen =
        Number(
            $("plotterNotchPen")?.value ||
            3
        );


    const drillPen =
        Number(
            $("plotterDrillPen")?.value ||
            4
        );


    return {

        unitsPerMm:
            Number.isFinite(
                unitsPerMm
            ) &&
            unitsPerMm > 0

                ? unitsPerMm

                : 40,

        originX:
            Number.isFinite(
                originX
            )
                ? originX
                : 0,

        originY:
            Number.isFinite(
                originY
            )
                ? originY
                : 0,

        flipY,

        penCut:
            Number.isFinite(
                cutPen
            )
                ? cutPen
                : 1,

        penGrainline:
            Number.isFinite(
                grainlinePen
            )
                ? grainlinePen
                : 2,

        penNotch:
            Number.isFinite(
                notchPen
            )
                ? notchPen
                : 3,

        penDrill:
            Number.isFinite(
                drillPen
            )
                ? drillPen
                : 4,

        includeGrainline:
            $("addGrainline")?.value !==
            "no",

        includeNotches:
            $("addNotches")?.value !==
            "no",

        includeDrillPoints:
            true,

        includeLabels:
            false,

        initialize:
            true,

        resetPen:
            true,

        terminate:
            true

    };

}


/* ============================================================
   PLOTTER INFO
   ============================================================ */

function updatePlotterInfo() {

    const infoNode =
        $("plotterInfo");


    if (
        !infoNode ||
        !Plotter
    ) {

        return;

    }


    const config =
        getPlotterConfig();


    const info =
        Plotter.getExportInfo(
            config
        );


    infoNode.textContent =

        `1 cm = 10 mm = ` +
        `${info.hpglUnitsPerCm} HPGL units • ` +
        `${info.unitsPerMm} units/mm`;

}


/* ============================================================
   PLT EXPORT
   ============================================================ */

function exportPLT() {

    if (
        AppState.exporting
    ) {

        return;

    }


    AppState.exporting =
        true;


    try {

        setPlotterStatus(
            "Memvalidasi PLT / HPGL..."
        );


        validateBeforeExport();

        validateOutputAudit();


        const config =
            getPlotterConfig();


        if (
            !Number.isFinite(
                config.unitsPerMm
            ) ||
            config.unitsPerMm <= 0
        ) {

            throw new Error(
                "Units/mm plotter tidak valid."
            );

        }


        const filename =
            buildOutputFilename(
                "plt"
            );


        const result =
            Plotter.downloadHPGL(

                AppState.cuttingPattern,

                filename,

                config

            );


        AppState.lastExport = {

            ...result,

            format:
                "PLT / HPGL",

            exportedAt:
                new Date()
                    .toISOString(),

            plotter: {

                unitsPerMm:
                    config.unitsPerMm,

                originX:
                    config.originX,

                originY:
                    config.originY,

                flipY:
                    config.flipY

            }

        };


        renderResultInfo();

        updatePlotterInfo();


        setPlotterStatus(

            `PLT / HPGL berhasil dibuat • ` +
            `${config.unitsPerMm} units/mm • ` +
            `${filename}`,

            "ok"

        );


        setStatus(
            "Export PLT berhasil.",
            "ok"
        );


        return AppState.lastExport;

    }
    catch (
        error
    ) {

        console.error(
            "PLT export error:",
            error
        );


        setPlotterStatus(
            error.message,
            "error"
        );


        setStatus(
            error.message,
            "error"
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }
    finally {

        AppState.exporting =
            false;

    }

}


/* ============================================================
   SVG EXPORT
   ============================================================ */

function exportSVG() {

    if (
        AppState.exporting
    ) {

        return;

    }


    AppState.exporting =
        true;


    try {

        setPlotterStatus(
            "Memvalidasi SVG..."
        );


        validateBeforeExport();

        validateOutputAudit();


        const filename =
            buildOutputFilename(
                "svg"
            );


        const result =
            SVG.downloadSVG(

                AppState.cuttingPattern,

                filename,

                {

                    includeGrainline:
                        $("addGrainline")?.value !== "no",

                    includeNotches:
                        $("addNotches")?.value !== "no",

                    includeDrillPoints:
                        true,

                    includeLabels:
                        true,

                    labelHeight:
                        2.5

                }

            );


        AppState.lastExport = {

            ...result,

            format:
                "SVG 1:1",

            exportedAt:
                new Date()
                    .toISOString()

        };


        renderResultInfo();


        setPlotterStatus(

            `SVG 1:1 berhasil dibuat • ` +
            `mm • ${filename}`,

            "ok"

        );


        setStatus(
            "Export SVG berhasil.",
            "ok"
        );


        return AppState.lastExport;

    }
    catch (
        error
    ) {

        console.error(
            "SVG export error:",
            error
        );


        setPlotterStatus(
            error.message,
            "error"
        );


        setStatus(
            error.message,
            "error"
        );


        return {

            success:
                false,

            error:
                error.message

        };

    }
    finally {

        AppState.exporting =
            false;

    }

}


/* ============================================================
   OUTPUT AUDIT MANUAL
   ============================================================ */

function runOutputAudit() {

    if (
        !AppState.cuttingPattern
    ) {

        setAuditStatus(
            "Belum ada cutting geometry.",
            "error"
        );


        return {

            valid:
                false,

            errors: [

                "Belum ada cutting geometry."

            ]

        };

    }


    try {

        const audit =
            auditOutputs(
                AppState.cuttingPattern
            );


        renderAuditStatus(
            audit
        );


        if (
            audit.valid
        ) {

            setAuditStatus(

                `LULUS • ${audit.checks.length} checks`,

                "ok"

            );

        }
        else {

            setAuditStatus(

                `DITAHAN • ${audit.errors.length} error`,

                "error"

            );

        }


        return audit;

    }
    catch (
        error
    ) {

        setAuditStatus(
            error.message,
            "error"
        );


        return {

            valid:
                false,

            errors: [

                {

                    message:
                        error.message

                }

            ]

        };

    }

}


/* ============================================================
   SYSTEM AUDIT MANUAL
   ============================================================ */

function runSystemAudit() {

    const report =
        runStartupAudit();


    renderStartupAudit(
        report
    );


    return report;

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

    AppState.outputAudit =
        null;

    AppState.nestingResult =
        null;

    AppState.lastExport =
        null;


    setAuditStatus(
        "Audit belum dijalankan."
    );


    setNestingStatus(
        "Nesting belum dijalankan."
    );


    const nestingResult =
        $("nestingResult");


    if (
        nestingResult
    ) {

        nestingResult.innerHTML =
            "";

    }


    const nestingPreview =
        $("nestingPreview");


    if (
        nestingPreview
    ) {

        nestingPreview.innerHTML =
            "";

    }


    const resultAudit =
        $("resultAudit");


    if (
        resultAudit
    ) {

        resultAudit.innerHTML =
            "";

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


    setPlotterStatus(
        "Garment berubah. Output produksi dibatalkan."
    );


    setDraftStatus(
        "Jenis pakaian berubah. Periksa ukuran kembali."
    );

}


/* ============================================================
   CATEGORY CHANGE
   ============================================================ */

function handleCategoryChange() {

    invalidateGeneratedPattern();


    renderMeasurementFields();


    setDraftStatus(
        "Kategori berubah. Ukuran harus diperiksa kembali."
    );


    setSystemAuditStatus(
        "Kategori berubah. Jalankan System Audit.",
        "warning"
    );

}


/* ============================================================
   AGE CHANGE
   ============================================================ */

function handleAgeChange() {

    invalidateGeneratedPattern();


    setDraftStatus(
        "Umur berubah. Jalankan pola kembali."
    );

}


/* ============================================================
   SIZE UNIT CHANGE
   ============================================================ */

function handleUnitChange() {

    invalidateGeneratedPattern();


    renderMeasurementFields();


    setPlotterStatus(
        "Unit tampilan berubah. Generate ulang pola."
    );

}


/* ============================================================
   MEASUREMENT CHANGE
   ============================================================ */

function handleMeasurementChange() {

    invalidateGeneratedPattern();


    setDraftStatus(
        "Ukuran berubah. Buat pola kembali."
    );


    setPlotterStatus(
        "Output produksi lama dibatalkan."
    );

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

    AppState.outputAudit =
        null;

    AppState.nestingResult =
        null;

    AppState.lastExport =
        null;


    if (
        AppState.basePattern
    ) {

        setDraftStatus(

            "Pengaturan produksi berubah. " +
            "Generate ulang untuk memperbarui geometry."

        );

    }


    setPlotterStatus(
        "Output produksi lama dibatalkan."
    );


    setAuditStatus(
        "Audit perlu dijalankan ulang."
    );


    setNestingStatus(
        "Nesting perlu dijalankan ulang."
    );


    const nestingResult =
        $("nestingResult");


    if (
        nestingResult
    ) {

        nestingResult.innerHTML =
            "";

    }


    const nestingPreview =
        $("nestingPreview");


    if (
        nestingPreview
    ) {

        nestingPreview.innerHTML =
            "";

    }

}


/* ============================================================
   PLOTTER SETTING CHANGE
   ============================================================ */

function handlePlotterSettingChange() {

    updatePlotterInfo();


    AppState.lastExport =
        null;


    setPlotterStatus(

        "Pengaturan plotter berubah. " +
        "PLT akan dibuat dengan konfigurasi baru."

    );

}


/* ============================================================
   NESTING SETTING CHANGE
   ============================================================ */

function handleNestingSettingChange() {

    AppState.nestingResult =
        null;


    setNestingStatus(

        "Pengaturan marker berubah. " +
        "Jalankan nesting kembali."

    );


    const preview =
        $("nestingPreview");


    if (
        preview
    ) {

        preview.innerHTML =
            "";

    }


    const result =
        $("nestingResult");


    if (
        result
    ) {

        result.innerHTML =
            "";

    }

}


/* ============================================================
   FIT PREVIEWS
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


function fitNestingPreview() {

    if (
        !NestingPreview
    ) {

        return;

    }


    NestingPreview.fit(
        "nestingPreview"
    );

}


/* ============================================================
   OPEN PREVIEW
   ============================================================ */

function openPreview() {

    if (
        !AppState.cuttingPattern
    ) {

        setPlotterStatus(
            "Belum ada cutting geometry."
        );


        return;

    }


    renderPreview(
        AppState.cuttingPattern
    );


    fitPreview();

}


/* ============================================================
   GENERATE PATTERN
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


    AppState.lastExport =
        null;


    AppState.nestingResult =
        null;


    try {

        /*
         * ================================================
         * CURRENT GARMENT
         * ================================================
         */

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
         * ================================================
         * CURRENT PROFILE
         * ================================================
         */

        setStatus(
            "Memvalidasi ukuran..."
        );


        createCurrentProfile();


        /*
         * ================================================
         * UNIVERSAL CURRENT SELECTION AUDIT
         * ================================================
         */

        if (
            UniversalGarmentAudit
        ) {

            const selectionAudit =
                UniversalGarmentAudit
                    .auditCurrentSelection(

                        AppState.profile,

                        AppState.garment

                    );


            /*
             * Error benar-benar menghentikan proses.
             *
             * Warning tidak menghentikan drafting.
             */

            if (
                selectionAudit.errors?.length
            ) {

                const firstError =
                    selectionAudit.errors[0];


                throw new Error(

                    firstError.message ||
                    firstError.check ||
                    "Current garment selection tidak valid."

                );

            }

        }


        /*
         * ================================================
         * PROFILE / GARMENT VALIDATION
         * ================================================
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

                (
                    profileValidation.missing ||
                    []
                )
                .map(
                    item =>
                        item.label ||
                        item.id ||
                        item
                )
                .join(", ")

            );

        }


        /*
         * ================================================
         * FABRIC
         * ================================================
         */

        getFabricData();

        renderFabricResult();


        /*
         * ================================================
         * PATTERN ENGINE
         * ================================================
         */

        setDraftStatus(

            `Menjalankan ${garment.label} engine...`

        );


        const engineResult =
            runPatternEngine(
                garment
            );


        AppState.engineResult =
            engineResult;


        /*
         * ================================================
         * BASE PATTERN
         * ================================================
         */

        setDraftStatus(
            "Memvalidasi base pattern..."
        );


        const basePattern =
            normalizeBasePattern(
                engineResult
            );


        /*
         * ================================================
         * SEAM
         * ================================================
         */

        setDraftStatus(
            "Menerapkan seam allowance..."
        );


        const productionPattern =
            buildProductionPattern(
                basePattern
            );


        /*
         * ================================================
         * CUTTING GEOMETRY
         * ================================================
         */

        setDraftStatus(
            "Membentuk cutting boundary..."
        );


        const cuttingPattern =
            createCuttingPattern(
                productionPattern
            );


        /*
         * ================================================
         * PRODUCTION QUALITY GATE
         * ================================================
         */

        setDraftStatus(
            "Memvalidasi geometri produksi..."
        );


        const productionValidation =
            validateCuttingForProduction(
                cuttingPattern
            );


        if (
            !productionValidation.valid
        ) {

            renderPreview(
                cuttingPattern
            );


            renderResultInfo();

            renderMeasurementsResult();


            const firstError =
                productionValidation.errors?.[0];


            throw new Error(

                firstError
                    ? (
                        firstError.message ||
                        firstError.check ||
                        "Production geometry invalid."
                    )
                    : "Production geometry invalid."

            );

        }


        /*
         * ================================================
         * OUTPUT AUDIT
         * ================================================
         */

        setDraftStatus(
            "Mengaudit konsistensi output..."
        );


        const audit =
            auditOutputs(
                cuttingPattern
            );


        renderAuditStatus(
            audit
        );


        if (
            !audit.valid
        ) {

            throw new Error(

                "Output audit gagal. " +
                `${audit.errors.length} error ditemukan.`

            );

        }


        /*
         * ================================================
         * PREVIEW
         * ================================================
         */

        renderPreview(
            cuttingPattern
        );


        /*
         * ================================================
         * RESULTS
         * ================================================
         */

        renderResultInfo();

        renderMeasurementsResult();


        /*
         * ================================================
         * NESTING STATE
         * ================================================
         */

        setNestingStatus(
            "Cutting geometry siap untuk nesting."
        );


        /*
         * ================================================
         * PRODUCTION STATUS
         * ================================================
         */

        setPlotterStatus(

            "Geometry dan output lulus audit.",

            "ok"

        );


        /*
         * ================================================
         * SUCCESS
         * ================================================
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
            `AUDITED`,

            "ok"

        );


        setStatus(

            `Pola berhasil dibuat, divalidasi, dan diaudit • ` +
            `${Schema.getCategoryLabel(
                getCategory()
            )} • ` +
            `${garment.label}`,

            "ok"

        );


        return cuttingPattern;

    }
    catch (
        error
    ) {

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


        return {

            success:
                false,

            error:
                error.message

        };

    }
    finally {

        AppState.generating =
            false;

    }

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

    AppState.basePattern =
        null;

    AppState.productionPattern =
        null;

    AppState.cuttingPattern =
        null;

    AppState.productionValidation =
        null;

    AppState.outputAudit =
        null;

    AppState.startupAudit =
        null;

    AppState.nestingResult =
        null;

    AppState.lastExport =
        null;

    AppState.error =
        null;


    /*
     * Defaults
     */

    if (
        $("userMode")
    )
        $("userMode").value =
            "tailor";


    if (
        $("category")
    )
        $("category").value =
            "child";


    if (
        $("sizeSystem")
    )
        $("sizeSystem").value =
            "cm";


    if (
        $("garmentType")
    )
        $("garmentType").value =
            "tshirt";


    if (
        $("age")
    )
        $("age").value =
            "";


    if (
        $("fabric")
    )
        $("fabric").value =
            "cotton";


    if (
        $("fabricWidth")
    )
        $("fabricWidth").value =
            "150";


    if (
        $("fabricLength")
    )
        $("fabricLength").value =
            "200";


    if (
        $("stretch")
    )
        $("stretch").value =
            "medium";


    if (
        $("stretchDirection")
    )
        $("stretchDirection").value =
            "crosswise";


    if (
        $("ease")
    )
        $("ease").value =
            "2";


    if (
        $("seam")
    )
        $("seam").value =
            "1";


    if (
        $("patternTolerance")
    )
        $("patternTolerance").value =
            "0";


    if (
        $("addSeam")
    )
        $("addSeam").value =
            "yes";


    if (
        $("addNotches")
    )
        $("addNotches").value =
            "yes";


    if (
        $("addGrainline")
    )
        $("addGrainline").value =
            "yes";


    /*
     * Plotter
     */

    if (
        $("plotterUnitsPerMm")
    )
        $("plotterUnitsPerMm").value =
            "40";


    if (
        $("plotterOriginX")
    )
        $("plotterOriginX").value =
            "0";


    if (
        $("plotterOriginY")
    )
        $("plotterOriginY").value =
            "0";


    if (
        $("plotterFlipY")
    )
        $("plotterFlipY").value =
            "no";


    if (
        $("plotterCutPen")
    )
        $("plotterCutPen").value =
            "1";


    if (
        $("plotterGrainPen")
    )
        $("plotterGrainPen").value =
            "2";


    if (
        $("plotterNotchPen")
    )
        $("plotterNotchPen").value =
            "3";


    if (
        $("plotterDrillPen")
    )
        $("plotterDrillPen").value =
            "4";


    /*
     * Nesting
     */

    if (
        $("nestingGap")
    )
        $("nestingGap").value =
            "1";


    if (
        $("nestingMargin")
    )
        $("nestingMargin").value =
            "1";


    if (
        $("nestingStrategy")
    )
        $("nestingStrategy").value =
            "shelf";


    if (
        $("nestingRotation")
    )
        $("nestingRotation").value =
            "180";


    if (
        $("nestingGrainline")
    )
        $("nestingGrainline").value =
            "yes";


    if (
        $("markerEfficiency")
    )
        $("markerEfficiency").value =
            "85";


    /*
     * Main preview
     */

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


    /*
     * Result panels
     */

    if (
        $("resultInfo")
    )
        $("resultInfo").innerHTML =
            "";


    if (
        $("resultMeasurements")
    )
        $("resultMeasurements").innerHTML =
            "";


    if (
        $("resultAudit")
    )
        $("resultAudit").innerHTML =
            "";


    if (
        $("nestingResult")
    )
        $("nestingResult").innerHTML =
            "";


    if (
        $("nestingPreview")
    )
        $("nestingPreview").innerHTML =
            "";


    if (
        $("systemAuditResult")
    )
        $("systemAuditResult").innerHTML =
            "";


    /*
     * Mode
     */

    applyMode(
        "tailor"
    );


    /*
     * Re-render
     */

    renderMeasurementFields();

    updateGarmentInformation();

    updatePlotterInfo();


    /*
     * Status
     */

    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );


    setPlotterStatus(
        "Output produksi belum dibuat."
    );


    setAuditStatus(
        "Audit belum dijalankan."
    );


    setNestingStatus(
        "Nesting belum dijalankan."
    );


    /*
     * System audit
     */

    const audit =
        runStartupAudit();


    renderStartupAudit(
        audit
    );

}


/* ============================================================
   BIND EVENTS
   ============================================================ */

function bindEvents() {

    /*
     * Mode
     */

    $("userMode")?.addEventListener(

        "change",

        event => {

            applyMode(
                event.target.value
            );

        }

    );


    /*
     * Category
     */

    $("category")?.addEventListener(

        "change",

        handleCategoryChange

    );


    /*
     * Garment
     */

    $("garmentType")?.addEventListener(

        "change",

        handleGarmentChange

    );


    /*
     * Age
     */

    $("age")?.addEventListener(

        "change",

        handleAgeChange

    );


    $("age")?.addEventListener(

        "input",

        handleAgeChange

    );


    /*
     * Unit
     */

    $("sizeSystem")?.addEventListener(

        "change",

        handleUnitChange

    );


    /*
     * Main buttons
     */

    $("generateBtn")?.addEventListener(

        "click",

        generatePattern

    );


    $("resetBtn")?.addEventListener(

        "click",

        resetApplication

    );


    /*
     * Main preview
     */

    $("fitPreviewBtn")?.addEventListener(

        "click",

        fitPreview

    );


    $("openPreviewBtn")?.addEventListener(

        "click",

        openPreview

    );


    /*
     * Exports
     */

    $("exportDxfBtn")?.addEventListener(

        "click",

        exportDXF

    );


    $("exportPltBtn")?.addEventListener(

        "click",

        exportPLT

    );


    $("exportSvgBtn")?.addEventListener(

        "click",

        exportSVG

    );


    /*
     * Audits
     */

    $("auditOutputBtn")?.addEventListener(

        "click",

        runOutputAudit

    );


    $("runSystemAuditBtn")?.addEventListener(

        "click",

        runSystemAudit

    );


    /*
     * Nesting
     */

    $("runNestingBtn")?.addEventListener(

        "click",

        runNesting

    );


    $("fitNestingPreviewBtn")?.addEventListener(

        "click",

        fitNestingPreview

    );


    /*
     * Measurements
     */

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


    /*
     * Production settings
     */

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


    /*
     * Nesting settings
     */

    [

        "nestingGap",
        "nestingMargin",
        "nestingStrategy",
        "nestingRotation",
        "nestingGrainline"

    ]
    .forEach(
        id => {

            $(id)?.addEventListener(

                "input",

                handleNestingSettingChange

            );


            $(id)?.addEventListener(

                "change",

                handleNestingSettingChange

            );

        }
    );


    /*
     * Plotter settings
     */

    [

        "plotterUnitsPerMm",
        "plotterOriginX",
        "plotterOriginY",
        "plotterFlipY",
        "plotterCutPen",
        "plotterGrainPen",
        "plotterNotchPen",
        "plotterDrillPen"

    ]
    .forEach(
        id => {

            $(id)?.addEventListener(

                "input",

                handlePlotterSettingChange

            );


            $(id)?.addEventListener(

                "change",

                handlePlotterSettingChange

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


    /*
     * Dependency gate.
     */

    validateDependencies();


    /*
     * Startup system audit.
     *
     * IMPORTANT:
     *
     * Audit dilakukan sebelum UI dinyatakan siap.
     * Tetapi audit system yang berisi warning tidak
     * menghentikan aplikasi.
     */

    const startupAudit =
        runStartupAudit();


    AppState.startupAudit =
        startupAudit;


    /*
     * State initialization.
     */

    AppState.initialized =
        true;


    AppState.mode =
        $("userMode")?.value ||
        "tailor";


    AppState.garment =
        getGarmentId();


    /*
     * UI initialization.
     */

    applyMode(
        AppState.mode
    );


    renderMeasurementFields();

    updateGarmentInformation();

    bindEvents();

    updatePlotterInfo();


    /*
     * System audit UI.
     */

    renderStartupAudit(
        startupAudit
    );


    /*
     * Status.
     */

    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );


    setPlotterStatus(
        "Output produksi belum dibuat."
    );


    setAuditStatus(
        "Audit belum dijalankan."
    );


    setNestingStatus(
        "Nesting belum dijalankan."
    );


    /*
     * Console.
     */

    console.log(
        "PatternMaker Universal initialized.",
        AppState
    );


    console.log(
        "PatternMaker startup audit:",
        startupAudit
    );

}


/* ============================================================
   START
   ============================================================ */

try {

    initializeApplication();

}
catch (
    error
) {

    console.error(
        "PatternMaker initialization failed:",
        error
    );


    setStatus(
        error.message ||
        "PatternMaker gagal melakukan initialization.",
        "error"
    );

}


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

    renderNestingPreview,

    reset:
        resetApplication,

    fitPreview,

    fitNestingPreview,

    openPreview,

    buildProductionPattern,

    createCuttingPattern,

    validateCuttingForProduction,

    exportDXF,

    exportPLT,

    exportSVG,

    runOutputAudit,

    runSystemAudit,

    runNesting,

    getPlotterConfig,

    getNestingConfig,

    auditOutputs,

    validateBeforeExport,

    validateOutputAudit

};
