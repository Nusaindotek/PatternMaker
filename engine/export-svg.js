/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 32 — engine/export-svg.js
 * ============================================================
 *
 * SVG PRODUCTION EXPORTER
 *
 * Input:
 *   Cutting Geometry
 *
 * Output:
 *   SVG 1:1
 *
 * Internal:
 *   cm
 *
 * Export:
 *   mm
 *
 * ============================================================
 *
 * PRINSIP:
 *
 * Preview SVG di browser bukan sumber export.
 *
 * Exporter ini membaca langsung:
 *
 *     cuttingPattern
 *
 * sehingga:
 *
 * Preview
 * DXF
 * PLT
 * SVG
 *
 * semuanya berasal dari geometry produksi yang sama.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       CONSTANT
       ======================================================== */

    const CM_TO_MM =
        10;


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const ProductionValidator =
        window.PatternMakerProductionValidator;


    if (
        !ProductionValidator
    ) {

        throw new Error(
            "production-validator.js belum tersedia."
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


    function cmToMm(
        value
    ) {

        return round(

            Number(value) *
            CM_TO_MM

        );

    }


    function escapeXml(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );

    }


    /* ========================================================
       POINT CONVERSION
       ======================================================== */

    function pointToMm(
        point
    ) {

        if (
            !Array.isArray(point) ||
            point.length < 2
        ) {

            throw new Error(
                "SVG point tidak valid."
            );

        }


        return {

            x:
                cmToMm(
                    point[0]
                ),

            y:
                cmToMm(
                    point[1]
                )

        };

    }


    function pointsToSvg(
        points
    ) {

        if (
            !Array.isArray(points) ||
            !points.length
        ) {

            return "";

        }


        return points
            .map(
                point => {

                    const converted =
                        pointToMm(
                            point
                        );


                    return (

                        `${converted.x},` +
                        `${converted.y}`

                    );

                }
            )
            .join(" ");

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function calculateBounds(
        pattern
    ) {

        const allPoints =
            [];


        (
            pattern?.pieces ||
            []
        )
        .forEach(
            piece => {

                const points =
                    getCutPoints(
                        piece
                    );


                allPoints.push(
                    ...points
                );

            }
        );


        if (
            !allPoints.length
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
            allPoints.map(
                point =>
                    cmToMm(
                        point[0]
                    )
            );


        const ys =
            allPoints.map(
                point =>
                    cmToMm(
                        point[1]
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
                maxX - minX,

            height:
                maxY - minY

        };

    }


    /* ========================================================
       CUT POINTS
       ======================================================== */

    function getCutPoints(
        piece
    ) {

        if (
            piece?.cutPoints &&
            Array.isArray(
                piece.cutPoints
            ) &&
            piece.cutPoints.length >= 3
        ) {

            return piece.cutPoints;

        }


        if (
            piece?.points &&
            Array.isArray(
                piece.points
            ) &&
            piece.points.length >= 3
        ) {

            return piece.points;

        }


        return [];

    }


    /* ========================================================
       LABEL POSITION
       ======================================================== */

    function getLabelPosition(
        piece
    ) {

        const points =
            getCutPoints(
                piece
            );


        if (
            !points.length
        ) {

            return {

                x: 0,

                y: 0

            };

        }


        const converted =
            points.map(
                point =>
                    pointToMm(
                        point
                    )
            );


        const xs =
            converted.map(
                point =>
                    point.x
            );


        const ys =
            converted.map(
                point =>
                    point.y
            );


        return {

            x:
                (
                    Math.min(...xs) +
                    Math.max(...xs)
                ) / 2,

            y:
                Math.min(...ys) -
                3

        };

    }


    /* ========================================================
       GRAINLINE
       ======================================================== */

    function createGrainlineSvg(
        piece,
        options = {}
    ) {

        if (
            options.includeGrainline === false ||
            !Array.isArray(
                piece?.grainline
            ) ||
            piece.grainline.length < 2
        ) {

            return "";

        }


        const start =
            pointToMm(
                piece.grainline[0]
            );


        const end =
            pointToMm(
                piece.grainline[1]
            );


        return `

        <line
            x1="${start.x}"
            y1="${start.y}"
            x2="${end.x}"
            y2="${end.y}"
            stroke="black"
            stroke-width="0.3"
            stroke-dasharray="2 1"
            fill="none"
            vector-effect="non-scaling-stroke"
        />

        `;

    }


    /* ========================================================
       NOTCH
       ======================================================== */

    function createNotchSvg(
        point,
        options = {}
    ) {

        const size =
            num(
                options.notchSize,
                0.6
            );


        const a = [

            point[0] -
            size,

            point[1] -
            size

        ];


        const b = [

            point[0] +
            size,

            point[1] +
            size

        ];


        const start =
            pointToMm(
                a
            );


        const end =
            pointToMm(
                b
            );


        return `

        <line
            x1="${start.x}"
            y1="${start.y}"
            x2="${end.x}"
            y2="${end.y}"
            stroke="black"
            stroke-width="0.35"
            fill="none"
            vector-effect="non-scaling-stroke"
        />

        `;

    }


    /* ========================================================
       DRILL POINT
       ======================================================== */

    function createDrillSvg(
        point,
        options = {}
    ) {

        const size =
            num(
                options.drillSize,
                0.7
            );


        const p =
            pointToMm(
                point
            );


        const horizontalA = {

            x:
                cmToMm(
                    point[0] -
                    size
                ),

            y:
                p.y

        };


        const horizontalB = {

            x:
                cmToMm(
                    point[0] +
                    size
                ),

            y:
                p.y

        };


        const verticalA = {

            x:
                p.x,

            y:
                cmToMm(
                    point[1] -
                    size
                )

        };


        const verticalB = {

            x:
                p.x,

            y:
                cmToMm(
                    point[1] +
                    size
                )

        };


        return `

        <line
            x1="${horizontalA.x}"
            y1="${horizontalA.y}"
            x2="${horizontalB.x}"
            y2="${horizontalB.y}"
            stroke="black"
            stroke-width="0.3"
        />

        <line
            x1="${verticalA.x}"
            y1="${verticalA.y}"
            x2="${verticalB.x}"
            y2="${verticalB.y}"
            stroke="black"
            stroke-width="0.3"
        />

        `;

    }


    /* ========================================================
       LABEL
       ======================================================== */

    function createLabelSvg(
        piece,
        options = {}
    ) {

        if (
            options.includeLabels === false
        ) {

            return "";

        }


        const position =
            getLabelPosition(
                piece
            );


        const label =
            escapeXml(

                piece.label ||
                piece.name ||
                "PATTERN"

            );


        const fontSize =
            num(
                options.labelHeight,
                2.5
            );


        return `

        <text
            x="${position.x}"
            y="${position.y}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${fontSize}"
            font-weight="700"
            fill="black"
        >
            ${label}
        </text>

        `;

    }


    /* ========================================================
       PIECE SVG
       ======================================================== */

    function createPieceSvg(
        piece,
        index,
        options = {}
    ) {

        const points =
            getCutPoints(
                piece
            );


        if (
            points.length < 3
        ) {

            throw new Error(

                `Piece "${piece?.name || index}" ` +
                "tidak memiliki cutting boundary."

            );

        }


        const polygonPoints =
            pointsToSvg(
                points
            );


        let output =
            "";


        output += `

        <g
            id="piece-${index + 1}"
            data-name="${escapeXml(
                piece.name ||
                `piece-${index + 1}`
            )}"
            data-type="${escapeXml(
                piece.type ||
                "pattern"
            )}"
        >

        `;


        /*
         * CUT
         */

        output += `

        <polygon
            points="${polygonPoints}"
            fill="none"
            stroke="black"
            stroke-width="0.4"
            vector-effect="non-scaling-stroke"
            data-layer="CUT"
        />

        `;


        /*
         * GRAINLINE
         */

        output +=
            createGrainlineSvg(
                piece,
                options
            );


        /*
         * NOTCHES
         */

        if (
            options.includeNotches !== false &&
            Array.isArray(
                piece.notches
            )
        ) {

            piece.notches.forEach(
                notch => {

                    output +=
                        createNotchSvg(
                            notch,
                            options
                        );

                }
            );

        }


        /*
         * DRILL POINTS
         */

        if (
            options.includeDrillPoints !== false &&
            Array.isArray(
                piece.drillPoints
            )
        ) {

            piece.drillPoints.forEach(
                point => {

                    output +=
                        createDrillSvg(
                            point,
                            options
                        );

                }
            );

        }


        /*
         * LABEL
         */

        output +=
            createLabelSvg(
                piece,
                options
            );


        output +=
            `</g>`;

        return output;

    }


    /* ========================================================
       QUALITY GATE
       ======================================================== */

    function validatePattern(
        pattern
    ) {

        if (
            !pattern
        ) {

            throw new Error(
                "Pattern belum tersedia."
            );

        }


        const validation =
            ProductionValidator
                .validateForProduction(

                    pattern,

                    {

                        requireCutPoints:
                            true,

                        requireSeam:
                            true

                    }

                );


        if (
            !validation.valid
        ) {

            const messages =
                validation.errors
                    .slice(
                        0,
                        5
                    )
                    .map(
                        error => {

                            if (
                                typeof error ===
                                "string"
                            ) {

                                return error;

                            }


                            return (

                                error.message ||
                                error.check ||
                                "Geometry invalid."

                            );

                        }
                    );


            throw new Error(

                "SVG export dihentikan: " +
                messages.join(
                    " | "
                )

            );

        }


        return validation;

    }


    /* ========================================================
       SVG DOCUMENT
       ======================================================== */

    function buildSVG(
        pattern,
        options = {}
    ) {

        const config = {

            includeGrainline:
                options.includeGrainline !== false,

            includeNotches:
                options.includeNotches !== false,

            includeDrillPoints:
                options.includeDrillPoints !== false,

            includeLabels:
                options.includeLabels === true,

            labelHeight:
                num(
                    options.labelHeight,
                    2.5
                ),

            notchSize:
                num(
                    options.notchSize,
                    0.6
                ),

            drillSize:
                num(
                    options.drillSize,
                    0.7
                )

        };


        validatePattern(
            pattern
        );


        const bounds =
            calculateBounds(
                pattern
            );


        /*
         * SVG requires positive width/height.
         */

        const width =
            Math.max(
                1,
                bounds.width
            );


        const height =
            Math.max(
                1,
                bounds.height
            );


        let output =
            "";


        output +=
            '<?xml version="1.0" encoding="UTF-8"?>\n';


        output += `

<svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width="${width}mm"
    height="${height}mm"
    viewBox="${bounds.minX} ${bounds.minY} ${width} ${height}"
    data-patternmaker-unit="mm"
    data-patternmaker-scale="1"
    data-source-unit="cm"
>

        `;


        /*
         * Metadata.
         */

        output += `

    <metadata>
        PatternMaker Universal
        Geometry: CUTTING_BOUNDARY
        Source Unit: cm
        Output Unit: mm
        Scale: 1:1
    </metadata>

        `;


        /*
         * White page / no visible fill.
         */

        output += `

    <g
        id="production-pattern"
        fill="none"
    >

        `;


        /*
         * Pieces.
         */

        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                output +=
                    createPieceSvg(

                        piece,

                        index,

                        config

                    );

            }
        );


        output += `

    </g>

        `;


        output +=
            "</svg>";


        return output;

    }


    /* ========================================================
       SVG BLOB
       ======================================================== */

    function createSVGBlob(
        pattern,
        options = {}
    ) {

        const svg =
            buildSVG(
                pattern,
                options
            );


        return new Blob(

            [
                svg
            ],

            {

                type:
                    "image/svg+xml;charset=utf-8"

            }

        );

    }


    /* ========================================================
       DOWNLOAD
       ======================================================== */

    function downloadSVG(
        pattern,
        filename =
            "PatternMaker-Pattern.svg",
        options = {}
    ) {

        const blob =
            createSVGBlob(
                pattern,
                options
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );


        return {

            success:
                true,

            filename,

            format:
                "SVG",

            sourceUnit:
                "cm",

            outputUnit:
                "mm",

            scale:
                1

        };

    }


    /* ========================================================
       EXPORT INFORMATION
       ======================================================== */

    function getExportInfo() {

        return {

            format:
                "SVG 1.1",

            sourceUnit:
                "cm",

            outputUnit:
                "mm",

            conversion:
                CM_TO_MM,

            scale:
                1,

            physicalOutput:
                true

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerSVG = {

        cmToMm,

        pointToMm,

        pointsToSvg,

        calculateBounds,

        getCutPoints,

        getLabelPosition,

        createGrainlineSvg,

        createNotchSvg,

        createDrillSvg,

        createLabelSvg,

        createPieceSvg,

        validatePattern,

        buildSVG,

        createSVGBlob,

        downloadSVG,

        getExportInfo

    };


})();
