/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 24 — engine/seam-production.js
 * ============================================================
 *
 * PRODUCTION SEAM ALLOWANCE ENGINE
 *
 * Fungsi:
 *
 * 1. Mengambil base pattern piece.
 * 2. Membuat offset perimeter.
 * 3. Menghasilkan cutting boundary.
 * 4. Mempertahankan construction points.
 * 5. Tidak mengubah base pattern.
 *
 * ============================================================
 *
 * DATA FLOW
 *
 * Base Pattern
 *      ↓
 * Seam Production Engine
 *      ↓
 * Cut Boundary
 *      ↓
 * Production Geometry
 *
 * ============================================================
 *
 * CATATAN
 *
 * Offset polygon di sini adalah pendekatan parametrik dasar.
 * Untuk bentuk kurva/concave yang sangat kompleks, engine
 * offset tingkat lanjut dapat menggantikan fungsi ini tanpa
 * mengubah API publik.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const ProductionGeometry =
        window.PatternMakerProductionGeometry;


    if (!ProductionGeometry) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    /* ========================================================
       HELPERS
       ======================================================== */

    function num(
        value,
        fallback = 0
    ) {

        const n =
            Number(value);


        return Number.isFinite(n)
            ? n
            : fallback;

    }


    function round(
        value
    ) {

        return Math.round(
            Number(value) * 1000
        ) / 1000;

    }


    function clonePoint(
        point
    ) {

        return [

            round(
                point[0]
            ),

            round(
                point[1]
            )

        ];

    }


    function clonePoints(
        points = []
    ) {

        return points.map(
            clonePoint
        );

    }


    /* ========================================================
       AREA / ORIENTATION
       ======================================================== */

    function polygonSignedArea(
        points
    ) {

        let area =
            0;


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (
                    i + 1
                ) %
                points.length;


            area +=

                (
                    points[i][0] *
                    points[j][1]
                )

                -

                (
                    points[j][0] *
                    points[i][1]
                );

        }


        return area / 2;

    }


    function polygonOrientation(
        points
    ) {

        const area =
            polygonSignedArea(
                points
            );


        if (
            area > 0
        ) {

            return "CCW";

        }


        if (
            area < 0
        ) {

            return "CW";

        }


        return "DEGENERATE";

    }


    /* ========================================================
       VECTOR HELPERS
       ======================================================== */

    function normalizeVector(
        x,
        y
    ) {

        const length =
            Math.hypot(
                x,
                y
            );


        if (
            length === 0
        ) {

            return {

                x: 0,

                y: 0

            };

        }


        return {

            x:
                x / length,

            y:
                y / length

        };

    }


    function perpendicular(
        vector,
        orientation
    ) {

        /*
         * Untuk polygon CCW:
         * outward normal berada di kanan edge.
         *
         * Untuk polygon CW:
         * outward normal berada di kiri edge.
         */

        if (
            orientation === "CCW"
        ) {

            return {

                x:
                    vector.y,

                y:
                    -vector.x

            };

        }


        return {

            x:
                -vector.y,

            y:
                vector.x

        };

    }


    /* ========================================================
       LINE INTERSECTION
       ======================================================== */

    function lineIntersection(
        lineA,
        lineB
    ) {

        const x1 =
            lineA.a[0];

        const y1 =
            lineA.a[1];

        const x2 =
            lineA.b[0];

        const y2 =
            lineA.b[1];


        const x3 =
            lineB.a[0];

        const y3 =
            lineB.a[1];

        const x4 =
            lineB.b[0];

        const y4 =
            lineB.b[1];


        const denominator =

            (
                x1 - x2
            ) *
            (
                y3 - y4
            )

            -

            (
                y1 - y2
            ) *
            (
                x3 - x4
            );


        if (
            Math.abs(
                denominator
            ) <
            1e-9
        ) {

            return null;

        }


        const numeratorX =

            (
                (
                    x1 * y2 -
                    y1 * x2
                ) *
                (
                    x3 - x4
                )
            )

            -

            (
                (
                    x1 - x2
                ) *
                (
                    x3 * y4 -
                    y3 * x4
                )
            );


        const numeratorY =

            (
                (
                    x1 * y2 -
                    y1 * x2
                ) *
                (
                    y3 - y4
                )
            )

            -

            (
                (
                    y1 - y2
                ) *
                (
                    x3 * y4 -
                    y3 * x4
                )
            );


        return [

            numeratorX /
                denominator,

            numeratorY /
                denominator

        ];

    }


    /* ========================================================
       OFFSET EDGE
       ======================================================== */

    function offsetEdge(
        a,
        b,
        distance,
        orientation
    ) {

        const dx =
            b[0] -
            a[0];


        const dy =
            b[1] -
            a[1];


        const direction =
            normalizeVector(
                dx,
                dy
            );


        const normal =
            perpendicular(
                direction,
                orientation
            );


        return {

            a: [

                round(
                    a[0] +
                    normal.x *
                    distance
                ),

                round(
                    a[1] +
                    normal.y *
                    distance
                )

            ],

            b: [

                round(
                    b[0] +
                    normal.x *
                    distance
                ),

                round(
                    b[1] +
                    normal.y *
                    distance
                )

            ]

        };

    }


    /* ========================================================
       OFFSET POLYGON
       ======================================================== */

    function offsetPolygon(
        points,
        distance
    ) {

        const original =
            clonePoints(
                points
            );


        if (
            original.length < 3
        ) {

            throw new Error(
                "Offset membutuhkan minimal 3 titik."
            );

        }


        if (
            distance === 0
        ) {

            return original;

        }


        const orientation =
            polygonOrientation(
                original
            );


        if (
            orientation ===
            "DEGENERATE"
        ) {

            throw new Error(
                "Polygon degenerate."
            );

        }


        const edgeCount =
            original.length;


        const edges =
            [];


        for (
            let i = 0;
            i < edgeCount;
            i++
        ) {

            const current =
                original[i];


            const next =
                original[
                    (
                        i + 1
                    ) %
                    edgeCount
                ];


            edges.push(

                offsetEdge(

                    current,

                    next,

                    distance,

                    orientation

                )

            );

        }


        const output =
            [];


        for (
            let i = 0;
            i < edgeCount;
            i++
        ) {

            const previousEdge =
                edges[
                    (
                        i - 1 +
                        edgeCount
                    ) %
                    edgeCount
                ];


            const currentEdge =
                edges[i];


            const intersection =
                lineIntersection(

                    previousEdge,

                    currentEdge

                );


            if (
                intersection
            ) {

                output.push([

                    round(
                        intersection[0]
                    ),

                    round(
                        intersection[1]
                    )

                ]);

            }
            else {

                /*
                 * Parallel fallback.
                 */

                output.push([

                    round(
                        currentEdge.a[0]
                    ),

                    round(
                        currentEdge.a[1]
                    )

                ]);

            }

        }


        return output;

    }


    /* ========================================================
       ADD SEAM TO PIECE
       ======================================================== */

    function createSeamPiece(
        piece,
        distance
    ) {

        const seam =
            Math.max(
                0,
                num(
                    distance,
                    0
                )
            );


        const basePoints =
            clonePoints(
                piece.points
            );


        if (
            seam === 0
        ) {

            return {

                ...piece,

                basePoints,

                cutPoints:
                    clonePoints(
                        basePoints
                    ),

                seamAllowance:
                    0

            };

        }


        const cutPoints =
            offsetPolygon(

                basePoints,

                seam

            );


        return {

            ...piece,

            basePoints,

            cutPoints,

            seamAllowance:
                seam,

            metadata: {

                ...(piece.metadata || {}),

                hasSeamAllowance:
                    true,

                seamAllowanceCm:
                    seam

            }

        };

    }


    /* ========================================================
       APPLY SEAM TO PATTERN
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
                "Pattern tidak memiliki pieces."
            );

        }


        const defaultSeam =
            Math.max(
                0,
                num(
                    options.defaultSeam,
                    1
                )
            );


        const resultPieces =
            pattern.pieces.map(
                piece => {

                    const seam =
                        piece.seamAllowance !==
                            undefined

                            ? num(
                                piece.seamAllowance,
                                defaultSeam
                            )

                            : defaultSeam;


                    return createSeamPiece(

                        piece,

                        seam

                    );

                }
            );


        return {

            ...pattern,

            pieces:
                resultPieces,

            metadata: {

                ...(pattern.metadata || {}),

                seamProcessed:
                    true,

                seamUnit:
                    "cm",

                seamDefault:
                    defaultSeam,

                seamProcessedAt:
                    new Date()
                        .toISOString()

            }

        };

    }


    /* ========================================================
       VALIDATE SEAM PIECE
       ======================================================== */

    function validateSeamPiece(
        piece
    ) {

        const errors = [];


        if (
            !piece.basePoints ||
            piece.basePoints.length < 3
        ) {

            errors.push(

                "basePoints tidak valid."

            );

        }


        if (
            !piece.cutPoints ||
            piece.cutPoints.length < 3
        ) {

            errors.push(

                "cutPoints tidak valid."

            );

        }


        const seam =
            Number(
                piece.seamAllowance
            );


        if (
            !Number.isFinite(
                seam
            ) ||
            seam < 0
        ) {

            errors.push(

                "seamAllowance tidak valid."

            );

        }


        return {

            valid:
                errors.length === 0,

            errors

        };

    }


    /* ========================================================
       VALIDATE PATTERN
       ======================================================== */

    function validateSeamPattern(
        pattern
    ) {

        const errors = [];


        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            return {

                valid:
                    false,

                errors: [

                    "Pattern tidak valid."

                ]

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const result =
                    validateSeamPiece(
                        piece
                    );


                if (
                    !result.valid
                ) {

                    errors.push({

                        index,

                        piece:
                            piece.name,

                        errors:
                            result.errors

                    });

                }

            }
        );


        return {

            valid:
                errors.length === 0,

            errors

        };

    }


    /* ========================================================
       CONVERT TO CUTTING GEOMETRY
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


        const pieces =
            pattern.pieces.map(
                piece => {

                    const points =

                        piece.cutPoints &&
                        piece.cutPoints.length

                            ? clonePoints(
                                piece.cutPoints
                            )

                            : clonePoints(
                                piece.points
                            );


                    const cutPiece = {

                        ...piece,

                        points,

                        layer:
                            "CUT",

                        basePoints:
                            clonePoints(
                                piece.basePoints ||
                                piece.points
                            ),

                        cuttingBoundary:
                            true

                    };


                    /*
                     * Base pattern tetap
                     * tersedia untuk informasi konstruksi.
                     */

                    cutPiece.metadata = {

                        ...(piece.metadata || {}),

                        cuttingBoundary:
                            true

                    };


                    /*
                     * Recalculate bounds.
                     */

                    cutPiece.bounds =
                        ProductionGeometry
                            .getBounds(
                                points
                            );


                    return cutPiece;

                }
            );


        return {

            ...pattern,

            pieces,

            metadata: {

                ...(pattern.metadata || {}),

                geometryType:
                    "CUTTING_BOUNDARY",

                generatedAt:
                    new Date()
                        .toISOString()

            }

        };

    }


    /* ========================================================
       GET SEAM SUMMARY
       ======================================================== */

    function getSeamSummary(
        pattern
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            return {

                pieceCount:
                    0,

                averageSeam:
                    0,

                maxSeam:
                    0

            };

        }


        const values =
            pattern.pieces.map(
                piece =>
                    Number(
                        piece.seamAllowance ||
                        0
                    )
            );


        const total =
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,

                0

            );


        const max =
            values.length
                ? Math.max(
                    ...values
                )
                : 0;


        return {

            pieceCount:
                values.length,

            averageSeam:
                values.length
                    ? round(
                        total /
                        values.length
                    )
                    : 0,

            maxSeam:
                round(
                    max
                )

        };

    }


    /* ========================================================
       EXPORT GLOBAL API
       ======================================================== */

    window.PatternMakerSeamProduction = {

        polygonSignedArea,

        polygonOrientation,

        offsetPolygon,

        createSeamPiece,

        applySeamAllowance,

        validateSeamPiece,

        validateSeamPattern,

        toCuttingGeometry,

        getSeamSummary

    };


})();
