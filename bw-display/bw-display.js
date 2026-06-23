/**
 * Bandwidth Display Plugin v1.5
 * fm-dx-webserver plugin – önálló widget, megjeleníti az aktuális sávszélességet.
 *
 * Adatforrás: window.parsedData.sigRaw – az utolsó szám a tényleges BW értéke kHz-ben.
 * Példa: "Ss33.3,4,4,236" → 236 kHz
 *
 * Telepítés: másold be a plugins/ mappába.
 * Kompatibilis: fm-dx-webserver 1.2.0+
 *
 * Szerző: Balázs (Claude segítségével)
 */

(function () {
    'use strict';

    const PLUGIN_NAME = 'Bandwidth Display';
    const PLUGIN_VERSION = '1.5';

    // -----------------------------------------------------------------------
    // Widget CSS
    // -----------------------------------------------------------------------
    const STYLES = `
        #bw-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9000;
            background: #1a1a2e;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 10px 16px;
            min-width: 130px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            font-family: 'Consolas', 'Courier New', monospace;
            user-select: none;
            cursor: move;
        }
        #bw-widget-title {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #888;
            margin-bottom: 4px;
        }
        #bw-widget-value {
            font-size: 22px;
            font-weight: bold;
            color: #e0e0e0;
            line-height: 1.1;
        }
        #bw-widget-unit {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }
    `;

    // -----------------------------------------------------------------------
    // sigRaw-ból kinyeri a tényleges sávszélességet
    // Formátum: "Ss33.3,4,4,236" vagy "Sm7.0,19,8,56" → utolsó szám a BW
    // -----------------------------------------------------------------------
    function parseBwFromSigRaw(sigRaw) {
        if (!sigRaw || typeof sigRaw !== 'string') return null;
        const parts = sigRaw.split(',');
        if (parts.length < 2) return null;
        const last = parseInt(parts[parts.length - 1], 10);
        return isNaN(last) ? null : last;
    }

    // -----------------------------------------------------------------------
    // Widget létrehozása
    // -----------------------------------------------------------------------
    function createWidget() {
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);

        const widget = document.createElement('div');
        widget.id = 'bw-widget';
        widget.innerHTML = `
            <div id="bw-widget-title">Bandwidth</div>
            <div id="bw-widget-value">—</div>
            <div id="bw-widget-unit">kHz</div>
        `;
        document.body.appendChild(widget);

        makeDraggable(widget);

        const savedPos = loadPosition();
        if (savedPos) {
            widget.style.left   = savedPos.x + 'px';
            widget.style.top    = savedPos.y + 'px';
            widget.style.right  = 'auto';
            widget.style.bottom = 'auto';
        }

        return {
            value: document.getElementById('bw-widget-value'),
            unit:  document.getElementById('bw-widget-unit'),
        };
    }

    // -----------------------------------------------------------------------
    // Megjelenítő frissítése
    // -----------------------------------------------------------------------
    function updateWidget(els, bw) {
        if (bw === null || isNaN(bw)) {
            els.value.textContent = '—';
            els.unit.textContent  = 'kHz';
            return;
        }
        els.value.textContent = bw;
        els.unit.textContent  = 'kHz';
    }

    // -----------------------------------------------------------------------
    // Polling – window.parsedData.sigRaw olvasása 500ms-enként
    // -----------------------------------------------------------------------
    function startPolling(els) {
        let lastSigRaw = null;

        function poll() {
            if (window.parsedData && window.parsedData.sigRaw) {
                const sigRaw = window.parsedData.sigRaw;
                if (sigRaw !== lastSigRaw) {
                    lastSigRaw = sigRaw;
                    const bw = parseBwFromSigRaw(sigRaw);
                    updateWidget(els, bw);
                }
            }
        }

        setInterval(poll, 500);
        poll();
    }

    // -----------------------------------------------------------------------
    // Drag & drop
    // -----------------------------------------------------------------------
    function makeDraggable(el) {
        let startX, startY, startLeft, startTop;

        el.addEventListener('mousedown', function (e) {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            startX    = e.clientX;
            startY    = e.clientY;
            startLeft = rect.left;
            startTop  = rect.top;

            el.style.right  = 'auto';
            el.style.bottom = 'auto';
            el.style.left   = startLeft + 'px';
            el.style.top    = startTop  + 'px';

            function onMove(e) {
                const newLeft = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  startLeft + e.clientX - startX));
                const newTop  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, startTop  + e.clientY - startY));
                el.style.left = newLeft + 'px';
                el.style.top  = newTop  + 'px';
            }

            function onUp() {
                savePosition(parseInt(el.style.left), parseInt(el.style.top));
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup',   onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
        });
    }

    function savePosition(x, y) {
        try { sessionStorage.setItem('bw-widget-pos', JSON.stringify({ x, y })); } catch (e) {}
    }

    function loadPosition() {
        try { return JSON.parse(sessionStorage.getItem('bw-widget-pos')); } catch (e) { return null; }
    }

    // -----------------------------------------------------------------------
    // Inicializálás
    // -----------------------------------------------------------------------
    function init() {
        console.log('[Plugin] ' + PLUGIN_NAME + ' v' + PLUGIN_VERSION + ' betöltve.');
        const els = createWidget();
        setTimeout(function () { startPolling(els); }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
