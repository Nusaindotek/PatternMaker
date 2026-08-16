/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 49
 *
 * FILE:
 *   engine/pattern-registry.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   Central Pattern Engine Registry
 *
 * Flow:
 *
 *   Garment
 *      ↓
 *   patternEngine ID
 *      ↓
 *   Registry
 *      ↓
 *   Engine
 *      ↓
 *   generate(context)
 *
 * ============================================================
 *
 * Registry TIDAK membuat pattern.
 * Registry hanya:
 *
 * - register engine
 * - resolve engine
 * - validate engine contract
 * - expose engine catalog
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       ENGINE REGISTRY
       ======================================================== */

    const ENGINES =
        new Map();


    /* ========================================================
       CUSTOM ENGINE REGISTRY
       ======================================================== */

    const CUSTOM_ENGINES =
        new Map();


    /* ========================================================
       CLONE
       ======================================================== */

    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                value
            );

        }


        /*
         * Engine object may contain functions.
         *
         * Therefore do not JSON-clone it.
         */

        return value;

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

    function validateEngineContract(
        engine
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !engine ||
            typeof engine !==
                "object"
        ) {

            errors.push(
                "Engine harus berupa object."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !engine.id
        ) {

            errors.push(
                "Engine tidak memiliki id."
            );

        }


        if (
            !engine.label
        ) {

            warnings.push(
                `Engine "${engine.id || "unknown"}" tidak memiliki label.`
            );

        }


        if (
            typeof engine.generate !==
            "function"
        ) {

            errors.push(

                `Engine "${engine.id || "unknown"}" ` +
                "tidak memiliki generate(context)."

            );

        }


        if (
            engine.version ===
            undefined
        ) {

            warnings.push(

                `Engine "${engine.id || "unknown"}" ` +
                "tidak memiliki version."

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
       REGISTER
       ======================================================== */

    function registerEngine(
        engine,
        options = {}
    ) {

        const validation =
            validateEngineContract(
                engine
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Engine registration gagal: " +

                validation.errors.join(
                    " | "
                )

            );

        }


        const id =
            String(
                engine.id
            )
            .trim();


        if (
            ENGINES.has(
                id
            ) &&
            options.replace !==
            true
        ) {

            throw new Error(

                `Pattern engine "${id}" sudah terdaftar.`

            );

        }


        ENGINES.set(
            id,
            engine
        );


        return engine;

    }


    /* ========================================================
       REGISTER CUSTOM
       ======================================================== */

    function registerCustomEngine(
        engine,
        options = {}
    ) {

        const validation =
            validateEngineContract(
                engine
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Custom engine registration gagal: " +

                validation.errors.join(
                    " | "
                )

            );

        }


        const id =
            String(
                engine.id
            )
            .trim();


        if (
            CUSTOM_ENGINES.has(
                id
            ) &&
            options.replace !==
            true
        ) {

            throw new Error(

                `Custom engine "${id}" sudah terdaftar.`

            );

        }


        CUSTOM_ENGINES.set(
            id,
            engine
        );


        return engine;

    }


    /* ========================================================
       GET ENGINE
       ======================================================== */

    function getEngine(
        engineId
    ) {

        if (
            !engineId
        ) {

            return null;

        }


        return (

            ENGINES.get(
                engineId
            )

            ||

            CUSTOM_ENGINES.get(
                engineId
            )

            ||

            null

        );

    }


    /* ========================================================
       HAS ENGINE
       ======================================================== */

    function hasEngine(
        engineId
    ) {

        return Boolean(

            getEngine(
                engineId
            )

        );

    }


    /* ========================================================
       REMOVE ENGINE
       ======================================================== */

    function removeEngine(
        engineId
    ) {

        if (
            ENGINES.has(
                engineId
            )
        ) {

            return ENGINES.delete(
                engineId
            );

        }


        if (
            CUSTOM_ENGINES.has(
                engineId
            )
        ) {

            return CUSTOM_ENGINES.delete(
                engineId
            );

        }


        return false;

    }


    /* ========================================================
       ENGINE IDS
       ======================================================== */

    function getEngineIds() {

        return [

            ...ENGINES.keys(),

            ...CUSTOM_ENGINES.keys()

        ];

    }


    /* ========================================================
       ALL ENGINES
       ======================================================== */

    function getAllEngines() {

        return [

            ...ENGINES.values(),

            ...CUSTOM_ENGINES.values()

        ];

    }


    /* ========================================================
       BUILT-IN ENGINE IDS
       ======================================================== */

    function getBuiltInEngineIds() {

        return [

            ...ENGINES.keys()

        ];

    }


    /* ========================================================
       CUSTOM ENGINE IDS
       ======================================================== */

    function getCustomEngineIds() {

        return [

            ...CUSTOM_ENGINES.keys()

        ];

    }


    /* ========================================================
       ENGINE INFO
       ======================================================== */

    function getEngineInfo(
        engineId
    ) {

        const engine =
            getEngine(
                engineId
            );


        if (
            !engine
        ) {

            return null;

        }


        return {

            id:
                engine.id,

            label:
                engine.label ||
                engine.id,

            version:
                engine.version ||
                null,

            source:
                ENGINES.has(
                    engineId
                )
                    ? "builtin"
                    : "custom",

            hasGenerate:
                typeof engine.generate ===
                "function"

        };

    }


    /* ========================================================
       REGISTER FROM GLOBAL
       ======================================================== */

    function registerGlobalEngine(
        globalName,
        engineId = null
    ) {

        const engine =
            window[
                globalName
            ];


        if (
            !engine
        ) {

            throw new Error(

                `Global engine "${globalName}" tidak ditemukan.`

            );

        }


        if (
            engineId &&
            !engine.id
        ) {

            engine.id =
                engineId;

        }


        return registerEngine(
            engine
        );

    }


    /* ========================================================
       ENGINE RESOLUTION
       ======================================================== */

    function resolve(
        engineId
    ) {

        return getEngine(
            engineId
        );

    }


    /* ========================================================
       GENERATE
       ======================================================== */

    function generate(
        engineId,
        context
    ) {

        const engine =
            getEngine(
                engineId
            );


        if (
            !engine
        ) {

            throw new Error(

                `Pattern engine "${engineId}" ` +
                "tidak terdaftar."

            );

        }


        if (
            typeof engine.generate !==
            "function"
        ) {

            throw new Error(

                `Pattern engine "${engineId}" ` +
                "tidak memiliki generate()."

            );

        }


        return engine.generate(
            context
        );

    }


    /* ========================================================
       VALIDATE REGISTRY
       ======================================================== */

    function validateRegistry() {

        const result = {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            engines:
                {}

        };


        getAllEngines()
            .forEach(
                engine => {

                    const validation =
                        validateEngineContract(
                            engine
                        );


                    result.engines[
                        engine.id
                    ] =
                        validation;


                    if (
                        !validation.valid
                    ) {

                        result.valid =
                            false;


                        result.errors.push(
                            ...validation.errors
                        );

                    }


                    if (
                        validation.warnings.length
                    ) {

                        result.warnings.push(
                            ...validation.warnings
                        );

                    }

                }
            );


        return result;

    }


    /* ========================================================
       GARMENT ENGINE COMPATIBILITY
       ======================================================== */

    function validateGarmentEngine(
        garment
    ) {

        const errors =
            [];

        const warnings =
            [];


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
            getEngine(
                garment.patternEngine
            );


        if (
            !engine
        ) {

            errors.push(

                `Garment "${garment.id}" ` +
                `menggunakan engine "${garment.patternEngine}" ` +
                "yang belum terdaftar."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const validation =
            validateEngineContract(
                engine
            );


        errors.push(
            ...validation.errors
        );


        warnings.push(
            ...validation.warnings
        );


        return {

            valid:
                errors.length === 0,

            errors,

            warnings,

            engine:

                {

                    id:
                        engine.id,

                    version:
                        engine.version ||
                        null

                }

        };

    }


    /* ========================================================
       BATCH GARMENT AUDIT
       ======================================================== */

    function validateGarmentCatalog(
        garments
    ) {

        const result = {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            garments:
                {}

        };


        (
            garments ||
            []
        )
        .forEach(
            garment => {

                const validation =
                    validateGarmentEngine(
                        garment
                    );


                result.garments[
                    garment.id
                ] =
                    validation;


                if (
                    !validation.valid
                ) {

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
       BUILT-IN REGISTRATION
       ========================================================
       Built-in engine globals are registered only
       when available.
       ======================================================== */

    function registerBuiltInEngines() {

        const candidates = [

            "PatternMakerBodice",

            "PatternMakerSleeve",

            "PatternMakerShirt",

            "PatternMakerDress",

            "PatternMakerSkirt",

            "PatternMakerPants",

            "PatternMakerShorts"

        ];


        const registered = [];


        candidates.forEach(
            globalName => {

                const engine =
                    window[
                        globalName
                    ];


                if (
                    !engine
                ) {

                    return;

                }


                try {

                    registerEngine(
                        engine,
                        {
                            replace:
                                true
                        }
                    );


                    registered.push(
                        engine.id
                    );

                }
                catch (
                    error
                ) {

                    console.warn(

                        `PatternMaker: gagal register ` +
                        `${globalName}:`,

                        error

                    );

                }

            }
        );


        return registered;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug() {

        const validation =
            validateRegistry();


        console.group(
            "PatternMaker Pattern Registry"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Built-in engines:",
            getBuiltInEngineIds()
        );


        console.log(
            "Custom engines:",
            getCustomEngineIds()
        );


        console.log(
            "Validation:",
            validation
        );


        console.groupEnd();


        return validation;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerPatternRegistry = {

        VERSION,

        registerEngine,

        registerCustomEngine,

        registerGlobalEngine,

        registerBuiltInEngines,

        getEngine,

        resolve,

        hasEngine,

        removeEngine,

        getEngineIds,

        getAllEngines,

        getBuiltInEngineIds,

        getCustomEngineIds,

        getEngineInfo,

        generate,

        validateEngineContract,

        validateRegistry,

        validateGarmentEngine,

        validateGarmentCatalog,

        debug

    };


})();
