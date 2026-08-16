```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 87
 *
 * FILE:
 *   main.js
 * ============================================================
 *
 * APPLICATION CONTROLLER
 *
 * Responsibility:
 *
 *   UI
 *    ↓
 *   State
 *    ↓
 *   Engine Router
 *    ↓
 *   Pattern
 *    ↓
 *   Audit
 *    ↓
 *   Preview / Result
 *
 * ============================================================
 *
 * IMPORTANT
 *
 * main.js TIDAK berisi formula drafting.
 *
 * main.js hanya:
 *
 * - membaca input
 * - membangun context
 * - memilih engine
 * - menjalankan audit
 * - merender hasil
 *
 * ============================================================
 */

"use strict";


/* ============================================================
   GLOBAL STATE
   ============================================================ */

const appState = {

    generated:
        false,

    basePattern:
        null,

    graded:
        null,

    production:
        null,

    nesting:
        null,

    audit:
        null,

    profile:
        {},

    garment:
        {},

    measurements:
        {},

    fabric:
        {},

    errors:
        [],

    warnings:
        []

};


/* ============================================================
   UI HELPERS
   ============================================================ */

function $(id) {

    return document.getElementById(
        id
    );

}


function setText(
    id,
    value
) {

    const element =
        $(id);


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


function setHtml(
    id,
    value
) {

    const element =
        $(id);


    if (
        element
    ) {

        element.innerHTML =
            value;

    }

}


/* ============================================================
   ENGINE AVAILABILITY
   ============================================================ */

function getEngine(
    garment
) {

    const map = {

        tshirt:
            window.PatternMakerBodice,

        blouse:
            window.PatternMakerBodice,

        sweater:
            window.PatternMakerBodice,

        shirt:
            window.PatternMakerShirt,

        dress:
            window.PatternMakerDress,

        skirt:
            window.PatternMakerSkirt,

        pants:
            window.PatternMakerPants,

        shorts:
            window.PatternMakerPants

    };


    return map[
        garment
    ] || null;

}


/* ============================================================
   GARMENT DEFINITIONS
   ============================================================ */

const GARMENTS = {

    tshirt: {

        label:
            "Kaos",

        engine:
            "bodice",

        measurements: [

            "chest",
            "waist",
            "shoulder",
            "bodyLength",
            "sleeveLength",
            "upperArm"

        ]

    },


    blouse: {

        label:
            "Blus",

        engine:
            "bodice",

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "bodyLength",
            "sleeveLength",
            "upperArm"

        ]

    },


    shirt: {

        label:
            "Kemeja",

        engine:
            "shirt",

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "bodyLength",
            "sleeveLength",
            "upperArm",
            "neck"

        ]

    },


    sweater: {

        label:
            "Sweater",

        engine:
            "bodice",

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "bodyLength",
            "sleeveLength",
            "upperArm",
            "wrist"

        ]

    },


    dress: {

        label:
            "Dress",

        engine:
            "dress",

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "garmentLength",
            "sleeveLength"

        ]

    },


    skirt: {

        label:
            "Rok",

        engine:
            "skirt",

        measurements: [

            "waist",
            "hip",
            "garmentLength"

        ]

    },


    pants: {

        label:
            "Celana",

        engine:
            "pants",

        measurements: [

            "waist",
            "hip",
            "crotchDepth",
            "outseam",
            "thigh",
            "ankle"

        ]

    },


    shorts: {

        label:
            "Shorts",

        engine:
            "pants",

        measurements: [

            "waist",
            "hip",
            "crotchDepth",
            "garmentLength",
            "thigh",
            "ankle"

        ]

    },


    outer: {

        label:
            "Outer / Jaket",

        engine:
            "bodice",

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "bodyLength",
            "sleeveLength",
            "upperArm",
            "wrist"

        ]

    },


    custom: {

        label:
            "Custom Pattern",

        engine:
            null,

        measurements: [

            "chest",
            "waist",
            "hip",
            "shoulder",
            "bodyLength"

        ]

    }

};


/* ============================================================
   MEASUREMENT DEFINITIONS
   ============================================================ */

const MEASUREMENTS = {

    chest:
        [
            "Lingkar dada",
            64
        ],

    waist:
        [
            "Lingkar pinggang",
            58
        ],

    hip:
        [
            "Lingkar pinggul",
            68
        ],

    shoulder:
        [
            "Lebar bahu",
            27
        ],

    bodyLength:
        [
            "Panjang badan",
            40
        ],

    garmentLength:
        [
            "Panjang pakaian",
            75
        ],

    sleeveLength:
        [
            "Panjang lengan",
            35
        ],

    upperArm:
        [
            "Lingkar lengan atas",
            22
        ],

    wrist:
        [
            "Lingkar pergelangan",
            16
        ],

    neck:
        [
            "Lingkar leher",
            28
        ],

    crotchDepth:
        [
            "Tinggi duduk / crotch depth",
            24
        ],

    outseam:
        [
            "Panjang luar celana",
            75
        ],

    thigh:
        [
            "Lingkar paha",
            38
        ],

    ankle:
        [
            "Lingkar kaki / ankle",
            24
        ]

};


/* ============================================================
   LABELS
   ============================================================ */

const CATEGORY_LABELS = {

    child:
        "Anak",

    teen:
        "Remaja",

    women:
        "Wanita",

    men:
        "Pria",

    custom:
        "Custom"

};


const FABRIC_LABELS = {

    cotton:
        "Cotton",

    "cotton-combed":
        "Cotton Combed",

    jersey:
        "Jersey",

    "sublime-jersey":
        "Sublime Jersey",

    "rib-knit":
        "Rib Knit",

    "french-terry":
        "French Terry",

    fleece:
        "Fleece",

    linen:
        "Linen",

    rayon:
        "Rayon",

    denim:
        "Denim",

    polyester:
        "Polyester",

    knit:
        "Knit",

    custom:
        "Custom"

};


/* ============================================================
   UNIT
   ============================================================ */

function displayUnit() {

    const value =
        $("sizeSystem")?.value;


    return value ===
        "inch"

        ? "in"

        : "cm";

}


function fromInputToCm(
    value
) {

    const numeric =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numeric
        )
    ) {

        return NaN;

    }


    return displayUnit() ===
        "in"

        ? numeric *
          2.54

        : numeric;

}


function toDisplayValue(
    cm
) {

    const value =
        Number(
            cm
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return "";

    }


    return displayUnit() ===
        "in"

        ? value /
          2.54

        : value;

}


/* ============================================================
   MEASUREMENT FIELDS
   ============================================================ */

function renderMeasurementFields() {

    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const schema =
        GARMENTS[
            garmentId
        ];


    if (
        !schema
    ) {

        return;

    }


    setText(
        "garmentNote",
        schema.label
    );


    const container =
        $("measurementFields");


    if (
        !container
    ) {

        return;

    }


    const unit =
        displayUnit();


    container.innerHTML =

        schema.measurements
            .map(
                key => {

                    const meta =
                        MEASUREMENTS[
                            key
                        ];


                    if (
                        !meta
                    ) {

                        return "";

                    }


                    const defaultValue =
                        toDisplayValue(
                            meta[1]
                        );


                    return `

                        <div class="measurement-group">

                            <label for="m-${key}">
                                ${escapeHtml(
                                    meta[0]
                                )}
                            </label>

                            <input

                                id="m-${key}"

                                data-measure="${key}"

                                type="number"

                                min="0.1"

                                step="0.1"

                                value="${Number(
                                    defaultValue
                                ).toFixed(1)}"

                            >

                            <div class="measurement-note">
                                ${unit}
                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    setText(

        "measurementStatus",

        `${schema.measurements.length} ukuran diperlukan untuk ${schema.label}.`

    );

}


