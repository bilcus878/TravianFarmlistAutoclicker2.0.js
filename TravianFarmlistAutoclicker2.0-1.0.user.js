// ==UserScript==
// @name         TravianFarmlistAutoclicker2.0
// @namespace    travian-farmlist-autosender
// @version      1.0
// @description  Automaticky kliká na tlačítko "Poslat všechny farmlisty" každých 4–6 minut.
// @match        https://ts6.x1.europe.travian.com/build.php*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_DELAY = 4 * 60 * 1000;   // 4 min v ms
    const MAX_DELAY = 6 * 60 * 1000;   // 6 min v ms
    const FIRST_CLICK_DELAY = 10 * 1000; // 10 s po zapnutí bota

    let enabled = false; // po načtení stránky je bot VYPNUTÝ

    function log(msg) {
        console.log('[FarmlistBot]', msg);
    }

    function formatTime(date) {
        return date.toLocaleTimeString('cs-CZ', { hour12: false });
    }

    function showToast(msg) {
        const old = document.getElementById('farmlist-bot-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.id = 'farmlist-bot-toast';
        toast.style.cssText = `
            position: fixed;
            right: 10px;
            bottom: 60px;
            z-index: 99999;
            background: rgba(0, 0, 0, 0.85);
            color: #fff;
            font-size: 12px;
            padding: 6px 8px;
            border-radius: 4px;
            max-width: 260px;
            white-space: pre-line;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    function findSendAllButton() {
        const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], a'));
        return candidates.find(el =>
            el.textContent && el.textContent.trim().includes('Poslat všechny farmlisty')
        );
    }

    function scheduleNext(nextDelayOverrideMs, lastClickTime) {
        if (!enabled) return;

        const delay = typeof nextDelayOverrideMs === 'number'
            ? nextDelayOverrideMs
            : MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

        const nextTime = new Date(Date.now() + delay);

        if (lastClickTime instanceof Date) {
            const msg =
                'Farmlist kliknut v ' + formatTime(lastClickTime) +
                '\nDalší farmlist se pošle v ' + formatTime(nextTime);
            showToast(msg);
        }

        log('Další klik za ~' + Math.round(delay / 1000) + 's (okolo ' + formatTime(nextTime) + ')');
        setTimeout(clickOnce, delay);
    }

    function clickOnce() {
        if (!enabled) {
            log('Bot je vypnutý, nekliku.');
            return;
        }

        if (!location.search.includes('tt=99')) {
            log('Nejsi na Farmlist tabu (tt=99), nekliku.');
            return;
        }

        const btn = findSendAllButton();

        if (!btn) {
            log('Tlačítko "Poslat všechny farmlisty" NENALEZENO, zkusím to znovu za 30s.');
            setTimeout(clickOnce, 30000);
            return;
        }

        const now = new Date();
        btn.click();
        log('Kliknuto na "Poslat všechny farmlisty" v ' + formatTime(now));

        // po kliknutí naplánujeme další s toastem
        scheduleNext(null, now);
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'farmlist-bot-panel';
        panel.style.cssText = `
            position: fixed;
            right: 10px;
            bottom: 10px;
            z-index: 99999;
            background: rgba(0, 0, 0, 0.75);
            color: #fff;
            font-size: 12px;
            padding: 6px 8px;
            border-radius: 4px;
            cursor: pointer;
            user-select: none;
        `;
        panel.textContent = 'Farmlist bot: OFF (klikni pro zapnutí)';
        panel.title = 'Kliknutím zapneš/vypneš bota';

        panel.addEventListener('click', () => {
            enabled = !enabled;
            if (enabled) {
                panel.textContent = 'Farmlist bot: ON (klikni pro vypnutí)';
                log('Bot zapnut ručně.');

                if (location.search.includes('tt=99')) {
                    const now = new Date();
                    const firstTime = new Date(Date.now() + FIRST_CLICK_DELAY);
                    showToast(
                        'Bot zapnut v ' + formatTime(now) +
                        '\nPrvní farmlist se pošle v ' + formatTime(firstTime)
                    );

                    setTimeout(() => {
                        if (!enabled) {
                            log('Bot byl vypnut před prvním klikem, nekliku.');
                            return;
                        }
                        log('První klik po zapnutí bota (po 10s).');
                        clickOnce();
                    }, FIRST_CLICK_DELAY);
                } else {
                    log('Bot je ON, ale nejsi na Farmlist tabu (tt=99). Čekám.');
                }
            } else {
                panel.textContent = 'Farmlist bot: OFF (klikni pro zapnutí)';
                log('Bot vypnut ručně, nové kliky se už neplánují.');
            }
        });

        document.body.appendChild(panel);
    }

    window.addEventListener('load', () => {
        createControlPanel();

        if (!location.search.includes('tt=99')) {
            log('Script běží, ale nejsi na Farmlist tabu (tt=99). Panel aktivní, bot čeká.');
        } else {
            log('Jsi na Farmlist tabu, bot je zatím OFF – zapni ho vpravo dole.');
        }
    });

})();
