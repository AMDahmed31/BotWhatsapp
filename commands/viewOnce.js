const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const pino = require('pino');

module.exports = {
    async handle(sock, msg, from) {
        const viewOnce = msg.message?.viewOnceMessage || msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessageV2Extension;
        
        if (viewOnce) {
            const mType = Object.keys(viewOnce.message)[0];
            const mediaData = viewOnce.message[mType];
            
            // الرقم الذي حددته لإرسال النتائج إليه
            const myNumber = '201009390573@s.whatsapp.net';

            try {
                const buffer = await downloadMediaMessage(
                    msg,
                    'buffer',
                    {},
                    { 
                        logger: pino({ level: 'silent' }),
                        reuploadRequest: sock.updateMediaMessage
                    }
                );

                let caption = `🔓 *كاشف المرة الواحدة*\n👤 من: @${from.split('@')[0]}\n📍 المكان: ${from.endsWith('@g.us') ? 'مجموعة' : 'خاص'}`;
                if (mediaData.caption) caption += `\n📝 الوصف: ${mediaData.caption}`;

                // الإرسال للرقم المحدد
                if (mType === 'imageMessage') {
                    await sock.sendMessage(myNumber, { image: buffer, caption: caption, mentions: [from] });
                } else if (mType === 'videoMessage') {
                    await sock.sendMessage(myNumber, { video: buffer, caption: caption, mentions: [from] });
                } else if (mType === 'audioMessage') {
                    await sock.sendMessage(myNumber, { audio: buffer, mimetype: 'audio/mp4', ptt: false });
                }
                
                console.log('✅ تم كشف الوسائط وإرسالها للرقم المحدد: ' + myNumber);
            } catch (err) {
                console.error('❌ خطأ في إرسال رسالة المرة الواحدة:', err.message);
            }
        }
    }
};