/* ============================================================
   COLLECT MEASUREMENTS
   ============================================================ */

function collectMeasurements() {

    const result =
        {};


    document
        .querySelectorAll(
            "[data-measure]"
        )
        .forEach(
            input => {

                result[
                    input.dataset.measure
                ] =

                    fromInputToCm(
                        input.value
                    );

            }
        );


    /*
     * Normalize legacy UI keys into canonical
     * engine keys.
     */

    if (
        result.bodyLength !==
        undefined &&
        result.garmentLength ===
        undefined
    ) {

        result.garmentLength =
            result.bodyLength;

    }


    return result;

}


/* ============================================================
   VALIDATE MEASUREMENTS
   ============================================================ */

function validateMeasurements(
    measurements
) {

    const errors =
        [];


    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const schema =
        GARMENTS[
            garmentId
        ];


    if (
        !schema
    ) {

        errors.push(
            "Jenis pakaian tidak dikenali."
        );


        return errors;

    }


    schema.measurements
        .forEach(
            key => {

                /*
                 * UI compatibility.
                 */

                let value =
                    measurements[
                        key
                    ];


                if (
                    key ===
                    "bodyLength" &&
                    value ===
                    undefined
                ) {

                    value =
                        measurements
                            .garmentLength;

                }


                if (
                    key ===
                    "garmentLength" &&
                    value ===
                    undefined
                ) {

                    value =
                        measurements
                            .bodyLength;

                }


                if (
                    !Number.isFinite(
                        value
                    ) ||
                    value <=
                    0
                ) {

                    errors.push(

                        `${MEASUREMENTS[key]?.[0] || key} ` +
                        "harus lebih besar dari 0."

                    );

                }

            }
        );


    const fabricWidth =
        Number(
            $("fabricWidth")?.value
        );


    const fabricLength =
        Number(
            $("fabricLength")?.value
        );


    if (
        !(fabricWidth > 0)
    ) {

        errors.push(
            "Lebar kain harus lebih besar dari 0."
        );

    }


    if (
        !(fabricLength > 0)
    ) {

        errors.push(
            "Panjang kain harus lebih besar dari 0."
        );

    }


    const ease =
        Number(
            $("ease")?.value
        );


    const seam =
        Number(
            $("seam")?.value
        );


    if (
        !Number.isFinite(
            ease
        ) ||
        ease <
        0
    ) {

        errors.push(
            "Ease tidak valid."
        );

    }


    if (
        !Number.isFinite(
            seam
        ) ||
        seam <
        0
    ) {

        errors.push(
            "Seam allowance tidak valid."
        );

    }


    if (
        measurements.hip !==
            undefined &&

        measurements.waist !==
            undefined &&

        measurements.hip <
        measurements.waist
    ) {

        errors.push(

            "Lingkar pinggul tidak boleh lebih kecil " +
            "daripada lingkar pinggang."

        );

    }


    return errors;

}


