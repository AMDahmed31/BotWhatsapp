from kivymd.app import MDApp
from kivymd.uix.button import MDRaisedButton
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.image import Image
from kivy.uix.label import Label
from kivy.core.window import Window

class WhatsAppBotApp(MDApp):
    def build(self):
        # تنسيق الألوان
        self.theme_cls.primary_palette = "Green"
        self.theme_cls.theme_style = "Dark"
        
        layout = BoxLayout(orientation='vertical', padding=30, spacing=20)

        # عنوان التطبيق
        layout.add_widget(Label(
            text="WhatsApp Bot Control",
            font_size='24sp',
            bold=True,
            color=(1, 1, 1, 1)
        ))

        # مكان عرض كود الـ QR (لو موجود ملف اسمه qr.png هيعرضه)
        try:
            self.qr_img = Image(source='qr.png', allow_stretch=True)
            layout.add_widget(self.qr_img)
        except:
            layout.add_widget(Label(text="Waiting for QR Code..."))

        # زر تشغيل البوت
        btn_start = MDRaisedButton(
            text="تشغيل البوت الآن",
            pos_hint={'center_x': .5},
            size_hint=(0.8, None),
            on_release=self.start_bot
        )
        layout.add_widget(btn_start)

        # زر مسح الجلسة (Session)
        btn_clear = MDRaisedButton(
            text="مسح بيانات الحفظ",
            md_bg_color=(1, 0, 0, 1), # لون أحمر
            pos_hint={'center_x': .5},
            size_hint=(0.8, None),
            on_release=self.clear_session
        )
        layout.add_widget(btn_clear)

        return layout

    def start_bot(self, instance):
        print("جاري تشغيل ملفات البوت...")
        # هنا التطبيق بيدي أمر تشغيل داخلي

    def clear_session(self, instance):
        print("تم مسح بيانات الجلسة.")

if __name__ == "__main__":
    WhatsAppBotApp().run()
