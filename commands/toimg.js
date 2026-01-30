const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    commands: ['.استخراج ملصق', 'استخراج'], 
    async execute(sock, msg, from, text) {
        // مصفوفة لتخزين المسارات التي يجب مسحها لاحقاً
        let filesToDelete = [];

        try {
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted || !quoted.stickerMessage) {
                return await sock.sendMessage(from, { text: '❌ رد على ملصق واكتب: \n*.استخراج ملصق*' }, { quoted: msg });
            }

            const sticker = quoted.stickerMessage;
            const isAnimated = sticker.isAnimated;

            const stream = await downloadContentFromMessage(sticker, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const randomName = Math.floor(Math.random() * 10000);
            // المسارات الأساسية
            const inputFile = path.join(__dirname, `../temp_in_${randomName}.webp`);
            const outputFile = isAnimated 
                ? path.join(__dirname, `../temp_out_${randomName}.mp4`) 
                : path.join(__dirname, `../temp_out_${randomName}.png`);
            const finalFile = isAnimated ? path.join(__dirname, `../temp_final_${randomName}.mp4`) : outputFile;

            // إضافة الملفات للقائمة لضمان مسحها
            filesToDelete.push(inputFile, outputFile, finalFile);

            fs.writeFileSync(inputFile, buffer);
            await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

            let command;
            if (isAnimated) {
                // أمر محسن: يحول بـ magick ثم يضغط بـ ffmpeg للملف النهائي
                command = `magick "${inputFile}" "${outputFile}" && ffmpeg -i "${outputFile}" -vf "fps=15,scale=512:-1:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0,format=yuv420p" -c:v libx264 -preset ultrafast -y "${finalFile}"`;
            } else {
                command = `magick "${inputFile}" "${outputFile}"`;
            }

            exec(command, async (error) => {
                try {
                    if (error) {
                        console.error('Conversion Error:', error);
                        await sock.sendMessage(from, { text: '⚠️ فشل الاستخراج.' });
                    } else {
                        // إرسال النتيجة
                        if (isAnimated) {
                            await sock.sendMessage(from, { 
                                video: fs.readFileSync(finalFile), 
                                caption: '✅ تم استخراج الفيديو بنجاح',
                                mimetype: 'video/mp4' 
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(from, { 
                                image: fs.readFileSync(outputFile), 
                                caption: '✅ تم استخراج الصورة بنجاح' 
                            }, { quoted: msg });
                        }
                        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
                    }
                } catch (e) {
                    console.log("Error during sending:", e);
                } finally {
                    // --- عملية التنظيف (Cleanup) ---
                    // نمسح كل الملفات المخزنة في المصفوفة فوراً
                    filesToDelete.forEach(f => {
                        if (fs.existsSync(f)) {
                            fs.unlinkSync(f);
                        }
                    });
                }
            });

        } catch (e) {
            console.log("Error:", e.message);
            // مسح الملفات حتى في حالة حدوث خطأ برمجي
            filesToDelete.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
        }
    }
};