/* ============================================================
   BUILD PROFILE
   ============================================================ */

function buildProfile(
    measurements
) {

    const category =
        $("category")?.value ||
        "child";


    return {

        category,

        age:
            $("age")?.value || null,

        measurements: {

            ...measurements

        }

    };

}


/* ============================================================
   BUILD FABRIC
   ============================================================ */

function buildFabric() {

    return {

        material:

            $("fabric")?.value ||
            "cotton",

        materialLabel:

            FABRIC_LABELS[
                $("fabric")?.value
            ] ||

            "Custom",

        width:

            Number(
                $("fabricWidth")?.value
            ),

        length:

            Number(
                $("fabricLength")?.value
            ),

        stretch:

            $("stretch")?.value ||
            "none",

        stretchDirection:

            $("stretchDirection")?.value ||
            "crosswise",

        ease:

            Number(
                $("ease")?.value
            )

    };

}


/* ============================================================
   BUILD ENGINE CONTEXT
   ============================================================ */

function buildEngineContext() {

    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const measurements =
        collectMeasurements();


    const profile =
        buildProfile(
            measurements
        );


    const fabric =
        buildFabric();


    const garment =
        GARMENTS[
            garmentId
        ];


    return {

        profile,

        measurements,

        fabric,

        garmentId:

            garment?.engine ===
                "pants"

                ?

                    garmentId

                :

                    garmentId,

        garment: {

            id:
                garmentId,

            label:
                garment?.label ||
                garmentId

        },

        options: {

            fit:
                "regular",

            notches:
                true,

            seam:
                0,

            tolerance:
                0,

            ease:
                fabric.ease

        }

    };

}


