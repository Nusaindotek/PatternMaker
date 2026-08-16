/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 53
 * FILE: engine/pants.js
 * ============================================================
 *
 * Migrated from V5:
 *   makePantPieces(shorts = false)
 *
 * Supports:
 *   pants
 *   shorts
 *
 * Internal unit:
 *   cm
 * ============================================================
 */

(function () {

    "use strict";


    const Schema =
        window.PatternMakerMeasurementSchema;

    const Mapper =
        window.PatternMakerMeasurementMapper;


    if (
        !Schema ||
        !Mapper
    ) {

        throw new Error(
            "Pants Engine membutuhkan measurement-schema.js dan measurement-mapper.js."
        );

    }


    const VERSION =
        "V5-MIGRATED-v1";


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


    function round1(
        value
    ) {

        return Math.round(
            num(value) * 10
        ) / 10;

    }


    function clonePoints(
        points
    ) {

        return (points || [])
            .map(
                point => [
                    num(point[0]),
                    num(point[1])
                ]
            );

    }


    function getMeasurement(
        measurements,
        canonicalId,
        fallback,
        aliases = []
    ) {

        const direct =
            measurements?.[
                canonicalId
            ];


        if (
            Number.isFinite(
                Number(direct)
            ) &&
            Number(direct) > 0
        ) {

            return Number(direct);

        }


        const mapped =
            Mapper.getValue(
                measurements || {},
                canonicalId
            );


        if (
            Number.isFinite(
                Number(mapped)
            ) &&
            Number(mapped) > 0
        ) {

            return Number(mapped);

        }


        for (
            const alias of aliases
        ) {

            const value =
                measurements?.[
                    alias
                ];


            if (
                Number.isFinite(
                    Number(value)
                ) &&
                Number(value) > 0
            ) {

                return Number(value);

            }

        }


        return num(
            fallback
        );

    }


    function getEase(
        context
    ) {

        return Math.max(

            0,

            num(
                context?.fabric?.ease,
                num(
                    context?.options?.ease,
                    0
                )
            )

        );

    }


    function getSeam(
        context
    ) {

        const seam =
            num(
                context?.options?.seam,
                0
            );


        const tolerance =
            num(
                context?.options?.tolerance,
                0
            );


        return Math.max(
            0,
            seam + tolerance
        );

    }


    function addRadialSeam(
        points,
        seam
    ) {

        if (
            !(seam > 0) ||
            points.length < 3
        ) {

            return clonePoints(
                points
            );

        }


        let cx = 0;
        let cy = 0;


        for (
            const [
                x,
                y
            ] of points
        ) {

            cx += x;
            cy += y;

        }


        cx /=
            points.length;

        cy /=
            points.length;


        return points.map(
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
                    ) || 1;

                const factor =
                    (
                        length + seam
                    ) / length;


                return [

                    round1(
                        cx + dx * factor
                    ),

                    round1(
                        cy + dy * factor
                    )

                ];

            }
        );

    }


    function makePiece(
        name,
        points,
        options = {}
    ) {

        return {

            name,

            layer:
                options.layer ||
                "OUTLINE",

            points:
                clonePoints(
                    points
                ),

            closed:
                options.closed !==
                false,

            grainline:
                options.grainline
                    ? clonePoints(
                        options.grainline
                    )
                    : null,

            notches:
                options.notches
                    ? clonePoints(
                        options.notches
                    )
                    : [],

            label:
                options.label ||
                name,

            metadata: {

                engine:
                    "pants",

                source:
                    "V5-migration",

                version:
                    VERSION

            }

        };

    }


    function makePantPieces(
        context = {}
    ) {

        const measurements =
            context?.profile?.measurements ||
            context?.measurements ||
            {};


        const garmentId =
            String(
                context?.garment?.id ||
                context?.garmentId ||
                ""
            )
            .toLowerCase();


        const isShorts =
            garmentId ===
            "shorts" ||
            context?.shorts === true;


        const ease =
            getEase(
                context
            );


        const hip =
            getMeasurement(
                measurements,
                "hip",
                96
            ) + ease;


        /*
         * Retain V5 calculation.
         */

        const waist =
            getMeasurement(
                measurements,
                "waist",
                72
            ) + ease;


        void waist;


        const rise =
            getMeasurement(
                measurements,
                "crotchDepth",
                27,
                [
                    "rise"
                ]
            );


        const length =
            isShorts

                ? getMeasurement(
                    measurements,
                    "garmentLength",
                    38,
                    [
                        "shortsLength"
                    ]
                )

                : getMeasurement(
                    measurements,
                    "outseam",
                    100,
                    [
                        "pantsLength",
                        "garmentLength"
                    ]
                );


        const thigh =
            getMeasurement(
                measurements,
                "thigh",
                58,
                [
                    "thighCircumference"
                ]
            ) + ease;


        /*
         * V5 uses hem.
         *
         * Canonical fallback:
         * ankle.
         */

        const hem =
            getMeasurement(
                measurements,
                "ankle",
                32,
                [
                    "hem"
                ]
            ) + ease;


        const seam =
            getSeam(
                context
            );


        const w =
            Math.max(
                23,
                hip / 4
            );


        const crotch =
            Math.max(
                8,
                thigh / 7
            );


        const hemW =
            Math.max(
                12,
                hem / 4
            );


        /*
         * LEFT
         */

        const left = [

            [20, 20],

            [
                20 + w,
                20
            ],

            [
                20 + w + crotch,
                20 + rise
            ],

            [
                20 + w + 4,
                20 + length
            ],

            [
                20 + w - hemW,
                20 + length
            ],

            [
                20,
                20 + length - 8
            ]

        ];


        /*
         * RIGHT
         */

        const x2 =
            55 + w;


        const right = [

            [x2, 20],

            [
                x2 + w,
                20
            ],

            [
                x2 + w + crotch,
                20 + rise
            ],

            [
                x2 + w + 4,
                20 + length
            ],

            [
                x2 + w - hemW,
                20 + length
            ],

            [
                x2,
                20 + length - 8
            ]

        ];


        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        const categoryLabel =
            Schema.getCategoryLabel(
                category
            );


        const includeNotches =
            context?.options?.notches !==
            false;


        const type =
            isShorts
                ? "SHORTS"
                : "PANTS";


        const leftNotches =
            includeNotches
                ? [
                    [
                        20 + w,
                        20 + rise + 8
                    ]
                ]
                : [];


        const rightNotches =
            includeNotches
                ? [
                    [
                        x2 + w,
                        20 + rise + 8
                    ]
                ]
                : [];


        const leftPiece =
            makePiece(

                `${type}_L`,

                addRadialSeam(
                    left,
                    seam
                ),

                {

                    grainline: [

                        [
                            20 + w / 2,
                            30
                        ],

                        [
                            20 + w / 2,
                            20 +
                            length -
                            8
                        ]

                    ],

                    notches:
                        leftNotches,

                    label:
                        `${type} LEFT • ${categoryLabel}`

                }

            );


        const rightPiece =
            makePiece(

                `${type}_R`,

                addRadialSeam(
                    right,
                    seam
                ),

                {

                    grainline: [

                        [
                            x2 + w / 2,
                            30
                        ],

                        [
                            x2 + w / 2,
                            20 +
                            length -
                            8
                        ]

                    ],

                    notches:
                        rightNotches,

                    label:
                        `${type} RIGHT • ${categoryLabel}`

                }

            );


        return {

            type:
                "base-pattern",

            engine:
                "pants",

            version:
                VERSION,

            pieces: [

                leftPiece,
                rightPiece

            ],

            metadata: {

                source:
                    "PatternMaker V5",

                migration:
                    true,

                category,

                categoryLabel,

                garmentType:
                    isShorts
                        ? "shorts"
                        : "pants",

                unit:
                    "cm",

                scale:
                    1,

                fullOpen:
                    true,

                seamAllowanceIncluded:
                    seam > 0,

                productionGeometry:
                    false,

                formula:
                    "V5 makePantPieces extraction"

            }

        };

    }


    const PantsEngine = {

        id:
            "pants",

        label:
            "Pants / Shorts Pattern Engine",

        version:
            VERSION,

        generate:
            makePantPieces,

        makePantPieces

    };


    window.PatternMakerPants =
        PantsEngine;


})();
