/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 26 — engine/production-validator.js
 * ============================================================
 *
 * PRODUCTION GEOMETRY VALIDATOR
 *
 * Tujuan:
 * - Memastikan cutting geometry valid.
 * - Menolak polygon rusak sebelum export.
 * - Menjadi quality gate untuk:
 *
 *     DXF
 *     PLT / HPGL
 *     SVG
 *
 * Validator TIDAK memperbaiki geometry.
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


    const SeamProduction =
        window.PatternMakerSeamProduction;


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const EPSILON =
        0.000001;


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
       NUMBER CHECK
       ======================================================== */

    function isFiniteNumber(
        value
    ) {

        return Number.isFinite(
            Number(value)
        );

    }


    /* ========================================================
       POINT EQUALITY
       ======================================================== */

    function pointsEqual(
        a,
        b,
        epsilon = EPSILON
    ) {

        if (
            !Array.isArray(a) ||
            !Array.isArray(b)
        ) {

            return false;

        }


        return (

            Math.abs(
                Number(a[0]) -
                Number(b[0])
            ) <= epsilon

            &&

            Math.abs(
                Number(a[1]) -
                Number(b[1])
            ) <= epsilon

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

            Number(b[0]) -
            Number(a[0]),

            Number(b[1]) -
            Number(a[1])

        );

    }


    /* ========================================================
       ORIENTATION
       ======================================================== */

    function orientation(
        a,
        b,
        c
    ) {

        const value =

            (
                Number(b[0]) -
                Number(a[0])
            )
            *
            (
                Number(c[1]) -
                Number(a[1])
            )

            -

            (
                Number(b[1]) -
                Number(a[1])
            )
            *
            (
                Number(c[0]) -
                Number(a[0])
            );


        if (
            Math.abs(value) <= EPSILON
        ) {

            return 0;

        }


        return value > 0
            ? 1
            : 2;

    }


    /* ========================================================
       ON SEGMENT
       ======================================================== */

    function onSegment(
        a,
        b,
        c
    ) {

        return (

            Number(b[0]) <=
                Math.max(
                    Number(a[0]),
                    Number(c[0])
                ) + EPSILON

            &&

            Number(b[0]) >=
                Math.min(
                    Number(a[0]),
                    Number(c[0])
                ) - EPSILON

            &&

            Number(b[1]) <=
                Math.max(
                    Number(a[1]),
                    Number(c[1])
                ) + EPSILON

            &&

            Number(b[1]) >=
                Math.min(
                    Number(a[1]),
                    Number(c[1])
                ) - EPSILON

        );

    }


    /* ========================================================
       SEGMENT INTERSECTION
       ======================================================== */

    function segmentsIntersect(
        a,
        b,
        c,
        d
    ) {

        const o1 =
            orientation(
                a,
                b,
                c
            );


        const o2 =
            orientation(
                a,
                b,
                d
            );


        const o3 =
            orientation(
                c,
                d,
                a
            );


        const o4 =
            orientation(
                c,
                d,
                b
            );


        /*
         * General intersection.
         */

        if (
            o1 !== o2 &&
            o3 !== o4
        ) {

            return true;

        }


        /*
         * Collinear cases.
         */

        if (
            o1 === 0 &&
            onSegment(
                a,
                c,
                b
            )
        ) {

            return true;

        }


        if (
            o2 === 0 &&
            onSegment(
                a,
                d,
                b
            )
        ) {

            return true;

        }


        if (
            o3 === 0 &&
            onSegment(
                c,
                a,
                d
            )
        ) {

            return true;

        }


        if (
            o4 === 0 &&
            onSegment(
                c,
                b,
                d
            )
        ) {

            return true;

        }


        return false;

    }


    /* ========================================================
       SELF INTERSECTION
       ======================================================== */

    function findSelfIntersections(
        points
    ) {

        const intersections = [];


        if (
            !Array.isArray(points) ||
            points.length < 4
        ) {

            return intersections;

        }


        const count =
            points.length;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const a =
                points[i];


            const b =
                points[
                    (i + 1) %
                    count
                ];


            for (
                let j = i + 1;
                j < count;
                j++
            ) {

                /*
                 * Adjacent edges share a vertex
                 * and are therefore ignored.
                 */

                if (
                    j === i
                ) {

                    continue;

                }


                if (
                    j ===
                    (
                        i + 1
                    ) %
                    count
                ) {

                    continue;

                }


                /*
                 * First and last edge
                 * are adjacent.
                 */

                if (
                    i === 0 &&
                    j === count - 1
                ) {

                    continue;

                }


                const c =
                    points[j];


                const d =
                    points[
                        (j + 1) %
                        count
                    ];


                if (
                    segmentsIntersect(
                        a,
                        b,
                        c,
                        d
                    )
                ) {

                    intersections.push({

                        edgeA:
                            i,

                        edgeB:
                            j

                    });

                }

            }

        }


        return intersections;

    }


    /* ========================================================
       DUPLICATE POINTS
       ======================================================== */

    function findDuplicatePoints(
        points
    ) {

        const duplicates = [];


        if (
            !Array.isArray(points)
        ) {

            return duplicates;

        }


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < points.length;
                j++
            ) {

                if (
                    pointsEqual(
                        points[i],
                        points[j]
                    )
                ) {

                    /*
                     * First and last point may be
                     * intentionally identical.
                     */

                    if (
                        i === 0 &&
                        j === points.length - 1
                    ) {

                        continue;

                    }


                    duplicates.push({

                        pointA:
                            i,

                        pointB:
                            j

                    });

                }

            }

        }


        return duplicates;

    }


    /* ========================================================
       ZERO LENGTH EDGES
       ======================================================== */

    function findZeroLengthEdges(
        points
    ) {

        const edges = [];


        if (
            !Array.isArray(points) ||
            points.length < 2
        ) {

            return edges;

        }


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


            if (
                distance(
                    a,
                    b
                ) <= EPSILON
            ) {

                edges.push(
                    i
                );

            }

        }


        return edges;

    }


    /* ========================================================
       POINT VALIDATION
       ======================================================== */

    function validatePoints(
        points
    ) {

        const result =
            createResult();


        addCheck(

            result,

            "Points array",

            Array.isArray(
                points
            ),

            "Points harus berupa array."

        );


        if (
            !Array.isArray(points)
        ) {

            return result;

        }


        addCheck(

            result,

            "Minimum points",

            points.length >= 3,

            "Polygon membutuhkan minimal 3 titik."

        );


        points.forEach(
            (
                point,
                index
            ) => {

                const valid =

                    Array.isArray(point) &&

                    point.length >= 2 &&

                    isFiniteNumber(point[0]) &&

                    isFiniteNumber(point[1]);


                addCheck(

                    result,

                    `Coordinate point ${index + 1}`,

                    valid,

                    valid
                        ? ""
                        : `Point ${index + 1} memiliki koordinat tidak valid.`

                );

            }
        );


        return result;

    }


    /* ========================================================
       VALIDATE CLOSED POLYGON
       ======================================================== */

    function validateClosedPolygon(
        points
    ) {

        const result =
            createResult();


        const pointResult =
            validatePoints(
                points
            );


        result.checks.push(
            ...pointResult.checks
        );


        result.errors.push(
            ...pointResult.errors
        );


        result.warnings.push(
            ...pointResult.warnings
        );


        if (
            !pointResult.valid
        ) {

            result.valid =
                false;

            return result;

        }


        /*
         * Zero length edges.
         */

        const zeroEdges =
            findZeroLengthEdges(
                points
            );


        addCheck(

            result,

            "No zero-length edges",

            zeroEdges.length === 0,

            zeroEdges.length
                ? `Edge invalid: ${zeroEdges.join(", ")}`
                : ""

        );


        /*
         * Duplicates.
         */

        const duplicates =
            findDuplicatePoints(
                points
            );


        addCheck(

            result,

            "No duplicate points",

            duplicates.length === 0,

            duplicates.length

                ? "Polygon memiliki duplicate points."

                : ""

        );


        /*
         * Self intersection.
         */

        const intersections =
            findSelfIntersections(
                points
            );


        addCheck(

            result,

            "No self intersections",

            intersections.length === 0,

            intersections.length

                ? "Polygon memiliki self-intersection."

                : ""

        );


        /*
         * Area.
         */

        if (
            Geometry
        ) {

            const area =
                Math.abs(
                    Number(
                        Geometry.calculatePolygonArea(
                            points
                        )
                    )
                );


            addCheck(

                result,

                "Positive polygon area",

                area > EPSILON,

                "Area polygon harus lebih besar dari nol."

            );

        }


        return result;

    }


    /* ========================================================
       BOUNDS VALIDATION
       ======================================================== */

    function validateBounds(
        piece
    ) {

        const result =
            createResult();


        if (
            !Geometry ||
            !piece ||
            !Array.isArray(
                piece.points
            )
        ) {

            return result;

        }


        const bounds =
            Geometry.getBounds(
                piece.points
            );


        const valid =

            isFiniteNumber(
                bounds.minX
            ) &&

            isFiniteNumber(
                bounds.maxX
            ) &&

            isFiniteNumber(
                bounds.minY
            ) &&

            isFiniteNumber(
                bounds.maxY
            ) &&

            isFiniteNumber(
                bounds.width
            ) &&

            isFiniteNumber(
                bounds.height
            );


        addCheck(

            result,

            "Valid bounds",

            valid,

            valid
                ? ""
                : `Bounds piece "${piece.name}" tidak valid.`

        );


        if (
            valid
        ) {

            addCheck(

                result,

                "Positive width",

                bounds.width > EPSILON,

                `Width "${piece.name}" terlalu kecil.`

            );


            addCheck(

                result,

                "Positive height",

                bounds.height > EPSILON,

                `Height "${piece.name}" terlalu kecil.`

            );

        }


        return result;

    }


    /* ========================================================
       GRAINLINE VALIDATION
       ======================================================== */

    function validateGrainline(
        piece
    ) {

        const result =
            createResult();


        if (
            piece.grainline ===
            undefined
        ) {

            addWarning(

                result,

                "Grainline",

                `Piece "${piece.name}" belum memiliki grainline.`

            );


            return result;

        }


        if (
            !Array.isArray(
                piece.grainline
            )
        ) {

            addCheck(

                result,

                "Grainline array",

                false,

                `Grainline "${piece.name}" bukan array.`

            );


            return result;

        }


        if (
            piece.grainline.length ===
            0
        ) {

            addWarning(

                result,

                "Grainline empty",

                `Piece "${piece.name}" belum mempunyai grainline.`

            );


            return result;

        }


        piece.grainline.forEach(
            (
                point,
                index
            ) => {

                const valid =

                    Array.isArray(point) &&

                    point.length >= 2 &&

                    isFiniteNumber(point[0]) &&

                    isFiniteNumber(point[1]);


                addCheck(

                    result,

                    `Grainline point ${index + 1}`,

                    valid,

                    valid
                        ? ""
                        : `Grainline point ${index + 1} tidak valid.`

                );

            }
        );


        if (
            piece.grainline.length >= 2
        ) {

            const length =
                distance(

                    piece.grainline[0],

                    piece.grainline[1]

                );


            addCheck(

                result,

                "Grainline length",

                length > EPSILON,

                `Grainline "${piece.name}" terlalu pendek.`

            );

        }


        return result;

    }


    /* ========================================================
       NOTCH VALIDATION
       ======================================================== */

    function validateNotches(
        piece
    ) {

        const result =
            createResult();


        if (
            piece.notches ===
            undefined
        ) {

            return result;

        }


        if (
            !Array.isArray(
                piece.notches
            )
        ) {

            addCheck(

                result,

                "Notches array",

                false,

                `Notches "${piece.name}" bukan array.`

            );


            return result;

        }


        piece.notches.forEach(
            (
                notch,
                index
            ) => {

                const valid =

                    Array.isArray(
                        notch
                    ) &&

                    notch.length >= 2 &&

                    isFiniteNumber(
                        notch[0]
                    ) &&

                    isFiniteNumber(
                        notch[1]
                    );


                addCheck(

                    result,

                    `Notch ${index + 1}`,

                    valid,

                    valid
                        ? ""
                        : `Notch ${index + 1} "${piece.name}" tidak valid.`

                );

            }
        );


        return result;

    }


    /* ========================================================
       SEAM VALIDATION
       ======================================================== */

    function validateSeam(
        piece
    ) {

        const result =
            createResult();


        const seam =
            Number(
                piece.seamAllowance
            );


        if (
            piece.seamAllowance ===
            undefined
        ) {

            addWarning(

                result,

                "Seam allowance undefined",

                `Piece "${piece.name}" belum memiliki seamAllowance.`

            );


            return result;

        }


        addCheck(

            result,

            "Seam allowance valid",

            Number.isFinite(
                seam
            ) &&
            seam >= 0,

            `Seam allowance "${piece.name}" tidak valid.`

        );


        if (
            piece.cutPoints
        ) {

            addCheck(

                result,

                "Cut points available",

                Array.isArray(
                    piece.cutPoints
                ) &&
                piece.cutPoints.length >= 3,

                `Cut points "${piece.name}" tidak valid.`

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


        const name =
            piece?.name ||
            `Piece #${index + 1}`;


        addCheck(

            result,

            `${name} exists`,

            Boolean(
                piece
            ),

            "Piece tidak tersedia."

        );


        if (
            !piece
        ) {

            return result;

        }


        const geometryResult =
            validateClosedPolygon(
                piece.points
            );


        result.checks.push(
            ...geometryResult.checks
        );


        result.errors.push(
            ...geometryResult.errors
        );


        result.warnings.push(
            ...geometryResult.warnings
        );


        const boundsResult =
            validateBounds(
                piece
            );


        result.checks.push(
            ...boundsResult.checks
        );


        result.errors.push(
            ...boundsResult.errors
        );


        result.warnings.push(
            ...boundsResult.warnings
        );


        const grainlineResult =
            validateGrainline(
                piece
            );


        result.checks.push(
            ...grainlineResult.checks
        );


        result.errors.push(
            ...grainlineResult.errors
        );


        result.warnings.push(
            ...grainlineResult.warnings
        );


        const notchResult =
            validateNotches(
                piece
            );


        result.checks.push(
            ...notchResult.checks
        );


        result.errors.push(
            ...notchResult.errors
        );


        result.warnings.push(
            ...notchResult.warnings
        );


        const seamResult =
            validateSeam(
                piece
            );


        result.checks.push(
            ...seamResult.checks
        );


        result.errors.push(
            ...seamResult.errors
        );


        result.warnings.push(
            ...seamResult.warnings
        );


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       PATTERN VALIDATION
       ======================================================== */

    function validateProductionPattern(
        pattern
    ) {

        const result =
            createResult();


        addCheck(

            result,

            "Pattern exists",

            Boolean(
                pattern
            ),

            "Production pattern belum tersedia."

        );


        if (
            !pattern
        ) {

            return result;

        }


        addCheck(

            result,

            "Pieces array",

            Array.isArray(
                pattern.pieces
            ) &&
            pattern.pieces.length > 0,

            "Pattern tidak memiliki pieces."

        );


        if (
            !Array.isArray(
                pattern.pieces
            )
        ) {

            return result;

        }


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

            }
        );


        /*
         * Metadata
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
                    : `Unit "${unit}" tidak valid.`

            );

        }
        else {

            addWarning(

                result,

                "Pattern unit missing",

                "Pattern belum memiliki metadata.unit."

            );

        }


        /*
         * Geometry type
         */

        const geometryType =
            pattern.metadata?.geometryType;


        if (
            geometryType
        ) {

            addCheck(

                result,

                "Geometry type",

                typeof geometryType ===
                    "string",

                "geometryType harus berupa string."

            );

        }


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       COMPARISON BASE VS CUTTING
       ======================================================== */

    function compareBaseAndCutting(
        basePattern,
        cuttingPattern
    ) {

        const result =
            createResult();


        if (
            !basePattern ||
            !cuttingPattern
        ) {

            addCheck(

                result,

                "Base and cutting patterns",

                false,

                "Base pattern atau cutting pattern tidak tersedia."

            );


            return result;

        }


        const basePieces =
            basePattern.pieces || [];


        const cutPieces =
            cuttingPattern.pieces || [];


        addCheck(

            result,

            "Piece count consistency",

            basePieces.length ===
                cutPieces.length,

            `Base=${basePieces.length}, ` +
            `Cut=${cutPieces.length}.`

        );


        const count =
            Math.min(

                basePieces.length,

                cutPieces.length

            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const base =
                basePieces[i];


            const cut =
                cutPieces[i];


            addCheck(

                result,

                `Piece identity ${i + 1}`,

                (
                    base.name ===
                    cut.name
                ),

                `Base "${base.name}" != Cut "${cut.name}".`

            );


            if (
                cut.basePoints
            ) {

                addCheck(

                    result,

                    `Base geometry preserved ${i + 1}`,

                    Array.isArray(
                        cut.basePoints
                    ) &&
                    cut.basePoints.length >= 3,

                    `Base geometry piece ${i + 1} tidak tersedia.`

                );

            }

        }


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       FULL QUALITY GATE
       ======================================================== */

    function validateForProduction(
        pattern,
        options = {}
    ) {

        const result =
            createResult();


        /*
         * Pattern geometry.
         */

        const patternResult =
            validateProductionPattern(
                pattern
            );


        result.checks.push(
            ...patternResult.checks
        );


        result.errors.push(
            ...patternResult.errors
        );


        result.warnings.push(
            ...patternResult.warnings
        );


        /*
         * Cut geometry harus ada
         * apabila requirement produksi aktif.
         */

        if (
            options.requireCutPoints !== false
        ) {

            (
                pattern?.pieces ||
                []
            )
            .forEach(
                (
                    piece,
                    index
                ) => {

                    addCheck(

                        result,

                        `Cut points piece ${index + 1}`,

                        Array.isArray(
                            piece.cutPoints
                        ) &&
                        piece.cutPoints.length >= 3,

                        `Piece "${piece.name}" ` +
                        "belum mempunyai cutPoints."

                    );

                }
            );

        }


        /*
         * Seam.
         */

        if (
            options.requireSeam === true
        ) {

            (
                pattern?.pieces ||
                []
            )
            .forEach(
                (
                    piece,
                    index
                ) => {

                    addCheck(

                        result,

                        `Seam piece ${index + 1}`,

                        Number.isFinite(
                            Number(
                                piece.seamAllowance
                            )
                        ) &&
                        Number(
                            piece.seamAllowance
                        ) >= 0,

                        `Seam "${piece.name}" tidak valid.`

                    );

                }
            );

        }


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
       DEBUG
       ======================================================== */

    function runDebug(
        pattern = null
    ) {

        const target =
            pattern ||
            window.PatternMakerApp?.state
                ?.cuttingPattern;


        const result =
            validateForProduction(

                target,

                {

                    requireCutPoints:
                        true,

                    requireSeam:
                        true

                }

            );


        const formatted =
            formatResult(
                result
            );


        console.group(
            "PatternMaker Production Validator"
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

    window.PatternMakerProductionValidator = {

        validatePoints,

        validateClosedPolygon,

        validateBounds,

        validateGrainline,

        validateNotches,

        validateSeam,

        validatePiece,

        validateProductionPattern,

        compareBaseAndCutting,

        validateForProduction,

        formatResult,

        runDebug

    };


})();
