/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 79
 *
 * FILE:
 *   engine/nesting-validator.js
 * ============================================================
 *
 * NESTING / MARKER QUALITY GATE
 *
 * Validates:
 *
 * - marker dimensions
 * - placed pieces
 * - unplaced pieces
 * - material width overflow
 * - material length
 * - polygon finiteness
 * - polygon overlap
 * - duplicate placements
 * - rotation policy
 * - grainline policy
 * - efficiency
 *
 * ============================================================
 *
 * DOES NOT:
 *
 * - modify geometry
 * - move pieces
 * - optimize nesting
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Nesting =
        window.PatternMakerNestingEngine;


    if (
        !Nesting
    ) {

        throw new Error(
            "nesting-engine.js harus dimuat sebelum nesting-validator.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const EPSILON =
        1e-7;


    /* ========================================================
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        requireAllPlaced:
            true,

        requireInsideMarker:
            true,

        checkOverlap:
            true,

        checkDuplicateIds:
            true,

        respectGrainline:
            true,

        allowRotation90:
            true,

        minimumEfficiency:
            0,

        maximumEfficiency:
            100

    };


    /* ========================================================
       NUMBER
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


    /* ========================================================
       NORMALIZE OPTIONS
       ======================================================== */

    function normalizeOptions(
        options = {}
    ) {

        return {

            ...DEFAULT_OPTIONS,

            ...options

        };

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getBounds(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length === 0
        ) {

            return {

                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
                width: 0,
                height: 0

            };

        }


        const xs =
            points.map(
                point =>
                    num(
                        point[0]
                    )
            );


        const ys =
            points.map(
                point =>
                    num(
                        point[1]
                    )
            );


        const minX =
            Math.min(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxX =
            Math.max(
                ...xs
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
                maxX - minX,

            height:
                maxY - minY

        };

    }


    /* ========================================================
       POINT VALIDATION
       ======================================================== */

    function validatePoints(
        points
    ) {

        const errors =
            [];


        if (
            !Array.isArray(points) ||
            points.length <
            3
        ) {

            errors.push(
                "Polygon membutuhkan minimal 3 points."
            );


            return {

                valid:
                    false,

                errors

            };

        }


        points.forEach(
            (
                point,
                index
            ) => {

                if (
                    !Array.isArray(point) ||
                    point.length < 2
                ) {

                    errors.push(

                        `Point ${index + 1} invalid.`

                    );


                    return;

                }


                if (
                    !Number.isFinite(
                        Number(
                            point[0]
                        )
                    ) ||
                    !Number.isFinite(
                        Number(
                            point[1]
                        )
                    )
                ) {

                    errors.push(

                        `Point ${index + 1} ` +
                        "memiliki coordinate non-finite."

                    );

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
       ORIENTATION
       ======================================================== */

    function orientation(
        a,
        b,
        c
    ) {

        const value =

            (
                b[1] -
                a[1]
            )
            *
            (
                c[0] -
                b[0]
            )

            -

            (
                b[0] -
                a[0]
            )
            *
            (
                c[1] -
                b[1]
            );


        if (
            Math.abs(value) <=
            EPSILON
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

            b[0] <=
            Math.max(
                a[0],
                c[0]
            ) +
            EPSILON

            &&

            b[0] >=
            Math.min(
                a[0],
                c[0]
            ) -
            EPSILON

            &&

            b[1] <=
            Math.max(
                a[1],
                c[1]
            ) +
            EPSILON

            &&

            b[1] >=
            Math.min(
                a[1],
                c[1]
            ) -
            EPSILON

        );

    }


    /* ========================================================
       SEGMENT INTERSECTION
       ======================================================== */

    function segmentsIntersect(
        p1,
        p2,
        q1,
        q2
    ) {

        const o1 =
            orientation(
                p1,
                p2,
                q1
            );


        const o2 =
            orientation(
                p1,
                p2,
                q2
            );


        const o3 =
            orientation(
                q1,
                q2,
                p1
            );


        const o4 =
            orientation(
                q1,
                q2,
                p2
            );


        if (
            o1 !== o2 &&
            o3 !== o4
        ) {

            return true;

        }


        if (
            o1 === 0 &&
            onSegment(
                p1,
                q1,
                p2
            )
        ) {

            return true;

        }


        if (
            o2 === 0 &&
            onSegment(
                p1,
                q2,
                p2
            )
        ) {

            return true;

        }


        if (
            o3 === 0 &&
            onSegment(
                q1,
                p1,
                q2
            )
        ) {

            return true;

        }


        if (
            o4 === 0 &&
            onSegment(
                q1,
                p2,
                q2
            )
        ) {

            return true;

        }


        return false;

    }


    /* ========================================================
       POLYGON INTERSECTION
       ======================================================== */

    function polygonsIntersect(
        polygonA,
        polygonB
    ) {

        const boundsA =
            getBounds(
                polygonA
            );


        const boundsB =
            getBounds(
                polygonB
            );


        /*
         * Fast bounds rejection.
         */

        if (

            boundsA.maxX <=
            boundsB.minX

            ||

            boundsA.minX >=
            boundsB.maxX

            ||

            boundsA.maxY <=
            boundsB.minY

            ||

            boundsA.minY >=
            boundsB.maxY

        ) {

            /*
             * Touching at exactly the boundary
             * is not treated as overlap here.
             */

            return false;

        }


        /*
         * Edge intersections.
         */

        for (
            let i = 0;
            i < polygonA.length;
            i++
        ) {

            const a1 =
                polygonA[i];


            const a2 =
                polygonA[
                    (
                        i + 1
                    )
                    %
                    polygonA.length
                ];


            for (
                let j = 0;
                j < polygonB.length;
                j++
            ) {

                const b1 =
                    polygonB[j];


                const b2 =
                    polygonB[
                        (
                            j + 1
                        )
                        %
                        polygonB.length
                    ];


                if (
                    segmentsIntersect(
                        a1,
                        a2,
                        b1,
                        b2
                    )
                ) {

                    return true;

                }

            }

        }


        return false;

    }


    /* ========================================================
       MARKER CONTAINMENT
       ======================================================== */

    function isInsideMarker(
        points,
        markerWidth,
        markerLength,
        margin = 0
    ) {

        const bounds =
            getBounds(
                points
            );


        return (

            bounds.minX >=
            margin -
            EPSILON

            &&

            bounds.maxX <=
            markerWidth -
            margin +
            EPSILON

            &&

            bounds.minY >=
            margin -
            EPSILON

            &&

            bounds.maxY <=
            markerLength -
            margin +
            EPSILON

        );

    }


    /* ========================================================
       DUPLICATE IDS
       ======================================================== */

    function findDuplicateIds(
        placements
    ) {

        const result =
            [];

        const seen =
            new Map();


        (
            placements ||
            []
        )
        .forEach(
            (
                placement,
                index
            ) => {

                const id =
                    String(
                        placement?.id ||
                        `INDEX-${index}`
                    );


                if (
                    seen.has(
                        id
                    )
                ) {

                    result.push({

                        id,

                        first:
                            seen.get(
                                id
                            ),

                        duplicate:
                            index

                    });

                }
                else {

                    seen.set(
                        id,
                        index
                    );

                }

            }
        );


        return result;

    }


    /* ========================================================
       ROTATION VALIDATION
       ======================================================== */

    function validateRotation(
        placement,
        options
    ) {

        const errors =
            [];


        const rotation =
            num(
                placement.rotation,
                0
            );


        if (
            rotation !== 0 &&
            rotation !== 90
        ) {

            errors.push(

                `${placement.name || placement.id}: ` +
                `rotation ${rotation}° tidak didukung.`

            );

        }


        if (
            rotation === 90 &&
            !options.allowRotation90
        ) {

            errors.push(

                `${placement.name || placement.id}: ` +
                "rotation 90° tidak diizinkan."

            );

        }


        /*
         * If grainline is explicitly marked as locked,
         * 90° rotation must be rejected.
         */

        const metadata =
            placement.metadata ||
            {};


        const grainLocked =

            metadata.grainlineLocked ===
            true

            ||

            metadata.respectGrainline ===
            true;


        if (
            options.respectGrainline &&
            grainLocked &&
            rotation ===
            90
        ) {

            errors.push(

                `${placement.name || placement.id}: ` +
                "rotation 90° melanggar grainline."

            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       PLACEMENT VALIDATION
       ======================================================== */

    function validatePlacement(
        placement,
        index,
        marker,
        options
    ) {

        const errors =
            [];

        const warnings =
            [];


        const name =
            placement?.name ||
            placement?.id ||
            `piece-${index + 1}`;


        const points =
            placement?.points;


        const pointValidation =
            validatePoints(
                points
            );


        if (
            !pointValidation.valid
        ) {

            errors.push(

                ...pointValidation.errors.map(
                    error =>
                        `${name}: ${error}`
                )

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        /*
         * Bounds.
         */

        if (
            options.requireInsideMarker
        ) {

            const inside =
                isInsideMarker(

                    points,

                    marker.width,

                    marker.length,

                    marker.margin || 0

                );


            if (
                !inside
            ) {

                errors.push(

                    `${name}: piece keluar dari marker.`

                );

            }

        }


        /*
         * Rotation.
         */

        const rotation =
            validateRotation(

                placement,

                options

            );


        if (
            !rotation.valid
        ) {

            errors.push(
                ...rotation.errors
            );

        }


        /*
         * Placement metadata.
         */

        if (
            !Number.isFinite(
                Number(
                    placement.x
                )
            ) ||
            !Number.isFinite(
                Number(
                    placement.y
                )
            )
        ) {

            errors.push(

                `${name}: translation x/y invalid.`

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
       OVERLAP MATRIX
       ======================================================== */

    function findOverlaps(
        placements
    ) {

        const overlaps =
            [];


        for (
            let i = 0;
            i < placements.length;
            i++
        ) {

            const a =
                placements[i];


            for (
                let j = i + 1;
                j < placements.length;
                j++
            ) {

                const b =
                    placements[j];


                if (
                    polygonsIntersect(
                        a.points,
                        b.points
                    )
                ) {

                    overlaps.push({

                        first:
                            a.id ||
                            a.name,

                        second:
                            b.id ||
                            b.name

                    });

                }

            }

        }


        return overlaps;

    }


    /* ========================================================
       EFFICIENCY
       ======================================================== */

    function calculateEfficiency(
        result
    ) {

        const marker =
            result.marker;


        if (
            !marker
        ) {

            return 0;

        }


        const materialArea =
            num(
                marker.area
            );


        const pieceArea =
            num(
                marker.pieceArea
            );


        if (
            materialArea <=
            EPSILON
        ) {

            return 0;

        }


        return (

            pieceArea /
            materialArea

        ) * 100;

    }


    /* ========================================================
       FULL VALIDATION
       ======================================================== */

    function validate(
        result,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const errors =
            [];

        const warnings =
            [];

        const checks =
            [];


        if (
            !result ||
            !result.marker
        ) {

            return {

                valid:
                    false,

                version:
                    VERSION,

                errors: [

                    "Nesting result tidak memiliki marker."

                ],

                warnings: [],

                checks: [],

                summary: {

                    placed:
                        0,

                    unplaced:
                        0

                }

            };

        }


        const marker = {

            width:
                num(
                    result.marker.width
                ),

            length:
                num(
                    result.marker.length
                ),

            area:
                num(
                    result.marker.area
                ),

            pieceArea:
                num(
                    result.marker.pieceArea
                ),

            efficiency:
                num(
                    result.marker.efficiency
                ),

            margin:
                num(
                    result.metadata?.margin,
                    0
                )

        };


        /* ----------------------------------------------------
           MARKER DIMENSIONS
           ---------------------------------------------------- */

        const markerValid =

            marker.width >
            0

            &&

            marker.length >
            0

            &&

            marker.area >
            0;


        checks.push({

            name:
                "marker-dimensions",

            passed:
                markerValid,

            message:
                markerValid
                    ? ""
                    : "Marker dimensions invalid."

        });


        if (
            !markerValid
        ) {

            errors.push(
                "Marker dimensions invalid."
            );

        }


        /* ----------------------------------------------------
           PLACEMENTS
           ---------------------------------------------------- */

        const placements =
            Array.isArray(
                result.placements
            )

                ? result.placements

                : [];


        const unplaced =
            Array.isArray(
                result.unplaced
            )

                ? result.unplaced

                : [];


        if (
            config.requireAllPlaced &&
            unplaced.length >
            0
        ) {

            errors.push(

                `${unplaced.length} piece belum ditempatkan.`

            );

        }


        checks.push({

            name:
                "all-pieces-placed",

            passed:
                !config.requireAllPlaced ||
                unplaced.length === 0,

            message:

                unplaced.length
                    ? `${unplaced.length} unplaced.`
                    : ""

        });


        /* ----------------------------------------------------
           DUPLICATE IDS
           ---------------------------------------------------- */

        if (
            config.checkDuplicateIds
        ) {

            const duplicates =
                findDuplicateIds(
                    placements
                );


            if (
                duplicates.length
            ) {

                errors.push(

                    "Duplicate placement ID ditemukan."

                );

            }


            checks.push({

                name:
                    "duplicate-placement-ids",

                passed:
                    duplicates.length === 0,

                message:
                    duplicates.length
                        ? JSON.stringify(
                            duplicates
                          )
                        : ""

            });

        }


        /* ----------------------------------------------------
           PIECE VALIDATION
           ---------------------------------------------------- */

        placements.forEach(
            (
                placement,
                index
            ) => {

                const validation =
                    validatePlacement(

                        placement,

                        index,

                        marker,

                        config

                    );


                errors.push(
                    ...validation.errors
                );


                warnings.push(
                    ...validation.warnings
                );

            }
        );


        checks.push({

            name:
                "placement-geometry",

            passed:
                placements.every(
                    placement =>
                        validatePlacement(

                            placement,

                            0,

                            marker,

                            config

                        ).valid
                ),

            message:
                ""

        });


        /* ----------------------------------------------------
           OVERLAP
           ---------------------------------------------------- */

        if (
            config.checkOverlap
        ) {

            const overlaps =
                findOverlaps(
                    placements
                );


            if (
                overlaps.length
            ) {

                errors.push(

                    `${overlaps.length} overlap ` +
                    "antar-piece ditemukan."

                );

            }


            checks.push({

                name:
                    "piece-overlap",

                passed:
                    overlaps.length === 0,

                message:
                    overlaps.length
                        ? JSON.stringify(
                            overlaps
                          )
                        : ""

            });

        }


        /* ----------------------------------------------------
           EFFICIENCY
           ---------------------------------------------------- */

        const calculatedEfficiency =
            calculateEfficiency(
                result
            );


        const reportedEfficiency =
            marker.efficiency;


        if (
            Math.abs(

                calculatedEfficiency -
                reportedEfficiency

            ) >
            0.01
        ) {

            warnings.push(

                `Reported efficiency (${reportedEfficiency}) ` +
                `berbeda dari calculated (${calculatedEfficiency}).`

            );

        }


        if (
            calculatedEfficiency <
            config.minimumEfficiency
        ) {

            errors.push(

                `Efficiency ${calculatedEfficiency.toFixed(3)}% ` +
                `di bawah minimum ${config.minimumEfficiency}%.`

            );

        }


        if (
            calculatedEfficiency >
            config.maximumEfficiency +
            EPSILON
        ) {

            errors.push(

                `Efficiency ${calculatedEfficiency.toFixed(3)}% ` +
                "melebihi 100%."

            );

        }


        checks.push({

            name:
                "efficiency",

            passed:

                calculatedEfficiency >=
                config.minimumEfficiency

                &&

                calculatedEfficiency <=
                config.maximumEfficiency,

            message:
                ""

        });


        /* ----------------------------------------------------
           FINAL
           ---------------------------------------------------- */

        return {

            valid:
                errors.length ===
                0,

            version:
                VERSION,

            errors,

            warnings,

            checks,

            summary: {

                placed:
                    placements.length,

                unplaced:
                    unplaced.length,

                markerWidth:
                    marker.width,

                markerLength:
                    marker.length,

                markerArea:
                    marker.area,

                pieceArea:
                    marker.pieceArea,

                reportedEfficiency:
                    reportedEfficiency,

                calculatedEfficiency,

                overlapCount:
                    findOverlaps(
                        placements
                    ).length

            }

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        result,
        options = {}
    ) {

        const report =
            validate(
                result,
                options
            );


        console.group(
            "PatternMaker Nesting Validator"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Valid:",
            report.valid
        );


        console.log(
            "Errors:",
            report.errors
        );


        console.log(
            "Warnings:",
            report.warnings
        );


        console.log(
            "Summary:",
            report.summary
        );


        console.groupEnd();


        return report;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerNestingValidator = {

        VERSION,

        DEFAULT_OPTIONS,

        getBounds,

        validatePoints,

        polygonsIntersect,

        findDuplicateIds,

        findOverlaps,

        calculateEfficiency,

        validatePlacement,

        validate,

        debug

    };


})();