/* ============================================================
   GENERATE BASE PATTERN
   ============================================================ */

function generateBasePattern() {

    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const garment =
        GARMENTS[
            garmentId
        ];


    const engine =
        getEngine(
            garmentId
        );


    if (
        !engine
    ) {

        throw new Error(

            `Engine untuk "${garment?.label || garmentId}" ` +
            "belum tersedia."

        );

    }


    if (
        typeof engine.generate !==
        "function"
    ) {

        throw new Error(

            `Engine "${garmentId}" tidak memiliki generate().`

        );

    }


    const context =
        buildEngineContext();


    /*
     * Engine-specific compatibility.
     */

    if (
        garment?.engine ===
        "pants"
    ) {

        context.garmentId =
            garmentId;

    }


    if (
        garment?.engine ===
        "dress"
    ) {

        context.garmentId =
            "dress";

    }


    if (
        garment?.engine ===
        "shirt"
    ) {

        context.garmentId =
            "shirt";

    }


    if (
        garment?.engine ===
        "skirt"
    ) {

        context.garmentId =
            "skirt";

    }


    if (
        garment?.engine ===
        "bodice"
    ) {

        context.garmentId =
            garmentId;

    }


    return engine.generate(
        context
    );

}


/* ============================================================
   GRADE BASE PATTERN
   ============================================================ */

function gradeBasePattern(
    pattern
) {

    const grading =
        window.PatternMakerGradingEngine;


    if (
        !grading
    ) {

        throw new Error(
            "Grading engine belum tersedia."
        );

    }


    const category =
        $("category")?.value ||
        "custom";


    return grading.gradePattern(

        pattern,

        {

            category,

            mode:
                grading.MODES
                    .STRICT,

            sizes:

                window.PatternMakerUniversalGarmentAudit
                    ?.DEFAULT_SIZES

                ||

                [

                    {
                        id:
                            "BASE",

                        label:
                            "Base"

                    }

                ]

        }

    );

}


/* ============================================================
   PRODUCTION
   ============================================================ */

function createProductionPattern(
    pattern
) {

    const seam =
        window.PatternMakerSeamProduction;


    if (
        !seam
    ) {

        throw new Error(
            "Seam production engine belum tersedia."
        );

    }


    const allowance =
        Number(
            $("seam")?.value
        );


    return seam.applySeamAllowance(

        pattern,

        {

            defaultSeam:
                Number.isFinite(
                    allowance
                )
                    ? allowance
                    : 0,

            miterLimit:
                4,

            curveTolerance:
                0.05,

            maxSegmentLength:
                2

        }

    );

}


/* ============================================================
   NESTING
   ============================================================ */

function createNestedMarker(
    production
) {

    const nesting =
        window.PatternMakerNestingEngine;


    if (
        !nesting
    ) {

        throw new Error(
            "Nesting engine belum tersedia."
        );

    }


    return nesting.nest(

        production,

        {

            materialWidth:

                Number(
                    $("fabricWidth")?.value
                ) || 140,

            spacing:
                0.5,

            allowRotation90:
                true,

            respectGrainline:
                true

        }

    );

}


/* ============================================================
   UNIVERSAL AUDIT
   ============================================================ */

function runUniversalAudit() {

    const runner =
        window.PatternMakerUniversalAuditRunner;


    if (
        !runner
    ) {

        return null;

    }


    try {

        return runner.run({

            garments: [

                $("garmentType")?.value ||
                "tshirt"

            ],

            profile:
                buildProfile(
                    appState.measurements
                ),

            seamAllowance:
                Number(
                    $("seam")?.value
                ) || 0,

            materialWidth:
                Number(
                    $("fabricWidth")?.value
                ) || 140,

            spacing:
                0.5,

            allowRotation90:
                true,

            respectGrainline:
                true,

            requireTrueOffset:
                true,

            requireAllPlaced:
                true,

            requireProductionPass:
                true,

            requireNestingPass:
                true,

            auditOutputs:
                false

        });

    }
    catch (
        error
    ) {

        return {

            valid:
                false,

            errors: [

                error.message

            ]

        };

    }

}


