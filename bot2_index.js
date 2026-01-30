const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs/promises');
const path = require('path');
const { Boom } = require('@hapi/boom');
const express = require('express'); // إضافة مكتبة اكسبريس

const logFile = './bot.log';
const logger = pino({ level: 'silent' });

// إعداد خادم التحكم (Express)
const appServer = express();
appServer.use(express.json());

function logToConsole(...args) {
    console.log(...args);
}

const commands = new Map();
const activeReactions = new Set();
let lastReactionStart = 0;
const reactionEmojis = ['😀', '😃', '😁', '🙂', '🙃', '🤍', '❤', '💙', '⏸️', '⏹️'];

const LAST_CONNECTED_FILE = path.join(__dirname, 'last_connected.json');
let minAcceptableTimestamp = Date.now() / 1000;

// متغير عالمي للوصول لـ sock من خارج دالة الاتصال
let socketInstance = null;

async function loadLastConnectedTime() {
    try {
        const data = await fs.readFile(LAST_CONNECTED_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (typeof parsed.timestamp === 'number') {
            minAcceptableTimestamp = parsed.timestamp;
        }
    } catch {}
}

async function saveLastConnectedTime() {
    try {
        await fs.writeFile(LAST_CONNECTED_FILE, JSON.stringify({
            timestamp: Date.now() / 1000,
            savedAt: new Date().toISOString()
        }, null, 2));
    } catch {}
}

async function loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    try {
        await fs.mkdir(commandsDir, { recursive: true });
    } catch {}
    const files = (await fs.readdir(commandsDir)).filter(f => f.endsWith('.js'));
    commands.clear();
    for (const file of files) {
        try {
            const filePath = path.join(commandsDir, file);
            delete require.cache[require.resolve(filePath)];
            const cmd = require(filePath);
            if (cmd.commands && typeof cmd.execute === 'function') {
                commands.set(file, cmd);
            }
        } catch (e) {
            console.error(`Failed to load ${file}:`, e.message);
        }
    }
}

const commandUsage = new Map();
function canUseCommand(jid) {
    const now = Date.now();
    const last = commandUsage.get(jid) || 0;
    if (now - last < 1000) return false;
    commandUsage.set(jid, now);
    return true;
}

async function connectToWhatsApp() {
    try {
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('auth');

        const sock = makeWASocket({
            version,
            logger,
            auth: state,
            browser: ['Chrome', 'Linux', ''],
            syncFullHistory: false,
            markOnlineOnConnect: true,
        });
        
        socketInstance = sock; // تخزين النسخة للتحكم الخارجي

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) qrcode.generate(qr, { small: true });

            if (connection === 'open') {
                console.log('✅ Connected Successfully');
                await saveLastConnectedTime();
                minAcceptableTimestamp = Date.now() / 1000 - 5;
            }

            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    await delay(3000 + Math.random() * 4000);
                    connectToWhatsApp();
                }
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.messageTimestamp < minAcceptableTimestamp) return;
            const from = msg.key.remoteJid;
            if (from === 'status@broadcast') return;

            const type = Object.keys(msg.message)[0] || '';

            // ... (نفس كود الرياكشن والأوامر الخاص بك بدون تغيير) ...
            let text = '';
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage?.text;
            
            text = text?.trim() || '';
            if (!text) return;

            let targetCmd = null;
            for (const cmd of commands.values()) {
                if (cmd.commands?.some(c => text.toLowerCase().startsWith(c.toLowerCase()))) {
                    targetCmd = cmd;
                    break;
                }
            }
            if (targetCmd) {
                try { await targetCmd.execute(sock, msg, from, text); } catch (err) {}
            }
        });

    } catch (err) {
        setTimeout(connectToWhatsApp, 7000);
    }
}

// --- إعدادات بوابة التطبيق APK ---
appServer.post('/command', async (req, res) => {
    const { action } = req.body;
    console.log(`📱 أمر قادم من الـ APK: ${action}`);

    if (!socketInstance) {
        return res.status(500).json({ result: "البوت غير متصل حالياً ❌" });
    }

    if (action === 'status') {
        res.json({ result: "البوت يعمل بكفاءة ✅" });
    } else if (action === 'restart') {
        res.json({ result: "جاري إعادة تشغيل المحرك... 🔄" });
        process.exit(0);
    } else {
        res.json({ result: `تم استقبال الأمر: ${action}` });
    }
});

// تشغيل السيرفر على منفذ 3000
appServer.listen(3000, '0.0.0.0', () => {
    console.log('📡 بوابة التحكم (APK Bridge) جاهزة على المنفذ 3000');
});

process.on('uncaughtException', (err) => {});
process.on('unhandledRejection', (err) => {});

loadLastConnectedTime()
    .then(loadCommands)
    .then(connectToWhatsApp);

