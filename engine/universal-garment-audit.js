/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 38 — engine/universal-garment-audit.js
 * ============================================================
 *
 * UNIVERSAL GARMENT / SIZE SYSTEM AUDITOR
 *
 * Tujuan:
 *
 * 1. Memastikan category tersedia.
 * 2. Memastikan garment tersedia untuk category.
 * 3. Memastikan requiredMeasurements memiliki schema.
 * 4. Memastikan optionalMeasurements memiliki schema.
 * 5. Memastikan patternEngine tersedia.
 * 6. Memastikan size/category tidak saling bertentangan.
 * 7. Memastikan profile dapat divalidasi terhadap garment.
 *
 * Validator TIDAK mengubah data.
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

    const Garment =
        window.PatternMakerGarment;

    const Profile =
        window.PatternMakerProfile;


    /* ========================================================
       RESULT
       ======================================================== */

    function createResult() {

        return {

            valid: true,

            errors: [],

            warnings: [],

            checks: []

        };

    }


    function addCheck(
        result,
        name,
        passed,
        message = ""
    ) {

        result.checks.push({

            name,

            passed,

            message

        });


        if (!passed) {

            result.valid =
                false;

            result.errors.push({

                check:
                    name,

                message

            });

        }

    }


    function addWarning(
        result,
        name,
        message
    ) {

        result.warnings.push({

            check:
                name,

            message

        });

    }


    /* ========================================================
       DEPENDENCY AUDIT
       ======================================================== */

    function auditDependencies() {

        const result =
            createResult();


        addCheck(

            result,

            "Measurement Schema",

            Boolean(
                Schema
            ),

            "PatternMakerMeasurementSchema belum tersedia."

        );


        addCheck(

            result,

            "Garment Module",

            Boolean(
                Garment
            ),

            "PatternMakerGarment belum tersedia."

        );


        addCheck(

            result,

            "Profile Module",

            Boolean(
                Profile
            ),

            "PatternMakerProfile belum tersedia."

        );


        return result;

    }


    /* ========================================================
       GET ALL GARMENTS
       ======================================================== */

    function getAllGarments() {

        if (
            !Garment
        ) {

            return [];

        }


        if (
            typeof Garment.getAllGarments ===
            "function"
        ) {

            const garments =
                Garment.getAllGarments();


            return Array.isArray(
                garments
            )
                ? garments
                : [];

        }


        /*
         * Fallback untuk implementasi catalog
         * yang expose getGarmentCatalog().
         */

        if (
            typeof Garment.getGarmentCatalog ===
            "function"
        ) {

            const catalog =
                Garment.getGarmentCatalog();


            if (
                Array.isArray(catalog)
            ) {

                return catalog;

            }


            if (
                catalog &&
                typeof catalog ===
                    "object"
            ) {

                return Object.values(
                    catalog
                );

            }

        }


        return [];

    }


    /* ========================================================
       CATEGORY EXTRACTION
       ======================================================== */

    function getGarmentCategories(
        garment
    ) {

        const values = [

            ...(Array.isArray(
                garment?.categories
            )
                ? garment.categories
                : []),

            ...(garment?.category
                ? [garment.category]
                : []),

            ...(Array.isArray(
                garment?.supportedCategories
            )
                ? garment.supportedCategories
                : [])

        ];


        return [
            ...new Set(
                values
                    .filter(Boolean)
                    .map(
                        value =>
                            String(value)
                    )
            )
        ];

    }


    /* ========================================================
       CATEGORY LABEL
       ======================================================== */

    function getCategoryLabel(
        category
    ) {

        if (
            Schema &&
            typeof Schema.getCategoryLabel ===
                "function"
        ) {

            return Schema.getCategoryLabel(
                category
            );

        }


        return String(
            category
        );

    }


    /* ========================================================
       MEASUREMENT DEFINITIONS
       ======================================================== */

    function getMeasurementDefinition(
        measurementId
    ) {

        if (
            !Schema ||
            typeof Schema.getMeasurementDefinition !==
                "function"
        ) {

            return null;

        }


        return Schema.getMeasurementDefinition(
            measurementId
        );

    }


    /* ========================================================
       GARMENT AUDIT
       ======================================================== */

    function auditGarment(
        garment
    ) {

        const result =
            createResult();


        const garmentId =
            garment?.id ||
            garment?.name ||
            "unknown";


        addCheck(

            result,

            `Garment object: ${garmentId}`,

            Boolean(
                garment &&
                typeof garment ===
                    "object"
            ),

            "Garment bukan object yang valid."

        );


        if (
            !garment
        ) {

            return result;

        }


        /*
         * ID
         */

        addCheck(

            result,

            `Garment ID: ${garmentId}`,

            Boolean(
                garment.id
            ),

            `Garment "${garmentId}" tidak memiliki id.`

        );


        /*
         * Label
         */

        addCheck(

            result,

            `Garment label: ${garmentId}`,

            Boolean(
                garment.label ||
                garment.name
            ),

            `Garment "${garmentId}" tidak memiliki label.`

        );


        /*
         * Pattern engine
         */

        addCheck(

            result,

            `Pattern engine: ${garmentId}`,

            Boolean(
                garment.patternEngine
            ),

            `Garment "${garmentId}" tidak memiliki patternEngine.`

        );


        /*
         * Required measurements
         */

        const required =
            Array.isArray(
                garment.requiredMeasurements
            )
                ? garment.requiredMeasurements
                : [];


        addCheck(

            result,

            `Required measurements array: ${garmentId}`,

            Array.isArray(
                garment.requiredMeasurements
            ),

            `requiredMeasurements "${garmentId}" harus array.`

        );


        required.forEach(
            measurementId => {

                const definition =
                    getMeasurementDefinition(
                        measurementId
                    );


                addCheck(

                    result,

                    `Schema ${measurementId}: ${garmentId}`,

                    Boolean(
                        definition
                    ),

                    `Measurement "${measurementId}" ` +
                    `belum ada di measurement schema.`

                );

            }
        );


        /*
         * Optional measurements
         */

        if (
            garment.optionalMeasurements !==
            undefined
        ) {

            addCheck(

                result,

                `Optional measurements array: ${garmentId}`,

                Array.isArray(
                    garment.optionalMeasurements
                ),

                `optionalMeasurements "${garmentId}" harus array.`

            );


            (
                garment.optionalMeasurements ||
                []
            )
            .forEach(
                measurementId => {

                    const definition =
                        getMeasurementDefinition(
                            measurementId
                        );


                    addCheck(

                        result,

                        `Optional schema ${measurementId}: ${garmentId}`,

                        Boolean(
                            definition
                        ),

                        `Optional measurement "${measurementId}" ` +
                        `belum ada di schema.`

                    );

                }
            );

        }


        /*
         * Duplicate measurement requirement
         */

        const duplicateIds =
            required.filter(
                (
                    id,
                    index
                ) =>
                    required.indexOf(
                        id
                    ) !== index
            );


        addCheck(

            result,

            `No duplicate required measurements: ${garmentId}`,

            duplicateIds.length === 0,

            duplicateIds.length

                ? `Duplikasi: ${[
                    ...new Set(
                        duplicateIds
                    )
                ].join(", ")}`

                : ""

        );


        /*
         * Optional and required overlap
         */

        const optional =
            Array.isArray(
                garment.optionalMeasurements
            )
                ? garment.optionalMeasurements
                : [];


        const overlap =
            required.filter(
                id =>
                    optional.includes(
                        id
                    )
            );


        addCheck(

            result,

            `Required/optional consistency: ${garmentId}`,

            overlap.length === 0,

            overlap.length

                ? `Measurement terdapat di required dan optional: ` +
                  `${overlap.join(", ")}`

                : ""

        );


        /*
         * Feature object
         */

        if (
            garment.features !==
            undefined
        ) {

            addCheck(

                result,

                `Features object: ${garmentId}`,

                typeof garment.features ===
                    "object",

                `features "${garmentId}" harus object.`

            );

        }


        /*
         * Categories
         */

        const categories =
            getGarmentCategories(
                garment
            );


        if (
            categories.length === 0
        ) {

            addWarning(

                result,

                `Category mapping: ${garmentId}`,

                `Garment "${garmentId}" belum memiliki explicit category mapping.`

            );

        }
        else {

            categories.forEach(
                category => {

                    addCheck(

                        result,

                        `Category ${category}: ${garmentId}`,

                        Boolean(
                            getCategoryLabel(
                                category
                            )
                        ),

                        `Category "${category}" tidak dikenal oleh schema.`

                    );

                }
            );

        }


        /*
         * Size behavior
         */

        if (
            garment.sizeSystem !==
            undefined
        ) {

            const validSizeSystem =

                Array.isArray(
                    garment.sizeSystem
                )

                ||

                typeof garment.sizeSystem ===
                    "string"

                ||

                typeof garment.sizeSystem ===
                    "object";


            addCheck(

                result,

                `Size system declaration: ${garmentId}`,

                validSizeSystem,

                `sizeSystem "${garmentId}" tidak valid.`

            );

        }


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       CATEGORY AUDIT
       ======================================================== */

    function auditCategories() {

        const result =
            createResult();


        if (
            !Schema
        ) {

            addCheck(

                result,

                "Category schema",

                false,

                "Schema kategori belum tersedia."

            );


            return result;

        }


        /*
         * Known universal categories.
         *
         * Ini bukan berarti seluruh garment harus
         * mendukung semuanya.
         */

        const expectedCategories = [

            "child",

            "teen",

            "women",

            "men",

            "custom"

        ];


        expectedCategories.forEach(
            category => {

                const label =
                    getCategoryLabel(
                        category
                    );


                const valid =
                    Boolean(
                        label &&
                        label !==
                            category
                    );


                if (
                    valid
                ) {

                    addCheck(

                        result,

                        `Universal category: ${category}`,

                        true

                    );

                }
                else {

                    addWarning(

                        result,

                        `Universal category: ${category}`,

                        `Category "${category}" belum memiliki label schema.`

                    );

                }

            }
        );


        return result;

    }


    /* ========================================================
       GARMENT MATRIX
       ======================================================== */

    function createGarmentMatrix() {

        const garments =
            getAllGarments();


        const matrix = {

            child: [],

            teen: [],

            women: [],

            men: [],

            custom: []

        };


        garments.forEach(
            garment => {

                const categories =
                    getGarmentCategories(
                        garment
                    );


                categories.forEach(
                    category => {

                        if (
                            matrix[category]
                        ) {

                            matrix[category]
                                .push(
                                    garment.id
                                );

                        }

                    }
                );

            }
        );


        return matrix;

    }


    /* ========================================================
       MATRIX AUDIT
       ======================================================== */

    function auditGarmentMatrix() {

        const result =
            createResult();


        const matrix =
            createGarmentMatrix();


        Object.entries(
            matrix
        )
        .forEach(
            (
                [
                    category,
                    garments
                ]
            ) => {

                if (
                    category ===
                    "custom"
                ) {

                    addWarning(

                        result,

                        `Category matrix: ${category}`,

                        "Custom merupakan kategori bebas."

                    );


                    return;

                }


                if (
                    garments.length === 0
                ) {

                    addWarning(

                        result,

                        `Category matrix: ${category}`,

                        `Belum ada garment eksplisit untuk ${getCategoryLabel(category)}.`

                    );

                }
                else {

                    addCheck(

                        result,

                        `Category matrix: ${category}`,

                        true,

                        garments.join(", ")

                    );

                }

            }
        );


        return {

            result,

            matrix

        };

    }


    /* ========================================================
       CATEGORY / PROFILE COMPATIBILITY
       ======================================================== */

    function auditProfileCategoryCompatibility(
        profile,
        garment
    ) {

        const result =
            createResult();


        if (
            !profile ||
            !garment
        ) {

            addCheck(

                result,

                "Profile + garment",

                false,

                "Profile atau garment belum tersedia."

            );


            return result;

        }


        /*
         * Category from profile.
         */

        const profileCategory =
            profile.category ||
            null;


        /*
         * Garment category mapping.
         */

        const categories =
            getGarmentCategories(
                garment
            );


        if (
            !profileCategory
        ) {

            addWarning(

                result,

                "Profile category",

                "Profile belum memiliki category."

            );

            return result;

        }


        if (
            categories.length === 0
        ) {

            addWarning(

                result,

                "Garment category mapping",

                `Garment "${garment.id}" tidak memiliki mapping kategori eksplisit.`

            );


            return result;

        }


        const compatible =

            categories.includes(
                profileCategory
            )

            ||

            categories.includes(
                "custom"
            );


        addCheck(

            result,

            "Profile/Garment category compatibility",

            compatible,

            compatible

                ? ""

                : `Profile=${profileCategory}, ` +
                  `Garment categories=${categories.join(", ")}`

        );


        return result;

    }


    /* ========================================================
       AGE / CATEGORY AUDIT
       ======================================================== */

    function auditAgeCategory(
        profile
    ) {

        const result =
            createResult();


        if (
            !profile
        ) {

            addWarning(

                result,

                "Age/category",

                "Profile belum tersedia."

            );


            return result;

        }


        const category =
            profile.category;


        const age =
            Number(
                profile.age
            );


        if (
            !Number.isFinite(age)
        ) {

            addWarning(

                result,

                "Age/category",

                "Profile belum memiliki umur numerik."

            );


            return result;

        }


        /*
         * Usia di sini dipakai hanya sebagai
         * konsistensi UX / grouping.
         *
         * Bukan aturan medis atau sizing absolut.
         */

        if (
            category ===
            "child"
        ) {

            if (
                age >= 13
            ) {

                addWarning(

                    result,

                    "Child age consistency",

                    `Kategori child dengan umur ${age} tahun perlu diperiksa.`

                );

            }

        }


        if (
            category ===
            "teen"
        ) {

            if (
                age < 12 ||
                age > 19
            ) {

                addWarning(

                    result,

                    "Teen age consistency",

                    `Kategori teen dengan umur ${age} tahun perlu diperiksa.`

                );

            }

        }


        if (
            category ===
            "women" ||
            category ===
            "men"
        ) {

            if (
                age < 13
            ) {

                addWarning(

                    result,

                    "Adult category age consistency",

                    `Kategori ${category} dengan umur ${age} tahun perlu diperiksa.`

                );

            }

        }


        return result;

    }


    /* ========================================================
       FULL SYSTEM AUDIT
       ======================================================== */

    function auditSystem() {

        const result =
            createResult();


        /*
         * Dependencies
         */

        const dependencyResult =
            auditDependencies();


        result.checks.push(
            ...dependencyResult.checks
        );


        result.errors.push(
            ...dependencyResult.errors
        );


        result.warnings.push(
            ...dependencyResult.warnings
        );


        /*
         * Categories
         */

        const categoryResult =
            auditCategories();


        result.checks.push(
            ...categoryResult.checks
        );


        result.errors.push(
            ...categoryResult.errors
        );


        result.warnings.push(
            ...categoryResult.warnings
        );


        /*
         * Garments
         */

        const garments =
            getAllGarments();


        addCheck(

            result,

            "Garment catalog available",

            garments.length > 0,

            "Tidak ditemukan garment pada catalog."

        );


        garments.forEach(
            garment => {

                const garmentResult =
                    auditGarment(
                        garment
                    );


                result.checks.push(
                    ...garmentResult.checks
                );


                result.errors.push(
                    ...garmentResult.errors
                );


                result.warnings.push(
                    ...garmentResult.warnings
                );

            }
        );


        /*
         * Matrix
         */

        const matrixAudit =
            auditGarmentMatrix();


        result.checks.push(
            ...matrixAudit.result.checks
        );


        result.errors.push(
            ...matrixAudit.result.errors
        );


        result.warnings.push(
            ...matrixAudit.result.warnings
        );


        result.valid =
            result.errors.length === 0;


        return {

            ...result,

            matrix:
                matrixAudit.matrix

        };

    }


    /* ========================================================
       PROFILE + GARMENT AUDIT
       ======================================================== */

    function auditCurrentSelection(
        profile,
        garmentId
    ) {

        const result =
            createResult();


        if (
            !Garment
        ) {

            addCheck(

                result,

                "Garment module",

                false,

                "Garment module belum tersedia."

            );


            return result;

        }


        const garment =
            typeof Garment.getGarment ===
                "function"

                ? Garment.getGarment(
                    garmentId
                )

                : null;


        addCheck(

            result,

            `Current garment: ${garmentId}`,

            Boolean(
                garment
            ),

            `Garment "${garmentId}" tidak ditemukan.`

        );


        if (
            !garment
        ) {

            return result;

        }


        const garmentAudit =
            auditGarment(
                garment
            );


        result.checks.push(
            ...garmentAudit.checks
        );


        result.errors.push(
            ...garmentAudit.errors
        );


        result.warnings.push(
            ...garmentAudit.warnings
        );


        const compatibility =
            auditProfileCategoryCompatibility(

                profile,

                garment

            );


        result.checks.push(
            ...compatibility.checks
        );


        result.errors.push(
            ...compatibility.errors
        );


        result.warnings.push(
            ...compatibility.warnings
        );


        const age =
            auditAgeCategory(
                profile
            );


        result.checks.push(
            ...age.checks
        );


        result.errors.push(
            ...age.errors
        );


        result.warnings.push(
            ...age.warnings
        );


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       FORMAT
       ======================================================== */

    function formatResult(
        result
    ) {

        return {

            valid:
                result.valid,

            totalChecks:
                result.checks.length,

            passedChecks:
                result.checks.filter(
                    check =>
                        check.passed
                ).length,

            failedChecks:
                result.checks.filter(
                    check =>
                        !check.passed
                ).length,

            errors:
                result.errors,

            warnings:
                result.warnings,

            matrix:
                result.matrix ||
                null

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function runDebug() {

        const result =
            auditSystem();


        const formatted =
            formatResult(
                result
            );


        console.group(
            "PatternMaker Universal Garment Audit"
        );


        console.log(
            "Valid:",
            formatted.valid
        );


        console.log(
            "Checks:",
            formatted.totalChecks
        );


        console.log(
            "Passed:",
            formatted.passedChecks
        );


        console.log(
            "Failed:",
            formatted.failedChecks
        );


        console.log(
            "Garment Matrix:",
            formatted.matrix
        );


        if (
            formatted.errors.length
        ) {

            console.error(
                "Errors:",
                formatted.errors
            );

        }


        if (
            formatted.warnings.length
        ) {

            console.warn(
                "Warnings:",
                formatted.warnings
            );

        }


        console.groupEnd();


        return formatted;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerUniversalGarmentAudit = {

        auditDependencies,

        getAllGarments,

        getGarmentCategories,

        getCategoryLabel,

        auditGarment,

        auditCategories,

        createGarmentMatrix,

        auditGarmentMatrix,

        auditProfileCategoryCompatibility,

        auditAgeCategory,

        auditCurrentSelection,

        auditSystem,

        formatResult,

        runDebug

    };


})();