/* ============================================================
   RENDER INFO
   ============================================================ */

function renderResultInfo() {

    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const categoryId =
        $("category")?.value ||
        "custom";


    const fabricId =
        $("fabric")?.value ||
        "custom";


    const rows = [

        [
            "Kategori",

            CATEGORY_LABELS[
                categoryId
            ] ||
            categoryId

        ],

        [
            "Jenis pakaian",

            GARMENTS[
                garmentId
            ]?.label ||
            garmentId

        ],

        [
            "Sistem ukuran",

            displayUnit() ===
                "cm"

                ? "Centimeter"

                : "Inch"

        ],

        [
            "Material",

            FABRIC_LABELS[
                fabricId
            ] ||
            fabricId

        ],

        [
            "Stretch",

            $("stretch")?.value ||
            "-"

        ],

        [
            "Arah stretch",

            $("stretchDirection")?.value ||
            "-"

        ],

        [
            "Ease",

            `${Number(
                $("ease")?.value || 0
            )} cm`

        ],

        [
            "Seam allowance",

            `${Number(
                $("seam")?.value || 0
            )} cm`

        ]

    ];


    setHtml(

        "resultInfo",

        rows
            .map(
                (
                    [
                        key,
                        value
                    ]
                ) =>

                    `

                    <div class="kv">

                        <b>
                            ${escapeHtml(
                                key
                            )}
                        </b>

                        <span>
                            ${escapeHtml(
                                value
                            )}
                        </span>

                    </div>

                    `

            )
            .join("")

    );

}


/* ============================================================
   RENDER MEASUREMENTS
   ============================================================ */

function renderMeasurementsResult() {

    const measurements =
        appState.measurements;


    if (
        !measurements ||
        Object.keys(
            measurements
        ).length ===
        0
    ) {

        setHtml(

            "resultMeasurements",

            `<div class="measurement-note">
                Belum ada data.
            </div>`

        );


        return;

    }


    const unit =
        displayUnit();


    const html =
        Object.entries(
            measurements
        )
        .map(
            (
                [
                    key,
                    value
                ]
            ) => {

                const meta =
                    MEASUREMENTS[
                        key
                    ];


                return `

                    <div class="kv">

                        <b>
                            ${escapeHtml(
                                meta?.[0] ||
                                key
                            )}
                        </b>

                        <span>
                            ${Number(
                                toDisplayValue(
                                    value
                                )
                            ).toFixed(1)}
                            ${unit}
                        </span>

                    </div>

                `;

            }
        )
        .join("");


    setHtml(
        "resultMeasurements",
        html
    );

}


/* ============================================================
   RENDER FABRIC
   ============================================================ */

function renderFabricResult() {

    const fabric =
        appState.fabric;


    setHtml(

        "fabricResult",

        `

        <div class="kv">

            <b>Lebar kain</b>

            <span>
                ${fabric.width} cm
            </span>

        </div>

        <div class="kv">

            <b>Panjang kain</b>

            <span>
                ${fabric.length} cm
            </span>

        </div>

        <div class="kv">

            <b>Material</b>

            <span>
                ${escapeHtml(
                    fabric.materialLabel
                )}
            </span>

        </div>

        <div class="kv">

            <b>Stretch</b>

            <span>
                ${escapeHtml(
                    fabric.stretch
                )}
            </span>

        </div>

        <div class="kv">

            <b>Arah stretch</b>

            <span>
                ${escapeHtml(
                    fabric.stretchDirection
                )}
            </span>

        </div>

        <div class="kv">

            <b>Status</b>

            <span>
                Parameter kain tervalidasi
            </span>

        </div>

        `

    );

}


