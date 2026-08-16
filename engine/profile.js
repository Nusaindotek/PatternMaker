```javascript id="8m9x2k"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 4 — engine/profile.js
 * ============================================================
 *
 * Fungsi:
 * - Membuat Body Profile universal.
 * - Mendukung Anak / Remaja / Wanita / Pria / Custom.
 * - Menyimpan sistem unit.
 * - Menyimpan ukuran tubuh dalam satu standar internal: CM.
 * - Umur hanya sebagai metadata.
 *
 * Tidak bergantung pada DOM.
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VALIDASI DEPENDENCY
       ======================================================== */

    if (!window.PatternMakerMeasurementSchema) {

        throw new Error(
            "PatternMakerMeasurementSchema belum dimuat. " +
            "Pastikan measurement-schema.js dimuat sebelum profile.js."
        );

    }


    const Schema =
        window.PatternMakerMeasurementSchema;


    /* ========================================================
       CLASS BODY PROFILE
       ======================================================== */

    class BodyProfile {

        constructor(options = {}) {

            this.id =
                options.id ||
                createProfileId();


            this.category =
                options.category || "custom";


            this.name =
                options.name || "Custom Profile";


            this.age =
                Number.isFinite(Number(options.age))
                    ? Number(options.age)
                    : null;


            this.unit =
                options.unit || "cm";


            this.measurements = {};


            this.metadata = {

                createdAt:
                    options.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString(),

                source:
                    options.source ||
                    "manual",

                version:
                    "1.0"

            };


            if (options.measurements) {

                this.setMeasurements(
                    options.measurements,
                    this.unit
                );

            }

        }


        /* ====================================================
           SET CATEGORY
           ==================================================== */

        setCategory(category) {

            if (!Schema.USER_CATEGORIES[category]) {

                throw new Error(
                    `Kategori profile tidak valid: ${category}`
                );

            }

            this.category = category;

            return this;

        }


        /* ====================================================
           SET UNIT
           ==================================================== */

        setUnit(unit) {

            if (!Schema.MEASUREMENT_UNITS[unit]) {

                throw new Error(
                    `Unit tidak didukung: ${unit}`
                );

            }


            /*
             * Semua measurement internal selalu disimpan CM.
             *
             * Jadi perubahan unit hanya mengubah
             * cara input/output ditampilkan.
             */

            this.unit = unit;

            this.metadata.updatedAt =
                new Date().toISOString();


            return this;

        }


        /* ====================================================
           SET AGE
           ==================================================== */

        setAge(age) {

            if (
                age !== null &&
                (
                    !Number.isFinite(Number(age)) ||
                    Number(age) < 0 ||
                    Number(age) > 120
                )
            ) {

                throw new Error(
                    "Umur harus berada antara 0–120 tahun."
                );

            }


            this.age =
                age === null
                    ? null
                    : Number(age);


            this.metadata.updatedAt =
                new Date().toISOString();


            return this;

        }


        /* ====================================================
           SET SINGLE MEASUREMENT
           ==================================================== */

        setMeasurement(
            measurementId,
            value,
            unit = this.unit
        ) {

            const definition =
                Schema.getMeasurementDefinition(
                    measurementId
                );


            if (!definition) {

                throw new Error(
                    `Measurement tidak ditemukan: ${measurementId}`
                );

            }


            const numericValue =
                Number(value);


            if (!Number.isFinite(numericValue)) {

                throw new Error(
                    `${definition.label} harus berupa angka.`
                );

            }


            /*
             * Validasi dilakukan terhadap nilai dalam unit input.
             *
             * Schema menyimpan batas dasar dalam CM,
             * sehingga untuk INCH kita konversi dulu.
             */

            const valueInCm =
                Schema.measurementToCm(
                    numericValue,
                    unit
                );


            const validation =
                Schema.validateMeasurementValue(
                    measurementId,
                    valueInCm
                );


            if (!validation.valid) {

                throw new Error(
                    validation.message
                );

            }


            /*
             * INTERNAL FORMAT
             *
             * Seluruh engine pattern menerima CM.
             */

            this.measurements[measurementId] =
                valueInCm;


            this.metadata.updatedAt =
                new Date().toISOString();


            return this;

        }


        /* ====================================================
           SET MULTIPLE MEASUREMENTS
           ==================================================== */

        setMeasurements(
            measurements = {},
            unit = this.unit
        ) {

            Object.entries(measurements)
                .forEach(
                    ([id, value]) => {

                        this.setMeasurement(
                            id,
                            value,
                            unit
                        );

                    }
                );


            return this;

        }


        /* ====================================================
           GET MEASUREMENT
           ==================================================== */

        getMeasurement(
            measurementId,
            outputUnit = "cm"
        ) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    this.measurements,
                    measurementId
                )
            ) {

                return null;

            }


            const cmValue =
                this.measurements[
                    measurementId
                ];


            return Schema.measurementFromCm(
                cmValue,
                outputUnit
            );

        }


        /* ====================================================
           CHECK MEASUREMENT
           ==================================================== */

        hasMeasurement(
            measurementId
        ) {

            return Object.prototype.hasOwnProperty.call(
                this.measurements,
                measurementId
            );

        }


        /* ====================================================
           GET REQUIRED MEASUREMENTS
           ==================================================== */

        getRequiredMeasurements(
            garmentType
        ) {

            return Schema.getRequiredMeasurements(
                garmentType
            );

        }


        /* ====================================================
           CHECK GARMENT COMPLETENESS
           ==================================================== */

        validateForGarment(
            garmentType
        ) {

            const required =
                this.getRequiredMeasurements(
                    garmentType
                );


            const missing = [];


            required.forEach(
                measurementId => {

                    if (
                        !this.hasMeasurement(
                            measurementId
                        )
                    ) {

                        const definition =
                            Schema.getMeasurementDefinition(
                                measurementId
                            );


                        missing.push({

                            id:
                                measurementId,

                            label:
                                definition
                                    ? definition.label
                                    : measurementId

                        });

                    }

                }
            );


            return {

                valid:
                    missing.length === 0,

                missing

            };

        }


        /* ====================================================
           EXPORT DATA
           ==================================================== */

        toJSON() {

            return {

                id:
                    this.id,

                name:
                    this.name,

                category:
                    this.category,

                categoryLabel:
                    Schema.getCategoryLabel(
                        this.category
                    ),

                age:
                    this.age,

                unit:
                    this.unit,

                /*
                 * Internal values selalu CM.
                 */

                measurements:
                    {
                        ...this.measurements
                    },

                metadata:
                    {
                        ...this.metadata
                    }

            };

        }


        /* ====================================================
           CLONE PROFILE
           ==================================================== */

        clone(
            newName = null
        ) {

            const copy =
                new BodyProfile({

                    id:
                        createProfileId(),

                    name:
                        newName ||
                        `${this.name} Copy`,

                    category:
                        this.category,

                    age:
                        this.age,

                    unit:
                        this.unit,

                    measurements:
                        {
                            ...this.measurements
                        },

                    source:
                        "clone"

                });


            return copy;

        }

    }


    /* ========================================================
       PROFILE ID
       ======================================================== */

    function createProfileId() {

        return (
            "PM-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8)
        ).toUpperCase();

    }


    /* ========================================================
       PROFILE FACTORY
       ======================================================== */

    function createBodyProfile(
        options = {}
    ) {

        return new BodyProfile(
            options
        );

    }


    /* ========================================================
       PROFILE CATEGORY HELPERS
       ======================================================== */

    function getDefaultProfile(
        category = "custom"
    ) {

        const categoryData =
            Schema.USER_CATEGORIES[
                category
            ];


        if (!categoryData) {

            throw new Error(
                `Kategori tidak valid: ${category}`
            );

        }


        return new BodyProfile({

            name:
                `${categoryData.label} Profile`,

            category:

                category,

            unit:
                "cm",

            source:
                "default"

        });

    }


    /* ========================================================
       EXPORT GLOBAL
       ======================================================== */

    window.PatternMakerProfile = {

        BodyProfile,

        createBodyProfile,

        getDefaultProfile

    };


})();
```
