// ==UserScript==
// @name         TravianFarmlistAutoclicker2.0
// @namespace    https://github.com/bilcus878
// @version      1.2
// @description  Automaticky kliká na tlačítko "Poslat všechny farmlisty" každých 2–3 minut.
// @match        *://*.travian.com/build.php*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MIN_DELAY = 2 * 60 * 1000;   // 2 min v ms
    const MAX_DELAY = 3 * 60 * 1000;   // 3 min v ms
    const FIRST_CLICK_DELAY = 10 * 1000; // 10 s po zapnutí bota
    const RETRY_DELAY = 30 * 1000; // 30 s pokud tlačítko není nalezeno

    let enabled = false;
    let currentTimeout = null;
    let lastClickTime = null;
    let clickCount = 0;
    let nextClickTime = null;

    function log(msg) {
        console.log('[FarmlistBot]', msg);
    }

    function formatTime(date) {
        return date.toLocaleTimeString('cs-CZ', { hour12: false });
    }

    function showToast(msg, permanent = false) {
        // Toast už není potřeba, všechno je v panelu
        return;
    }

    function findSendAllButton() {
        const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], a'));
        return candidates.find(el =>
            el.textContent && el.textContent.trim().includes('Poslat všechny farmlisty')
        );
    }

    function clearScheduledClick() {
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
            log('Zrušen naplánovaný klik.');
        }
    }

    function getRandomDelay() {
        return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    }

    function scheduleNext(delayMs, showNotification = false) {
        if (!enabled) {
            log('Bot je vypnutý, neplánuji další klik.');
            return;
        }

        clearScheduledClick();

        const delay = delayMs || getRandomDelay();
        nextClickTime = new Date(Date.now() + delay);

        if (showNotification && lastClickTime) {
            const msg =
                '✓ Poslední klik: ' + formatTime(lastClickTime) +
                '\n📊 Celkem odesláno: ' + clickCount +
                '\n⏰ Další klik: ' + formatTime(nextClickTime);
            showToast(msg, true); // permanent toast
        }

        log('Další klik za ~' + Math.round(delay / 1000) + 's (okolo ' + formatTime(nextClickTime) + ')');
        currentTimeout = setTimeout(clickOnce, delay);
        
        // Aktualizuj panel s novým časem
        const panel = document.getElementById('farmlist-bot-panel');
        if (panel) updatePanelStatus(panel);
    }

    function clickOnce() {
        if (!enabled) {
            log('Bot je vypnutý, nekliku.');
            return;
        }

        if (!location.search.includes('tt=99')) {
            log('Nejsi na Farmlist tabu (tt=99), zkusím to znovu za 30s.');
            scheduleNext(RETRY_DELAY);
            return;
        }

        const btn = findSendAllButton();

        if (!btn) {
            log('Tlačítko "Poslat všechny farmlisty" NENALEZENO, zkusím to znovu za 30s.');
            scheduleNext(RETRY_DELAY);
            return;
        }

        // Kontrola, zda je tlačítko aktivní (ne disabled)
        if (btn.disabled || btn.classList.contains('disabled')) {
            log('Tlačítko je neaktivní (disabled), zkusím za 30s.');
            scheduleNext(RETRY_DELAY);
            return;
        }

        const now = new Date();
        lastClickTime = now;
        clickCount++;
        
        btn.click();
        log('✓ Kliknuto na "Poslat všechny farmlisty" v ' + formatTime(now) + ' (celkem: ' + clickCount + ')');

        // Aktualizuj panel ihned po kliku
        const panel = document.getElementById('farmlist-bot-panel');
        if (panel) updatePanelStatus(panel);

        // Naplánujeme další klik s notifikací
        scheduleNext(null, true);
    }

    function updatePanelStatus(panel) {
        if (!panel) return;
        
        if (enabled) {
            let infoText = `<strong>🟢 Farmlist bot: ON</strong>`;
            
            if (lastClickTime) {
                infoText += `<br><small>✓ Poslední: ${formatTime(lastClickTime)}</small>`;
            }
            
            if (nextClickTime) {
                infoText += `<br><small>⏰ Další: ${formatTime(nextClickTime)}</small>`;
            }
            
            infoText += `<br><small>📊 Odesláno: ${clickCount}x</small>`;
            infoText += `<br><small style="opacity: 0.7;">(klikni pro vypnutí)</small>`;
            
            panel.innerHTML = infoText;
            panel.style.background = 'rgba(0, 128, 0, 0.85)';
        } else {
            panel.innerHTML = `
                <strong>🔴 Farmlist bot: OFF</strong><br>
                <small style="opacity: 0.7;">(klikni pro zapnutí)</small>
            `;
            panel.style.background = 'rgba(0, 0, 0, 0.75)';
        }
    }

    function startBot(panel) {
        enabled = true;
        updatePanelStatus(panel);
        log('Bot zapnut ručně.');

        if (location.search.includes('tt=99')) {
            const now = new Date();
            const firstTime = new Date(Date.now() + FIRST_CLICK_DELAY);
            nextClickTime = firstTime;
            
            log('✓ Bot zapnut v ' + formatTime(now) + ', první klik v ' + formatTime(firstTime));
            updatePanelStatus(panel);

            scheduleNext(FIRST_CLICK_DELAY);
        } else {
            log('Bot je ON, ale nejsi na Farmlist tabu (tt=99). Čekám.');
        }
    }

    function stopBot(panel) {
        enabled = false;
        clearScheduledClick();
        nextClickTime = null;
        updatePanelStatus(panel);
        log('Bot vypnut ručně. Statistika: odesláno ' + clickCount + 'x.');
    }

    function createControlPanel() {
        // Zobraz panel pouze na Farmlist tabu (tt=99)
        if (!location.search.includes('tt=99')) {
            log('Nejsi na Farmlist tabu (tt=99), panel se nezobrazí.');
            return;
        }

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
            padding: 8px 10px;
            border-radius: 6px;
            cursor: pointer;
            user-select: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            transition: transform 0.1s;
        `;
        
        panel.addEventListener('mouseenter', () => {
            panel.style.transform = 'scale(1.05)';
        });
        
        panel.addEventListener('mouseleave', () => {
            panel.style.transform = 'scale(1)';
        });

        updatePanelStatus(panel);

        panel.addEventListener('click', () => {
            if (enabled) {
                stopBot(panel);
            } else {
                startBot(panel);
            }
        });

        document.body.appendChild(panel);
    }

    // Sledování změny URL (pokud uživatel klikne na jiný tab)
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            log('URL se změnila: ' + lastUrl);
            
            const panel = document.getElementById('farmlist-bot-panel');
            
            if (!location.search.includes('tt=99')) {
                // Opustil Farmlist tab - skryj panel
                if (panel) panel.style.display = 'none';
                
                if (enabled) {
                    log('Opustil jsi Farmlist tab, bot čeká (panel skryt).');
                }
            } else {
                // Vrátil se na Farmlist tab - zobraz panel
                if (panel) {
                    panel.style.display = 'block';
                } else {
                    // Panel neexistuje, vytvoř ho
                    createControlPanel();
                }
                
                log('Vrátil ses na Farmlist tab.');
            }
        }
    }, 1000);

    window.addEventListener('load', () => {
        if (location.search.includes('tt=99')) {
            createControlPanel();
            log('Jsi na Farmlist tabu, panel vytvořen. Bot je zatím OFF – zapni ho vpravo dole.');
        } else {
            log('Nejsi na Farmlist tabu (tt=99). Panel se zobrazí až když přejdeš na Farmlist.');
        }
    });

})();