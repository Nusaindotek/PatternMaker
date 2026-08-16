/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 34 — main.js
 * ============================================================
 *
 * APPLICATION CONTROLLER
 *
 * PIPELINE:
 *
 * UI
 *  ↓
 * Body Profile
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
 * Production Validation
 *  ↓
 * Output Audit
 *  ↓
 * Full / Open Preview
 *  ↓
 * DXF / PLT / SVG
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

const DXF =
    window.PatternMakerDXF;

const Plotter =
    window.PatternMakerPlotter;

const SVG =
    window.PatternMakerSVG;

const OutputAudit =
    window.PatternMakerOutputAudit;


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

        DXF,

        Plotter,

        SVG,

        OutputAudit

    };


    const missing =
        Object.entries(required)
            .filter(
                ([, value]) => !value
            )
            .map(
                ([key]) => key
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

    lastExport:
        null,

    error:
        null

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
            MODES[mode].description;

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
                !Number.isFinite(value)
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
            <b>Material</b>
            <span>${fabric.material}</span>
        </div>

        <div class="kv">
            <b>Lebar Kain</b>
            <span>${fabric.width} cm</span>
        </div>

        <div class="kv">
            <b>Panjang Kain</b>
            <span>${fabric.length} cm</span>
        </div>

        <div class="kv">
            <b>Stretch</b>
            <span>${fabric.stretch}</span>
        </div>

        <div class="kv">
            <b>Arah Stretch</b>
            <span>${fabric.stretchDirection}</span>
        </div>

        <div class="kv">
            <b>Ease</b>
            <span>${fabric.ease} cm</span>
        </div>

        <div class="kv">
            <b>Seam Allowance</b>
            <span>${fabric.seam} cm</span>
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
                $("addGrainline")?.value !== "no",

            notches:
                $("addNotches")?.value !== "no",

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
        !Array.isArray(result.pieces)
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
   AUDIT STATUS
   ============================================================ */

function renderAuditStatus(
    audit
) {

    const resultNode =
        $("auditResult");


    const statusNode =
        $("auditStatus");


    if (
        statusNode
    ) {

        if (
            audit.valid
        ) {

            statusNode.textContent =
                `LULUS • ${audit.checks.length} pemeriksaan`;

            statusNode.className =
                "status ok";

        }
        else {

            statusNode.textContent =
                `DITAHAN • ${audit.errors.length} error`;

            statusNode.className =
                "status error";

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

        resultNode.innerHTML += `

            <div class="measurement-note">

                <b>
                    Error utama:
                </b>

                ${
                    audit.errors
                        .slice(0, 3)
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
                                    "Error."
                                );

                            }
                        )
                        .join(
                            " • "
                        )
                }

            </div>

        `;

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
                piece.name;


            svg.appendChild(
                label
            );


            if (
                $("addGrainline")?.value !== "no" &&
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


            if (
                $("addNotches")?.value !== "no" &&
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


    const exportText =
        AppState.lastExport
            ? AppState.lastExport.filename
            : "-";


    container.innerHTML = `

        <div class="kv">
            <b>Kategori</b>
            <span>${category}</span>
        </div>

        <div class="kv">
            <b>Jenis Pakaian</b>
            <span>${garment?.label || "-"}</span>
        </div>

        <div class="kv">
            <b>Umur</b>
            <span>${age}</span>
        </div>

        <div class="kv">
            <b>Material</b>
            <span>${AppState.fabric?.material || "-"}</span>
        </div>

        <div class="kv">
            <b>Base Pieces</b>
            <span>${basePieces}</span>
        </div>

        <div class="kv">
            <b>Cutting Pieces</b>
            <span>${productionPieces}</span>
        </div>

        <div class="kv">
            <b>Seam Allowance</b>
            <span>${seam} cm</span>
        </div>

        <div class="kv">
            <b>Production Validation</b>
            <span>${validationText}</span>
        </div>

        <div class="kv">
            <b>Last Export</b>
            <span>${exportText}</span>
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
   FILENAME
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
   AUDIT QUALITY GATE
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
        OutputAudit.auditPattern(
            AppState.cuttingPattern
        );


    AppState.outputAudit =
        audit;


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
   DXF
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
            info.conversion !== 10
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


        return AppState.lastExport;

    }
    catch (
        error
    ) {

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
            Number.isFinite(unitsPerMm) &&
            unitsPerMm > 0
                ? unitsPerMm
                : 40,

        originX:
            Number.isFinite(originX)
                ? originX
                : 0,

        originY:
            Number.isFinite(originY)
                ? originY
                : 0,

        flipY,

        penCut:
            Number.isFinite(cutPen)
                ? cutPen
                : 1,

        penGrainline:
            Number.isFinite(grainlinePen)
                ? grainlinePen
                : 2,

        penNotch:
            Number.isFinite(notchPen)
                ? notchPen
                : 3,

        penDrill:
            Number.isFinite(drillPen)
                ? drillPen
                : 4,

        includeGrainline:
            $("addGrainline")?.value !== "no",

        includeNotches:
            $("addNotches")?.value !== "no",

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
        !infoNode
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
   PLT
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


        return AppState.lastExport;

    }
    catch (
        error
    ) {

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
   SVG
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


        return AppState.lastExport;

    }
    catch (
        error
    ) {

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
   AUDIT MANUAL
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


/* ============================================================
   INVALIDATE
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

    AppState.lastExport =
        null;


    const auditStatus =
        $("auditStatus");


    if (
        auditStatus
    ) {

        auditStatus.textContent =
            "Audit belum dijalankan.";

        auditStatus.className =
            "status";

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
   UNIT CHANGE
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

    AppState.lastExport =
        null;

    AppState.error =
        null;


    if ($("userMode"))
        $("userMode").value =
            "tailor";

    if ($("category"))
        $("category").value =
            "child";

    if ($("sizeSystem"))
        $("sizeSystem").value =
            "cm";

    if ($("garmentType"))
        $("garmentType").value =
            "tshirt";

    if ($("age"))
        $("age").value =
            "";

    if ($("fabric"))
        $("fabric").value =
            "cotton";

    if ($("fabricWidth"))
        $("fabricWidth").value =
            "150";

    if ($("fabricLength"))
        $("fabricLength").value =
            "200";

    if ($("stretch"))
        $("stretch").value =
            "medium";

    if ($("stretchDirection"))
        $("stretchDirection").value =
            "crosswise";

    if ($("ease"))
        $("ease").value =
            "2";

    if ($("seam"))
        $("seam").value =
            "1";

    if ($("patternTolerance"))
        $("patternTolerance").value =
            "0";

    if ($("addSeam"))
        $("addSeam").value =
            "yes";

    if ($("addNotches"))
        $("addNotches").value =
            "yes";

    if ($("addGrainline"))
        $("addGrainline").value =
            "yes";

    if ($("plotterUnitsPerMm"))
        $("plotterUnitsPerMm").value =
            "40";

    if ($("plotterOriginX"))
        $("plotterOriginX").value =
            "0";

    if ($("plotterOriginY"))
        $("plotterOriginY").value =
            "0";

    if ($("plotterFlipY"))
        $("plotterFlipY").value =
            "no";

    if ($("plotterCutPen"))
        $("plotterCutPen").value =
            "1";

    if ($("plotterGrainPen"))
        $("plotterGrainPen").value =
            "2";

    if ($("plotterNotchPen"))
        $("plotterNotchPen").value =
            "3";

    if ($("plotterDrillPen"))
        $("plotterDrillPen").value =
            "4";


    if ($("patternPreview")) {

        $("patternPreview").innerHTML =
            "";

        $("patternPreview").setAttribute(
            "viewBox",
            "0 0 1000 620"
        );

    }


    if ($("resultInfo"))
        $("resultInfo").innerHTML =
            "";

    if ($("resultMeasurements"))
        $("resultMeasurements").innerHTML =
            "";

    if ($("resultAudit"))
        $("resultAudit").innerHTML =
            "";


    applyMode(
        "tailor"
    );


    renderMeasurementFields();

    updateGarmentInformation();

    updatePlotterInfo();


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


    AppState.lastExport =
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


        setStatus(
            "Memvalidasi ukuran..."
        );


        createCurrentProfile();


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


        getFabricData();

        renderFabricResult();


        setDraftStatus(

            `Menjalankan ${garment.label} engine...`

        );


        const engineResult =
            runPatternEngine(
                garment
            );


        setDraftStatus(
            "Memvalidasi base pattern..."
        );


        const basePattern =
            normalizeBasePattern(
                engineResult
            );


        setDraftStatus(
            "Menerapkan seam allowance..."
        );


        const productionPattern =
            buildProductionPattern(
                basePattern
            );


        setDraftStatus(
            "Membentuk cutting boundary..."
        );


        const cuttingPattern =
            createCuttingPattern(
                productionPattern
            );


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


            throw new Error(

                "Pola ditahan sebelum produksi: " +

                productionValidation.errors
                    .slice(0, 5)
                    .map(
                        error => {

                            if (
                                typeof error === "string"
                            ) {

                                return error;

                            }


                            return (
                                error.message ||
                                error.check ||
                                "Geometry invalid."
                            );

                        }
                    )
                    .join(" | ")

            );

        }


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


        renderPreview(
            cuttingPattern
        );


        renderResultInfo();

        renderMeasurementsResult();


        setPlotterStatus(

            "Geometry dan seluruh output lulus audit.",

            "ok"

        );


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

    }
    finally {

        AppState.generating =
            false;

    }

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


    $("auditOutputBtn")?.addEventListener(
        "click",
        runOutputAudit
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

    updatePlotterInfo();


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

    validateCuttingForProduction,

    exportDXF,

    exportPLT,

    exportSVG,

    runOutputAudit,

    getPlotterConfig

};
