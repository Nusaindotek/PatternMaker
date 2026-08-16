```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 12 — main.js
 * ============================================================
 *
 * APPLICATION CONTROLLER
 *
 * Alur:
 *
 * UI
 *  ↓
 * Body Profile
 *  ↓
 * Garment
 *  ↓
 * Measurement Validation
 *  ↓
 * Pattern Engine
 *  ↓
 * Production Geometry
 *  ↓
 * Full / Open Preview
 *
 * ============================================================
 */

"use strict";


/* ============================================================
   GLOBAL REFERENCES
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


const LegacyAdapters =
    window.PatternMakerLegacyAdapters;


const ProductionGeometry =
    window.PatternMakerProductionGeometry;


/* ============================================================
   DEPENDENCY VALIDATION
   ============================================================ */

function validateDependencies() {

    const dependencies = {

        Schema,

        Profile,

        Garment,

        Measurements,

        Registry,

        LegacyAdapters,

        ProductionGeometry

    };


    const missing =
        Object.entries(
            dependencies
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

            "PatternMaker dependency belum tersedia: " +
            missing.join(", ")

        );

    }

}


/* ============================================================
   STATE
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

    bodice:
        null,

    sleeve:
        null,

    pattern:
        null,

    productionPattern:
        null,

    productionGeometry:
        null,

    error:
        null

};


/* ============================================================
   DOM
   ============================================================ */

function $(id) {

    return document.getElementById(
        id
    );

}


/* ============================================================
   NUMBER
   ============================================================ */

function getNumber(
    id,
    fallback = 0
) {

    const node =
        $(id);


    if (
        !node
    ) {

        return fallback;

    }


    const value =
        Number(
            node.value
        );


    return Number.isFinite(
        value
    )

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


/* ============================================================
   DRAFT STATUS
   ============================================================ */

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

const MODE_DEFINITIONS = {

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
            "Kontrol fitting dan konstruksi untuk tailor."

    },


    expert: {

        label:
            "Expert / Garment — Profesional",

        description:
            "Kontrol patternmaking dan produksi."

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
        $("modeDescription");


    if (
        description
    ) {

        description.textContent =
            MODE_DEFINITIONS[
                mode
            ].description;

    }


    const result =
        $("modeResult");


    if (
        result
    ) {

        result.textContent =
            `Mode kerja: ${MODE_DEFINITIONS[mode].label}`;

    }

}


/* ============================================================
   CURRENT UNIT
   ============================================================ */

function getUnit() {

    const node =
        $("sizeSystem");


    return (

        node &&
        node.value

    )
        ? node.value
        : "cm";

}


/* ============================================================
   CURRENT GARMENT
   ============================================================ */

function getCurrentGarment() {

    const node =
        $("garmentType");


    return (

        node &&
        node.value

    )
        ? node.value
        : "custom";

}


/* ============================================================
   CURRENT CATEGORY
   ============================================================ */

function getCurrentCategory() {

    const node =
        $("category");


    return (

        node &&
        node.value

    )
        ? node.value
        : "custom";

}


/* ============================================================
   RENDER MEASUREMENT FIELDS
   ============================================================ */

function renderMeasurementFields() {

    const container =
        $("measurementFields");


    if (
        !container
    ) {

        return;

    }


    const garmentId =
        getCurrentGarment();


    const garment =
        Garment.getGarment(
            garmentId
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
                        .toFixed(2);

                }

            }


            const required =
                garment.requiredMeasurements
                    .includes(
                        measurementId
                    );


            html += `

                <div
                    class="measurement-field"
                >

                    <label
                        for="${measurementId}"
                    >

                        ${definition.label}

                        ${required
                            ? " *"
                            : ""}

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

                        ${required
                            ? " • wajib"
                            : " • opsional"}

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
            getCurrentGarment()
        );


    if (
        !garment
    ) {

        node.className =
            "status error";


        node.textContent =
            "Garment tidak ditemukan.";


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
            getCurrentGarment()
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
   COLLECT INPUT
   ============================================================ */

function collectMeasurementInput() {

    const garmentId =
        getCurrentGarment();


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


            const valid =
                Schema.validateMeasurementValue(

                    measurementId,

                    cm

                );


            if (
                !valid.valid
            ) {

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
        required.filter(
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
   CREATE BODY PROFILE
   ============================================================ */

function createCurrentProfile() {

    const input =
        collectMeasurementInput();


    const ageNode =
        $("age");


    const age =

        ageNode &&
        ageNode.value !== ""

            ? Number(
                ageNode.value
            )

            : null;


    const profile =
        Profile.createBodyProfile({

            name:

                `${Schema.getCategoryLabel(
                    getCurrentCategory()
                )} Profile`,

            category:
                getCurrentCategory(),

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

function getFabricInput() {

    const node =
        $("fabric");


    return (

        node &&
        node.value

    )
        ? node.value
        : "cotton";

}


function normalizeFabricForLegacy(
    value
) {

    const text =
        String(
            value || ""
        )
        .toLowerCase();


    if (
        text.includes("rib")
    ) {

        return "rib";

    }


    return "woven";

}


/* ============================================================
   BUILD FABRIC
   ============================================================ */

function buildFabric() {

    if (
        typeof window.createFabric !==
        "function"
    ) {

        /*
         * Fabric engine lama mungkin memakai
         * export module dan belum diekspos global.
         *
         * Untuk sementara kita gunakan data
         * fallback yang tidak merusak pattern flow.
         */

        AppState.fabric = {

            material:
                getFabricInput(),

            width:
                getNumber(
                    "fabricWidth",
                    150
                ),

            length:
                getNumber(
                    "fabricLength",
                    200
                )

        };


        return AppState.fabric;

    }


    const fabric =
        window.createFabric({

            material:
                getFabricInput(),

            width:
                getNumber(
                    "fabricWidth",
                    150
                ),

            length:
                getNumber(
                    "fabricLength",
                    200
                )

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
        $("fabricResult");


    if (
        !container ||
        !fabric
    ) {

        return;

    }


    const material =
        fabric.materialName ||
        fabric.material ||
        "-";


    const width =
        fabric.effectiveWidth ||
        fabric.width ||
        "-";


    const length =
        fabric.length ||
        "-";


    container.innerHTML = `

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
                Lebar Kain
            </b>

            <span>
                ${width} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Panjang Kain
            </b>

            <span>
                ${length} cm
            </span>

        </div>

    `;

}


/* ============================================================
   LEGACY UPPER BODY
   ============================================================ */

function generateLegacyUpperBody(
    garment
) {

    const measurements =
        Measurements.getLegacyMeasurements(
            garment.id
        );


    /*
     * Tambahkan parameter legacy yang
     * dibutuhkan oleh sleeve.js.
     */

    const sleeveMeasurements = {

        ...measurements,

        fabric:
            normalizeFabricForLegacy(
                getFabricInput()
            ),

        negativeEase:
            getNumber(
                "negativeEase",
                0
            )

    };


    /*
     * BODICE
     */

    if (
        typeof window.makeBodice ===
        "function"
    ) {

        AppState.bodice =
            window.makeBodice(
                measurements
            );

    }
    else {

        throw new Error(
            "makeBodice tidak tersedia."
        );

    }


    /*
     * SLEEVE
     */

    if (
        typeof window.makeSleeve ===
        "function"
    ) {

        AppState.sleeve =
            window.makeSleeve(

                sleeveMeasurements,

                AppState.bodice

            );

    }
    else {

        throw new Error(
            "makeSleeve tidak tersedia."
        );

    }


    return {

        bodice:
            AppState.bodice,

        sleeve:
            AppState.sleeve,

        measurements

    };

}


/* ============================================================
   CREATE PRODUCTION GEOMETRY
   ============================================================ */

function buildProductionGeometry() {

    if (
        !ProductionGeometry
    ) {

        throw new Error(
            "Production Geometry engine belum tersedia."
        );

    }


    if (
        !AppState.bodice
    ) {

        throw new Error(
            "Bodice belum dibuat."
        );

    }


    const seam =
        Math.max(
            0,
            getNumber(
                "seam",
                1
            )
        );


    const grainline =
        !$("addGrainline") ||
        $("addGrainline").value !== "no";


    const notches =
        !$("addNotches") ||
        $("addNotches").value !== "no";


    const pattern =
        ProductionGeometry.createProductionPattern({

            bodice:
                AppState.bodice,

            sleeve:
                AppState.sleeve,

            seamAllowance:
                seam,

            grainline,

            notches,

            gap:
                8

        });


    const validation =
        ProductionGeometry.validateProductionPattern(
            pattern
        );


    if (
        !validation.valid
    ) {

        throw new Error(

            "Production geometry tidak valid: " +
            validation.errors.join("; ")

        );

    }


    AppState.productionPattern =
        pattern;


    AppState.productionGeometry =
        pattern.pieces;


    return pattern;

}


/* ============================================================
   FULL / OPEN PREVIEW
   ============================================================ */

function renderFullOpenPreview(
    pattern
) {

    const svg =
        $("patternPreview");


    if (
        !svg ||
        !pattern ||
        !pattern.pieces
    ) {

        return;

    }


    svg.innerHTML =
        "";


    const summary =
        ProductionGeometry.getPatternSummary(
            pattern
        );


    const ns =
        "http://www.w3.org/2000/svg";


    const viewWidth =
        Math.max(
            100,
            summary.width + 20
        );


    const viewHeight =
        Math.max(
            80,
            summary.height + 20
        );


    svg.setAttribute(
        "viewBox",

        `0 0 ${viewWidth} ${viewHeight}`

    );


    svg.setAttribute(
        "preserveAspectRatio",
        "xMidYMid meet"
    );


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
        "0"
    );


    background.setAttribute(
        "y",
        "0"
    );


    background.setAttribute(
        "width",
        viewWidth
    );


    background.setAttribute(
        "height",
        viewHeight
    );


    background.setAttribute(
        "fill",
        "#fafafa"
    );


    svg.appendChild(
        background
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
                        point =>
                            point.join(",")
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
                "0.4"
            );


            svg.appendChild(
                polygon
            );


            /*
             * LABEL
             */

            const bounds =
                piece.bounds;


            const label =
                document.createElementNS(

                    ns,

                    "text"

                );


            label.setAttribute(

                "x",

                (
                    bounds.minX +
                    bounds.maxX
                ) / 2

            );


            label.setAttribute(

                "y",

                Math.max(

                    3,

                    bounds.minY -

                    2

                )

            );


            label.setAttribute(
                "text-anchor",
                "middle"
            );


            label.setAttribute(
                "font-size",
                "2.8"
            );


            label.setAttribute(
                "font-weight",
                "700"
            );


            label.textContent =
                piece.label;


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
                    !$("addGrainline") ||
                    $("addGrainline").value !== "no"
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
             * NOTCHES
             */

            if (
                piece.notches &&
                piece.notches.length
            ) {

                piece.notches.forEach(
                    notch => {

                        const n =
                            document.createElementNS(

                                ns,

                                "line"

                            );


                        n.setAttribute(
                            "x1",
                            notch[0] - 1.2
                        );


                        n.setAttribute(
                            "y1",
                            notch[1] - 1.2
                        );


                        n.setAttribute(
                            "x2",
                            notch[0] + 1.2
                        );


                        n.setAttribute(
                            "y2",
                            notch[1] + 1.2
                        );


                        n.setAttribute(
                            "stroke",
                            "#b42318"
                        );


                        n.setAttribute(
                            "stroke-width",
                            "0.4"
                        );


                        svg.appendChild(
                            n
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

function renderResultInformation() {

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
            getCurrentCategory()
        );


    const profileAge =
        AppState.profile &&
        AppState.profile.age !== null

            ? `${AppState.profile.age} tahun`

            : "-";


    const material =
        AppState.fabric
            ? (
                AppState.fabric.materialName ||
                AppState.fabric.material ||
                "-"
            )
            : "-";


    const pieceCount =
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
                ${profileAge}
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
                Unit Internal
            </b>

            <span>
                cm
            </span>

        </div>


        <div class="kv">

            <b>
                Seam Allowance
            </b>

            <span>
                ${getNumber("seam", 1)} cm
            </span>

        </div>


        <div class="kv">

            <b>
                Pattern Pieces
            </b>

            <span>
                ${pieceCount}
            </span>

        </div>

    `;

}


/* ============================================================
   RESULT MEASUREMENTS
   ============================================================ */

function renderResultMeasurements() {

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


    try {

        setStatus(
            "Memvalidasi ukuran..."
        );


        AppState.garment =
            getCurrentGarment();


        /*
         * BODY PROFILE
         */

        createCurrentProfile();


        /*
         * GARMENT
         */

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
         * PROFILE VALIDATION
         */

        const validation =
            Garment.validateProfileForGarment(

                AppState.profile,

                AppState.garment

            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Ukuran belum lengkap: " +

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

        const fabric =
            buildFabric();


        renderFabricResult(
            fabric
        );


        /*
         * ENGINE AVAILABILITY
         */

        const engineInfo =
            Registry.getGarmentEngineInfo(
                AppState.garment
            );


        /*
         * Saat ini engine nyata yang
         * sudah kita sambungkan adalah bodice.
         */

        if (
            garment.patternEngine !==
            "bodice"
        ) {

            throw new Error(

                `${garment.label} sudah terdaftar, ` +
                `tetapi engine "${garment.patternEngine}" ` +
                `belum diimplementasikan.`

            );

        }


        /*
         * LEGACY BODICE/SLEEVE
         */

        setDraftStatus(
            "Menjalankan bodice engine..."
        );


        generateLegacyUpperBody(
            garment
        );


        /*
         * PRODUCTION GEOMETRY
         */

        setDraftStatus(
            "Membuat production geometry..."
        );


        const productionPattern =
            buildProductionGeometry();


        /*
         * PREVIEW
         */

        renderFullOpenPreview(
            productionPattern
        );


        /*
         * RESULT
         */

        renderResultInformation();

        renderResultMeasurements();


        setDraftStatus(

            `Drafting selesai • ` +

            `${productionPattern.pieces.length} ` +

            `potongan • Full / Open`,

            "ok"

        );


        setStatus(

            `Pola berhasil dibuat • ` +

            `${Schema.getCategoryLabel(
                getCurrentCategory()
            )} • ` +

            `${garment.label}`,

            "ok"

        );


    }
    catch (
        error
    ) {

        console.error(
            "PatternMaker Error:",
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
   PREVIEW FIT
   ============================================================ */

function fitPreview() {

    const preview =
        $("patternPreview");


    if (
        !preview
    ) {

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


    renderFullOpenPreview(

        AppState.productionPattern

    );


    fitPreview();

}


/* ============================================================
   GARMENT CHANGE
   ============================================================ */

function handleGarmentChange() {

    AppState.garment =
        getCurrentGarment();


    AppState.profile =
        null;


    AppState.measurements =
        null;


    AppState.bodice =
        null;


    AppState.sleeve =
        null;


    AppState.productionPattern =
        null;


    AppState.productionGeometry =
        null;


    renderMeasurementFields();

    updateGarmentInformation();


    setDraftStatus(
        "Jenis pakaian berubah. Periksa ukuran kemudian buat pola kembali."
    );

}


/* ============================================================
   UNIT CHANGE
   ============================================================ */

function handleUnitChange() {

    const oldProfile =
        AppState.profile;


    renderMeasurementFields();


    /*
     * Internal profile tetap CM.
     * UI hanya berubah unit.
     */

    AppState.profile =
        oldProfile;

}


/* ============================================================
   MODE CHANGE
   ============================================================ */

function handleModeChange(
    event
) {

    applyMode(
        event.target.value
    );

}


/* ============================================================
   MEASUREMENT CHANGE
   ============================================================ */

function handleMeasurementChange() {

    AppState.profile =
        null;


    AppState.measurements =
        null;


    AppState.bodice =
        null;


    AppState.sleeve =
        null;


    AppState.productionPattern =
        null;


    AppState.productionGeometry =
        null;


    setDraftStatus(
        "Ukuran berubah. Buat pola kembali."
    );

}


/* ============================================================
   RESET
   ============================================================ */

function resetApplication() {

    AppState.profile =
        null;


    AppState.measurements =
        null;


    AppState.bodice =
        null;


    AppState.sleeve =
        null;


    AppState.pattern =
        null;


    AppState.productionPattern =
        null;


    AppState.productionGeometry =
        null;


    AppState.fabric =
        null;


    AppState.error =
        null;


    AppState.garment =
        "tshirt";


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


    renderMeasurementFields();


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


    updateGarmentInformation();


    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    setDraftStatus(
        "Engine drafting siap."
    );

}


/* ============================================================
   BIND EVENTS
   ============================================================ */

function bindEvents() {

    const mode =
        $("userMode");


    if (
        mode
    ) {

        mode.addEventListener(

            "change",

            handleModeChange

        );

    }


    const garment =
        $("garmentType");


    if (
        garment
    ) {

        garment.addEventListener(

            "change",

            handleGarmentChange

        );

    }


    const unit =
        $("sizeSystem");


    if (
        unit
    ) {

        unit.addEventListener(

            "change",

            handleUnitChange

        );

    }


    const generate =
        $("generateBtn");


    if (
        generate
    ) {

        generate.addEventListener(

            "click",

            generatePattern

        );

    }


    const reset =
        $("resetBtn");


    if (
        reset
    ) {

        reset.addEventListener(

            "click",

            resetApplication

        );

    }


    const fit =
        $("fitPreviewBtn");


    if (
        fit
    ) {

        fit.addEventListener(

            "click",

            fitPreview

        );

    }


    const open =
        $("openPreviewBtn");


    if (
        open
    ) {

        open.addEventListener(

            "click",

            openPreview

        );

    }


    /*
     * Measurement inputs dinamis.
     */

    const measurementContainer =
        $("measurementFields");


    if (
        measurementContainer
    ) {

        measurementContainer.addEventListener(

            "input",

            event => {

                if (
                    event.target &&
                    event.target.dataset &&
                    event.target.dataset.measurement
                ) {

                    handleMeasurementChange();

                }

            }

        );

    }

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
        getCurrentGarment();


    applyMode(
        AppState.mode
    );


    renderMeasurementFields();


    updateGarmentInformation();


    bindEvents();


    setDraftStatus(
        "Engine drafting siap."
    );


    setStatus(
        "Masukkan ukuran kemudian tekan BUAT POLA."
    );


    console.log(
        "PatternMaker Universal initialized.",
        AppState
    );

}


/* ============================================================
   STARTUP
   ============================================================ */

initializeApplication();


/* ============================================================
   EXPORT CONTROLLER API
   ============================================================ */

window.PatternMakerApp = {

    state:
        AppState,

    initialize:
        initializeApplication,

    generatePattern,

    renderMeasurementFields,

    renderFullOpenPreview,

    buildProductionGeometry,

    reset:
        resetApplication,

    fitPreview

};
```
