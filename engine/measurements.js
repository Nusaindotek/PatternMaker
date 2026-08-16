```javascript id="j7x5kp"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 6 — engine/measurements.js
 * ============================================================
 *
 * STATUS:
 * REFACTOR dari measurements.js lama
 *
 * Tugas:
 * - Membaca ukuran dari UI/DOM
 * - Menggunakan measurement-schema.js
 * - Membuat BodyProfile
 * - Menyimpan nilai internal dalam CM
 * - Validasi ukuran
 * - Menjaga kompatibilitas dengan engine lama
 *
 * DEPENDENCY:
 *
 * measurement-schema.js
 * profile.js
 * garment.js
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VALIDASI DEPENDENCY
       ======================================================== */

    if (
        !window.PatternMakerMeasurementSchema
    ) {

        throw new Error(
            "measurement-schema.js belum dimuat."
        );

    }


    if (
        !window.PatternMakerProfile
    ) {

        throw new Error(
            "profile.js belum dimuat."
        );

    }


    if (
        !window.PatternMakerGarment
    ) {

        throw new Error(
            "garment.js belum dimuat."
        );

    }


    const Schema =
        window.PatternMakerMeasurementSchema;

    const Profile =
        window.PatternMakerProfile;

    const Garment =
        window.PatternMakerGarment;


    /* ========================================================
       STATE
       ======================================================== */

    let currentProfile = null;


    /* ========================================================
       DOM HELPER
       ======================================================== */

    function getElement(
        id
    ) {

        return document.getElementById(
            id
        );

    }


    /* ========================================================
       SAFE NUMBER
       ======================================================== */

    function getNumber(
        id
    ) {

        const element =
            getElement(id);


        if (!element) {

            return null;

        }


        const value =
            Number(
                element.value
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            return null;

        }


        return value;

    }


    /* ========================================================
       READ UNIT
       ======================================================== */

    function getInputUnit() {

        const element =
            getElement(
                "sizeSystem"
            );


        if (
            !element ||
            !element.value
        ) {

            return "cm";

        }


        return element.value;

    }


    /* ========================================================
       READ CATEGORY
       ======================================================== */

    function getCategory() {

        const element =
            getElement(
                "category"
            );


        if (
            !element ||
            !element.value
        ) {

            return "custom";

        }


        return element.value;

    }


    /* ========================================================
       READ AGE
       ======================================================== */

    function getAge() {

        const element =
            getElement(
                "age"
            );


        if (
            !element ||
            element.value === ""
        ) {

            return null;

        }


        const value =
            Number(
                element.value
            );


        return Number.isFinite(
            value
        )
            ? value
            : null;

    }


    /* ========================================================
       GET CURRENT GARMENT
       ======================================================== */

    function getCurrentGarment() {

        const element =
            getElement(
                "garmentType"
            );


        if (
            !element ||
            !element.value
        ) {

            return "custom";

        }


        return element.value;

    }


    /* ========================================================
       MEASUREMENT FIELD LIST
       ======================================================== */

    function getMeasurementIds(
        garmentType = getCurrentGarment()
    ) {

        const garment =
            Garment.getGarment(
                garmentType
            );


        if (!garment) {

            return [];

        }


        return [
            ...new Set([
                ...garment.requiredMeasurements,
                ...garment.optionalMeasurements
            ])
        ];

    }


    /* ========================================================
       READ MEASUREMENTS FROM DOM
       ======================================================== */

    function readMeasurementsFromDOM(
        garmentType = getCurrentGarment()
    ) {

        const unit =
            getInputUnit();


        const ids =
            getMeasurementIds(
                garmentType
            );


        const measurements = {};


        ids.forEach(
            measurementId => {

                const value =
                    getNumber(
                        measurementId
                    );


                /*
                 * Field lama PatternMaker
                 * mungkin belum mempunyai ID
                 * untuk semua measurement baru.
                 *
                 * Karena itu field yang tidak ada
                 * tidak langsung menyebabkan crash.
                 */

                if (
                    value === null
                ) {

                    return;

                }


                measurements[
                    measurementId
                ] = value;

            }
        );


        return {

            unit,

            measurements

        };

    }


    /* ========================================================
       CREATE PROFILE FROM DOM
       ======================================================== */

    function createProfileFromDOM(
        garmentType = getCurrentGarment()
    ) {

        const input =
            readMeasurementsFromDOM(
                garmentType
            );


        const profile =
            Profile.createBodyProfile({

                name:
                    buildProfileName(),

                category:
                    getCategory(),

                age:
                    getAge(),

                unit:
                    input.unit,

                source:
                    "dom"

            });


        Object.entries(
            input.measurements
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


        currentProfile =
            profile;


        return profile;

    }


    /* ========================================================
       PROFILE NAME
       ======================================================== */

    function buildProfileName() {

        const category =
            Schema.getCategoryLabel(
                getCategory()
            );


        const age =
            getAge();


        if (
            age !== null
        ) {

            return `${category} • ${age} tahun`;

        }


        return category;

    }


    /* ========================================================
       VALIDATE CURRENT PROFILE
       ======================================================== */

    function validateMeasurements(
        garmentType = getCurrentGarment()
    ) {

        if (
            !currentProfile
        ) {

            currentProfile =
                createProfileFromDOM(
                    garmentType
                );

        }


        const result =
            Garment.validateProfileForGarment(
                currentProfile,
                garmentType
            );


        return result;

    }


    /* ========================================================
       GET COMPLETE MEASUREMENTS
       ======================================================== */

    function getMeasurements(
        garmentType = getCurrentGarment()
    ) {

        if (
            !currentProfile
        ) {

            currentProfile =
                createProfileFromDOM(
                    garmentType
                );

        }


        /*
         * Return plain object agar
         * engine lama seperti bodice.js
         * tetap bisa menerima object measurements.
         */

        return {
            ...currentProfile.measurements
        };

    }


    /* ========================================================
       GET PROFILE
       ======================================================== */

    function getProfile(
        garmentType = getCurrentGarment()
    ) {

        if (
            !currentProfile
        ) {

            currentProfile =
                createProfileFromDOM(
                    garmentType
                );

        }


        return currentProfile;

    }


    /* ========================================================
       SET PROFILE
       ======================================================== */

    function setProfile(
        profile
    ) {

        if (
            !profile
        ) {

            throw new Error(
                "Profile tidak boleh kosong."
            );

        }


        if (
            !(
                profile
                instanceof Profile.BodyProfile
            )
        ) {

            throw new Error(
                "Object harus berupa BodyProfile."
            );

        }


        currentProfile =
            profile;


        return currentProfile;

    }


    /* ========================================================
       CLEAR PROFILE
       ======================================================== */

    function clearProfile() {

        currentProfile =
            null;

    }


    /* ========================================================
       CHECK REQUIRED FIELD
       ======================================================== */

    function getMissingMeasurements(
        garmentType = getCurrentGarment()
    ) {

        const result =
            validateMeasurements(
                garmentType
            );


        return result.missing
            .map(
                item =>
                    item.id
            );

    }


    /* ========================================================
       FORMAT VALUE
       ======================================================== */

    function formatMeasurement(
        measurementId,
        value,
        outputUnit = null
    ) {

        const unit =
            outputUnit ||
            getInputUnit();


        const cm =
            Schema.measurementToCm(
                value,
                getInputUnit()
            );


        const display =
            Schema.measurementFromCm(
                cm,
                unit
            );


        const definition =
            Schema.getMeasurementDefinition(
                measurementId
            );


        if (!definition) {

            return {

                value:
                    display,

                unit

            };

        }


        return {

            value:
                Number(
                    display.toFixed(2)
                ),

            unit,

            label:
                definition.label

        };

    }


    /* ========================================================
       GET SUMMARY
       ======================================================== */

    function getSummary(
        garmentType = getCurrentGarment()
    ) {

        const profile =
            getProfile(
                garmentType
            );


        const validation =
            validateMeasurements(
                garmentType
            );


        return {

            profile:
                profile.toJSON(),

            garment:
                Garment.getGarmentUIData(
                    garmentType
                ),

            validation,

            measurements:
                {
                    ...profile.measurements
                }

        };

    }


    /* ========================================================
       BACKWARD COMPATIBILITY
       ========================================================
       
       Engine lama biasanya memerlukan:
       
       {
           bust,
           waist,
           hip,
           shoulder,
           ...
       }
       
       Fungsi ini mempertahankan
       bentuk object tersebut.
       ======================================================== */

    function getLegacyMeasurements(
        garmentType = getCurrentGarment()
    ) {

        const measurements =
            getMeasurements(
                garmentType
            );


        return {

            bust:
                measurements.bust ??
                null,

            waist:
                measurements.waist ??
                null,

            hip:
                measurements.hip ??
                null,

            shoulder:
                measurements.shoulder ??
                null,

            neck:
                measurements.neck ??
                null,

            bodyLength:
                measurements.bodyLength ??
                null,

            dressLength:
                measurements.dressLength ??
                null,

            skirtLength:
                measurements.skirtLength ??
                null,

            upperArm:
                measurements.upperArm ??
                null,

            elbow:
                measurements.elbow ??
                null,

            wrist:
                measurements.wrist ??
                null,

            sleeveLength:
                measurements.sleeveLength ??
                null,

            armhole:
                measurements.armhole ??
                null,

            rise:
                measurements.rise ??
                null,

            pantsLength:
                measurements.pantsLength ??
                null,

            shortsLength:
                measurements.shortsLength ??
                null,

            thigh:
                measurements.thigh ??
                null,

            knee:
                measurements.knee ??
                null,

            hem:
                measurements.hem ??
                null,

            height:
                measurements.height ??
                null

        };

    }


    /* ========================================================
       APPLY PROFILE TO DOM
       ======================================================== */

    function applyProfileToDOM(
        profile
    ) {

        if (
            !profile
        ) {

            return false;

        }


        const unit =
            getInputUnit();


        Object.entries(
            profile.measurements
        )
        .forEach(
            ([id, cmValue]) => {

                const element =
                    getElement(id);


                if (!element) {

                    return;

                }


                const displayValue =
                    Schema.measurementFromCm(
                        cmValue,
                        unit
                    );


                element.value =
                    Number(
                        displayValue.toFixed(2)
                    );

            }
        );


        const categoryElement =
            getElement(
                "category"
            );


        if (
            categoryElement &&
            profile.category
        ) {

            categoryElement.value =
                profile.category;

        }


        const ageElement =
            getElement(
                "age"
            );


        if (
            ageElement &&
            profile.age !== null
        ) {

            ageElement.value =
                profile.age;

        }


        currentProfile =
            profile;


        return true;

    }


    /* ========================================================
       DEBUG INFORMATION
       ======================================================== */

    function debug() {

        return {

            currentProfile,

            category:
                getCategory(),

            garment:
                getCurrentGarment(),

            unit:
                getInputUnit(),

            measurements:
                currentProfile
                    ? {
                        ...currentProfile.measurements
                    }
                    : {}

        };

    }


    /* ========================================================
       EXPORT GLOBAL API
       ======================================================== */

    window.PatternMakerMeasurements = {

        getNumber,

        getInputUnit,

        getCategory,

        getAge,

        getCurrentGarment,

        getMeasurementIds,

        readMeasurementsFromDOM,

        createProfileFromDOM,

        validateMeasurements,

        getMeasurements,

        getProfile,

        setProfile,

        clearProfile,

        getMissingMeasurements,

        formatMeasurement,

        getSummary,

        getLegacyMeasurements,

        applyProfileToDOM,

        debug

    };


})();
```
