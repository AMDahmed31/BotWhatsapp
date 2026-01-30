from kivymd.app import MDApp
from kivymd.uix.button import MDRaisedButton
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.image import Image
from kivy.uix.label import Label

class WhatsAppBotApp(MDApp):
    def build(self):
        self.theme_cls.primary_palette = "Green"
        self.theme_cls.theme_style = "Dark"
        
        layout = BoxLayout(orientation='vertical', padding=30, spacing=20)

        layout.add_widget(Label(
            text="WhatsApp Bot Control",
            font_size='24sp',
            bold=True
        ))

        # عرض الـ QR إذا وجد
        self.qr_img = Image(source='qr.png', allow_stretch=True)
        layout.add_widget(self.qr_img)

        # أزرار التحكم
        layout.add_widget(MDRaisedButton(
            text="تشغيل البوت الآن",
            pos_hint={'center_x': .5},
            size_hint=(0.8, None)
        ))

        layout.add_widget(MDRaisedButton(
            text="مسح بيانات الحفظ",
            md_bg_color=(1, 0, 0, 1),
            pos_hint={'center_x': .5},
            size_hint=(0.8, None)
        ))

        return layout

if __name__ == "__main__":
    WhatsAppBotApp().run()
