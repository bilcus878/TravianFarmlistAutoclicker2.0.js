// ==UserScript==
// @name         TravianFarmlistAutoclicker 2.12.3 UI FIX FINAL + CUSTOM SPACING
// @namespace    https://github.com/custom
// @version      2.12.5
// @description  Farmlist bot with improved UI (Bot:OFF up, minimal spacing, perfect bottom alignment)
// @match        *://*.travian.com/build.php*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    /* ============================================================
       GLOBAL STATE
    ============================================================ */

    let enabled = false;
    let totalSent = parseInt(localStorage.getItem("fl_totalSent") || "0");
    let totalRuntime = parseInt(localStorage.getItem("fl_totalRuntime") || "0");
    let lastAttack = localStorage.getItem("fl_lastAttack") ? new Date(localStorage.getItem("fl_lastAttack")) : null;
    let attackHistory = JSON.parse(localStorage.getItem("fl_attackHistory") || "[]");
    let sessionSent = 0;
    let sessionStart = null;

    let nextClickTime = null;
    let timeoutHandle = null;

    let panel = null;
    let settingsOpen = false;
    let logOpen = false;
    let dragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    /* ============================================================
       CONFIG
    ============================================================ */

    let config = {
        skin: localStorage.getItem("fl_skin") || "traffic",
        opacity: parseFloat(localStorage.getItem("fl_opacity") || "0.70"),
        locked: localStorage.getItem("fl_locked") !== "0",
        posX: parseFloat(localStorage.getItem("fl_posX") || "-1"),
        posY: parseFloat(localStorage.getItem("fl_posY") || "-1"),
        intervalPreset: localStorage.getItem("fl_interval") || "2-3",
        customMin: parseInt(localStorage.getItem("fl_custom_min") || "2"),
        customMax: parseInt(localStorage.getItem("fl_custom_max") || "3"),
        firstAttackDelay: parseInt(localStorage.getItem("fl_first_attack_delay") || "10"),
        randomDeviation: parseInt(localStorage.getItem("fl_random_deviation") || "0"),
        scheduledStop: localStorage.getItem("fl_scheduled_stop") || "",
        soundAlert: localStorage.getItem("fl_sound_alert") || "none"
    };

    function saveConfig() {
        localStorage.setItem("fl_skin", config.skin);
        localStorage.setItem("fl_opacity", config.opacity);
        localStorage.setItem("fl_locked", config.locked ? "1" : "0");
        localStorage.setItem("fl_posX", config.posX);
        localStorage.setItem("fl_posY", config.posY);
        localStorage.setItem("fl_interval", config.intervalPreset);
        localStorage.setItem("fl_custom_min", config.customMin);
        localStorage.setItem("fl_custom_max", config.customMax);
        localStorage.setItem("fl_first_attack_delay", config.firstAttackDelay);
        localStorage.setItem("fl_random_deviation", config.randomDeviation);
        localStorage.setItem("fl_scheduled_stop", config.scheduledStop);
        localStorage.setItem("fl_sound_alert", config.soundAlert);
    }

    function saveStats() {
        localStorage.setItem("fl_totalSent", totalSent);
        localStorage.setItem("fl_totalRuntime", totalRuntime);
        if (lastAttack) {
            localStorage.setItem("fl_lastAttack", lastAttack.toISOString());
        }
        localStorage.setItem("fl_attackHistory", JSON.stringify(attackHistory));
    }

    /* ============================================================
       INTERVALS
    ============================================================ */

    const RETRY_DELAY = 30000;

    const preset = {
        "2-3": { min: 120000, max: 180000, label: "2–3 min" },
        "4-6": { min: 240000, max: 360000, label: "4–6 min" },
        "8-10": { min: 480000, max: 600000, label: "8–10 min" },
        "12-14": { min: 720000, max: 840000, label: "12–14 min" },
        "14-16": { min: 840000, max: 960000, label: "14–16 min" },
        "custom": { min: 0, max: 0, label: "Vlastní" }
    };

    function randomDelay() {
        let delay;
        
        if (config.intervalPreset === "custom") {
            const min = config.customMin * 60000;
            const max = config.customMax * 60000;
            delay = min + Math.random() * (max - min);
        } else {
            const p = preset[config.intervalPreset];
            delay = p.min + Math.random() * (p.max - p.min);
        }
        
        // Přidej náhodnou odchylku
        if (config.randomDeviation > 0) {
            const deviation = (Math.random() * 2 - 1) * config.randomDeviation * 1000; // -X až +X sekund
            delay += deviation;
        }
        
        return Math.max(1000, delay); // Minimálně 1 sekunda
    }

    function findButton() {
        return [...document.querySelectorAll("button,a,input[type='submit']")]
            .find(el => el.textContent.includes("Poslat všechny farmlisty"));
    }

    function fTime(t) { return t ? t.toLocaleTimeString("cs-CZ") : "-"; }
    function ago(t) {
        if (!t) return "-";
        let s = Math.floor((Date.now() - t.getTime()) / 1000);
        if (s < 60) return `před ${s}s`;
        return `před ${Math.floor(s / 60)}m`;
    }
    function timeUntil(t) {
        if (!t) return "-";
        let s = Math.floor((t.getTime() - Date.now()) / 1000);
        if (s < 0) return "nyní";
        if (s < 60) return `za ${s}s`;
        return `za ${Math.floor(s / 60)}m`;
    }
    function fDuration(ms) {
        if (!ms) return "-";
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        if (h) return `${h}h ${m % 60}m`;
        if (m) return `${m}m ${s % 60}s`;
        return `${s}s`;
    }

    /* ============================================================
       SOUND ALERTS
    ============================================================ */

    function playSound() {
        if (config.soundAlert === "none") return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (config.soundAlert === "beep") {
            // Krátké pípnutí
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (config.soundAlert === "ding") {
            // Příjemný ding zvuk
            oscillator.frequency.value = 1000;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            // Druhý tón pro "ding" efekt
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1200;
                gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.2);
            }, 100);
        }
    }

    /* ============================================================
       ICON STYLE
    ============================================================ */

    function styleIcon(btn) {
        btn.style.cssText = `
            width: 26px;
            height: 26px;
            font-size: 18px;
            border-radius: 4px;
            border: 1px solid rgba(255,255,255,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.20);
            color: white;
            cursor: pointer;
            line-height: 1;
        `;
    }

    /* ============================================================
       DRAG FUNCTIONALITY
    ============================================================ */

    function startDrag(e) {
        if (config.locked || e.target.tagName === "BUTTON" || 
            e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
        
        dragging = true;
        const rect = panel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        panel.style.cursor = "grabbing";
        e.preventDefault();
    }

    function drag(e) {
        if (!dragging) return;
        
        e.preventDefault();
        
        const x = e.clientX - dragOffsetX;
        const y = e.clientY - dragOffsetY;
        
        panel.style.left = x + "px";
        panel.style.top = y + "px";
        panel.style.right = "auto";
        panel.style.bottom = "auto";
    }

    function stopDrag(e) {
        if (!dragging) return;
        
        dragging = false;
        panel.style.cursor = config.locked ? "default" : "move";
        
        config.posX = panel.offsetLeft;
        config.posY = panel.offsetTop;
        saveConfig();
    }

    /* ============================================================
       PANEL (FIXED UI)
    ============================================================ */

    function createPanel() {
        if (!location.search.includes("tt=99")) return;

        panel = document.createElement("div");
        panel.id = "fl_panel";

        panel.style.cssText = `
            position: fixed;
            width: 230px;
            min-height: 110px;
            padding: 10px 14px 3px 14px;
            border-radius: 10px;
            z-index: 999999;
            font-size: 13px;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(4px);
            transition: 0.15s;
            cursor: ${config.locked ? "default" : "move"};
        `;

        if (config.posX === -1) panel.style.right = "12px";
        else panel.style.left = config.posX + "px";

        if (config.posY === -1) panel.style.bottom = "12px";
        else panel.style.top = config.posY + "px";

        /* ICONS */
        const log = document.createElement("button");
        log.innerHTML = "📋";
        styleIcon(log);
        log.style.position = "absolute";
        log.style.top = "10px";
        log.style.right = "10px";
        log.onclick = e => { e.stopPropagation(); toggleLog(); };
        panel.appendChild(log);

        const toggle = document.createElement("button");
        toggle.id = "fl_toggle";
        styleIcon(toggle);
        toggle.style.position = "absolute";
        toggle.style.top = "46px";  /* 10px + 26px tlačítko + 10px mezera */
        toggle.style.right = "10px";
        toggle.onclick = e => {
            e.stopPropagation();
            enabled ? stopBot() : startBot();
            updateToggle();
        };
        panel.appendChild(toggle);

        const set = document.createElement("button");
        set.innerHTML = "⚙️";
        styleIcon(set);
        set.style.position = "absolute";
        set.style.top = "82px";  /* 46px + 26px tlačítko + 10px mezera */
        set.style.right = "10px";
        set.onclick = e => { e.stopPropagation(); toggleSettings(); };
        panel.appendChild(set);

        /* INFO AREA */
        const info = document.createElement("div");
        info.id = "fl_info";
        info.style.cssText = `
            padding-right: 50px;
            display: flex;
            flex-direction: column;
            line-height: 1.4;
        `;
        panel.appendChild(info);

        document.body.appendChild(panel);

        panel.addEventListener("mousedown", startDrag);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDrag);

        applySkin();
        updatePanel();
        updateToggle();
    }

    /* ============================================================
       SKIN APPLICATION
    ============================================================ */

    function applySkin() {
        if (!panel) return;
        
        if (config.skin === "traffic") {
            panel.style.background = enabled
                ? `rgba(0,160,0,${config.opacity})`
                : `rgba(170,0,0,${config.opacity})`;
            panel.style.color = "#fff";
        } else if (config.skin === "dark") {
            panel.style.background = `rgba(20,20,20,${config.opacity})`;
            panel.style.color = "#fff";
        } else if (config.skin === "light") {
            panel.style.background = `rgba(240,240,240,${config.opacity})`;
            panel.style.color = "#000";
        }
    }

    /* ============================================================
       UPDATE PANEL
    ============================================================ */

    function updateToggle() {
        const btn = document.getElementById("fl_toggle");
        if (!btn) return;
        btn.innerHTML = enabled ? "✖" : "▶";
        btn.style.background = enabled
            ? "rgba(255,50,50,0.45)"
            : "rgba(0,200,0,0.40)";
    }

    function updatePanel() {
        if (!panel) return;

        applySkin();

        const info = document.getElementById("fl_info");
        if (!info) return;

        if (enabled) {
            const nextTime = nextClickTime ? fTime(nextClickTime) + ' (' + timeUntil(nextClickTime) + ')' : "-";
            const lastTime = lastAttack ? fTime(lastAttack) + ' (' + ago(lastAttack) + ')' : "-";
            
            info.innerHTML = `
                <strong>🟢 Bot: ON</strong>
                <div style="height:5px"></div>
                Další útok: ${nextTime}<br>
                Odesláno: ${sessionSent}×<br>
                Běží: ${sessionStart ? fDuration(Date.now() - sessionStart) : "-"}<br>
                Poslední útok: ${lastTime}
            `;
        } else {
            const lastTime = lastAttack ? fTime(lastAttack) + ' (' + ago(lastAttack) + ')' : "-";
            const intervalLabel = config.intervalPreset === "custom" 
                ? `${config.customMin}–${config.customMax} min` 
                : preset[config.intervalPreset].label;
            
            info.innerHTML = `
                <strong>🔴 Bot: OFF</strong>
                <div style="height:5px"></div>
                Interval: ${intervalLabel}<br>
                Prodlení prvního útoku: ${config.firstAttackDelay}s<br>
                Náhodná odchylka: ±${config.randomDeviation}s<br>
                Plánované vypnutí: ${config.scheduledStop || "-"}
            `;
        }
    }

    /* ============================================================
       BOT LOGIC
    ============================================================ */

    function clickOnce() {
        if (!enabled) return;

        // Kontrola plánovaného vypnutí
        if (config.scheduledStop) {
            const now = new Date();
            const [hours, minutes] = config.scheduledStop.split(':').map(Number);
            const stopTime = new Date();
            stopTime.setHours(hours, minutes, 0, 0);
            
            if (now >= stopTime) {
                console.log("Plánované vypnutí bota v " + config.scheduledStop);
                stopBot();
                alert("Bot byl automaticky vypnut v naplánovaný čas: " + config.scheduledStop);
                return;
            }
        }

        const btn = findButton();
        if (!btn) {
            console.warn("Farmlist button not found, retrying in 30s");
            return scheduleNext(RETRY_DELAY);
        }

        panel.style.transform = "scale(1.03)";
        setTimeout(() => { panel.style.transform = "scale(1)"; }, 120);

        btn.click();
        playSound(); // Přehrát zvuk při útoku

        lastAttack = new Date();
        
        // Přidat do historie
        attackHistory.unshift(lastAttack.getTime());
        if (attackHistory.length > 25) {
            attackHistory = attackHistory.slice(0, 25);
        }
        
        sessionSent++;
        totalSent++;
        
        saveStats();
        updatePanel();
        scheduleNext();
        updateToggle();
    }

    function scheduleNext(forceDelay = null) {
        if (!enabled) return;

        clearTimeout(timeoutHandle);
        const delay = forceDelay ?? randomDelay();
        nextClickTime = new Date(Date.now() + delay);

        timeoutHandle = setTimeout(clickOnce, delay);
    }

    function startBot() {
        enabled = true;
        sessionStart = Date.now();
        scheduleNext(config.firstAttackDelay * 1000);
        updatePanel();
        updateToggle();
    }

    function stopBot() {
        enabled = false;
        clearTimeout(timeoutHandle);

        if (sessionStart)
            totalRuntime += Date.now() - sessionStart;

        sessionStart = null;
        nextClickTime = null;
        sessionSent = 0;

        saveStats();
        updatePanel();
        updateToggle();
    }

    /* ============================================================
       LEAVE WARNING
    ============================================================ */

    window.addEventListener("beforeunload", function (e) {
        if (enabled) {
            e.preventDefault();
            e.returnValue = "Bot je stále zapnutý!";
            return "Bot je stále zapnutý!";
        }
    });

    /* ============================================================
       LOG PANEL
    ============================================================ */

    function toggleLog() { logOpen ? closeLog() : openLog(); }

    function openLog() {
        logOpen = true;

        const p = document.createElement("div");
        p.id = "fl_log";
        p.style.cssText = `
            position: fixed;
            bottom: 150px; right: 12px;
            background: rgba(0,0,0,0.90);
            padding: 12px;
            border-radius: 8px;
            color: #fff;
            font-size: 13px;
            z-index: 999998;
            max-width: 300px;
            max-height: 500px;
            overflow-y: auto;
        `;
        
        // Sestavit historii útoků
        let historyHTML = '';
        if (attackHistory.length > 0) {
            historyHTML = '<div style="margin: 10px 0; font-size: 12px; line-height: 1.4;">';
            
            for (let i = 0; i < attackHistory.length; i++) {
                const attackTime = new Date(attackHistory[i]);
                const timeStr = attackTime.toLocaleTimeString("cs-CZ");
                
                // Vypočítat rozdíl s předchozím útokem
                let intervalStr = "";
                if (i > 0) {
                    const prevAttackTime = attackHistory[i - 1];
                    const diffMs = prevAttackTime - attackHistory[i];
                    const diffSec = Math.floor(diffMs / 1000);
                    const mins = Math.floor(diffSec / 60);
                    const secs = diffSec % 60;
                    
                    if (mins > 0) {
                        intervalStr = `${mins}m ${secs}s`;
                    } else {
                        intervalStr = `${secs}s`;
                    }
                } else {
                    intervalStr = "-";
                }
                
                historyHTML += `<div style="padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    #${i + 1} ${timeStr} <span style="color: #aaa;">(${intervalStr})</span>
                </div>`;
            }
            
            historyHTML += '</div>';
        } else {
            historyHTML = '<div style="margin: 10px 0; color: #888;">Žádná historie útoků</div>';
        }
        
        p.innerHTML = `
            <strong>📋 Historie posledních 25 útoků</strong><hr>
            ${historyHTML}
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2);">
                <strong>Celkové statistiky:</strong><br>
                Odesláno celkem: ${totalSent}<br>
                Celkový čas: ${fDuration(totalRuntime)}<br>
            </div>
            <button id="resetStats" style="
                width:100%; padding:4px; margin-top: 8px;
                border-radius:4px;
                font-size:12px;
                background:rgba(200,0,0,0.7);
                border:1px solid rgba(255,255,255,0.3);
                color:white;
                cursor:pointer;">
                Resetovat statistiky
            </button>
        `;
        document.body.appendChild(p);
        
        document.getElementById("resetStats").onclick = () => {
            if (confirm("Opravdu chcete resetovat všechny statistiky?")) {
                totalSent = 0;
                totalRuntime = 0;
                lastAttack = null;
                attackHistory = [];
                saveStats();
                updatePanel();
                closeLog();
            }
        };
    }

    function closeLog() {
        logOpen = false;
        const p = document.getElementById("fl_log");
        if (p) p.remove();
    }

    /* ============================================================
       SETTINGS PANEL
    ============================================================ */

    function createRadio(name, val, label) {
        return `
            <label>
                <input type="radio" name="${name}" value="${val}"
                    ${config[name] === val ? "checked" : ""}
                    style="accent-color:#fff;margin-right:4px;">
                ${label}
            </label><br>
        `;
    }

    function toggleSettings() { settingsOpen ? closeSettings() : openSettings(); }

    function openSettings() {
        settingsOpen = true;

        const p = document.createElement("div");
        p.id = "fl_settings";
        p.style.cssText = `
            position: fixed;
            bottom: 150px; right: 12px;
            background: rgba(0,0,0,0.95);
            padding: 14px;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            z-index: 999998;
            min-width: 240px;
        `;

        p.innerHTML = `
            <strong>⚙️ Nastavení</strong><hr>

            <b>Skin:</b><br>
            ${createRadio("skin", "traffic", "Traffic")}
            ${createRadio("skin", "dark", "Dark")}
            ${createRadio("skin", "light", "Light")}
            <br>
            
            <b>Zvukový alert:</b><br>
            ${createRadio("soundAlert", "none", "Žádný")}
            ${createRadio("soundAlert", "beep", "Beep (krátké)")}
            ${createRadio("soundAlert", "ding", "Ding (příjemné)")}
            <br>

            <b>Průhlednost:</b> <span id="opVal">${config.opacity.toFixed(2)}</span><br>
            <input type="range" min="0.3" max="1" step="0.01"
                   id="opSlider" value="${config.opacity}"
                   style="width:100%;"><br><br>

            <label>
                <input type="checkbox" id="lockPanel"
                    ${config.locked ? "checked" : ""}>
                Zamknout panel
            </label><br><br>

            <b>Interval:</b><br>
            ${Object.keys(preset)
                .filter(k => k !== 'custom')
                .map(k => createRadio("intervalPreset", k, preset[k].label))
                .join("")}
            ${createRadio("intervalPreset", "custom", "Vlastní")}
            
            <div id="customIntervalInputs" style="display:${config.intervalPreset === 'custom' ? 'block' : 'none'};margin-left:20px;margin-top:5px;">
                <label>Min: <input type="number" id="customMin" value="${config.customMin}" min="1" max="60" style="width:50px;"> min</label><br>
                <label>Max: <input type="number" id="customMax" value="${config.customMax}" min="1" max="60" style="width:50px;"> min</label>
            </div>

            <br>
            
            <b>Prodlení prvního útoku:</b><br>
            <label style="display:flex;align-items:center;gap:5px;">
                <input type="number" id="firstAttackDelay" value="${config.firstAttackDelay}" min="1" max="300" style="width:60px;"> sekund
            </label>

            <br>
            
            <b>Náhodná odchylka intervalu:</b><br>
            <label style="display:flex;align-items:center;gap:5px;">
                ±<input type="number" id="randomDeviation" value="${config.randomDeviation}" min="0" max="300" style="width:60px;"> sekund
            </label>
            <span style="font-size:11px;color:#aaa;">Bot může poslat útok o tuto hodnotu dříve nebo později</span>

            <br><br>
            
            <b>Plánované vypnutí:</b><br>
            <label style="display:flex;align-items:center;gap:5px;">
                <input type="time" id="scheduledStop" value="${config.scheduledStop}" style="width:100px;">
            </label>
            <span style="font-size:11px;color:#aaa;">Bot se automaticky vypne v zadaný čas</span>

            <br>
            <button id="saveBtn" style="
                width:100%; padding:6px;
                border-radius:5px;
                font-size:14px;
                background:rgba(0,150,0,0.85);
                border:1px solid rgba(255,255,255,0.4);
                color:white;
                cursor:pointer;">
                Uložit změny
            </button>
        `;

        document.body.appendChild(p);

        [...p.querySelectorAll("input[name='skin']")].forEach(el =>
            el.onchange = () => config.skin = el.value);

        [...p.querySelectorAll("input[name='soundAlert']")].forEach(el =>
            el.onchange = () => config.soundAlert = el.value);

        const slider = document.getElementById("opSlider");
        const opVal = document.getElementById("opVal");
        slider.oninput = () => {
            config.opacity = parseFloat(slider.value);
            opVal.textContent = config.opacity.toFixed(2);
            applySkin(); // Živý náhled průhlednosti
        };

        document.getElementById("lockPanel").onchange =
            e => {
                config.locked = e.target.checked;
                panel.style.cursor = config.locked ? "default" : "move";
            };

        [...p.querySelectorAll("input[name='intervalPreset']")].forEach(el =>
            el.onchange = () => {
                config.intervalPreset = el.value;
                
                // Zobraz/skryj custom inputs
                const customDiv = document.getElementById("customIntervalInputs");
                if (customDiv) {
                    customDiv.style.display = el.value === 'custom' ? 'block' : 'none';
                }
            });

        // Custom interval inputs
        const minInput = document.getElementById("customMin");
        const maxInput = document.getElementById("customMax");
        if (minInput) minInput.oninput = () => {
            const val = parseInt(minInput.value) || 2;
            config.customMin = Math.min(val, config.customMax); // Validace: min <= max
            minInput.value = config.customMin;
            if (config.intervalPreset === "custom" && !enabled) {
                updatePanel();
            }
        };
        if (maxInput) maxInput.oninput = () => {
            const val = parseInt(maxInput.value) || 3;
            config.customMax = Math.max(val, config.customMin); // Validace: max >= min
            maxInput.value = config.customMax;
            if (config.intervalPreset === "custom" && !enabled) {
                updatePanel();
            }
        };
        
        // First attack delay input
        const delayInput = document.getElementById("firstAttackDelay");
        if (delayInput) delayInput.oninput = () => {
            config.firstAttackDelay = parseInt(delayInput.value) || 10;
            if (!enabled) {
                updatePanel();
            }
        };
        
        // Random deviation input
        const deviationInput = document.getElementById("randomDeviation");
        if (deviationInput) deviationInput.oninput = () => {
            config.randomDeviation = parseInt(deviationInput.value) || 0;
            if (!enabled) {
                updatePanel();
            }
        };
        
        // Scheduled stop input
        const stopInput = document.getElementById("scheduledStop");
        if (stopInput) stopInput.oninput = () => {
            config.scheduledStop = stopInput.value;
            if (!enabled) {
                updatePanel();
            }
        };

        document.getElementById("saveBtn").onclick = () => {
            saveConfig();
            applySkin();
            updatePanel();
            
            // Přeplánuj příští útok pokud bot běží
            if (enabled) {
                clearTimeout(timeoutHandle);
                scheduleNext();
                
                // Vizuální feedback
                panel.style.transform = "scale(1.05)";
                setTimeout(() => { panel.style.transform = "scale(1)"; }, 200);
            }
            
            closeSettings();
        };
    }

    function closeSettings() {
        settingsOpen = false;
        const p = document.getElementById("fl_settings");
        if (p) p.remove();
    }

    /* ============================================================
       INIT
    ============================================================ */

    window.addEventListener("load", () => {
        createPanel();
        setInterval(() => {
            if (enabled) {
                updatePanel();
            }
            updateToggle();
        }, 1000);
    });

})();