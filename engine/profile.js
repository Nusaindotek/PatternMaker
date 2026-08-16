/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 46
 *
 * FILE:
 *   engine/profile.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   Canonical Body Profile
 *
 * Flow:
 *
 *   Raw Input
 *       ↓
 *   Measurement Mapper
 *       ↓
 *   Profile
 *
 * ============================================================
 *
 * Profile menyimpan:
 *
 * - category
 * - age
 * - size metadata
 * - canonical measurements
 * - unit internal
 * - source
 * - validation
 *
 * Internal measurement unit:
 *
 *   cm
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Schema =
        window.PatternMakerMeasurementSchema;

    const Mapper =
        window.PatternMakerMeasurementMapper;


    if (
        !Schema
    ) {

        throw new Error(
            "measurement-schema.js harus dimuat sebelum profile.js."
        );

    }


    if (
        !Mapper
    ) {

        throw new Error(
            "measurement-mapper.js harus dimuat sebelum profile.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const INTERNAL_UNIT =
        "cm";


    /* ========================================================
       UTILITY
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


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }


    function numberOrNull(
        value
    ) {

        const number =
            Number(
                value
            );


        return Number.isFinite(
            number
        )
            ? number
            : null;

    }


    /* ========================================================
       BODY PROFILE CLASS
       ======================================================== */

    class BodyProfile {

        constructor(
            options = {}
        ) {

            this.version =
                VERSION;


            this.id =
                options.id ||
                BodyProfile.createId();


            this.name =
                options.name ||
                "Unnamed Profile";


            this.category =
                options.category ||
                "custom";


            this.age =
                numberOrNull(
                    options.age
                );


            this.sizeId =
                options.sizeId ||
                null;


            this.sizeLabel =
                options.sizeLabel ||
                null;


            this.source =
                options.source ||
                "manual";


            this.unit =
                INTERNAL_UNIT;


            this.createdAt =
                options.createdAt ||
                new Date()
                    .toISOString();


            this.updatedAt =
                new Date()
                    .toISOString();


            this.measurements = {};


            this.metadata =
                clone(
                    options.metadata ||
                    {}
                );


            /*
             * Canonicalize initial measurements.
             */

            if (
                options.measurements
            ) {

                this.setMeasurements(

                    options.measurements,

                    {

                        unit:
                            options.unit ||
                            INTERNAL_UNIT

                    }

                );

            }

        }


        /* ====================================================
           ID
           ==================================================== */

        static createId() {

            return (

                "PROFILE-" +

                Date.now() +

                "-" +

                Math.random()
                    .toString(36)
                    .slice(2, 8)

            );

        }


        /* ====================================================
           SET ALL MEASUREMENTS
           ==================================================== */

        setMeasurements(
            measurements,
            options = {}
        ) {

            const unit =
                options.unit ||
                INTERNAL_UNIT;


            const mapped =
                Mapper.canonicalizeToCm(

                    measurements,

                    {
                        unit
                    }

                );


            this.measurements =
                {

                    ...this.measurements,

                    ...mapped.measurements

                };


            this.updatedAt =
                new Date()
                    .toISOString();


            return {

                measurements:
                    clone(
                        this.measurements
                    ),

                warnings:
                    mapped.warnings || [],

                conflicts:
                    mapped.conflicts || []

            };

        }


        /* ====================================================
           SET ONE MEASUREMENT
           ==================================================== */

        setMeasurement(
            id,
            value,
            unit = INTERNAL_UNIT
        ) {

            const canonicalId =
                Mapper.resolve(
                    id
                );


            if (
                !canonicalId
            ) {

                throw new Error(

                    `Measurement "${id}" ` +
                    "tidak dikenal."

                );

            }


            const cm =
                Schema.measurementToCm(
                    value,
                    unit
                );


            if (
                cm === null
            ) {

                throw new Error(

                    `${canonicalId} harus berupa angka.`

                );

            }


            const validation =
                Schema.validateMeasurementValue(

                    canonicalId,

                    cm

                );


            if (
                !validation.valid
            ) {

                throw new Error(
                    validation.message
                );

            }


            this.measurements[
                canonicalId
            ] =
                cm;


            this.updatedAt =
                new Date()
                    .toISOString();


            return cm;

        }


        /* ====================================================
           GET ONE MEASUREMENT
           ==================================================== */

        getMeasurement(
            id,
            unit = INTERNAL_UNIT
        ) {

            const canonicalId =
                Mapper.resolve(
                    id
                );


            if (
                !canonicalId
            ) {

                return null;

            }


            const valueCm =
                this.measurements[
                    canonicalId
                ];


            if (
                valueCm ===
                undefined
            ) {

                return null;

            }


            return Schema.cmToUnit(
                valueCm,
                unit
            );

        }


        /* ====================================================
           HAS
           ==================================================== */

        hasMeasurement(
            id
        ) {

            const canonicalId =
                Mapper.resolve(
                    id
                );


            if (
                !canonicalId
            ) {

                return false;

            }


            return (

                this.measurements[
                    canonicalId
                ] !==
                undefined

            );

        }


        /* ====================================================
           REMOVE
           ==================================================== */

        removeMeasurement(
            id
        ) {

            const canonicalId =
                Mapper.resolve(
                    id
                );


            if (
                !canonicalId
            ) {

                return false;

            }


            if (
                this.measurements[
                    canonicalId
                ] ===
                undefined
            ) {

                return false;

            }


            delete this.measurements[
                canonicalId
            ];


            this.updatedAt =
                new Date()
                    .toISOString();


            return true;

        }


        /* ====================================================
           GET CANONICAL MEASUREMENTS
           ==================================================== */

        getCanonicalMeasurements() {

            return clone(
                this.measurements
            );

        }


        /* ====================================================
           EXPORT IN UNIT
           ==================================================== */

        getMeasurements(
            unit = INTERNAL_UNIT
        ) {

            const output = {};


            Object.entries(
                this.measurements
            )
            .forEach(
                (
                    [
                        id,
                        valueCm
                    ]
                ) => {

                    output[
                        id
                    ] =
                        Schema.cmToUnit(
                            valueCm,
                            unit
                        );

                }
            );


            return output;

        }


        /* ====================================================
           REQUIRED VALIDATION
           ==================================================== */

        validateRequired(
            requiredMeasurements = []
        ) {

            const required =
                requiredMeasurements
                    .map(
                        Mapper.resolve
                    )
                    .filter(
                        Boolean
                    );


            const missing = [];


            required.forEach(
                id => {

                    if (
                        !this.hasMeasurement(
                            id
                        )
                    ) {

                        missing.push(
                            id
                        );

                    }

                }
            );


            return {

                valid:
                    missing.length === 0,

                missing,

                labels:
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
                    )

            };

        }


        /* ====================================================
           FULL VALIDATION
           ==================================================== */

        validate() {

            const errors = [];

            const warnings = [];


            /*
             * Category
             */

            if (
                !Schema.getCategoryDefinition(
                    this.category
                )
            ) {

                errors.push(

                    `Category "${this.category}" tidak dikenal.`

                );

            }


            /*
             * Age
             */

            if (
                this.age !== null
            ) {

                if (
                    this.age < 0
                ) {

                    errors.push(
                        "Umur tidak boleh negatif."
                    );

                }

            }


            /*
             * Measurements
             */

            const measurementValidation =
                Schema.validateMeasurementObject(
                    this.measurements
                );


            if (
                !measurementValidation.valid
            ) {

                errors.push(
                    ...measurementValidation.errors
                );

            }


            warnings.push(
                ...measurementValidation.warnings
            );


            /*
             * Empty profile
             */

            if (
                Object.keys(
                    this.measurements
                ).length === 0
            ) {

                warnings.push(
                    "Profile belum memiliki measurement."
                );

            }


            return {

                valid:
                    errors.length === 0,

                errors,

                warnings

            };

        }


        /* ====================================================
           TO JSON
           ==================================================== */

        toJSON() {

            return {

                version:
                    this.version,

                id:
                    this.id,

                name:
                    this.name,

                category:
                    this.category,

                age:
                    this.age,

                sizeId:
                    this.sizeId,

                sizeLabel:
                    this.sizeLabel,

                source:
                    this.source,

                unit:
                    this.unit,

                measurements:
                    clone(
                        this.measurements
                    ),

                metadata:
                    clone(
                        this.metadata
                    ),

                createdAt:
                    this.createdAt,

                updatedAt:
                    this.updatedAt

            };

        }


        /* ====================================================
           CLONE
           ==================================================== */

        clone() {

            return BodyProfile.fromJSON(
                this.toJSON()
            );

        }


        /* ====================================================
           APPLY SIZE PROFILE
           ==================================================== */

        applySizeProfile(
            sizeProfile
        ) {

            if (
                !sizeProfile
            ) {

                throw new Error(
                    "Size profile kosong."
                );

            }


            const mapped =
                Mapper.mapSizeProfile(
                    sizeProfile
                );


            this.category =
                sizeProfile.category ||
                this.category;


            this.sizeId =
                sizeProfile.sizeId ||
                sizeProfile.id ||
                null;


            this.sizeLabel =
                sizeProfile.sizeLabel ||
                sizeProfile.label ||
                null;


            this.age =
                numberOrNull(
                    sizeProfile.age
                );


            this.source =
                sizeProfile.source ||
                "size-system";


            this.measurements =
                {

                    ...this.measurements,

                    ...(
                        Mapper.canonicalizeToCm(

                            mapped.measurements,

                            {

                                unit:
                                    mapped.unit ||
                                    INTERNAL_UNIT

                            }

                        ).measurements

                    )

                };


            this.updatedAt =
                new Date()
                    .toISOString();


            return {

                profile:
                    this,

                warnings:
                    mapped.warnings || [],

                conflicts:
                    mapped.conflicts || []

            };

        }

    }


    /* ========================================================
       FACTORY
       ======================================================== */

    function createBodyProfile(
        options = {}
    ) {

        return new BodyProfile(
            options
        );

    }


    /* ========================================================
       FROM JSON
       ======================================================== */

    function fromJSON(
        data
    ) {

        if (
            !data ||
            typeof data !==
                "object"
        ) {

            throw new Error(
                "Profile JSON tidak valid."
            );

        }


        return new BodyProfile({

            id:
                data.id,

            name:
                data.name,

            category:
                data.category,

            age:
                data.age,

            sizeId:
                data.sizeId,

            sizeLabel:
                data.sizeLabel,

            source:
                data.source,

            unit:
                data.unit ||
                INTERNAL_UNIT,

            measurements:
                data.measurements ||
                {},

            metadata:
                data.metadata ||
                {},

            createdAt:
                data.createdAt

        });

    }


    /* ========================================================
       PROFILE VALIDATION
       ======================================================== */

    function validateProfile(
        profile
    ) {

        if (
            !profile
        ) {

            return {

                valid:
                    false,

                errors:
                    [
                        "Profile tidak tersedia."
                    ],

                warnings:
                    []

            };

        }


        if (
            profile instanceof
            BodyProfile
        ) {

            return profile.validate();

        }


        /*
         * Accept plain object.
         */

        try {

            const converted =
                fromJSON(
                    profile
                );


            return converted.validate();

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                errors:
                    [
                        error.message
                    ],

                warnings:
                    []

            };

        }

    }


    /* ========================================================
       PROFILE → LEGACY
       ======================================================== */

    function toLegacyMeasurements(
        profile
    ) {

        if (
            !profile
        ) {

            return {};

        }


        const source =
            profile instanceof
            BodyProfile

                ? profile.measurements

                : profile.measurements ||
                  {};


        return Mapper.toLegacyObject(
            source
        );

    }


    /* ========================================================
       PROFILE REGISTRY
       ======================================================== */

    const PROFILE_REGISTRY =
        new Map();


    function registerProfile(
        profile
    ) {

        const instance =
            profile instanceof
            BodyProfile

                ? profile

                : fromJSON(
                    profile
                );


        PROFILE_REGISTRY.set(
            instance.id,
            instance
        );


        return instance;

    }


    function getProfile(
        id
    ) {

        return (
            PROFILE_REGISTRY.get(
                id
            ) ||
            null
        );

    }


    function removeProfile(
        id
    ) {

        return PROFILE_REGISTRY.delete(
            id
        );

    }


    function clearProfiles() {

        PROFILE_REGISTRY.clear();

    }


    /* ========================================================
       SERIALIZATION
       ======================================================== */

    function serialize(
        profile
    ) {

        const instance =
            profile instanceof
            BodyProfile

                ? profile

                : fromJSON(
                    profile
                );


        return JSON.stringify(

            instance.toJSON(),

            null,

            2

        );

    }


    function deserialize(
        json
    ) {

        const data =
            typeof json ===
                "string"

                ? JSON.parse(
                    json
                )

                : json;


        return fromJSON(
            data
        );

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerProfile = {

        VERSION,

        INTERNAL_UNIT,

        BodyProfile,

        createBodyProfile,

        fromJSON,

        validateProfile,

        toLegacyMeasurements,

        registerProfile,

        getProfile,

        removeProfile,

        clearProfiles,

        serialize,

        deserialize

    };


})();
