require("dotenv").config();
const { default: makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");

const { state, saveState } = useSingleFileAuthState("./auth_info.json");

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveState);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        console.log("Message received:", msg.message);
    });

    // Auto-read statuses
    sock.ev.on("chats.update", (update) => {
        update.forEach((chat) => {
            if (chat.id && chat.readOnly === false) {
                sock.readMessages([{ remoteJid: chat.id, id: chat.id }]);
                console.log(`Status auto-read: ${chat.id}`);
            }
        });
    });

    console.log("Bot is running...");
}

startBot();
