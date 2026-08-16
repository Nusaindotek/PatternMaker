/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 57
 *
 * FILE:
 *   engine/production-geometry.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   BASE PATTERN
 *        ↓
 *   PRODUCTION GEOMETRY
 *        ↓
 *   CUTTING GEOMETRY
 *
 * ============================================================
 *
 * CATATAN:
 *
 * `applyLegacyOffset=true` hanya compatibility mode untuk
 * geometry V5 yang masih memakai radial seam.
 *
 * Untuk pipeline final:
 *
 *   seam-production.js
 *
 * akan menjadi pemilik seam allowance produksi.
 *
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
       DISTANCE
       ======================================================== */

    function distance(
        a,
        b
    ) {

        return Math.hypot(

            num(
                b?.[0]
            ) -
            num(
                a?.[0]
            ),

            num(
                b?.[1]
            ) -
            num(
                a?.[1]
            )

        );

    }


    /* ========================================================
       SIGNED AREA
       ======================================================== */

    function signedArea(
        points
    ) {

        if (
            !Array.isArray(
                points
            ) ||
            points.length < 3
        ) {

            return 0;

        }


        let area =
            0;


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const a =
                points[i];


            const b =
                points[
                    (
                        i + 1
                    ) %
                    points.length
                ];


            area +=

                num(
                    a?.[0]
                ) *
                num(
                    b?.[1]
                )

                -

                num(
                    b?.[0]
                ) *
                num(
                    a?.[1]
                );

        }


        return area / 2;

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getBounds(
        points
    ) {

        if (
            !Array.isArray(
                points
            ) ||
            points.length === 0
        ) {

            return {

                minX:
                    0,

                minY:
                    0,

                maxX:
                    0,

                maxY:
                    0,

                width:
                    0,

                height:
                    0

            };

        }


        const xs =
            points.map(
                point =>
                    num(
                        point?.[0]
                    )
            );


        const ys =
            points.map(
                point =>
                    num(
                        point?.[1]
                    )
            );


        const minX =
            Math.min(
                ...xs
            );


        const maxX =
            Math.max(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxY =
            Math.max(
                ...ys
            );


        return {

            minX,

            minY,

            maxX,

            maxY,

            width:
                maxX -
                minX,

            height:
                maxY -
                minY

        };

    }


    /* ========================================================
       FINITE POINT
       ======================================================== */

    function isFinitePoint(
        point
    ) {

        return (

            Array.isArray(
                point
            ) &&

            point.length >=
            2 &&

            Number.isFinite(
                Number(
                    point[0]
                )
            ) &&

            Number.isFinite(
                Number(
                    point[1]
                )
            )

        );

    }


    /* ========================================================
       VALIDATE PIECE
       ======================================================== */

    function validatePiece(
        piece,
        index = 0
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !piece ||
            typeof piece !==
                "object"
        ) {

            errors.push(

                `Piece ${index + 1} bukan object.`

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const points =

            piece.cutPoints ||
            piece.points ||
            [];


        if (
            !Array.isArray(
                points
            ) ||
            points.length < 3
        ) {

            errors.push(

                `Piece ${index + 1} membutuhkan ` +
                "minimal 3 points."

            );

        }


        (
            points ||
            []
        )
        .forEach(
            (
                point,
                pointIndex
            ) => {

                if (
                    !isFinitePoint(
                        point
                    )
                ) {

                    errors.push(

                        `Piece ${index + 1}, ` +
                        `point ${pointIndex + 1} invalid.`

                    );

                }

            }
        );


        if (
            Array.isArray(
                points
            ) &&
            points.length >= 3
        ) {

            if (
                Math.abs(
                    signedArea(
                        points
                    )
                ) <
                1e-8
            ) {

                warnings.push(

                    `Piece ${index + 1} ` +
                    "memiliki area mendekati nol."

                );

            }

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       LEGACY RADIAL OFFSET
       ======================================================== */

    function offsetRadial(
        points,
        amount
    ) {

        const source =
            clonePoints(
                points
            );


        const seam =
            num(
                amount
            );


        if (
            !(seam > 0) ||
            source.length < 3
        ) {

            return source;

        }


        let cx =
            0;


        let cy =
            0;


        source.forEach(
            (
                [
                    x,
                    y
                ]
            ) => {

                cx += x;

                cy += y;

            }
        );


        cx /=
            source.length;


        cy /=
            source.length;


        return source.map(
            (
                [
                    x,
                    y
                ]
            ) => {

                const dx =
                    x - cx;


                const dy =
                    y - cy;


                const length =
                    Math.hypot(
                        dx,
                        dy
                    ) ||
                    1;


                const factor =
                    (
                        length +
                        seam
                    ) /
                    length;


                return [

                    Math.round(

                        (
                            cx +
                            dx * factor
                        ) * 1000

                    ) / 1000,

                    Math.round(

                        (
                            cy +
                            dy * factor
                        ) * 1000

                    ) / 1000

                ];

            }
        );

    }


    /* ========================================================
       NORMALIZE PATTERN
       ======================================================== */

    function normalizePattern(
        pattern
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            throw new Error(

                "Base pattern tidak valid."

            );

        }


        const pieces =
            pattern.pieces.map(
                piece => {

                    const points =
                        clonePoints(

                            piece.points ||
                            piece.cutPoints

                        );


                    const seamPoints =

                        Array.isArray(
                            piece.seamPoints
                        )

                            ? clonePoints(
                                piece.seamPoints
                            )

                            : clonePoints(
                                points
                            );


                    return {

                        ...clone(
                            piece
                        ),

                        points,

                        seamPoints,

                        cutPoints:

                            Array.isArray(
                                piece.cutPoints
                            )

                                ? clonePoints(
                                    piece.cutPoints
                                )

                                : null

                    };

                }
            );


        return {

            type:
                pattern.type ||
                "base-pattern",

            engine:
                pattern.engine ||
                null,

            version:
                pattern.version ||
                null,

            pieces,

            metadata: {

                ...(pattern.metadata || {})

            }

        };

    }


    /* ========================================================
       CREATE PRODUCTION PATTERN
       ======================================================== */

    function createProductionPattern(
        pattern,
        options = {}
    ) {

        const normalized =
            normalizePattern(
                pattern
            );


        const seamAllowance =
            Math.max(

                0,

                num(
                    options.seamAllowance,
                    0
                )

            );


        const applyLegacyOffset =
            options.applyLegacyOffset ===
            true;


        const pieces =
            normalized.pieces.map(
                piece => {

                    const seamPoints =
                        clonePoints(

                            piece.seamPoints ||
                            piece.points

                        );


                    const alreadyHasSeam =
                        piece.metadata
                            ?.seamAllowanceIncluded ===
                        true;


                    const shouldOffset =

                        applyLegacyOffset &&

                        seamAllowance > 0 &&

                        !alreadyHasSeam;


                    const cutPoints =

                        shouldOffset

                            ? offsetRadial(

                                seamPoints,

                                seamAllowance

                              )

                            : clonePoints(

                                piece.cutPoints ||
                                seamPoints

                              );


                    return {

                        ...piece,

                        seamPoints,

                        cutPoints,

                        points:
                            clonePoints(
                                cutPoints
                            ),

                        layer:
                            piece.layer ||
                            "CUT",

                        metadata: {

                            ...(piece.metadata || {}),

                            productionGeometry:
                                true,

                            seamAllowanceCm:
                                seamAllowance,

                            cutGeometrySource:

                                shouldOffset

                                    ? "legacy-radial"

                                    : "base"

                        }

                    };

                }
            );


        return {

            type:
                "production-pattern",

            engine:
                normalized.engine,

            version:
                VERSION,

            pieces,

            metadata: {

                ...normalized.metadata,

                unit:
                    "cm",

                scale:
                    1,

                geometryType:
                    "PRODUCTION",

                seamAllowanceCm:
                    seamAllowance,

                seamStrategy:

                    applyLegacyOffset

                        ? "legacy-radial-compatibility"

                        : "separate-production-layer",

                productionGeometry:
                    true

            }

        };

    }


    /* ========================================================
       CUTTING GEOMETRY
       ======================================================== */

    function toCuttingGeometry(
        pattern,
        options = {}
    ) {

        return createProductionPattern(

            pattern,

            options

        );

    }


    /* ========================================================
       VALIDATE PRODUCTION PATTERN
       ======================================================== */

    function validateProductionPattern(
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
            pattern.pieces.length === 0
        ) {

            errors.push(

                "Production pattern tidak memiliki pieces."

            );


            return {

                valid:
                    false,

                errors,

                warnings,

                summary: {

                    pieceCount:
                        0

                }

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const result =
                    validatePiece(
                        piece,
                        index
                    );


                errors.push(
                    ...result.errors
                );


                warnings.push(
                    ...result.warnings
                );

            }
        );


        const allPoints =

            pattern.pieces.flatMap(

                piece =>

                    piece.cutPoints ||
                    piece.points ||
                    []

            );


        const bounds =
            getBounds(
                allPoints
            );


        return {

            valid:
                errors.length === 0,

            errors,

            warnings,

            summary: {

                pieceCount:
                    pattern.pieces.length,

                bounds

            }

        };

    }


    /* ========================================================
       PATTERN BOUNDS
       ======================================================== */

    function getPatternBounds(
        pattern
    ) {

        const allPoints =

            (
                pattern?.pieces ||
                []
            )
            .flatMap(

                piece =>

                    piece.cutPoints ||
                    piece.points ||
                    []

            );


        return getBounds(
            allPoints
        );

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerProductionGeometry = {

        VERSION,

        getBounds,

        signedArea,

        distance,

        validatePiece,

        normalizePattern,

        createProductionPattern,

        toCuttingGeometry,

        validateProductionPattern,

        getPatternBounds,

        offsetRadial

    };


})();