/* ============================================================
   RENDER ENGINE STATUS
   ============================================================ */

function renderEngineStatus() {

    const garmentId =
        $("garmentType")?.value ||
        "tshirt";


    const engine =
        getEngine(
            garmentId
        );


    const label =
        engine

            ? "Engine tersedia"

            : "Engine belum tersedia";


    setText(
        "measurementStatus",
        label
    );

}


/* ============================================================
   RENDER PREVIEW
   ============================================================ */

function drawPatternPreview() {

    const svg =
        $("patternPreview");


    if (
        !svg
    ) {

        return;

    }


    svg.innerHTML =
        "";


    /*
     * Prefer real generated geometry.
     */

    const production =
        appState.production;


    const base =
        production ||
        appState.basePattern;


    if (
        base &&
        Array.isArray(
            base.pieces
        ) &&
        base.pieces.length
    ) {

        renderGeometryPreview(
            svg,
            base.pieces
        );


        return;

    }


    /*
     * Fallback visual only when no engine result exists.
     */

    drawFallbackPreview(
        svg
    );

}


/* ============================================================
   GEOMETRY PREVIEW
   ============================================================ */

function renderGeometryPreview(
    svg,
    pieces
) {

    const ns =
        "http://www.w3.org/2000/svg";


    const allPoints =
        pieces.flatMap(

            piece =>

                piece.cutPoints ||

                piece.points ||

                []

        );


    if (
        allPoints.length ===
        0
    ) {

        drawFallbackPreview(
            svg
        );


        return;

    }


    const xs =
        allPoints.map(
            point =>
                Number(
                    point[0]
                )
        );


    const ys =
        allPoints.map(
            point =>
                Number(
                    point[1]
                )
        );


    const minX =
        Math.min(
            ...xs
        );


    const minY =
        Math.min(
            ...ys
        );


    const maxX =
        Math.max(
            ...xs
        );


    const maxY =
        Math.max(
            ...ys
        );


    const width =
        Math.max(
            1,
            maxX -
            minX
        );


    const height =
        Math.max(
            1,
            maxY -
            minY
        );


    const scale =
        Math.min(

            720 /
            width,

            340 /
            height

        );


    pieces.forEach(
        (
            piece,
            index
        ) => {

            const points =
                piece.cutPoints ||
                piece.points ||
                [];


            if (
                points.length <
                3
            ) {

                return;

            }


            const screenPoints =
                points.map(
                    (
                        [
                            x,
                            y
                        ]
                    ) => [

                        400 +

                        (
                            x -
                            (
                                minX +
                                maxX
                            ) /
                            2

                        )
                        *
                        scale,

                        210 +

                        (
                            (
                                maxY +
                                minY
                            ) /
                            2 -

                            y

                        )
                        *
                        scale

                    ]
                );


            const polygon =
                document.createElementNS(
                    ns,
                    "polygon"
                );


            polygon.setAttribute(

                "points",

                screenPoints
                    .map(
                        point =>
                            point.join(",")
                    )
                    .join(" ")

            );


            polygon.setAttribute(
                "fill",
                "none"
            );


            polygon.setAttribute(
                "stroke",
                "currentColor"
            );


            polygon.setAttribute(
                "stroke-width",
                "1.5"
            );


            svg.appendChild(
                polygon
            );


            const label =
                document.createElementNS(
                    ns,
                    "text"
                );


            label.setAttribute(
                "x",
                "400"
            );


            label.setAttribute(
                "y",
                String(
                    35 +
                    index *
                    18
                )
            );


            label.setAttribute(
                "text-anchor",
                "middle"
            );


            label.setAttribute(
                "font-size",
                "12"
            );


            label.textContent =
                piece.name ||
                `Piece ${index + 1}`;


            svg.appendChild(
                label
            );

        }
    );

}


/* ============================================================
   FALLBACK PREVIEW
   ============================================================ */

