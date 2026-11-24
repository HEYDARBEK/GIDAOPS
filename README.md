# GıdaOps AI — Çok Şubeli Gıda & Kantin Operasyonları Otomasyon ve YZ Karar Destek Sistemi

Çok noktalı hastane/üniversite kantini, kafe ve otomat operasyonları için geliştirilmiş; **Satış (POS), Depo/Stok, Üretim Tahmini, Merkezi Satın Alma, Finans (P&L) ve Üst Yönetim Raporlama** süreçlerini tek merkezde birleştiren operasyonel otomasyon ve yapay zekâ karar destek platformu.
https://heydarbek.github.io/GIDAOPS/

> **Not:** Uygulamadaki şube isimleri ve finansal değerler, sistemin tüm modüllerini göstermek amacıyla oluşturulmuş tamamen temsili (sentetik) verilerdir.

## Öne Çıkan Modüller
- **POS & Z-Raporu Konsolidasyonu + Anomali Motoru:** Şube bazlı günlük ciro trendlerini izler; Z-Score tabanlı ani ciro düşüşlerini, %5 üzeri kasa iptal/iade oranlarını ve %6 üzeri indirim sapmalarını otomatik işaretler.
- **Reçete Bazlı Stok & Fire Analizi:** POS satışlarına dayalı teorik tüketim ile fiili sayım farkını karşılaştırarak şube ve ürün grubu bazında TL fire kaybını hesaplar.
- **Üretim & Hazırlık Miktarı Tahmini:** Akademik takvim (sınav/tatil) ve hastane poliklinik yoğunluğuna göre gelecek 7 günün üretim miktarlarını planlar.
- **Merkezi Satın Alma Konsolidasyonu:** Dağınık şube taleplerini tek sipariş havuzunda toplar, önceki faturalara göre %10+ fiyat artışı gösteren tedarikçileri onay öncesinde uyarır ve tek tıkla CSV sipariş taslağı indirir.
- **Şube Bazlı Kârlılık (P&L) & Gıda Maliyeti Kontrolü:** Her şube için gıda maliyeti (COGS %), kira/ihale payı, personel gideri ve net kâr marjını %28–32 hedef bandına göre izler.
- **Otomatik Yönetici Brifingi & YZ Veri Asistanı:** WhatsApp/e-posta formatında tek tıkla yönetici özeti oluşturur, kişisel veri içermeyen KVKK uyumlu ChatGPT/Copilot promptu üretir ve veriler üzerinde doğal dilde sorgulama imkânı sunar.
- **Canlı CSV Yükleme & Excel Uyumlu Dışa Aktarım:** Yeni şube CSV dosyalarını doğrudan tarayıcıda işler; tüm raporları UTF-8 BOM formatında Türkçe karakter uyumlu olarak dışa aktarır.

## Kurulum ve Çalıştırma
Uygulama sıfır dış bağımlılıkla çalışır:
1. `index.html` dosyasını tarayıcınızda açın (veya GitHub Pages bağlantısını kullanın).
2. Python otomasyon betiğini çalıştırmak için:
   ```bash
   pip install pandas openpyxl
   python scripts/otomasyon_pipeline.py
   ```

## Proje Yapısı
- `index.html` — Tek sayfalık interaktif Yönetim & Otomasyon Paneli.
- `data/dashboard_data.js` — 10 şube × 30 günlük örnek veri seti ve istatistiksel anomali motoru.
- `data/ornek_pos_satis_verisi.csv` — Canlı CSV yükleme testi için örnek POS dışa aktarımı.
- `scripts/otomasyon_pipeline.py` — Ham ERP/POS CSV dosyalarını birleştirip çok sayfalı Excel yönetim raporu üreten Python (`pandas`/`openpyxl`) betiği.
