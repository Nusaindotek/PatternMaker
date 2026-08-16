/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 22 — engine/pattern-validator.js
 * ============================================================
 *
 * GLOBAL PATTERN INTEGRATION VALIDATOR
 *
 * Tujuan:
 * - Memvalidasi dependency antar module.
 * - Memvalidasi garment definition.
 * - Memvalidasi engine registry.
 * - Memvalidasi production geometry.
 * - Memvalidasi unit.
 * - Memvalidasi points / bounds / quantity.
 *
 * Validator TIDAK mengubah pattern.
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

    const Registry =
        window.PatternMakerPatternRegistry;

    const Geometry =
        window.PatternMakerProductionGeometry;


    /* ========================================================
       VALIDATOR RESULT
       ======================================================== */

    function createResult() {

        return {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            checks:
                []

        };

    }


    /* ========================================================
       ADD CHECK
       ======================================================== */

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


    /* ========================================================
       DEPENDENCY VALIDATION
       ======================================================== */

    function validateDependencies() {

        const result =
            createResult();


        const dependencies = {

            measurementSchema:
                Schema,

            garment:
                Garment,

            patternRegistry:
                Registry,

            productionGeometry:
                Geometry

        };


        Object.entries(
            dependencies
        )
        .forEach(
            ([name, dependency]) => {

                addCheck(

                    result,

                    `Dependency: ${name}`,

                    Boolean(
                        dependency
                    ),

                    dependency

                        ? ""

                        : `${name} belum tersedia.`

                );

            }
        );


        return result;

    }


    /* ========================================================
       GARMENT VALIDATION
       ======================================================== */

    function validateGarmentDefinition(
        garmentId
    ) {

        const result =
            createResult();


        if (!Garment) {

            addCheck(

                result,

                "Garment dependency",

                false,

                "PatternMakerGarment belum tersedia."

            );


            return result;

        }


        const garment =
            Garment.getGarment(
                garmentId
            );


        addCheck(

            result,

            `Garment exists: ${garmentId}`,

            Boolean(
                garment
            ),

            garment

                ? ""

                : `Garment "${garmentId}" tidak ditemukan.`

        );


        if (!garment) {

            return result;

        }


        addCheck(

            result,

            `Pattern engine defined: ${garmentId}`,

            Boolean(
                garment.patternEngine
            ),

            garment.patternEngine

                ? ""

                : `Garment "${garmentId}" tidak memiliki patternEngine.`

        );


        /*
         * REQUIRED MEASUREMENT
         */

        const required =
            garment.requiredMeasurements || [];


        required.forEach(
            measurementId => {

                const definition =
                    Schema?.getMeasurementDefinition(
                        measurementId
                    );


                addCheck(

                    result,

                    `Measurement schema: ${measurementId}`,

                    Boolean(
                        definition
                    ),

                    definition

                        ? ""

                        : `Measurement "${measurementId}" belum terdaftar.`

                );

            }
        );


        return result;

    }


    /* ========================================================
       REGISTRY VALIDATION
       ======================================================== */

    function validateGarmentEngine(
        garmentId
    ) {

        const result =
            createResult();


        if (
            !Garment ||
            !Registry
        ) {

            addCheck(

                result,

                "Registry dependencies",

                false,

                "Garment atau Registry belum tersedia."

            );


            return result;

        }


        const garment =
            Garment.getGarment(
                garmentId
            );


        if (!garment) {

            addCheck(

                result,

                "Garment exists",

                false,

                `Garment "${garmentId}" tidak ditemukan.`

            );


            return result;

        }


        /*
         * Legacy bodice family
         */

        if (
            garment.patternEngine ===
            "bodice"
        ) {

            const bodiceAvailable =
                typeof window.makeBodice ===
                "function";


            addCheck(

                result,

                `Legacy bodice available: ${garmentId}`,

                bodiceAvailable,

                bodiceAvailable

                    ? ""

                    : "makeBodice belum tersedia."

            );


            if (
                garment.features?.sleeve
            ) {

                const sleeveAvailable =
                    typeof window.makeSleeve ===
                    "function";


                addCheck(

                    result,

                    `Legacy sleeve available: ${garmentId}`,

                    sleeveAvailable,

                    sleeveAvailable

                        ? ""

                        : "makeSleeve belum tersedia."

                );

            }


            return result;

        }


        /*
         * Registry engine
         */

        const engine =
            Registry.getEngine(
                garment.patternEngine
            );


        addCheck(

            result,

            `Registered engine: ${garment.patternEngine}`,

            Boolean(
                engine
            ),

            engine

                ? ""

                : `Engine "${garment.patternEngine}" belum terdaftar.`

        );


        if (engine) {

            addCheck(

                result,

                `Engine generate(): ${garment.patternEngine}`,

                typeof engine.generate ===
                    "function",

                typeof engine.generate ===
                    "function"

                    ? ""

                    : `Engine "${garment.patternEngine}" tidak mempunyai generate().`

            );

        }


        return result;

    }


    /* ========================================================
       PIECE VALIDATION
       ======================================================== */

    function validatePiece(
        piece,
        index
    ) {

        const result =
            createResult();


        const prefix =
            `Piece #${index + 1}`;


        addCheck(

            result,

            `${prefix} object`,

            Boolean(
                piece &&
                typeof piece ===
                    "object"
            ),

            "Piece bukan object."

        );


        if (!piece) {

            return result;

        }


        addCheck(

            result,

            `${prefix} name`,

            Boolean(
                piece.name
            ),

            `${prefix} tidak memiliki name.`

        );


        addCheck(

            result,

            `${prefix} points`,

            Array.isArray(
                piece.points
            ) &&
            piece.points.length >= 3,

            `${prefix} harus memiliki minimal 3 titik.`

        );


        if (
            Array.isArray(
                piece.points
            )
        ) {

            piece.points.forEach(
                (
                    point,
                    pointIndex
                ) => {

                    const validPoint =

                        Array.isArray(point) &&

                        point.length >= 2 &&

                        Number.isFinite(
                            Number(point[0])
                        ) &&

                        Number.isFinite(
                            Number(point[1])
                        );


                    addCheck(

                        result,

                        `${prefix} point ${pointIndex + 1}`,

                        validPoint,

                        validPoint

                            ? ""

                            : `${prefix} memiliki koordinat tidak valid.`

                    );

                }
            );

        }


        const quantity =
            Number(
                piece.quantity
            );


        addCheck(

            result,

            `${prefix} quantity`,

            Number.isFinite(quantity) &&
            quantity > 0,

            `${prefix} quantity harus > 0.`

        );


        /*
         * Bounds
         */

        if (
            Geometry &&
            Array.isArray(
                piece.points
            ) &&
            piece.points.length >= 3
        ) {

            const calculatedBounds =
                Geometry.getBounds(
                    piece.points
                );


            const width =
                Number(
                    calculatedBounds.width
                );


            const height =
                Number(
                    calculatedBounds.height
                );


            addCheck(

                result,

                `${prefix} width`,

                Number.isFinite(width) &&
                width >= 0,

                `${prefix} width tidak valid.`

            );


            addCheck(

                result,

                `${prefix} height`,

                Number.isFinite(height) &&
                height >= 0,

                `${prefix} height tidak valid.`

            );

        }


        /*
         * Grainline
         */

        if (
            piece.grainline !== undefined
        ) {

            addCheck(

                result,

                `${prefix} grainline`,

                Array.isArray(
                    piece.grainline
                ),

                `${prefix} grainline harus berupa array.`

            );

        }


        /*
         * Notches
         */

        if (
            piece.notches !== undefined
        ) {

            addCheck(

                result,

                `${prefix} notches`,

                Array.isArray(
                    piece.notches
                ),

                `${prefix} notches harus berupa array.`

            );

        }


        return result;

    }


    /* ========================================================
       PATTERN VALIDATION
       ======================================================== */

    function validatePattern(
        pattern
    ) {

        const result =
            createResult();


        addCheck(

            result,

            "Pattern object",

            Boolean(
                pattern &&
                typeof pattern ===
                    "object"
            ),

            "Pattern tidak valid."

        );


        if (!pattern) {

            return result;

        }


        addCheck(

            result,

            "Pattern pieces",

            Array.isArray(
                pattern.pieces
            ) &&
            pattern.pieces.length > 0,

            "Pattern belum memiliki pieces."

        );


        if (
            Array.isArray(
                pattern.pieces
            )
        ) {

            pattern.pieces.forEach(
                (
                    piece,
                    index
                ) => {

                    const pieceResult =
                        validatePiece(
                            piece,
                            index
                        );


                    result.checks.push(
                        ...pieceResult.checks
                    );


                    result.errors.push(
                        ...pieceResult.errors
                    );


                    result.warnings.push(
                        ...pieceResult.warnings
                    );


                    if (
                        !pieceResult.valid
                    ) {

                        result.valid =
                            false;

                    }

                }
            );

        }


        /*
         * Metadata unit
         */

        const unit =
            pattern.metadata?.unit;


        if (
            unit !== undefined
        ) {

            const validUnit =
                [
                    "cm",
                    "mm",
                    "inch"
                ]
                .includes(
                    unit
                );


            addCheck(

                result,

                "Pattern unit",

                validUnit,

                validUnit

                    ? ""

                    : `Unit "${unit}" tidak didukung.`

            );

        }
        else {

            result.warnings.push({

                check:
                    "Pattern unit",

                message:
                    "Pattern belum menyimpan metadata.unit."

            });

        }


        /*
         * Scale
         */

        if (
            pattern.metadata?.scale !==
            undefined
        ) {

            const scale =
                Number(
                    pattern.metadata.scale
                );


            addCheck(

                result,

                "Pattern scale",

                Number.isFinite(
                    scale
                ) &&
                scale > 0,

                "Pattern scale harus > 0."

            );

        }


        return result;

    }


    /* ========================================================
       GARMENT ENGINE MATRIX
       ======================================================== */

    function validateAllGarments() {

        const result =
            createResult();


        const garments =
            Garment?.getAllGarments
                ? Garment.getAllGarments()
                : [];


        if (!garments.length) {

            addCheck(

                result,

                "Garment catalog",

                false,

                "Garment catalog kosong."

            );


            return result;

        }


        garments.forEach(
            garment => {

                const definitionResult =
                    validateGarmentDefinition(
                        garment.id
                    );


                result.checks.push(
                    ...definitionResult.checks
                );


                result.errors.push(
                    ...definitionResult.errors
                );


                result.warnings.push(
                    ...definitionResult.warnings
                );


                const engineResult =
                    validateGarmentEngine(
                        garment.id
                    );


                result.checks.push(
                    ...engineResult.checks
                );


                result.errors.push(
                    ...engineResult.errors
                );


                result.warnings.push(
                    ...engineResult.warnings
                );


                if (
                    !definitionResult.valid ||
                    !engineResult.valid
                ) {

                    result.valid =
                        false;

                }

            }
        );


        return result;

    }


    /* ========================================================
       COMPLETE SYSTEM VALIDATION
       ======================================================== */

    function validateSystem() {

        const result =
            createResult();


        /*
         * Dependency
         */

        const dependencyResult =
            validateDependencies();


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
         * Garments
         */

        if (
            dependencyResult.valid
        ) {

            const garmentResult =
                validateAllGarments();


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


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       FORMAT RESULT
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
                result.checks
                    .filter(
                        check =>
                            check.passed
                    )
                    .length,

            failedChecks:
                result.checks
                    .filter(
                        check =>
                            !check.passed
                    )
                    .length,

            errors:
                result.errors,

            warnings:
                result.warnings

        };

    }


    /* ========================================================
       DEBUG SYSTEM
       ======================================================== */

    function runDebug() {

        const result =
            validateSystem();


        const formatted =
            formatResult(
                result
            );


        console.group(
            "PatternMaker Universal Validation"
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

    window.PatternMakerValidator = {

        validateDependencies,

        validateGarmentDefinition,

        validateGarmentEngine,

        validatePiece,

        validatePattern,

        validateAllGarments,

        validateSystem,

        formatResult,

        runDebug

    };


})();
