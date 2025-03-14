# Server startup
Vid parent server startup behövs inloggning till pgserver.mau anges (antingen via argument typ --password eller via stdinput vid serverstart)
Vid lyckad anslutning till sql server startar parent servern, annars stängs den.

# Customer/Admin login
Klient skickar request till parent server.
Parent server checkar inloggning mot databas.
Vid success skickar den förfrågan till http server.
Http server servar statiskt innehåll tillbaka till parent server -> klient.

# Actions (Köp, lägg till, ta bort, orderhantering osv.)
Alla actions har endpoints på parent servern. (T.ex /buy, /orders). Alla requests autentiseras via Authorization header. Alla POST requests måste skicka med autentiserings-nyckel för att förfrågan ska godkännas av parent server.
Vid success (autentisering) så skickar parent server querys till SQL (pgserver.mau) som utförs via transaktioner.
Efter lyckad commit av transaktionen så servas det nya innehållet till klienten via klient <- parent server <-> http server

# Customer/Admin logout
Be servern att ta bort auth-nyckel och avbryta anslutningen (serva login-sidan igen)

# Rendering
All rendering sker client-side, dvs servern svarar enbart med data och html skapas dynamiskt på klientents sida
