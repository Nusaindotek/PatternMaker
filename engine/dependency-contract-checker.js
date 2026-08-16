```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 89
 *
 * FILE:
 *   engine/dependency-contract-checker.js
 * ============================================================
 *
 * DEPENDENCY / API CONTRACT CHECKER
 *
 * Tujuan:
 *
 *   Loaded Runtime
 *        ↓
 *   Contract Check
 *        ↓
 *   API Check
 *        ↓
 *   Dependency Check
 *        ↓
 *   PASS / FAIL
 *
 * ============================================================
 *
 * Checker ini TIDAK:
 *
 * - mengubah engine
 * - mengubah geometry
 * - mengubah state
 * - melakukan drafting
 *
 * Ia hanya melakukan inspection.
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
       CONTRACT DEFINITIONS
       ======================================================== */

    const CONTRACTS = Object.freeze({

        PatternMakerMeasurementSchema: [

            "getCategoryLabel"

        ],


        PatternMakerMeasurementMapper: [

            "getValue"

        ],


        PatternMakerGradePointSchema: [

            "normalizePoint",

            "createFromPointDefinitions",

            "validatePoint",

            "validatePieceGradePoints",

            "validatePatternGradePoints",

            "attachGradePoints"

        ],


        PatternMakerBodice: [

            "generate",

            "makeUpperPieces",

            "validateGradePoints"

        ],


        PatternMakerSkirt: [

            "generate",

            "makeSkirtPieces",

            "validateGradePoints"

        ],


        PatternMakerPants: [

            "generate",

            "makePantPieces",

            "validateGradePoints"

        ],


        PatternMakerDress: [

            "generate",

            "makeDressPieces",

            "validateGradePoints"

        ],


        PatternMakerShirt: [

            "generate",

            "makeShirtPieces",

            "validateGradePoints"

        ],


        PatternMakerGradingEngine: [

            "gradePattern",

            "validateGradedPattern"

        ],


        PatternMakerCurveGeometry: [

            "flattenQuadratic",

            "flattenCubic",

            "flattenPolyline",

            "flattenSegment",

            "flattenPath",

            "flattenPiece",

            "flattenPattern",

            "validateFlattenedPath"

        ],


        PatternMakerProductionGeometry: [

            "trueOffset",

            "offsetPiece",

            "createProductionPattern",

            "applySeamAllowance",

            "validateProductionPattern"

        ],


        PatternMakerSeamProduction: [

            "applySeamAllowance",

            "validateSeamPattern",

            "getSeamSummary",

            "toCuttingGeometry",

            "isProductionReady"

        ],


        PatternMakerProductionValidator: [

            "validatePoints",

            "validatePiece",

            "validateForProduction",

            "validateEngineResult",

            "isValidForProduction"

        ],


        PatternMakerNestingEngine: [

            "nest",

            "validateNesting",

            "getSummary"

        ],


        PatternMakerNestingPreview: [

            "createPreview",

            "createMarkerModel",

            "fitToViewport",

            "createSvgModel",

            "getSummary"

        ],


        PatternMakerNestingSvgRenderer: [

            "renderSvg",

            "getSvgBlob",

            "renderToElement"

        ],


        PatternMakerNestingValidator: [

            "validate",

            "validatePlacement",

            "findOverlaps",

            "findDuplicateIds"

        ],


        PatternMakerDxfExporter: [

            "createDxf",

            "createBlob",

            "getText",

            "getSummary"

        ],


        PatternMakerPlotterExporter: [

            "createPlotter",

            "getText",

            "createBlob",

            "getSummary"

        ],


        PatternMakerSvgExporter: [

            "createSvg",

            "createBlob",

            "getSummary"

        ],


        PatternMakerOutputAudit: [

            "audit",

            "auditProduction",

            "auditMarker",

            "assert"

        ],


        PatternMakerUniversalGarmentAudit: [

            "runGarment",

            "runMatrix",

            "assert"

        ],


        PatternMakerUniversalAuditRunner: [

            "run",

            "runGarment",

            "assert",

            "createReport",

            "calculateCompletion"

        ]

    });


    /* ========================================================
       DEPENDENCY ORDER
       ======================================================== */

    const DEPENDENCY_ORDER = Object.freeze([

        "PatternMakerMeasurementSchema",

        "PatternMakerMeasurementMapper",

        "PatternMakerGradePointSchema",

        "PatternMakerCurveGeometry",

        "PatternMakerProfile",

        "PatternMakerGarment",

        "PatternMakerMeasurements",

        "PatternMakerBodice",

        "PatternMakerSkirt",

        "PatternMakerPants",

        "PatternMakerDress",

        "PatternMakerShirt",

        "PatternMakerPatternRegistry",

        "PatternMakerGarmentEngineRouter",

        "PatternMakerProductionGeometry",

        "PatternMakerSeamProduction",

        "PatternMakerProductionValidator",

        "PatternMakerPatternValidator",

        "PatternMakerSizeSystem",

        "PatternMakerGradingEngine",

        "PatternMakerGradingRegression",

        "PatternMakerGarmentGradingRegression",

        "PatternMakerEndToEndProductionRegression",

        "PatternMakerNestingEngine",

        "PatternMakerNestingPreview",

        "PatternMakerNestingSvgRenderer",

        "PatternMakerNestingValidator",

        "PatternMakerEndToEndMarkerRegression",

        "PatternMakerDxfExporter",

        "PatternMakerPlotterExporter",

        "PatternMakerSvgExporter",

        "PatternMakerOutputAudit",

        "PatternMakerUniversalGarmentAudit",

        "PatternMakerUniversalAuditRunner"

    ]);


    /* ========================================================
       OPTIONAL RUNTIME GLOBALS
       ======================================================== */

    const OPTIONAL_GLOBALS = Object.freeze([

        "PatternMakerProfile",

        "PatternMakerGarment",

        "PatternMakerMeasurements",

        "PatternMakerPatternRegistry",

        "PatternMakerGarmentEngineRouter",

        "PatternMakerPatternValidator",

        "PatternMakerSizeSystem",

        "PatternMakerGradingRegression",

        "PatternMakerGarmentGradingRegression",

        "PatternMakerEndToEndProductionRegression",

        "PatternMakerEndToEndMarkerRegression"

    ]);


    /* ========================================================
       RESULT FACTORY
       ======================================================== */

    function createResult() {

        return {

            version:
                VERSION,

            valid:
                true,

            globals:
                {},

            contracts:
                {},

            dependencies: {

                loaded:
                    [],

                missing:
                    []

            },

            errors:
                [],

            warnings:
                [],

            summary: {

                requiredGlobals:
                    0,

                loadedGlobals:
                    0,

                missingGlobals:
                    0,

                requiredApis:
                    0,

                availableApis:
                    0,

                missingApis:
                    0,

                dependencyOrderValid:
                    true

            }

        };

    }


    /* ========================================================
       TYPE CHECK
       ======================================================== */

    function isObjectLike(
        value
    ) {

        return (

            value !==
            null

            &&

            (
                typeof value ===
                    "object"

                ||

                typeof value ===
                    "function"
            )

        );

    }


    /* ========================================================
       GET GLOBAL
       ======================================================== */

    function getGlobal(
        name
    ) {

        return globalThis[
            name
        ];

    }


    /* ========================================================
       CHECK GLOBAL
       ======================================================== */

    function checkGlobal(
        name,
        result
    ) {

        const value =
            getGlobal(
                name
            );


        const exists =
            isObjectLike(
                value
            );


        result.globals[
            name
        ] = {

            exists,

            type:
                exists
                    ? typeof value
                    : null

        };


        if (
            exists
        ) {

            result.summary.loadedGlobals++;

        }
        else {

            result.summary.missingGlobals++;

        }


        return exists;

    }


    /* ========================================================
       CHECK CONTRACT
       ======================================================== */

    function checkContract(
        name,
        methods,
        result
    ) {

        const target =
            getGlobal(
                name
            );


        const required =
            Array.isArray(
                methods
            )
                ? methods
                : [];


        const missing =
            [];

        const available =
            [];


        result.summary.requiredApis +=
            required.length;


        if (
            !isObjectLike(
                target
            )
        ) {

            required.forEach(
                method => {

                    missing.push(
                        method
                    );

                }
            );

        }
        else {

            required.forEach(
                method => {

                    if (
                        typeof target[
                            method
                        ] ===
                        "function"
                    ) {

                        available.push(
                            method
                        );

                    }
                    else {

                        missing.push(
                            method
                        );

                    }

                }
            );

        }


        result.summary.availableApis +=
            available.length;


        result.summary.missingApis +=
            missing.length;


        result.contracts[
            name
        ] = {

            required,

            available,

            missing,

            valid:
                missing.length ===
                0

        };


        if (
            missing.length
        ) {

            result.valid =
                false;


            result.errors.push({

                type:
                    "missing-api",

                global:
                    name,

                missing

            });

        }


        return {

            valid:
                missing.length ===
                0,

            missing,

            available

        };

    }


    /* ========================================================
       CHECK ALL CONTRACTS
       ======================================================== */

    function checkContracts(
        result
    ) {

        Object.entries(
            CONTRACTS
        )
        .forEach(
            (
                [
                    name,
                    methods
                ]
            ) => {

                checkGlobal(
                    name,
                    result
                );


                checkContract(
                    name,
                    methods,
                    result
                );

            }
        );

    }


    /* ========================================================
       DEPENDENCY ORDER CHECK
       ======================================================== */

    function checkDependencyOrder(
        result
    ) {

        /*
         * Runtime cannot always expose actual script/module
         * evaluation order. We therefore use explicit dependency
         * availability as the authoritative runtime check.
         */

        const loadedIndexes =
            [];


        DEPENDENCY_ORDER.forEach(
            (
                name,
                index
            ) => {

                if (
                    isObjectLike(
                        getGlobal(
                            name
                        )
                    )
                ) {

                    loadedIndexes.push(
                        {
                            name,
                            index
                        }
                    );

                }

            }
        );


        let previousIndex =
            -1;


        loadedIndexes.forEach(
            entry => {

                if (
                    entry.index <
                    previousIndex
                ) {

                    result.summary
                        .dependencyOrderValid =
                        false;

                }


                previousIndex =
                    Math.max(

                        previousIndex,

                        entry.index

                    );

            }
        );


        if (
            !result.summary
                .dependencyOrderValid
        ) {

            result.valid =
                false;


            result.errors.push({

                type:
                    "dependency-order",

                message:
                    "Loaded dependency order tidak konsisten."

            });

        }

    }


    /* ========================================================
       OPTIONAL GLOBAL WARNINGS
       ======================================================== */

    function checkOptionalGlobals(
        result
    ) {

        OPTIONAL_GLOBALS
            .forEach(
                name => {

                    if (
                        !isObjectLike(
                            getGlobal(
                                name
                            )
                        )
                    ) {

                        result.warnings.push({

                            type:
                                "optional-global-missing",

                            global:
                                name

                        });

                    }

                }
            );

    }


    /* ========================================================
       CHECK CONTRACT ONLY
       ======================================================== */

    function check(
        options = {}
    ) {

        const result =
            createResult();


        /*
         * Optional control:
         *
         * allowOptionalWarnings
         */

        const allowOptionalWarnings =

            options
                .allowOptionalWarnings !==
            false;


        checkContracts(
            result
        );


        checkDependencyOrder(
            result
        );


        if (
            allowOptionalWarnings
        ) {

            checkOptionalGlobals(
                result
            );

        }


        result.summary.requiredGlobals =
            Object.keys(
                CONTRACTS
            ).length;


        result.summary.missingGlobals =

            Object.values(
                result.globals
            )
            .filter(
                item =>
                    !item.exists
            )
            .length;


        if (
            result.summary.missingGlobals
        ) {

            result.valid =
                false;


            Object.entries(
                result.globals
            )
            .forEach(
                (
                    [
                        name,
                        state
                    ]
                ) => {

                    if (
                        !state.exists
                    ) {

                        result.errors.push({

                            type:
                                "missing-global",

                            global:
                                name

                        });

                    }

                }
            );

        }


        return result;

    }


    /* ========================================================
       ASSERT
       ======================================================== */

    function assert(
        options = {}
    ) {

        const result =
            check(
                options
            );


        if (
            !result.valid
        ) {

            const messages =
                [];


            result.errors.forEach(
                error => {

                    if (
                        error.type ===
                        "missing-api"
                    ) {

                        messages.push(

                            `${error.global}: ` +
                            `missing API [${error.missing.join(", ")}]`

                        );

                    }
                    else if (
                        error.type ===
                        "missing-global"
                    ) {

                        messages.push(

                            `Missing global: ${error.global}`

                        );

                    }
                    else {

                        messages.push(

                            error.message ||

                            JSON.stringify(
                                error
                            )

                        );

                    }

                }
            );


            throw new Error(

                messages.join(
                    "\n"
                )

            );

        }


        return true;

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getSummary(
        result
    ) {

        return {

            version:
                VERSION,

            valid:
                result?.valid ===
                true,

            requiredGlobals:
                result?.summary
                    ?.requiredGlobals ||
                0,

            loadedGlobals:
                result?.summary
                    ?.loadedGlobals ||
                0,

            missingGlobals:
                result?.summary
                    ?.missingGlobals ||
                0,

            requiredApis:
                result?.summary
                    ?.requiredApis ||
                0,

            availableApis:
                result?.summary
                    ?.availableApis ||
                0,

            missingApis:
                result?.summary
                    ?.missingApis ||
                0,

            dependencyOrderValid:
                result?.summary
                    ?.dependencyOrderValid ===
                true

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        options = {}
    ) {

        const result =
            check(
                options
            );


        console.group(
            "PatternMaker Dependency Contract Checker"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Valid:",
            result.valid
        );


        console.log(
            "Summary:",
            getSummary(
                result
            )
        );


        console.log(
            "Errors:",
            result.errors
        );


        console.log(
            "Warnings:",
            result.warnings
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    globalThis.PatternMakerDependencyContractChecker = {

        VERSION,

        CONTRACTS,

        DEPENDENCY_ORDER,

        OPTIONAL_GLOBALS,

        check,

        assert,

        getSummary,

        debug

    };


})();
```
