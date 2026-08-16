/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 56
 *
 * FILE:
 *   engine/garment-engine-router.js
 * ============================================================
 *
 * FLOW:
 *
 * GARMENT
 *    ↓
 * patternEngine
 *    ↓
 * Pattern Registry
 *    ↓
 * Engine
 *    ↓
 * generate(context)
 *
 * Router ini TIDAK membuat pola.
 * Router hanya menghubungkan garment contract dengan engine.
 * ============================================================
 */

(function () {

    "use strict";


    const Garment =
        window.PatternMakerGarment;

    const Registry =
        window.PatternMakerPatternRegistry;


    if (
        !Garment
    ) {

        throw new Error(
            "garment.js harus dimuat sebelum garment-engine-router.js."
        );

    }


    if (
        !Registry
    ) {

        throw new Error(
            "pattern-registry.js harus dimuat sebelum garment-engine-router.js."
        );

    }


    const VERSION =
        "FINAL-v1";


    /* ========================================================
       RESOLVE
       ======================================================== */

    function resolveEngine(
        garmentOrId
    ) {

        const garment =
            typeof garmentOrId ===
            "string"

                ? Garment.getGarment(
                    garmentOrId
                )

                : garmentOrId;


        if (
            !garment
        ) {

            throw new Error(
                "Garment tidak ditemukan."
            );

        }


        if (
            !garment.patternEngine
        ) {

            throw new Error(

                `Garment "${garment.id}" ` +
                "tidak memiliki patternEngine."

            );

        }


        const engine =
            Registry.getEngine(
                garment.patternEngine
            );


        if (
            !engine
        ) {

            throw new Error(

                `Pattern engine "${garment.patternEngine}" ` +
                `untuk garment "${garment.id}" belum terdaftar.`

            );

        }


        return {

            garment,

            engine,

            engineId:
                garment.patternEngine

        };

    }


    /* ========================================================
       BUILD CONTEXT
       ======================================================== */

    function buildContext(
        garmentOrId,
        options = {}
    ) {

        const resolved =
            resolveEngine(
                garmentOrId
            );


        return {

            ...options,

            garment:
                resolved.garment,

            garmentId:
                resolved.garment.id,

            patternEngine:
                resolved.engineId

        };

    }


    /* ========================================================
       GENERATE
       ======================================================== */

    function generate(
        garmentOrId,
        context = {}
    ) {

        const resolved =
            resolveEngine(
                garmentOrId
            );


        const finalContext =
            buildContext(
                resolved.garment,
                context
            );


        const result =
            resolved.engine.generate(
                finalContext
            );


        if (
            !result
        ) {

            throw new Error(

                `Engine "${resolved.engineId}" ` +
                "tidak menghasilkan pattern result."

            );

        }


        return {

            ...result,

            metadata: {

                ...(result.metadata || {}),

                routedBy:
                    "garment-engine-router",

                garmentId:
                    resolved.garment.id,

                patternEngine:
                    resolved.engineId,

                routerVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       VALIDATE ROUTING
       ======================================================== */

    function validateGarmentRouting(
        garment
    ) {

        const errors = [];
        const warnings = [];


        if (
            !garment
        ) {

            errors.push(
                "Garment tidak tersedia."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !garment.patternEngine
        ) {

            errors.push(

                `Garment "${garment.id}" ` +
                "tidak memiliki patternEngine."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const engine =
            Registry.getEngine(
                garment.patternEngine
            );


        if (
            !engine
        ) {

            errors.push(

                `Engine "${garment.patternEngine}" ` +
                `belum terdaftar untuk "${garment.id}".`

            );

        }


        if (
            engine &&
            typeof engine.generate !==
            "function"
        ) {

            errors.push(

                `Engine "${garment.patternEngine}" ` +
                "tidak memiliki generate()."

            );

        }


        if (
            engine &&
            garment.patternEngine ===
            "bodice"
        ) {

            warnings.push(

                `Garment "${garment.id}" ` +
                "menggunakan shared bodice engine."

            );

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       VALIDATE ALL GARMENTS
       ======================================================== */

    function validateAllGarments() {

        const result = {

            valid:
                true,

            total:
                0,

            passed:
                0,

            failed:
                0,

            garments:
                {},

            errors:
                [],

            warnings:
                []

        };


        Garment.getAllGarments()
            .forEach(
                garment => {

                    result.total++;


                    const validation =
                        validateGarmentRouting(
                            garment
                        );


                    result.garments[
                        garment.id
                    ] =
                        validation;


                    if (
                        validation.valid
                    ) {

                        result.passed++;

                    }
                    else {

                        result.failed++;

                        result.valid =
                            false;

                        result.errors.push(
                            ...validation.errors
                        );

                    }


                    result.warnings.push(
                        ...validation.warnings
                    );

                }
            );


        return result;

    }


    /* ========================================================
       GENERATION SMOKE TEST
       ======================================================== */

    function smokeTest(
        contextFactory
    ) {

        const result = {

            valid:
                true,

            total:
                0,

            passed:
                0,

            failed:
                0,

            garments:
                {},

            errors:
                []

        };


        Garment.getAllGarments()
            .forEach(
                garment => {

                    /*
                     * Skip custom until a custom engine
                     * is actually registered.
                     */

                    result.total++;


                    try {

                        const context =
                            typeof contextFactory ===
                            "function"

                                ? contextFactory(
                                    garment
                                )

                                : {

                                    profile: {

                                        category:
                                            "custom",

                                        measurements: {

                                            chest:
                                                88,

                                            waist:
                                                72,

                                            hip:
                                                96,

                                            shoulder:
                                                38,

                                            neck:
                                                38,

                                            garmentLength:
                                                60,

                                            sleeveLength:
                                                58,

                                            upperArm:
                                                28,

                                            backLength:
                                                42,

                                            outseam:
                                                100,

                                            crotchDepth:
                                                27,

                                            thigh:
                                                58,

                                            ankle:
                                                24

                                        }

                                    },

                                    fabric: {

                                        ease:
                                            2

                                    },

                                    options: {

                                        notches:
                                            true,

                                        seam:
                                            0,

                                        tolerance:
                                            0

                                    }

                                };


                        const output =
                            generate(
                                garment,
                                context
                            );


                        if (
                            !Array.isArray(
                                output?.pieces
                            ) ||
                            output.pieces.length ===
                                0
                        ) {

                            throw new Error(

                                "Engine menghasilkan " +
                                "result tanpa pieces."

                            );

                        }


                        result.passed++;


                        result.garments[
                            garment.id
                        ] = {

                            valid:
                                true,

                            pieces:
                                output.pieces.length,

                            engine:
                                garment.patternEngine

                        };

                    }
                    catch (
                        error
                    ) {

                        result.failed++;

                        result.valid =
                            false;


                        result.errors.push({

                            garment:
                                garment.id,

                            engine:
                                garment.patternEngine,

                            message:
                                error.message

                        });


                        result.garments[
                            garment.id
                        ] = {

                            valid:
                                false,

                            message:
                                error.message

                        };

                    }

                }
            );


        return result;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug() {

        const routing =
            validateAllGarments();


        console.group(
            "PatternMaker Garment Engine Router"
        );


        console.log(
            "Routing validation:",
            routing
        );


        console.groupEnd();


        return routing;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGarmentEngineRouter = {

        VERSION,

        resolveEngine,

        buildContext,

        generate,

        validateGarmentRouting,

        validateAllGarments,

        smokeTest,

        debug

    };


})();