function drawFallbackPreview(
    svg
) {

    const ns =
        "http://www.w3.org/2000/svg";


    const rect =
        document.createElementNS(
            ns,
            "rect"
        );


    rect.setAttribute(
        "x",
        "20"
    );


    rect.setAttribute(
        "y",
        "20"
    );


    rect.setAttribute(
        "width",
        "760"
    );


    rect.setAttribute(
        "height",
        "380"
    );


    rect.setAttribute(
        "fill",
        "none"
    );


    rect.setAttribute(
        "stroke",
        "currentColor"
    );


    rect.setAttribute(
        "stroke-width",
        "1"
    );


    svg.appendChild(
        rect
    );


    const text =
        document.createElementNS(
            ns,
            "text"
        );


    text.setAttribute(
        "x",
        "400"
    );


    text.setAttribute(
        "y",
        "210"
    );


    text.setAttribute(
        "text-anchor",
        "middle"
    );


    text.setAttribute(
        "font-size",
        "18"
    );


    text.textContent =
        "Pattern belum dibuat";


    svg.appendChild(
        text
    );

}


/* ============================================================
   RUN GENERATION
   ============================================================ */

function generatePattern() {

    const measurements =
        collectMeasurements();


    const errors =
        validateMeasurements(
            measurements
        );


    if (
        errors.length
    ) {

        appState.errors =
            errors;


        setText(

            "resultStatus",

            errors.join(
                " | "
            )

        );


        const status =
            $("resultStatus");


        if (
            status
        ) {

            status.className =
                "status error";

        }


        return null;

    }


    try {

        const base =
            generateBasePattern();


        appState.generated =
            true;


        appState.basePattern =
            base;


        appState.measurements =
            measurements;


        appState.profile =
            buildProfile(
                measurements
            );


        appState.garment = {

            key:
                $("garmentType")
                    ?.value,

            label:

                GARMENTS[
                    $("garmentType")
                        ?.value
                ]?.label ||

                $("garmentType")
                    ?.value

        };


        appState.fabric =
            buildFabric();


        appState.errors =
            [];


        appState.warnings =
            [];


        /*
         * Grading.
         *
         * A failure here should not destroy the
         * base pattern result. The UI will show the
         * exact failure.
         */

        try {

            appState.graded =
                gradeBasePattern(
                    base
                );

        }
        catch (
            error
        ) {

            appState.graded =
                null;


            appState.warnings.push(

                `Grading: ${error.message}`

            );

        }


        /*
         * Production geometry.
         */

        try {

            if (
                appState.graded &&
                Array.isArray(
                    appState.graded.variants
                )
            ) {

                /*
                 * Use middle/base variant for preview.
                 */

                const baseIndex =
                    Math.floor(

                        appState.graded
                            .variants
                            .length /

                        2

                    );


                appState.production =
                    createProductionPattern(

                        appState
                            .graded
                            .variants[
                                baseIndex
                            ]

                    );

            }
            else {

                appState.production =
                    createProductionPattern(
                        base
                    );

            }

        }
        catch (
            error
        ) {

            appState.production =
                null;


            appState.warnings.push(

                `Production geometry: ${error.message}`

            );

        }


        /*
         * Nesting.
         */

        try {

            if (
                appState.production
            ) {

                appState.nesting =
                    createNestedMarker(

                        appState.production

                    );

            }

        }
        catch (
            error
        ) {

            appState.nesting =
                null;


            appState.warnings.push(

                `Nesting: ${error.message}`

            );

        }


        /*
         * Universal audit.
         */

        appState.audit =
            runUniversalAudit();


        renderResultInfo();

        renderMeasurementsResult();

        renderFabricResult();

        drawPatternPreview();

        renderAuditStatus();


        const status =
            $("resultStatus");


        if (
            status
        ) {

            status.className =
                "status ok";

            status.textContent =

                `Pola berhasil dibuat • ` +

                `${
                    CATEGORY_LABELS[
                        $("category")
                            ?.value
                    ] ||
                    "Custom"
                } • ` +

                `${
                    GARMENTS[
                        $("garmentType")
                            ?.value
                    ]?.label ||
                    "Pattern"
                }`;

        }


        return base;

    }
    catch (
        error
    ) {

        appState.generated =
            false;


        appState.errors =
            [

                error.message

            ];


        const status =
            $("resultStatus");


        if (
            status
        ) {

            status.className =
                "status error";


            status.textContent =
                `Gagal membuat pola: ${error.message}`;

        }


        return null;

    }

}


