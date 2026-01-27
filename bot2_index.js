const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    downloadMediaMessage
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const path = require('path')

const commands = new Map()
const activeReactions = new Set()

function loadCommands() {
    const commandsDir = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir);

    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        try {
            const cmd = require(path.join(commandsDir, file))
            commands.set(file, cmd)
        } catch (e) {
            console.log(`❌ خطأ في تحميل ملف ${file}:`, e.message)
        }
    }
    console.log(`✅ تم تحميل ${commands.size} ملفات أوامر`)
}

async function connectToWhatsApp() {
    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState('auth')

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'error' }),
        auth: state,
        printQRInTerminal: false,
        browser: ['Chrome (Linux)', '', ''],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => { return undefined }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) qrcode.generate(qr, { small: true })

        if (connection === 'open') {
            console.log('\n✅ البوت متصل الآن وشغال بأقصى سرعة\n')
            const GROUP_ID = '120363360603895044@g.us'

            setTimeout(() => {
                if (fs.existsSync('./commands/islamic.js')) {
                    require('./commands/islamic.js').scheduleAzkar(sock, GROUP_ID)
                }
            }, 5000);

            setTimeout(() => {
                if (fs.existsSync('./commands/prayer.js')) {
                    require('./commands/prayer.js').schedulePrayer(sock)
                }
            }, 7000);

            setTimeout(() => {
                if (fs.existsSync('./commands/auto_broadcast.js')) {
                    require('./commands/auto_broadcast.js').scheduleAutoBroadcast(sock);
                }
            }, 10000);
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) connectToWhatsApp()
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return

        const from = msg.key.remoteJid
        if (from === 'status@broadcast') return

        const isMe = msg.key.fromMe
        const messageType = Object.keys(msg.message)[0]

        // 🔥 ميزة التفاعل التلقائي (5 ثواني + سريع)
        if (messageType === 'reactionMessage' && isMe) {
            const reaction = msg.message.reactionMessage
            const targetKey = reaction.key
            const yourEmoji = reaction.text
            
            const messageId = `${targetKey.remoteJid}-${targetKey.id}`
            
            if (activeReactions.has(messageId)) {
                return
            }
            
            if (targetKey.fromMe) {
                return
            }
            
            activeReactions.add(messageId)
            
            const allEmojis = [
                '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
                '🔥', '✨', '⚡', '💫', '💥', '🌟', '💢', '💨',
                '😂', '🤣', '😭', '😍', '🥰', '😘', '😎', '🤔',
                '👍', '👎', '👏', '🙌', '💪', '🦾', '👊', '✊',
                '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '👑', '💎'
            ]
            
            const shuffled = allEmojis.sort(() => Math.random() - 0.1)
            
            const DURATION = 5000      // ⏱️ 5 ثواني تفاعل
            const MIN_DELAY = 30       // ⚡ سرعة عالية
            const MAX_DELAY = 80       // ⚡ سرعة عالية
            
            setTimeout(async () => {
                try {
                    const startTime = Date.now()
                    let currentIndex = 0
                    
                    while (Date.now() - startTime < DURATION) {
                        await sock.sendMessage(from, {
                            react: { 
                                text: shuffled[currentIndex], 
                                key: targetKey 
                            }
                        })
                        
                        const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY
                        await new Promise(r => setTimeout(r, delay))
                        
                        currentIndex++
                        if (currentIndex >= shuffled.length) {
                            currentIndex = 0
                            shuffled.sort(() => Math.random() - 0.1)
                        }
                    }
                    
                    await new Promise(r => setTimeout(r, 200))
                    await sock.sendMessage(from, {
                        react: { text: yourEmoji, key: targetKey }
                    })
                    
                } catch (e) {
                    // تجاهل
                } finally {
                    // ✅ إيقاف لمدة 6 ثواني بعد الانتهاء
                    setTimeout(() => {
                        activeReactions.delete(messageId)
                    }, 6000) // 🛑 6 ثواني إيقاف
                }
            }, 100)
            
            return
        }

        let text = ''
        if (messageType === 'conversation') text = msg.message.conversation
        else if (messageType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text
        else if (messageType === 'imageMessage') text = msg.message.imageMessage.caption
        else if (messageType === 'videoMessage') text = msg.message.videoMessage.caption

        text = text?.trim() || ''

        let isCommand = false
        let targetCommand = null
        if (text) {
            for (const [fileName, cmd] of commands) {
                if (cmd.commands && cmd.commands.some(c => text.startsWith(c))) {
                    isCommand = true
                    targetCommand = cmd
                    break
                }
            }
        }

        if (isMe && !isCommand && !text.startsWith('.') && !text.startsWith('!')) return

        if (isCommand && targetCommand) {
            await targetCommand.execute(sock, msg, from, text)
        }
    })
}

loadCommands()
connectToWhatsApp()

process.on('uncaughtException', (err) => {
    if (err.message.includes('item-not-found') || err.message.includes('404')) {
        console.log('🛡️ تم اعتراض خطأ (404).');
    } else {
        console.error('⚠️ خطأ:', err.message);
    }
});

process.on('unhandledRejection', (reason) => {
    console.error('🛡️ رفض غير معالج:', reason?.message || reason);
});
