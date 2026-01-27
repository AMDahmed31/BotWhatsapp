const fs = require('fs');
const path = require('path');

module.exports = {
    commands: ['.ارجاع'],
    async execute(sock, msg, from, text) {

        const isMe = msg.key.fromMe;  
        const myNumber = '201551348207@s.whatsapp.net';  
        const sender = msg.key.participant || msg.key.remoteJid;  
        if (!isMe && sender !== myNumber) return;  

        try {  
            const filePath = path.join(__dirname, '../raw_numbers.txt');  
            if (!fs.existsSync(filePath)) return;  

            const rawData = fs.readFileSync(filePath, 'utf-8');  
            let foundNumbers = rawData.match(/\d+/g);  
            if (!foundNumbers) return;  

            const groupMetadata = await sock.groupMetadata(from);  
            const currentParticipants = groupMetadata.participants.map(p => p.id);  

            let uniqueNumbers = [...new Set(foundNumbers)]  
                .map(num => num.startsWith('20') ? `${num}@s.whatsapp.net` : `20${num}@s.whatsapp.net`)  
                .filter(jid => !currentParticipants.includes(jid));  

            if (uniqueNumbers.length === 0) return;  

            await sock.sendMessage(from, { 
                text: `✅ تم العثور على ${uniqueNumbers.length} عضو\n⚡ نظام متوازن: عضوين كل 30-40 ثانية\n⚠️ لا تقم بأي إضافات يدوية!` 
            });  

            let successCount = 0;
            let failCount = 0;

            // إضافة عضوين في كل دفعة
            for (let i = 0; i < uniqueNumbers.length; i += 2) {  
                const batch = uniqueNumbers.slice(i, i + 2);

                try {  
                    // محاكاة نشاط بشري
                    await sock.sendPresenceUpdate('available', from);
                    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
                    
                    await sock.sendPresenceUpdate('composing', from);
                    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

                    // إضافة الدفعة
                    await sock.groupParticipantsUpdate(from, batch, "add");
                    successCount += batch.length;
                    console.log(`✅ تمت إضافة دفعة ${Math.ceil((i + 2) / 2)}: ${batch.length} أعضاء`);

                    // إشعار تقدم كل 10 أعضاء
                    if ((i + 2) % 10 === 0 || i + 2 >= uniqueNumbers.length) {
                        await sock.sendMessage(from, { 
                            text: `📊 التقدم: ${Math.min(i + 2, uniqueNumbers.length)}/${uniqueNumbers.length}\n✅ نجح: ${successCount} | ❌ فشل: ${failCount}` 
                        });
                    }

                } catch (err) {  
                    failCount += batch.length;
                    console.log(`❌ فشل إضافة الدفعة: ${err.message}`);
                }  

                // فاصل زمني عشوائي بين 30-40 ثانية
                if (i + 2 < uniqueNumbers.length) {
                    const delay = 30000 + Math.random() * 10000; // 30-40 ثانية
                    console.log(`⏸️ انتظار ${Math.round(delay/1000)} ثانية...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // استراحة متوسطة كل 20 عضو (2-3 دقائق)
                if ((i + 2) % 20 === 0 && i + 2 < uniqueNumbers.length) {  
                    const mediumBreak = 120000 + Math.random() * 60000; // 2-3 دقائق
                    await sock.sendMessage(from, { 
                        text: `☕ استراحة ${Math.round(mediumBreak/60000)} دقيقة بعد ${i + 2} عضو...\n⏰ سيستكمل تلقائياً` 
                    });
                    console.log(`☕ استراحة ${Math.round(mediumBreak/1000)} ثانية...`);
                    await new Promise(resolve => setTimeout(mediumBreak));
                }

                // استراحة طويلة كل 50 عضو (5-8 دقائق)
                if ((i + 2) % 50 === 0 && i + 2 < uniqueNumbers.length) {
                    const longBreak = 300000 + Math.random() * 180000; // 5-8 دقائق
                    await sock.sendMessage(from, { 
                        text: `🛡️ استراحة حماية ${Math.round(longBreak/60000)} دقيقة\n✅ تم حتى الآن: ${successCount}\n⚠️ الرقم آمن - لا تتدخل!` 
                    });
                    await new Promise(resolve => setTimeout(resolve, longBreak));
                }
            }  

            await sock.sendMessage(from, { 
                text: `🎉 انتهت عملية الإضافة!\n\n📊 النتيجة:\n✅ نجح: ${successCount}\n❌ فشل: ${failCount}\n📝 إجمالي: ${uniqueNumbers.length}\n\n⏱️ الوقت المستغرق تقريباً: ${Math.round((uniqueNumbers.length / 2) * 35 / 60)} دقيقة` 
            });  

        } catch (e) {  
            console.error(e);
            await sock.sendMessage(from, { text: `❌ حدث خطأ: ${e.message}` });
        }  
    }
}
