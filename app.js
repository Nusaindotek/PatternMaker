```javascript id="e2q7pn"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 13 — app.js
 * ============================================================
 *
 * STATUS:
 * LEGACY COMPATIBILITY BRIDGE
 *
 * ============================================================
 *
 * app.js TIDAK LAGI menjadi application controller utama.
 *
 * Controller utama sekarang:
 *
 *     main.js
 *
 * app.js hanya:
 *
 * 1. Menjaga compatibility dengan kode lama.
 * 2. Menyediakan API yang mungkin masih dicari
 *    oleh komponen lama.
 * 3. Tidak membuat event listener baru untuk:
 *       - generate
 *       - reset
 *       - garment change
 *       - measurement change
 *       - preview
 *
 * ============================================================
 */

"use strict";


/* ============================================================
   WAIT FOR UNIVERSAL APP
   ============================================================ */

function getPatternMakerApp() {

    return (
        window.PatternMakerApp ||
        null
    );

}


/* ============================================================
   GENERATE
   ============================================================ */

function generatePatternLegacy() {

    const app =
        getPatternMakerApp();


    if (
        !app ||
        typeof app.generatePattern !==
        "function"
    ) {

        console.warn(
            "PatternMakerApp belum siap."
        );


        return;

    }


    return app.generatePattern();

}


/* ============================================================
   RESET
   ============================================================ */

function resetPatternMakerLegacy() {

    const app =
        getPatternMakerApp();


    if (
        !app ||
        typeof app.reset !==
        "function"
    ) {

        console.warn(
            "PatternMakerApp belum siap."
        );


        return;

    }


    return app.reset();

}


/* ============================================================
   PREVIEW
   ============================================================ */

function refreshPatternPreviewLegacy() {

    const app =
        getPatternMakerApp();


    if (
        !app ||
        typeof app.fitPreview !==
        "function"
    ) {

        return;

    }


    return app.fitPreview();

}


/* ============================================================
   GLOBAL COMPATIBILITY OBJECT
   ============================================================ */

window.PatternMakerLegacyApp = {

    generate:
        generatePatternLegacy,

    reset:
        resetPatternMakerLegacy,

    refreshPreview:
        refreshPatternPreviewLegacy

};


/* ============================================================
   LEGACY GLOBAL FUNCTIONS
   ============================================================
 *
 * Jika kode lama memanggil:
 *
 *     generatePattern()
 *
 * atau:
 *
 *     reset()
 *
 * kita tetap menyediakan alias.
 *
 * Namun alias hanya meneruskan ke main.js.
 *
 * ============================================================
 */

window.generatePatternLegacy =
    generatePatternLegacy;


window.resetPatternMaker =
    resetPatternMakerLegacy;


/* ============================================================
   MODULE READY
   ============================================================ */

window.addEventListener(

    "PatternMakerModulesReady",

    () => {

        console.log(
            "PatternMaker Universal controller ready."
        );

    }

);
```
