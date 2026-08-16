/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 73
 *
 * FILE:
 *   engine/seam-production.js
 * ============================================================
 *
 * SINGLE SEAM PIPELINE
 *
 * Base Pattern
 *      ↓
 * Seam Production
 *      ↓
 * Curve Geometry / Polygon Offset
 *      ↓
 * Cutting Geometry
 *
 * ============================================================
 *
 * IMPORTANT
 *
 * seam-production.js sekarang menjadi satu-satunya
 * orchestrator seam.
 *
 * True geometry tetap dimiliki oleh:
 *
 *   production-geometry.js
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Geometry =
        window.PatternMakerProductionGeometry;


    if (
        !Geometry
    ) {

        throw new Error(
            "production-geometry.js harus dimuat sebelum seam-production.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1.1";


    /* ========================================================
       DEFAULTS
       ======================================================== */

    const DEFAULTS = {

        defaultSeam:
            0,

        miterLimit:
            4,

        curveTolerance:
            0.05,

        maxSegmentLength:
            2,

        maxDepth:
            12,

        minDepth:
            2,

        preserveExistingCutPoints:
            false

    };


    /* ========================================================
       NUMBER
       ======================================================== */

    function num(
        value,
        fallback = 0
    ) {

        const n =
            Number(
                value
            );


        return Number.isFinite(
            n
        )
            ? n
            : fallback;

    }


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


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }


    /* ========================================================
       SEAM FOR PIECE
       ======================================================== */

    function getPieceSeam(
        piece,
        defaultSeam
    ) {

        return Math.max(

            0,

            num(

                piece?.metadata
                    ?.seamAllowanceCm,

                defaultSeam

            )

        );

    }


    /* ========================================================
       APPLY SEAM
       ======================================================== */

    function applySeamAllowance(
        pattern,
        options = {}
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            throw new Error(
                "Pattern tidak valid."
            );

        }


        const config = {

            ...DEFAULTS,

            ...options

        };


        const defaultSeam =
            Math.max(

                0,

                num(
                    config.defaultSeam,
                    0
                )

            );


        const pieces =
            pattern.pieces.map(
                piece => {

                    const seam =
                        getPieceSeam(

                            piece,

                            defaultSeam

                        );


                    /*
                     * Preserve explicit existing cut geometry
                     * only when requested.
                     */

                    if (

                        config
                            .preserveExistingCutPoints ===
                        true

                        &&

                        Array.isArray(
                            piece.cutPoints
                        )

                    ) {

                        return {

                            ...clone(
                                piece
                            ),

                            metadata: {

                                ...(piece.metadata || {}),

                                seamProduction:
                                    true,

                                seamAllowanceCm:
                                    seam,

                                seamStrategy:

                                    piece.metadata
                                        ?.seamStrategy

                                    ||

                                    "existing-cut-geometry",

                                seamVersion:
                                    VERSION

                            }

                        };

                    }


                    /*
                     * Always delegate geometry to
                     * production-geometry.js.
                     *
                     * This guarantees one geometry path.
                     */

                    return Geometry.offsetPiece(

                        piece,

                        seam,

                        {

                            miterLimit:
                                num(
                                    config.miterLimit,
                                    4
                                ),

                            curveTolerance:
                                num(
                                    config.curveTolerance,
                                    0.05
                                ),

                            maxSegmentLength:
                                num(
                                    config.maxSegmentLength,
                                    2
                                ),

                            maxDepth:
                                num(
                                    config.maxDepth,
                                    12
                                ),

                            minDepth:
                                num(
                                    config.minDepth,
                                    2
                                )

                        }

                    );

                }
            );


        return {

            type:
                "production-pattern",

            engine:
                pattern.engine ||
                null,

            version:
                VERSION,

            pieces,

            metadata: {

                ...(pattern.metadata || {}),

                geometryType:
                    "PRODUCTION",

                productionGeometry:
                    true,

                seamProduction:
                    true,

                seamStrategy:
                    "curve-flatten-true-polygon-offset",

                defaultSeamAllowanceCm:
                    defaultSeam,

                curveTolerance:
                    num(
                        config.curveTolerance,
                        0.05
                    ),

                maxSegmentLength:
                    num(
                        config.maxSegmentLength,
                        2
                    ),

                miterLimit:
                    num(
                        config.miterLimit,
                        4
                    ),

                seamVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       VALIDATE
       ======================================================== */

    function validateSeamPattern(
        pattern
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            ) ||
            pattern.pieces.length ===
            0
        ) {

            return {

                valid:
                    false,

                errors: [

                    "Pattern tidak memiliki pieces."

                ],

                warnings: []

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const seamPoints =

                    piece.seamPoints ||

                    piece.points;


                const cutPoints =
                    piece.cutPoints;


                if (
                    !Array.isArray(
                        seamPoints
                    )
                ) {

                    errors.push(

                        `Piece ${piece.name || index + 1} ` +
                        "tidak memiliki seam geometry."

                    );

                }


                if (
                    !Array.isArray(
                        cutPoints
                    )
                ) {

                    errors.push(

                        `Piece ${piece.name || index + 1} ` +
                        "tidak memiliki cut geometry."

                    );

                }


                const seam =
                    num(

                        piece.metadata
                            ?.seamAllowanceCm,

                        null

                    );


                if (
                    seam === null ||
                    seam < 0
                ) {

                    errors.push(

                        `Piece ${piece.name || index + 1} ` +
                        "seam allowance invalid."

                    );

                }


                if (
                    piece.metadata
                        ?.seamStrategy ===
                    "legacy-radial"
                ) {

                    warnings.push(

                        `Piece ${piece.name || index + 1} ` +
                        "masih menggunakan legacy-radial."

                    );

                }


                if (
                    piece.metadata
                        ?.seamStrategy ===
                    "curve-flatten-true-polygon-offset"
                ) {

                    /*
                     * Expected production path.
                     */

                }

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getSeamSummary(
        pattern
    ) {

        const values =

            (
                pattern?.pieces ||
                []
            )
            .map(
                piece =>
                    num(

                        piece.metadata
                            ?.seamAllowanceCm,

                        0

                    )

            );


        const positive =
            values.filter(
                value =>
                    value > 0
            );


        const average =

            positive.length

                ? positive.reduce(
                    (
                        total,
                        value
                    ) =>
                        total +
                        value,

                    0

                  ) /
                  positive.length

                : 0;


        return {

            pieceCount:
                values.length,

            averageSeam:
                average,

            maxSeam:

                positive.length

                    ? Math.max(
                        ...positive
                    )

                    : 0,

            minSeam:

                positive.length

                    ? Math.min(
                        ...positive
                    )

                    : 0,

            anySeam:
                positive.length >
                0,

            strategy:

                pattern?.metadata
                    ?.seamStrategy ||

                "none"

        };

    }


    /* ========================================================
       TO CUTTING GEOMETRY
       ======================================================== */

    function toCuttingGeometry(
        pattern
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            throw new Error(
                "Pattern tidak valid."
            );

        }


        return {

            ...clone(
                pattern
            ),

            type:
                "cutting-pattern",

            version:
                VERSION,

            pieces:

                pattern.pieces.map(
                    piece => ({

                        ...clone(
                            piece
                        ),

                        cutPoints:
                            Geometry.clonePoints(

                                piece.cutPoints ||

                                piece.seamPoints ||

                                piece.points

                            )

                    })

                ),

            metadata: {

                ...(pattern.metadata || {}),

                geometryType:
                    "CUTTING"

            }

        };

    }


    /* ========================================================
       PRODUCTION READY
       ======================================================== */

    function isProductionReady(
        pattern
    ) {

        return validateSeamPattern(
            pattern
        )
        .valid;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerSeamProduction = {

        VERSION,

        DEFAULTS,

        applySeamAllowance,

        validateSeamPattern,

        getSeamSummary,

        toCuttingGeometry,

        isProductionReady

    };


})();
