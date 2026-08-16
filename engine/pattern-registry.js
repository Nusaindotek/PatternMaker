```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 7 — engine/pattern-registry.js
 * ============================================================
 *
 * Fungsi:
 * - Registry / routing semua pattern engine.
 * - Satu pintu masuk untuk generate pattern.
 * - Menentukan engine berdasarkan garment definition.
 * - Menjaga agar UI tidak bergantung langsung pada engine.
 *
 * STATUS ENGINE:
 *
 * bodice  -> engine lama, siap dihubungkan
 * sleeve  -> engine lama, siap dihubungkan
 * dress   -> belum dibuat
 * skirt   -> belum dibuat
 * pants   -> belum dibuat
 * shirt   -> belum dibuat
 * outer   -> belum dibuat
 * custom  -> belum dibuat
 *
 * Tidak membuat geometri palsu.
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VALIDASI DEPENDENCY
       ======================================================== */

    if (
        !window.PatternMakerGarment
    ) {

        throw new Error(
            "garment.js belum dimuat sebelum pattern-registry.js."
        );

    }


    if (
        !window.PatternMakerMeasurements
    ) {

        throw new Error(
            "measurements.js belum dimuat sebelum pattern-registry.js."
        );

    }


    const Garment =
        window.PatternMakerGarment;


    const Measurements =
        window.PatternMakerMeasurements;


    /* ========================================================
       ENGINE STORE
       ======================================================== */

    const ENGINES = {};


    /* ========================================================
       ENGINE STATUS
       ======================================================== */

    const ENGINE_STATUS = {

        bodice: {
            id: "bodice",
            label: "Bodice Engine",
            status: "legacy-available"
        },

        sleeve: {
            id: "sleeve",
            label: "Sleeve Engine",
            status: "legacy-available"
        },

        dress: {
            id: "dress",
            label: "Dress Engine",
            status: "planned"
        },

        skirt: {
            id: "skirt",
            label: "Skirt Engine",
            status: "planned"
        },

        pants: {
            id: "pants",
            label: "Pants Engine",
            status: "planned"
        },

        shirt: {
            id: "shirt",
            label: "Shirt Engine",
            status: "planned"
        },

        outer: {
            id: "outer",
            label: "Outerwear Engine",
            status: "planned"
        },

        custom: {
            id: "custom",
            label: "Custom Pattern Engine",
            status: "planned"
        }

    };


    /* ========================================================
       REGISTER ENGINE
       ======================================================== */

    function registerEngine(
        engineId,
        engine
    ) {

        if (
            !engineId ||
            typeof engineId !== "string"
        ) {

            throw new Error(
                "engineId harus berupa string."
            );

        }


        if (
            !engine ||
            typeof engine !== "object"
        ) {

            throw new Error(
                `Engine "${engineId}" tidak valid.`
            );

        }


        if (
            typeof engine.generate !== "function"
        ) {

            throw new Error(
                `Engine "${engineId}" harus memiliki fungsi generate().`
            );

        }


        ENGINES[engineId] =
            engine;


        return engine;

    }


    /* ========================================================
       UNREGISTER ENGINE
       ======================================================== */

    function unregisterEngine(
        engineId
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                ENGINES,
                engineId
            )
        ) {

            delete ENGINES[
                engineId
            ];

            return true;

        }


        return false;

    }


    /* ========================================================
       CHECK ENGINE
       ======================================================== */

    function hasEngine(
        engineId
    ) {

        return Boolean(
            ENGINES[
                engineId
            ]
        );

    }


    /* ========================================================
       GET ENGINE
       ======================================================== */

    function getEngine(
        engineId
    ) {

        return (
            ENGINES[
                engineId
            ] || null
        );

    }


    /* ========================================================
       GET ENGINE STATUS
       ======================================================== */

    function getEngineStatus(
        engineId
    ) {

        const definition =
            ENGINE_STATUS[
                engineId
            ];


        if (!definition) {

            return {

                id:
                    engineId,

                label:
                    engineId,

                status:
                    "unknown"

            };

        }


        return {

            ...definition,

            loaded:
                hasEngine(
                    engineId
                )

        };

    }


    /* ========================================================
       GET ALL ENGINE STATUS
       ======================================================== */

    function getAllEngineStatus() {

        return Object.values(
            ENGINE_STATUS
        )
        .map(
            definition => ({

                ...definition,

                loaded:
                    hasEngine(
                        definition.id
                    )

            })
        );

    }


    /* ========================================================
       VALIDATE REQUEST
       ======================================================== */

    function validatePatternRequest(
        garmentId
    ) {

        const garment =
            Garment.getGarment(
                garmentId
            );


        if (!garment) {

            return {

                valid: false,

                reason:
                    "GARMENT_NOT_FOUND",

                message:
                    `Garment "${garmentId}" tidak ditemukan.`

            };

        }


        const required =
            Measurements.validateMeasurements(
                garmentId
            );


        if (
            !required.valid
        ) {

            return {

                valid: false,

                reason:
                    "MEASUREMENT_INCOMPLETE",

                message:
                    "Ukuran belum lengkap.",

                missing:
                    required.missing

            };

        }


        const engineId =
            garment.patternEngine;


        if (!engineId) {

            return {

                valid: false,

                reason:
                    "ENGINE_NOT_DEFINED",

                message:
                    `Garment "${garmentId}" belum memiliki pattern engine.`

            };

        }


        return {

            valid: true,

            garment,

            engineId

        };

    }


    /* ========================================================
       GENERATE PATTERN
       ======================================================== */

    function generatePattern(
        options = {}
    ) {

        const garmentId =
            options.garmentId ||
            Garment.getGarment(
                options.garment
            )?.id;


        if (!garmentId) {

            throw new Error(
                "Garment ID belum ditentukan."
            );

        }


        const request =
            validatePatternRequest(
                garmentId
            );


        if (
            !request.valid
        ) {

            return {

                success: false,

                reason:
                    request.reason,

                message:
                    request.message,

                missing:
                    request.missing || []

            };

        }


        const engine =
            getEngine(
                request.engineId
            );


        if (!engine) {

            return {

                success: false,

                reason:
                    "ENGINE_NOT_LOADED",

                message:
                    `Engine "${request.engineId}" belum tersedia.`,

                garment:
                    request.garment,

                engineStatus:
                    getEngineStatus(
                        request.engineId
                    )

            };

        }


        /*
         * Measurement data dibuat sekali.
         * Semua engine menerima format yang sama.
         */

        const measurements =
            Measurements.getLegacyMeasurements(
                garmentId
            );


        const profile =
            Measurements.getProfile(
                garmentId
            );


        const context = {

            garment:
                request.garment,

            garmentId,

            engineId:
                request.engineId,

            measurements,

            profile,

            options:

                options.options ||
                {},

            mode:
                options.mode ||
                "tailor"

        };


        try {

            const result =
                engine.generate(
                    context
                );


            return {

                success: true,

                garment:
                    request.garment,

                engineId:
                    request.engineId,

                result,

                context

            };

        }
        catch (error) {

            return {

                success: false,

                reason:
                    "ENGINE_ERROR",

                message:
                    error.message,

                error,

                garment:
                    request.garment,

                engineId:
                    request.engineId

            };

        }

    }


    /* ========================================================
       ENGINE CAPABILITY
       ======================================================== */

    function getGarmentEngineInfo(
        garmentId
    ) {

        const garment =
            Garment.getGarment(
                garmentId
            );


        if (!garment) {

            return null;

        }


        const engineId =
            garment.patternEngine;


        return {

            garmentId,

            garmentLabel:
                garment.label,

            engineId,

            loaded:
                hasEngine(
                    engineId
                ),

            status:
                getEngineStatus(
                    engineId
                )

        };

    }


    /* ========================================================
       REGISTER LEGACY BODICE ENGINE
       ========================================================
       
       Fungsi ini sengaja terpisah agar kita dapat
       menyesuaikan API bodice.js lama tanpa mengubah
       registry pada tahap berikutnya.
       ======================================================== */

    function registerLegacyBodiceEngine(
        legacyBodice
    ) {

        if (
            !legacyBodice
        ) {

            throw new Error(
                "Legacy bodice engine tidak diberikan."
            );

        }


        registerEngine(
            "bodice",
            {

                id:
                    "bodice",

                label:
                    "Legacy Bodice Engine",

                generate(
                    context
                ) {

                    /*
                     * ADAPTER SEMENTARA
                     *
                     * Jangan langsung mengasumsikan
                     * nama fungsi bodice lama.
                     *
                     * KODE berikutnya akan melakukan
                     * audit bodice.js dan mengisi adapter
                     * dengan API sebenarnya.
                     */

                    if (
                        typeof legacyBodice.generate
                        === "function"
                    ) {

                        return legacyBodice.generate(
                            context
                        );

                    }


                    if (
                        typeof legacyBodice.makeBodice
                        === "function"
                    ) {

                        return legacyBodice.makeBodice(
                            context.measurements,
                            context.options
                        );

                    }


                    throw new Error(
                        "API bodice.js lama belum memiliki adapter yang cocok."
                    );

                }

            }
        );

    }


    /* ========================================================
       REGISTER LEGACY SLEEVE ENGINE
       ======================================================== */

    function registerLegacySleeveEngine(
        legacySleeve
    ) {

        if (
            !legacySleeve
        ) {

            throw new Error(
                "Legacy sleeve engine tidak diberikan."
            );

        }


        registerEngine(
            "sleeve",
            {

                id:
                    "sleeve",

                label:
                    "Legacy Sleeve Engine",

                generate(
                    context
                ) {

                    if (
                        typeof legacySleeve.generate
                        === "function"
                    ) {

                        return legacySleeve.generate(
                            context
                        );

                    }


                    if (
                        typeof legacySleeve.makeSleeve
                        === "function"
                    ) {

                        return legacySleeve.makeSleeve(
                            context.measurements,
                            context.options
                        );

                    }


                    throw new Error(
                        "API sleeve.js lama belum memiliki adapter yang cocok."
                    );

                }

            }
        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug() {

        return {

            registeredEngines:
                Object.keys(
                    ENGINES
                ),

            status:
                getAllEngineStatus()

        };

    }


    /* ========================================================
       EXPORT GLOBAL
       ======================================================== */

    window.PatternMakerPatternRegistry = {

        registerEngine,

        unregisterEngine,

        hasEngine,

        getEngine,

        getEngineStatus,

        getAllEngineStatus,

        validatePatternRequest,

        generatePattern,

        getGarmentEngineInfo,

        registerLegacyBodiceEngine,

        registerLegacySleeveEngine,

        debug

    };


})();
```