/* ============================================================
   AUDIT STATUS
   ============================================================ */

function renderAuditStatus() {

    const audit =
        appState.audit;


    if (
        !audit
    ) {

        return;

    }


    const status =
        $("resultStatus");


    if (
        !status
    ) {

        return;

    }


    if (
        audit.valid
    ) {

        status.className =
            "status ok";


        status.textContent +=
            " • Audit PASS";

    }
    else {

        status.className =
            "status error";


        status.textContent +=
            " • Audit belum PASS";

    }

}


/* ============================================================
   RESET
   ============================================================ */

function resetApp() {

    const defaults = {

        category:
            "child",

        sizeSystem:
            "cm",

        age:
            "",

        garmentType:
            "tshirt",

        fabric:
            "cotton",

        fabricWidth:
            "150",

        fabricLength:
            "200",

        stretch:
            "medium",

        stretchDirection:
            "crosswise",

        ease:
            "2",

        seam:
            "1"

    };


    Object.entries(
        defaults
    )
    .forEach(
        (
            [
                id,
                value
            ]
        ) => {

            const element =
                $(id);


            if (
                element
            ) {

                element.value =
                    value;

            }

        }
    );


    appState.generated =
        false;


    appState.basePattern =
        null;


    appState.graded =
        null;


    appState.production =
        null;


    appState.nesting =
        null;


    appState.audit =
        null;


    appState.errors =
        [];


    appState.warnings =
        [];


    renderMeasurementFields();


    setText(

        "resultStatus",

        "Belum ada pola yang dibuat."

    );


    const status =
        $("resultStatus");


    if (
        status
    ) {

        status.className =
            "status";

    }


    setHtml(

        "resultInfo",

        `

        <div class="kv">
            <b>Kategori</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Jenis pakaian</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Material</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Ukuran</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Ease</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Seam allowance</b>
            <span>-</span>
        </div>

        `

    );


    setHtml(

        "resultMeasurements",

        `

        <div class="measurement-note">
            Belum ada data.
        </div>

        `

    );


    setHtml(

        "fabricResult",

        `

        <div class="kv">
            <b>Lebar kain</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Panjang kain</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Material</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Stretch</b>
            <span>-</span>
        </div>

        <div class="kv">
            <b>Status</b>
            <span>Belum dihitung</span>
        </div>

        `

    );


    const preview =
        $("patternPreview");


    if (
        preview
    ) {

        preview.innerHTML =
            "";

    }

}


/* ============================================================
   HTML ESCAPE
   ============================================================ */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ============================================================
   EVENT BINDING
   ============================================================ */

function bindEvents() {

    $("garmentType")
        ?.addEventListener(
            "change",
            () => {

                renderMeasurementFields();

                renderEngineStatus();

            }

        );


    $("sizeSystem")
        ?.addEventListener(
            "change",
            () => {

                renderMeasurementFields();

            }

        );


    $("generateBtn")
        ?.addEventListener(
            "click",
            generatePattern

        );


    $("resetBtn")
        ?.addEventListener(
            "click",
            resetApp

        );


    $("category")
        ?.addEventListener(
            "change",
            () => {

                const category =
                    $("category")
                        ?.value;


                const ageWrap =
                    $("ageWrap");


                if (
                    ageWrap
                ) {

                    const hide =

                        category ===
                            "custom"

                        ||

                        category ===
                            "women"

                        ||

                        category ===
                            "men";


                    ageWrap.classList.toggle(

                        "hidden",

                        hide

                    );

                }

            }

        );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

function initApp() {

    bindEvents();

    renderMeasurementFields();

    renderEngineStatus();

}


/* ============================================================
   BOOT
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        initApp,

        {
            once:
                true
        }

    );

}
else {

    initApp();

}
```
