/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 47
 *
 * FILE:
 *   engine/measurements.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 * Compatibility / Measurement Service Layer
 *
 * Source of Truth:
 *
 *   engine/measurement-schema.js
 *   engine/measurement-mapper.js
 *   engine/profile.js
 *
 * ============================================================
 *
 * FLOW:
 *
 * UI / Size System / Legacy Input
 *              ↓
 *      Measurement Mapper
 *              ↓
 *      Canonical Profile
 *              ↓
 *      Measurements Service
 *              ↓
 *      Pattern Engine
 *
 * ============================================================
 *
 * INTERNAL UNIT:
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

    const Profile =
        window.PatternMakerProfile;


    if (
        !Schema
    ) {

        throw new Error(
            "measurement-schema.js harus dimuat sebelum measurements.js."
        );

    }


    if (
        !Mapper
    ) {

        throw new Error(
            "measurement-mapper.js harus dimuat sebelum measurements.js."
        );

    }


    if (
        !Profile
    ) {

        throw new Error(
            "profile.js harus dimuat sebelum measurements.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const INTERNAL_UNIT =
        "cm";


    /* ========================================================
       ACTIVE PROFILE
       ======================================================== */

    let activeProfile =
        null;


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


    function isProfile(
        value
    ) {

        return (

            value instanceof
            Profile.BodyProfile

        );

    }


    /* ========================================================
       PROFILE SETTER
       ======================================================== */

    function setProfile(
        profile
    ) {

        if (
            !profile
        ) {

            activeProfile =
                null;


            return null;

        }


        /*
         * Accept BodyProfile instance.
         */

        if (
            isProfile(
                profile
            )
        ) {

            activeProfile =
                profile;


            return activeProfile;

        }


        /*
         * Accept serialized/plain profile.
         */

        const normalized =
            Profile.fromJSON(
                profile
            );


        activeProfile =
            normalized;


        return activeProfile;

    }


    /* ========================================================
       PROFILE GETTER
       ======================================================== */

    function getProfile() {

        return activeProfile;

    }


    /* ========================================================
       CLEAR PROFILE
       ======================================================== */

    function clearProfile() {

        activeProfile =
            null;

    }


    /* ========================================================
       CREATE PROFILE
       ======================================================== */

    function createProfile(
        options = {}
    ) {

        const profile =
            Profile.createBodyProfile(
                options
            );


        activeProfile =
            profile;


        return profile;

    }


    /* ========================================================
       SET MEASUREMENTS
       ======================================================== */

    function setMeasurements(
        measurements,
        options = {}
    ) {

        if (
            !activeProfile
        ) {

            activeProfile =
                createProfile({

                    category:
                        options.category ||
                        "custom",

                    age:
                        options.age ??
                        null,

                    name:
                        options.name ||
                        "Measurement Profile",

                    source:
                        options.source ||
                        "measurement-service"

                });

        }


        const result =
            activeProfile.setMeasurements(

                measurements,

                {

                    unit:
                        options.unit ||
                        INTERNAL_UNIT

                }

            );


        return {

            profile:
                activeProfile,

            measurements:
                activeProfile
                    .getCanonicalMeasurements(),

            warnings:
                result.warnings || [],

            conflicts:
                result.conflicts || []

        };

    }


    /* ========================================================
       SET ONE
       ======================================================== */

    function setMeasurement(
        id,
        value,
        unit = INTERNAL_UNIT
    ) {

        if (
            !activeProfile
        ) {

            throw new Error(

                "Active profile belum tersedia."

            );

        }


        return activeProfile.setMeasurement(

            id,

            value,

            unit

        );

    }


    /* ========================================================
       GET ONE
       ======================================================== */

    function getMeasurement(
        id,
        unit = INTERNAL_UNIT
    ) {

        if (
            !activeProfile
        ) {

            return null;

        }


        return activeProfile.getMeasurement(

            id,

            unit

        );

    }


    /* ========================================================
       HAS
       ======================================================== */

    function hasMeasurement(
        id
    ) {

        if (
            !activeProfile
        ) {

            return false;

        }


        return activeProfile.hasMeasurement(
            id
        );

    }


    /* ========================================================
       REMOVE
       ======================================================== */

    function removeMeasurement(
        id
    ) {

        if (
            !activeProfile
        ) {

            return false;

        }


        return activeProfile.removeMeasurement(
            id
        );

    }


    /* ========================================================
       CANONICAL MEASUREMENTS
       ======================================================== */

    function getCanonicalMeasurements() {

        if (
            !activeProfile
        ) {

            return {};

        }


        return activeProfile
            .getCanonicalMeasurements();

    }


    /* ========================================================
       CONVERTED MEASUREMENTS
       ======================================================== */

    function getMeasurements(
        unit = INTERNAL_UNIT
    ) {

        if (
            !activeProfile
        ) {

            return {};

        }


        return activeProfile.getMeasurements(
            unit
        );

    }


    /* ========================================================
       LEGACY MEASUREMENTS
       ======================================================== */

    function getLegacyMeasurements(
        garmentId = null
    ) {

        if (
            !activeProfile
        ) {

            return {};

        }


        const canonical =
            activeProfile
                .getCanonicalMeasurements();


        const legacy =
            Mapper.toLegacyObject(
                canonical
            );


        /*
         * Garment-specific compatibility layer.
         *
         * IMPORTANT:
         *
         * This does not create a second source of truth.
         *
         * It only adds common field names expected
         * by older engines.
         */

        if (
            garmentId
        ) {

            return applyGarmentCompatibility(

                legacy,

                garmentId

            );

        }


        return legacy;

    }


    /* ========================================================
       GARMENT COMPATIBILITY
       ======================================================== */

    function applyGarmentCompatibility(
        measurements,
        garmentId
    ) {

        const output = {

            ...measurements

        };


        const id =
            String(
                garmentId ||
                ""
            )
            .toLowerCase();


        /*
         * T-shirt / shirt.
         */

        if (
            id.includes(
                "shirt"
            ) ||
            id.includes(
                "tshirt"
            )
        ) {

            /*
             * Some legacy bodice engines use:
             *
             * chestCircumference
             * shoulderWidth
             * armholeCircumference
             *
             * Those are already emitted by mapper.
             */

            if (
                output.chest ===
                undefined &&
                output.bust !==
                undefined
            ) {

                output.chest =
                    output.bust;

            }

        }


        /*
         * Women's dress / bodice.
         */

        if (
            id.includes(
                "dress"
            ) ||
            id.includes(
                "bodice"
            )
        ) {

            /*
             * If only chest is available,
             * preserve it as bust compatibility.
             *
             * This is compatibility only.
             *
             * It does NOT redefine the canonical
             * measurement.
             */

            if (
                output.bust ===
                undefined &&
                output.chest !==
                undefined
            ) {

                output.bust =
                    output.chest;

            }

        }


        return output;

    }


    /* ========================================================
       MAP RAW INPUT
       ======================================================== */

    function mapInput(
        input,
        options = {}
    ) {

        return Mapper.mapObject(

            input,

            {

                unit:
                    options.unit ||
                    INTERNAL_UNIT

            }

        );

    }


    /* ========================================================
       NORMALIZE RAW INPUT TO CM
       ======================================================== */

    function normalizeInputToCm(
        input,
        options = {}
    ) {

        return Mapper.canonicalizeToCm(

            input,

            {

                unit:
                    options.unit ||
                    INTERNAL_UNIT

            }

        );

    }


    /* ========================================================
       APPLY SIZE PROFILE
       ======================================================== */

    function applySizeProfile(
        sizeProfile
    ) {

        if (
            !activeProfile
        ) {

            throw new Error(

                "Active profile belum tersedia."

            );

        }


        return activeProfile.applySizeProfile(
            sizeProfile
        );

    }


    /* ========================================================
       VALIDATE REQUIRED
       ======================================================== */

    function validateRequired(
        requiredMeasurements
    ) {

        if (
            !activeProfile
        ) {

            return {

                valid:
                    false,

                missing:
                    requiredMeasurements || [],

                labels:
                    [],

                message:
                    "Active profile belum tersedia."

            };

        }


        const result =
            activeProfile.validateRequired(
                requiredMeasurements
            );


        return {

            ...result,

            message:

                result.valid

                    ? ""

                    : (

                        "Measurement wajib belum lengkap: " +

                        result.labels.join(
                            ", "
                        )

                    )

        };

    }


    /* ========================================================
       VALIDATE PROFILE
       ======================================================== */

    function validateProfile() {

        if (
            !activeProfile
        ) {

            return {

                valid:
                    false,

                errors:
                    [
                        "Active profile belum tersedia."
                    ],

                warnings:
                    []

            };

        }


        return Profile.validateProfile(
            activeProfile
        );

    }


    /* ========================================================
       GET GARMENT MEASUREMENTS
       ======================================================== */

    function getGarmentMeasurements(
        garment
    ) {

        if (
            !garment
        ) {

            return {

                measurements:
                    {},

                missing:
                    [],

                valid:
                    false

            };

        }


        const required =
            Schema.getRequiredForGarment(
                garment
            );


        const validation =
            validateRequired(
                required
            );


        return {

            measurements:
                getCanonicalMeasurements(),

            legacyMeasurements:
                getLegacyMeasurements(
                    garment.id
                ),

            required,

            missing:
                validation.missing,

            valid:
                validation.valid

        };

    }


    /* ========================================================
       LEGACY BRIDGE
       ======================================================== */

    function fromLegacyMeasurements(
        measurements,
        options = {}
    ) {

        const normalized =
            normalizeInputToCm(

                measurements,

                {

                    unit:
                        options.unit ||
                        INTERNAL_UNIT

                }

            );


        if (
            !activeProfile
        ) {

            activeProfile =
                createProfile({

                    category:
                        options.category ||
                        "custom",

                    age:
                        options.age ??
                        null,

                    name:
                        options.name ||
                        "Legacy Profile",

                    source:
                        "legacy-adapter"

                });

        }


        activeProfile.setMeasurements(

            normalized.measurements,

            {

                unit:
                    "cm"

            }

        );


        return {

            profile:
                activeProfile,

            measurements:
                getCanonicalMeasurements(),

            warnings:
                normalized.warnings || [],

            conflicts:
                normalized.conflicts || []

        };

    }


    /* ========================================================
       PROFILE SNAPSHOT
       ======================================================== */

    function snapshot() {

        if (
            !activeProfile
        ) {

            return null;

        }


        return clone(
            activeProfile.toJSON()
        );

    }


    /* ========================================================
       RESTORE SNAPSHOT
       ======================================================== */

    function restore(
        data
    ) {

        const profile =
            Profile.fromJSON(
                data
            );


        activeProfile =
            profile;


        return activeProfile;

    }


    /* ========================================================
       EXPORT JSON
       ======================================================== */

    function exportJSON() {

        if (
            !activeProfile
        ) {

            return null;

        }


        return activeProfile.toJSON();

    }


    /* ========================================================
       IMPORT JSON
       ======================================================== */

    function importJSON(
        data
    ) {

        const profile =
            typeof data ===
                "string"

                ? Profile.deserialize(
                    data
                )

                : Profile.fromJSON(
                    data
                );


        activeProfile =
            profile;


        return activeProfile;

    }


    /* ========================================================
       RESOLVE MEASUREMENT ID
       ======================================================== */

    function resolveMeasurementId(
        id
    ) {

        return Mapper.resolve(
            id
        );

    }


    /* ========================================================
       GET DEFINITION
       ======================================================== */

    function getMeasurementDefinition(
        id
    ) {

        return Schema.getMeasurementDefinition(
            id
        );

    }


    /* ========================================================
       CREATE EMPTY MEASUREMENT OBJECT
       ======================================================== */

    function createEmptyMeasurements() {

        const output = {};


        Schema.getMeasurementIds()
            .forEach(
                id => {

                    output[
                        id
                    ] =
                        null;

                }
            );


        return output;

    }


    /* ========================================================
       CURRENT CATEGORY
       ======================================================== */

    function getCategory() {

        return activeProfile
            ?.category ||
            null;

    }


    /* ========================================================
       CURRENT AGE
       ======================================================== */

    function getAge() {

        return (
            activeProfile
                ?.age ??
            null
        );

    }


    /* ========================================================
       CURRENT SIZE
       ======================================================== */

    function getSizeInfo() {

        if (
            !activeProfile
        ) {

            return null;

        }


        return {

            sizeId:
                activeProfile.sizeId,

            sizeLabel:
                activeProfile.sizeLabel

        };

    }


    /* ========================================================
       VALIDATE MEASUREMENT VALUE
       ======================================================== */

    function validateMeasurementValue(
        id,
        value,
        unit = INTERNAL_UNIT
    ) {

        const canonical =
            Mapper.resolve(
                id
            );


        if (
            !canonical
        ) {

            return {

                valid:
                    false,

                message:
                    `Measurement "${id}" tidak dikenal.`

            };

        }


        const valueCm =
            Schema.measurementToCm(
                value,
                unit
            );


        return Schema.validateMeasurementValue(

            canonical,

            valueCm

        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug() {

        console.group(
            "PatternMaker Measurements Service"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Profile:",
            activeProfile
        );


        console.log(
            "Canonical measurements:",
            getCanonicalMeasurements()
        );


        console.log(
            "Legacy measurements:",
            getLegacyMeasurements()
        );


        console.log(
            "Validation:",
            validateProfile()
        );


        console.groupEnd();


        return {

            profile:
                snapshot(),

            canonical:
                getCanonicalMeasurements(),

            legacy:
                getLegacyMeasurements(),

            validation:
                validateProfile()

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerMeasurements = {

        VERSION,

        INTERNAL_UNIT,

        setProfile,

        getProfile,

        clearProfile,

        createProfile,

        setMeasurements,

        setMeasurement,

        getMeasurement,

        hasMeasurement,

        removeMeasurement,

        getCanonicalMeasurements,

        getMeasurements,

        getLegacyMeasurements,

        applyGarmentCompatibility,

        mapInput,

        normalizeInputToCm,

        applySizeProfile,

        validateRequired,

        validateProfile,

        getGarmentMeasurements,

        fromLegacyMeasurements,

        snapshot,

        restore,

        exportJSON,

        importJSON,

        resolveMeasurementId,

        getMeasurementDefinition,

        createEmptyMeasurements,

        getCategory,

        getAge,

        getSizeInfo,

        validateMeasurementValue,

        debug

    };


})();
