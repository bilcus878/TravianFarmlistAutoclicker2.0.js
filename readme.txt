🚜 Travian Farmlist Autoclicker

Pokročilý userscript pro automatizaci odesílání farmlistů v prohlížečové hře Travian. Bot nabízí širokou škálu nastavení, statistiky a realistické chování pro bezpečnější používání.

✨ Hlavní funkce
🎯 Automatizace

Automatické posílání farmlistů s nastavitelným intervalem
Náhodná odchylka (±X sekund) pro přirozenější chování
Plánované vypnutí v konkrétní čas
Prodleva prvního útoku po zapnutí bota
Vlastní intervaly nebo výběr z přednastavených (2-16 min)

🎨 Uživatelské rozhraní

3 vizuální témata: Traffic (semafor), Dark, Light
Přetahovatelný panel s možností zamčení pozice
Nastavitelná průhlednost s živým náhledem
Responzivní design - minimální, elegantní vzhled
Rychlé ovládání pomocí ikon

📊 Statistiky & Historie

Trvalé statistiky (přežijí refresh stránky)
Historie posledních 25 útoků s časovými intervaly
Celkový čas běhu a počet odeslaných útoků
Vizualizace intervalů mezi jednotlivými útoky
Reset statistik na jedno kliknutí

🔊 Notifikace

Zvukové alerty při každém útoku

Beep (krátké pípnutí)
Ding (příjemný dvojitý tón)
Žádný


Varování před zavřením stránky když bot běží

🛡️ Bezpečnost

Automatický retry při nenalezení tlačítka
Validace vstupů (kontrola min ≤ max)
Console logging pro debugging
Náhodné odchylky pro lidštější chování

📦 Instalace
Krok 1: Nainstalujte správce userscriptů
Nainstalujte jeden z těchto doplňků do svého prohlížeče:

Tampermonkey (doporučeno)
Violentmonkey
Greasemonkey (pouze Firefox)

Krok 2: Nainstalujte script

Klikněte na soubor TravianFarmlistAutoclicker2.0-1.0.user.js
Otevřete raw verzi souboru
Správce userscriptů by měl automaticky nabídnout instalaci
Potvrďte instalaci

Krok 3: Použití

Otevřete Travian a přejděte na stránku s farmlisty (URL obsahuje tt=99)
Panel bota se automaticky zobrazí v pravém dolním rohu
Nastavte si interval a další parametry
Klikněte na ▶ tlačítko pro spuštění

🎮 Návod k použití
Základní ovládání
Tlačítka na panelu:

📋 Log - Otevře historii útoků a statistiky
▶ / ✖ Play/Stop - Spustí/zastaví bota
⚙️ Nastavení - Otevře panel s nastavením

Panel když bot NEBĚŽÍ:
🔴 Bot: OFF
Interval: 2–3 min
Prodlení prvního útoku: 10s
Náhodná odchylka: ±30s
Plánované vypnutí: 23:00
Panel když bot BĚží:
🟢 Bot: ON
Další útok: 14:25:30 (za 2m)
Odesláno: 5×
Běží: 12m 34s
Poslední útok: 14:23:15 (před 2m)
Nastavení
🎨 Vzhled

Skin: Traffic (zelená/červená podle stavu) / Dark / Light
Průhlednost: Slider 0.3 - 1.0
Zamknout panel: Zaškrtnutím znemožníte přetahování

⏱️ Časování

Interval: 2-3, 4-6, 8-10, 12-14, 14-16 min nebo vlastní
Vlastní interval: Zadejte min a max v minutách
Prodlení prvního útoku: 1-300 sekund (výchozí: 10s)
Náhodná odchylka: ±0-300 sekund pro přirozenější chování
Plánované vypnutí: Zadejte čas ve formátu HH:MM

🔊 Zvuky

Žádný: Bez zvukových notifikací
Beep: Krátké pípnutí při každém útoku
Ding: Příjemný dvojitý tón

Historie útoků
Kliknutím na 📋 otevřete log panel s historií:
📋 Historie posledních 25 útoků
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1  14:23:45 (-)
#2  14:20:30 (3m 15s)
#3  14:17:42 (2m 48s)
...

Celkové statistiky:
Odesláno celkem: 156
Celkový čas: 5h 23m

[Resetovat statistiky]
⚙️ Konfigurace
Všechna nastavení jsou automaticky ukládána do localStorage a přežijí:

✅ Refresh stránky
✅ Restart prohlížeče
✅ Vypnutí počítače

Uložená data

Pozice panelu (X, Y)
Vizuální nastavení (skin, průhlednost, zámek)
Časové nastavení (interval, prodleva, odchylka, plánované vypnutí)
Zvukové alerty
Statistiky (celkový počet útoků, čas běhu)
Historie posledních 25 útoků

Velikost dat: ~200-500 bytes (zanedbatelné)
🔧 Pokročilé funkce
Náhodná odchylka
Přidává náhodnou odchylku k nastaveným intervalům:

Interval: 10 min + Odchylka: ±30s
Skutečný čas: 9m 30s - 10m 30s
Výsledek: Přirozenější, méně detekovatelné chování

Plánované vypnutí
Bot se automaticky vypne v zadaný čas:

Nastavíte: 23:00
Bot běží normálně až do 23:00
O půlnoci se vypne a zobrazí alert
Užitečné před spaním/odchodem z PC

Automatický retry
Pokud bot nenajde tlačítko "Poslat všechny farmlisty":

Zapíše varování do konzole
Zkusí to znovu za 30 sekund
Pokračuje v pokusu až tlačítko najde

🐛 Řešení problémů
Panel se nezobrazuje

✅ Zkontrolujte, že jste na správné stránce (URL obsahuje tt=99)
✅ Otevřete konzoli (F12) a hledejte chybové hlášky
✅ Zkuste refresh stránky (Ctrl+R)

Bot nekliká na tlačítko

✅ Ujistěte se, že tlačítko má text "Poslat všechny farmlisty"
✅ Zkontrolujte konzoli - bot loguje když nenajde tlačítko
✅ Může se lišit jazyk hry - upravte text v kódu

Statistiky se neukládají

✅ Zkontrolujte, že prohlížeč povoluje localStorage
✅ Vymažte cache a cookies
✅ Zkuste jiný prohlížeč

Zvuky nefungují

✅ Zkontrolujte, že stránka má povolení přehrávat zvuky
✅ Některé prohlížeče blokují autoplay - klikněte na stránku před spuštěním
✅ Zkuste zvýšit hlasitost systému

🚨 Upozornění
⚠️ Používejte na vlastní riziko!

Tento bot je proti pravidlům většiny online her včetně Travianu
Používání může vést k banu účtu
Doporučujeme používat pouze na testovacích serverech
Autor nenese odpovědnost za jakékoliv následky použití

Doporučení pro bezpečnější použití:

✅ Používejte náhodné odchylky (±30-60s)
✅ Nestavějte intervaly příliš krátké (min. 2 minuty)
✅ Používejte plánované vypnutí - bot by neměl běžet 24/7
✅ Pravidelně měňte intervaly
✅ Nenechávejte bot běžet přes noc