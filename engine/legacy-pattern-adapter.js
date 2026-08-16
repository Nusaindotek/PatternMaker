/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 23 — engine/legacy-pattern-adapter.js
 * ============================================================
 *
 * LEGACY ENGINE BRIDGE
 *
 * Menghubungkan ES Module lama:
 *
 *     bodice.js
 *     sleeve.js
 *
 * ke arsitektur Universal:
 *
 *     Pattern Registry
 *     main.js
 *     validator
 *     garment engines
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
   DEPENDENCY
   ============================================================ */

const Registry =
    window.PatternMakerPatternRegistry;


if (
    !Registry
) {

    throw new Error(
        "PatternMakerPatternRegistry belum tersedia."
    );

}


/* ============================================================
   BODICE INPUT ADAPTER
   ============================================================ */

function buildBodiceMeasurements(
    context = {}
) {

    const m =
        context.measurements ||
        {};


    return {

        bust:
            Number(
                m.bust || 0
            ),

        waist:
            Number(
                m.waist || 0
            ),

        shoulder:
            Number(
                m.shoulder || 0
            ),

        neck:
            Number(
                m.neck || 0
            ),

        bodyLength:
            Number(
                m.bodyLength || 0
            ),

        negativeEase:
            Number(
                context.options?.negativeEase || 0
            )

    };

}


/* ============================================================
   SLEEVE INPUT ADAPTER
   ============================================================ */

function buildSleeveMeasurements(
    context = {}
) {

    const m =
        context.measurements ||
        {};


    const fabric =
        String(
            context.fabric?.material ||
            context.options?.fabric ||
            "woven"
        )
        .toLowerCase();


    return {

        upperArm:
            Number(
                m.upperArm || 0
            ),

        wrist:
            Number(
                m.wrist || 0
            ),

        sleeveLength:
            Number(
                m.sleeveLength || 0
            ),

        negativeEase:
            Number(
                context.options?.negativeEase || 0
            ),

        fabric:
            fabric.includes("rib")
                ? "rib"
                : "woven"

    };

}


/* ============================================================
   VALIDATE BODICE INPUT
   ============================================================ */

function validateBodiceInput(
    measurements
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
            key => {

                const value =
                    Number(
                        measurements[key]
                    );


                return (

                    !Number.isFinite(
                        value
                    ) ||

                    value <= 0

                );

            }
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
   VALIDATE SLEEVE INPUT
   ============================================================ */

function validateSleeveInput(
    measurements
) {

    const required = [

        "upperArm",
        "wrist",
        "sleeveLength"

    ];


    const missing =
        required.filter(
            key => {

                const value =
                    Number(
                        measurements[key]
                    );


                return (

                    !Number.isFinite(
                        value
                    ) ||

                    value <= 0

                );

            }
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
   BODICE ADAPTER
   ============================================================ */

const BodiceAdapter = {

    id:
        "bodice",

    label:
        "Legacy Bodice Engine Adapter",

    version:
        "2.0",

    generate(
        context = {}
    ) {

        const measurements =
            buildBodiceMeasurements(
                context
            );


        validateBodiceInput(
            measurements
        );


        const geometry =
            makeBodice(
                measurements
            );


        if (
            !geometry
        ) {

            throw new Error(
                "makeBodice() tidak menghasilkan geometry."
            );

        }


        return {

            type:
                "bodice",

            engine:
                "bodice",

            geometry,

            measurements,

            metadata: {

                source:
                    "engine/bodice.js",

                adapter:
                    "legacy-pattern-adapter",

                version:
                    "2.0"

            }

        };

    }

};


/* ============================================================
   SLEEVE ADAPTER
   ============================================================ */

const SleeveAdapter = {

    id:
        "sleeve",

    label:
        "Legacy Sleeve Engine Adapter",

    version:
        "2.0",

    generate(
        context = {}
    ) {

        const bodiceMeasurements =
            buildBodiceMeasurements(
                context
            );


        const sleeveMeasurements =
            buildSleeveMeasurements(
                context
            );


        validateBodiceInput(
            bodiceMeasurements
        );


        validateSleeveInput(
            sleeveMeasurements
        );


        const bodice =
            makeBodice(
                bodiceMeasurements
            );


        if (
            !bodice
        ) {

            throw new Error(
                "makeBodice() gagal menghasilkan base."
            );

        }


        const geometry =
            makeSleeve(

                sleeveMeasurements,

                bodice

            );


        if (
            !geometry
        ) {

            throw new Error(
                "makeSleeve() tidak menghasilkan geometry."
            );

        }


        return {

            type:
                "sleeve",

            engine:
                "sleeve",

            geometry,

            measurements:
                sleeveMeasurements,

            bodiceReference: {

                armDepth:
                    bodice.armDepth,

                armholeLength:
                    bodice.armholeLength

            },

            metadata: {

                source:
                    "engine/sleeve.js",

                adapter:
                    "legacy-pattern-adapter",

                version:
                    "2.0"

            }

        };

    }

};


/* ============================================================
   REGISTER
   ============================================================ */

Registry.registerEngine(

    "bodice",

    BodiceAdapter

);


/*
 * Sleeve didaftarkan untuk kebutuhan adapter,
 * walaupun garment saat ini memakai bodice sebagai
 * primary engine.
 */

Registry.registerEngine(

    "sleeve",

    SleeveAdapter

);


/* ============================================================
   GLOBAL COMPATIBILITY API
   ============================================================
 *
 * Ini bagian penting dari KODE 23.
 *
 * Engine lama adalah ES Module.
 * Controller lama/universal membutuhkan API global.
 *
 * Kita expose hanya melalui bridge ini.
 *
 * Bodice.js dan sleeve.js sendiri TIDAK diubah.
 */

window.makeBodice =
    makeBodice;


window.makeSleeve =
    makeSleeve;


/* ============================================================
   UNIVERSAL LEGACY API
   ============================================================ */

window.PatternMakerLegacyAdapters = {

    BodiceAdapter,

    SleeveAdapter,

    buildBodiceMeasurements,

    buildSleeveMeasurements,

    validateBodiceInput,

    validateSleeveInput,

    makeBodice,

    makeSleeve

};


/* ============================================================
   READY INFORMATION
   ============================================================ */

console.log(
    "PatternMaker Legacy Adapter ready.",
    {
        bodice:
            typeof window.makeBodice ===
            "function",

        sleeve:
            typeof window.makeSleeve ===
            "function"

    }
);
