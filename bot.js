const fs = require('fs');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const { key: token, api_football_key: apiKey } = JSON.parse(fs.readFileSync('conf.json'));
const bot = new TelegramBot(token, { polling: true });

//dizionario con nome dei campionati e di dove lo fannp
const campionati = [
    { name: "Ligue 1", country: "France" },
    { name: "Bundesliga", country: "Germany" },
    { name: "Premier League", country: "England" },
    { name: "Serie A", country: "Italy" },
    { name: "Coppa Italia", country: "Italy" },
    { name: "Supercoppa", country: "Italy" },
    { name: "La Liga", country: "Spain" },
    { name: "Europei", country: "International" },
    { name: "Nations League", country: "International" },
    { name: "Mondiali", country: "International" },
    { name: "Mondiali per Club", country: "International" },
    { name: "Conference League", country: "International" },
    { name: "Europa League", country: "International" },
    { name: "Champions League", country: "International" }
];
//quando il bot parte
bot.on("message", (msg) => {
    const chatId = msg.chat.id;//prende id della chat
    const text = msg.text;//prende testo della chat

    if (text === "/start") {//se utente scrive start
        bot.sendMessage(chatId, "Scegli una data nel formato AAAA-MM-GG (es 2025-04-01) per vedere le partite:");//ti diche che fare 
    } 
    else if (text === "/help") {//se hai bisogno e scrivi help stampa cosa fa il bot
        bot.sendMessage(chatId, "🔹 Guida di GolBot 🔹\n\n" +
            "⚙️ Come usare il bot:\n" +
            "- Invia \"/start\" per iniziare.\n" +
            "- Inserisci una data nel formato \"AAAA-MM-GG\" 📅(es. 2025-04-01) per vedere le partite programmate per quel giorno.\n\n" +
            "⚽Campionati supportati:⚽\n" +
            "- Ligue 1 (Francia)🇫🇷\n" +
            "- Bundesliga (Germania)🇩🇪\n" +
            "- Premier League (Inghilterra)🇬🇧\n" +
            "- Serie A (Italia)🇮🇹\n" +
            "- Coppa Italia🇮🇹\n" +
            "- Supercoppa Italiana (Italia)🇮🇹\n" +
            "- La Liga (Spagna)🇪🇸\n" +
            "- Europei\n" +
            "- Nations League\n" +
            "- Mondiali🌍\n" +
            "- Mondiali per Club🌍\n" +
            "- Conference League\n" +
            "- Europa League\n" +
            "- Champions League\n\n" +
            "⚠️ Nota:\n" +
            "- Se non trovi partite, prova con un'altra data.\n" +
            "- Se per quel giorno sono programmate partite, l'API potrebbe non averle ancora caricate (solitamente carica al massimo le partite del giorno dopo).");
    }
    else if (text.length === 10 && text[4] === '-' && text[7] === '-') {//controlla la lunghezza della data, controlla se i trattini sono al punto giusto per vedere se la data l ho scritta giusta
        caricapartite(text).then(matches => {//chiama funzione 
            let message = "Nessuna partita trovata.";//messaggio in caso di errore
            if (matches.length) {//controlla se il messaggio che restituisce contiene qualcosa
                message = matches.join('\n');//scrive i messaggio intero
            }
            bot.sendMessage(chatId, message);
        }).catch(err => {//nel caso ci sia l'errore del bot che nn va
            bot.sendMessage(chatId, "Errore nel recupero delle partite.");
        });
    } else {//nel caso la data nn va bene o scritto altre cose che nn accetta
        bot.sendMessage(chatId, "Formato non valido! Usa AAAA-MM-GG.");
    }
});

function caricapartite(date) {//funzione che richiede le partite
    const url = `https://v3.football.api-sports.io/fixtures?date=${date}`;//url per fare le fetch
    return fetch(url, { headers: { "x-apisports-key": apiKey } }) //fa la fetch
    .then(res => res.json())
    .then(({ response }) => {
        let risultati = [];//lista per i risultati
        response.map(({ league, teams, fixture }) => {//fa map
            let campionato = campionati.find(l => l.name === league.name && l.country === (league.country || l.country));//fa i controlli per vedere se sono come risultato dei maggiori campionati scritti prima che vengono controllati
            if (campionato) {//se trova qualcosa
                risultati.push(`${league.name} (${league.country}) - ${teams.home.name} vs ${teams.away.name} (${fixture.status.long})`);//creo la stringa che viene visualizzata 
            }
        });
        return risultati;//restituisce risultati
    })
    .catch(err => {//se la fectch nn funziona
        console.error("Errore API", err);
        return [];
    });


}