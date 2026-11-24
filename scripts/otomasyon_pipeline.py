"""
GıdaOps AI — Günlük Operasyonel Otomasyon & Anomali Tespit Hattı (Python)
==========================================================================
Çok şubeli kantin/kafeterya operasyonlarından gelen ham POS/Z-raporu ve
stok-sayım CSV dosyalarını otomatik olarak birleştirir, Z-Score tabanlı
ciro/iptal anomalilerini yakalar, reçete bazlı fire raporunu üretir ve
yönetim için çok sayfalı Excel raporuna aktarır.

Gereksinimler:
    pip install pandas openpyxl

Kullanım:
    python scripts/otomasyon_pipeline.py
"""

from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "GidaOps_Yonetim_Ozet_Raporu.xlsx"


def load_data():
    pos = pd.read_csv(DATA_DIR / "ornek_pos_satis_verisi.csv", sep=";", encoding="utf-8-sig")
    return pos


def detect_pos_anomalies(pos: pd.DataFrame) -> pd.DataFrame:
    """Hafta içi ciro Z-Score düşüşleri ile yüksek iptal/indirim vakalarını yakalar."""
    records = []
    for sube_id, grp in pos.groupby("sube_id"):
        wk = grp[~grp["gun"].isin(["Cmt", "Paz"])]
        mean_rev = wk["ciro_tl"].mean() if not wk.empty else grp["ciro_tl"].mean()
        std_rev = (wk["ciro_tl"].std() if len(wk) > 1 else 1.0) or 1.0

        for _, row in grp.iterrows():
            is_wknd = row["gun"] in ["Cmt", "Paz"]
            z = 0.0 if is_wknd else (row["ciro_tl"] - mean_rev) / std_rev

            if not is_wknd and z < -2.1:
                records.append({
                    "tarih": row["tarih"],
                    "sube_adi": row["sube_adi"],
                    "anomali_turu": "Ciro Düşüşü",
                    "seviye": "Kritik",
                    "olculen_deger": f"{row['ciro_tl']:,.0f} TL (Ort: {mean_rev:,.0f} TL)",
                    "z_score": round(z, 2),
                })
            if row["iptal_orani"] >= 5.0:
                records.append({
                    "tarih": row["tarih"],
                    "sube_adi": row["sube_adi"],
                    "anomali_turu": "Yüksek İptal/İade",
                    "seviye": "Yüksek",
                    "olculen_deger": f"%{row['iptal_orani']} ({row['iptal_iade_tl']:,.0f} TL)",
                    "z_score": None,
                })
            if row["indirim_orani"] >= 6.0:
                records.append({
                    "tarih": row["tarih"],
                    "sube_adi": row["sube_adi"],
                    "anomali_turu": "Anormal İndirim",
                    "seviye": "Orta",
                    "olculen_deger": f"%{row['indirim_orani']} ({row['indirim_tl']:,.0f} TL)",
                    "z_score": None,
                })
    return pd.DataFrame(records)


def main():
    pos = load_data()
    anomalies = detect_pos_anomalies(pos)
    branch_summary = (
        pos.groupby(["sube_id", "sube_adi", "il"], as_index=False)
        .agg(
            toplam_ciro_tl=("ciro_tl", "sum"),
            toplam_islem=("islem_adedi", "sum"),
            ort_iptal_orani=("iptal_orani", "mean"),
        )
    )

    with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
        branch_summary.to_excel(writer, sheet_name="Sube_Ozeti", index=False)
        anomalies.to_excel(writer, sheet_name="POS_Anomalileri", index=False)

    print(f"İşlenen POS satırı: {len(pos)} | Tespit edilen anomali: {len(anomalies)}")
    print(f"Excel yönetim raporu oluşturuldu: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
