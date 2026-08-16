```javascript id="6p8m2r"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 8 — engine/legacy-pattern-adapter.js
 * ============================================================
 *
 * Adapter untuk engine PatternMaker lama.
 *
 * ENGINE ASLI:
 *   bodice.js  -> makeBodice(m)
 *   sleeve.js  -> makeSleeve(m, bodice)
 *
 * Tujuan:
 *   Menghubungkan engine lama ke Pattern Registry baru
 *   tanpa mengubah bodice.js atau sleeve.js.
 *
 * ============================================================
 */

import {
    makeBodice
} from "./bodice.js";


import {
    makeSleeve
} from "./sleeve.js";


/* ============================================================
   VALIDASI GLOBAL REGISTRY
   ============================================================ */

if (
    !window.PatternMakerPatternRegistry
) {

    throw new Error(
        "PatternMakerPatternRegistry belum tersedia. " +
        "Pastikan pattern-registry.js dimuat sebelum " +
        "legacy-pattern-adapter.js."
    );

}


if (
    !window.PatternMakerMeasurements
) {

    throw new Error(
        "PatternMakerMeasurements belum tersedia."
    );

}


const Registry =
    window.PatternMakerPatternRegistry;


const Measurements =
    window.PatternMakerMeasurements;


/* ============================================================
   LEGACY BODICE INPUT NORMALIZER
   ============================================================ */

/**
 * Engine bodice lama mengharapkan:
 *
 * {
 *     bust,
 *     waist,
 *     shoulder,
 *     neck,
 *     bodyLength,
 *     negativeEase
 * }
 *
 * Universal PatternMaker mungkin menyediakan lebih banyak data.
 * Adapter hanya mengambil data yang diperlukan.
 */

function buildBodiceMeasurements(
    context
) {

    const m =
        context.measurements || {};


    return {

        bust:
            Number(m.bust || 0),

        waist:
            Number(m.waist || 0),

        shoulder:
            Number(m.shoulder || 0),

        neck:
            Number(m.neck || 0),

        bodyLength:
            Number(m.bodyLength || 0),

        /*
         * Engine lama menggunakan negativeEase
         * dalam bentuk percentage.
         *
         * Untuk kompatibilitas awal:
         * default = 0.
         *
         * Engine universal berikutnya akan
         * menentukan nilai ini dari fabric + fit.
         */

        negativeEase:
            Number(
                context.options?.negativeEase ??
                0
            )

    };

}


/* ============================================================
   LEGACY SLEEVE INPUT NORMALIZER
   ============================================================ */

/**
 * sleeve.js lama menggunakan:
 *
 *   fabric
 *   negativeEase
 *   upperArm
 *   wrist
 *   sleeveLength
 *
 * dan membutuhkan object bodice sebagai input kedua.
 */

function buildSleeveMeasurements(
    context
) {

    const m =
        context.measurements || {};


    return {

        upperArm:
            Number(m.upperArm || 0),

        wrist:
            Number(m.wrist || 0),

        sleeveLength:
            Number(m.sleeveLength || 0),

        negativeEase:
            Number(
                context.options?.negativeEase ??
                0
            ),

        /*
         * Legacy sleeve.js membedakan:
         *
         * fabric === "rib"
         *
         * dengan fabric woven.
         *
         * Kita pertahankan kontrak lama dahulu.
         */

        fabric:
            normalizeLegacyFabric(
                context.options?.fabric ||
                context.fabric?.material ||
                "woven"
            )

    };

}


/* ============================================================
   LEGACY FABRIC NORMALIZER
   ============================================================ */

function normalizeLegacyFabric(
    fabric
) {

    if (
        !fabric
    ) {

        return "woven";

    }


    const value =
        String(
            fabric
        ).toLowerCase();


    /*
     * Legacy sleeve.js secara spesifik
     * memeriksa "rib".
     */

    if (
        value.includes("rib")
    ) {

        return "rib";

    }


    return "woven";

}


/* ============================================================
   BODICE ENGINE ADAPTER
   ============================================================ */

const BodiceAdapter = {

    id:
        "bodice",

    label:
        "Legacy Bodice Engine",

    version:
        "PatternMaker V1.2 Adapter",

    generate(
        context
    ) {

        const measurements =
            buildBodiceMeasurements(
                context
            );


        validateBodiceInput(
            measurements
        );


        const result =
            makeBodice(
                measurements
            );


        return {

            type:
                "bodice",

            engine:
                "legacy",

            source:
                "engine/bodice.js",

            measurements,

            geometry:
                result,

            metadata: {

                front:
                    Boolean(
                        result.front
                    ),

                back:
                    Boolean(
                        result.back
                    ),

                armholeLength:
                    result.armholeLength,

                armDepth:
                    result.armDepth

            }

        };

    }

};


/* ============================================================
   SLEEVE ENGINE ADAPTER
   ============================================================ */

const SleeveAdapter = {

    id:
        "sleeve",

    label:
        "Legacy Sleeve Engine",

    version:
        "PatternMaker V1.2 Adapter",

    generate(
        context
    ) {

        const bodiceInput =
            buildBodiceMeasurements(
                context
            );


        const sleeveInput =
            buildSleeveMeasurements(
                context
            );


        validateBodiceInput(
            bodiceInput
        );


        validateSleeveInput(
            sleeveInput
        );


        /*
         * Sleeve membutuhkan hasil bodice.
         */

        const bodice =
            makeBodice(
                bodiceInput
            );


        const sleeve =
            makeSleeve(
                sleeveInput,
                bodice
            );


        return {

            type:
                "sleeve",

            engine:
                "legacy",

            source:
                "engine/sleeve.js",

            measurements:
                sleeveInput,

            bodiceReference: {

                armDepth:
                    bodice.armDepth,

                armholeLength:
                    bodice.armholeLength

            },

            geometry:
                sleeve

        };

    }

};


/* ============================================================
   BODICE INPUT VALIDATION
   ============================================================ */

function validateBodiceInput(
    m
) {

    const required = [
        "bust",
        "waist",
        "shoulder",
        "neck",
        "bodyLength"
    ];


    const missing =
        required.filter(
            key =>
                !Number.isFinite(
                    Number(m[key])
                ) ||
                Number(m[key]) <= 0
        );


    if (
        missing.length
    ) {

        throw new Error(
            "Bodice membutuhkan ukuran: " +
            missing.join(", ")
        );

    }

}


/* ============================================================
   SLEEVE INPUT VALIDATION
   ============================================================ */

function validateSleeveInput(
    m
) {

    const required = [
        "upperArm",
        "wrist",
        "sleeveLength"
    ];


    const missing =
        required.filter(
            key =>
                !Number.isFinite(
                    Number(m[key])
                ) ||
                Number(m[key]) <= 0
        );


    if (
        missing.length
    ) {

        throw new Error(
            "Sleeve membutuhkan ukuran: " +
            missing.join(", ")
        );

    }

}


/* ============================================================
   REGISTER ENGINE
   ============================================================ */

Registry.registerEngine(
    "bodice",
    BodiceAdapter
);


Registry.registerEngine(
    "sleeve",
    SleeveAdapter
);


/* ============================================================
   DEBUG INFORMATION
   ============================================================ */

window.PatternMakerLegacyAdapters = {

    BodiceAdapter,

    SleeveAdapter,

    buildBodiceMeasurements,

    buildSleeveMeasurements,

    normalizeLegacyFabric

};
```
