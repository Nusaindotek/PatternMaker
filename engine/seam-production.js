/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 58
 *
 * FILE:
 *   engine/seam-production.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   BASE PATTERN
 *        ↓
 *   SEAM PRODUCTION
 *        ↓
 *   CUTTING GEOMETRY
 *
 * V1:
 * - seam = 0  → geometry tetap
 * - seam > 0  → legacy radial compatibility offset
 * - base pattern tidak dimutasi
 * - seam metadata disimpan per piece
 *
 * IMPORTANT:
 *
 * Legacy radial offset hanya compatibility layer.
 * Ini BELUM merupakan true polygon offset produksi
 * dengan edge-by-edge offset / corner join / curve offset.
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

            "production-geometry.js harus dimuat " +
            "sebelum seam-production.js."

        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


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


        return Number.isFinite(n)
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
       CLONE POINTS
       ======================================================== */

    function clonePoints(
        points
    ) {

        return (
            points ||
            []
        )
        .map(
            point => [

                num(
                    point?.[0]
                ),

                num(
                    point?.[1]
                )

            ]
        );

    }


    /* ========================================================
       OPTIONS
       ======================================================== */

    function normalizeOptions(
        options = {}
    ) {

        return {

            defaultSeam:

                Math.max(

                    0,

                    num(
                        options.defaultSeam,
                        0
                    )

                ),

            strategy:
                options.strategy ||
                "legacy-radial",

            applyWhenIncluded:
                options.applyWhenIncluded !==
                false,

            keepBasePoints:
                options.keepBasePoints !==
                false,

            keepExistingCutPoints:
                options.keepExistingCutPoints ===
                true

        };

    }


    /* ========================================================
       PIECE SEAM
       ======================================================== */

    function getPieceSeam(
        piece,
        defaultSeam
    ) {

        const value =

            piece?.metadata
                ?.seamAllowanceCm

            ??

            piece?.seamAllowanceCm;


        return Math.max(

            0,

            num(
                value,
                defaultSeam
            )

        );

    }


    /* ========================================================
       APPLY PIECE SEAM
       ======================================================== */

    function applyPieceSeam(
        piece,
        seam,
        options
    ) {

        const basePoints =
            clonePoints(

                piece?.seamPoints ||

                piece?.points ||

                piece?.cutPoints ||

                []

            );


        if (
            basePoints.length <
            3
        ) {

            throw new Error(

                `Piece "${piece?.name || "unknown"}" ` +
                "tidak memiliki geometry yang valid."

            );

        }


        const existingCut =

            Array.isArray(
                piece?.cutPoints
            )

                ? clonePoints(
                    piece.cutPoints
                )

                : null;


        let cutPoints;


        /*
         * Preserve an existing cut geometry
         * only when explicitly requested.
         */

        if (
            options.keepExistingCutPoints &&
            existingCut
        ) {

            cutPoints =
                existingCut;

        }

        else if (
            seam <= 0
        ) {

            cutPoints =
                clonePoints(
                    basePoints
                );

        }

        else if (
            options.strategy ===
            "legacy-radial"
        ) {

            cutPoints =
                Geometry.offsetRadial(

                    basePoints,

                    seam

                );

        }

        else {

            throw new Error(

                `Seam strategy "${options.strategy}" ` +
                "belum tersedia."

            );

        }


        return {

            ...clone(
                piece
            ),

            /*
             * Original sewing/base geometry.
             */

            points:
                clonePoints(
                    basePoints
                ),

            seamPoints:
                clonePoints(
                    basePoints
                ),

            /*
             * Production cutting boundary.
             */

            cutPoints,

            layer:
                "CUT",

            metadata: {

                ...(piece?.metadata || {}),

                seamProduction:
                    true,

                seamAllowanceCm:
                    seam,

                seamStrategy:

                    seam > 0

                        ? options.strategy

                        : "none",

                seamVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       APPLY SEAM ALLOWANCE
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

                "Pattern tidak valid untuk seam allowance."

            );

        }


        const config =
            normalizeOptions(
                options
            );


        const pieces =
            pattern.pieces.map(
                piece => {

                    const seam =
                        getPieceSeam(

                            piece,

                            config.defaultSeam

                        );


                    return applyPieceSeam(

                        piece,

                        seam,

                        config

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

                seamProduction:
                    true,

                seamStrategy:
                    config.strategy,

                defaultSeamAllowanceCm:
                    config.defaultSeam,

                seamVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       VALIDATE SEAM PATTERN
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

            errors.push(

                "Seam pattern tidak memiliki pieces."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const points =

                    piece.cutPoints ||

                    piece.points ||

                    [];


                if (
                    !Array.isArray(
                        points
                    ) ||
                    points.length <
                    3
                ) {

                    errors.push(

                        `Piece ${index + 1} ` +
                        "tidak memiliki cutPoints valid."

                    );


                    return;

                }


                points.forEach(
                    (
                        point,
                        pointIndex
                    ) => {

                        if (

                            !Array.isArray(
                                point
                            )

                            ||

                            point.length <
                            2

                            ||

                            !Number.isFinite(
                                Number(
                                    point[0]
                                )
                            )

                            ||

                            !Number.isFinite(
                                Number(
                                    point[1]
                                )
                            )

                        ) {

                            errors.push(

                                `Piece ${index + 1}, ` +
                                `point ${pointIndex + 1} ` +
                                "tidak valid."

                            );

                        }

                    }
                );


                const seam =
                    num(

                        piece.metadata
                            ?.seamAllowanceCm,

                        0

                    );


                if (
                    seam < 0
                ) {

                    errors.push(

                        `Piece ${index + 1} ` +
                        "memiliki seam allowance negatif."

                    );

                }

            }
        );


        /*
         * Explicitly warn that this is still
         * compatibility geometry.
         */

        if (

            pattern.metadata
                ?.seamStrategy ===
            "legacy-radial"

        ) {

            warnings.push(

                "Geometry menggunakan " +
                "legacy-radial compatibility offset; " +
                "belum merupakan true polygon offset produksi."

            );

        }


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

        const pieces =
            pattern?.pieces ||
            [];


        const values =
            pieces.map(
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
                        total + value,

                    0
                  )
                  /
                  positive.length

                : 0;


        return {

            pieceCount:
                pieces.length,

            averageSeam:
                Math.round(
                    average *
                    1000
                ) / 1000,

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
       CUTTING GEOMETRY
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

                "Pattern tidak valid untuk cutting geometry."

            );

        }


        const normalized =
            pattern.pieces.map(
                piece => ({

                    ...clone(
                        piece
                    ),

                    cutPoints:
                        clonePoints(

                            piece.cutPoints ||

                            piece.seamPoints ||

                            piece.points

                        )

                })
            );


        return {

            type:
                "cutting-pattern",

            engine:
                pattern.engine ||
                null,

            version:
                VERSION,

            pieces:
                normalized,

            metadata: {

                ...(pattern.metadata || {}),

                geometryType:
                    "CUTTING"

            }

        };

    }


    /* ========================================================
       PRODUCTION READY CHECK
       ======================================================== */

    function isProductionReady(
        pattern
    ) {

        const validation =
            validateSeamPattern(
                pattern
            );


        return validation.valid;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerSeamProduction = {

        VERSION,

        applySeamAllowance,

        validateSeamPattern,

        getSeamSummary,

        toCuttingGeometry,

        isProductionReady

    };


})();
