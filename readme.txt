NÁZEV: TravianFarmlistAutoclicker2.0
VERZE: 1.1
POPIS: Automatické odesílání farmlistů na Travian serveru pomocí Tampermonkey.

ÚČEL SCRIPTU

Tento skript automaticky kliká na tlačítko "Poslat všechny farmlisty" na stránce farmlistů v Travianu (URL obsahující tt=99).
Časování je náhodné mezi 4 a 6 minutami.
Po každém kliknutí zobrazí skript informační okno (toast), které uvádí čas posledního odeslání a čas následujícího odeslání.
Skript lze manuálně zapnout nebo vypnout pomocí ovládacího panelu v pravém dolním rohu obrazovky.

FUNKCE

Automatické kliknutí na "Poslat všechny farmlisty"

Náhodný interval mezi 4–6 minutami

Po zapnutí skriptu se první klik provede po 10 sekundách

Viditelné upozornění na odeslání (toast), které zůstává na obrazovce 5 sekund

Ovládací panel (ON/OFF) přímo v Travianu

Skript nepracuje, pokud nejste na stránce farmlistu (tt=99)

Bezpečný – neodesílá žádná data, obsahuje pouze kliknutí v DOM

INSTALACE

Nainstalujte rozšíření Tampermonkey (Chrome/Firefox/Edge/Opera).

Otevřete Tampermonkey -> Create a new script.

Odstraňte vše a vložte obsah souboru "TravianFarmlistAutoclicker2.0.user.js".

Uložte skript (CTRL+S).

Otevřete Travian.

Přejděte na stránku farmlistů (URL obsahující tt=99).

V pravém dolním rohu klikněte na panel "Farmlist bot: OFF" pro zapnutí.

POPIS CHOVÁNÍ

Po načtení stránky je bot vždy ve stavu OFF.

Po kliknutí na ON skript zobrazí informaci o aktivaci a o plánovaném prvním kliknutí.

První klik proběhne přesně 10 sekund po přepnutí na ON.

Po každém kliknutí se znovu spočítá náhodný interval 4–6 minut.

Po každém kliknutí se zobrazí okno s informací:
"Farmlist kliknut v HH:MM:SS"
"Další farmlist se pošle v HH:MM:SS"

Pokud tlačítko "Poslat všechny farmlisty" není nalezeno, skript to zkusí znovu za 30 sekund.

POŽADAVKY

Tampermonkey v5.0 nebo novější

Zapnutý JavaScript v prohlížeči

LIMITACE A UPOZORNĚNÍ

Tento skript je určen pouze pro osobní použití.
Travian obecně nepovoluje automatizaci hry.
Používání skriptu je na vlastní riziko.

ODINSTALACE

Otevřete Tampermonkey.

Najděte skript s názvem "TravianFarmlistAutoclicker2.0".

Klikněte na koš nebo přepněte do OFF.

VERZE A ZMĚNY

Verze 1.0:

Přidán toast s informacemi o kliku

Delay prvního kliku nastaven na 10s

Úprava ovládacího panelu

Oprava hlavičky scriptu pro správné zobrazení názvu

Celkové čištění kódu

Verze 1.1:

Přidaná podpora všech travian serverů