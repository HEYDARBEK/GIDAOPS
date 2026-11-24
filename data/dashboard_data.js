/**
 * GıdaOps AI — Deterministik Çok Şubeli Operasyonel Veri Seti (10 Şube × 30 Gün)
 * index.html tarafından doğrudan yüklenir (file:// ve GitHub Pages uyumlu).
 */
(function () {
  let seed = 20261124;
  function rand() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
  function randRange(min, max) { return min + rand() * (max - min); }
  function round2(n) { return Math.round(n * 100) / 100; }

  const branches = [
    { id: 'IST-01', name: 'İstanbul Araştırma Hast. Ana Kantin', city: 'İstanbul', type: 'Hastane Kantini', baseRev: 68000, rentRate: 0.16, staffCost: 245000, wasteBias: 0.032 },
    { id: 'IST-02', name: 'İstanbul Merkez Kafe Şubesi', city: 'İstanbul', type: 'Kafe', baseRev: 44000, rentRate: 0.18, staffCost: 175000, wasteBias: 0.068 },
    { id: 'IST-03', name: 'İstanbul Avrupa Kampüs Kafeterya', city: 'İstanbul', type: 'Üniversite Kafeterya', baseRev: 52000, rentRate: 0.15, staffCost: 195000, wasteBias: 0.029 },
    { id: 'IST-04', name: 'İstanbul Batı Kampüs Kantin', city: 'İstanbul', type: 'Üniversite Kantini', baseRev: 34000, rentRate: 0.14, staffCost: 135000, wasteBias: 0.036 },
    { id: 'IST-05', name: 'İstanbul Kuzey Kampüs Kantin', city: 'İstanbul', type: 'Üniversite Kantini', baseRev: 22000, rentRate: 0.13, staffCost: 92000, wasteBias: 0.025 },
    { id: 'IST-06', name: 'İstanbul Vakıf Hast. Kantin', city: 'İstanbul', type: 'Hastane Kantini', baseRev: 58000, rentRate: 0.17, staffCost: 210000, wasteBias: 0.041 },
    { id: 'MUG-01', name: 'Muğla Bölge Hast. Kantin & Otomat', city: 'Muğla', type: 'Hastane & Otomat', baseRev: 39000, rentRate: 0.14, staffCost: 148000, wasteBias: 0.074 },
    { id: 'IZM-01', name: 'İzmir Güney Hast. B Blok Kantin', city: 'İzmir', type: 'Hastane Kantini', baseRev: 41000, rentRate: 0.15, staffCost: 155000, wasteBias: 0.059 },
    { id: 'ZON-01', name: 'Zonguldak Tıp Fak. Hast. Kantin', city: 'Zonguldak', type: 'Hastane Kantini', baseRev: 36000, rentRate: 0.14, staffCost: 138000, wasteBias: 0.038 },
    { id: 'CAN-01', name: 'Çanakkale Merkez Şube Kantin', city: 'Çanakkale', type: 'Kantin', baseRev: 26000, rentRate: 0.13, staffCost: 105000, wasteBias: 0.027 }
  ];

  const dates = [];
  const endDate = new Date('2026-11-24T00:00:00');
  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    dates.push(d);
  }
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  const posRows = [];
  for (const b of branches) {
    for (let idx = 0; idx < dates.length; idx++) {
      const d = dates[idx];
      const dateStr = d.toISOString().slice(0, 10);
      const dow = d.getDay();
      const isWeekend = dow === 0 || dow === 6;

      let dayFactor = 1.0;
      if (b.type.includes('Üniversite')) {
        dayFactor = isWeekend ? 0.28 : (dow === 1 || dow === 3 ? 1.08 : 1.0);
      } else {
        dayFactor = isWeekend ? 0.68 : (dow === 1 ? 1.12 : 1.0);
      }

      let rev = b.baseRev * dayFactor * randRange(0.91, 1.09);
      let cancelRate = randRange(0.008, 0.022);
      let discountRate = randRange(0.01, 0.028);

      if (b.id === 'MUG-01' && idx === 27) rev *= 0.48;
      if (b.id === 'IZM-01' && idx >= 26 && idx <= 28) cancelRate = randRange(0.072, 0.095);
      if (b.id === 'IST-02' && idx === 28) discountRate = 0.089;
      if (b.id === 'IST-01' && idx === 29) rev *= 1.24;

      const avgBasket = b.type === 'Kafe' ? randRange(125, 155) : randRange(78, 105);
      const txCount = Math.max(25, Math.round(rev / avgBasket));
      const revenue = round2(rev);
      const cancelAmt = round2(revenue * cancelRate);
      const discountAmt = round2(revenue * discountRate);
      const posRatio = b.type.includes('Otomat') ? randRange(0.55, 0.68) : randRange(0.68, 0.80);
      const posAmt = round2(revenue * posRatio);
      const cashAmt = round2(revenue - posAmt);

      posRows.push({
        tarih: dateStr,
        gun: dayNames[dow],
        sube_id: b.id,
        sube_adi: b.name,
        il: b.city,
        sube_tipi: b.type,
        ciro_tl: revenue,
        islem_adedi: txCount,
        ort_sepet_tl: round2(revenue / txCount),
        pos_tl: posAmt,
        nakit_tl: cashAmt,
        iptal_iade_tl: cancelAmt,
        iptal_orani: round2(cancelRate * 100),
        indirim_tl: discountAmt,
        indirim_orani: round2(discountRate * 100)
      });
    }
  }

  const branchStats = {};
  for (const b of branches) {
    const rows = posRows.filter(r => r.sube_id === b.id);
    const weekdayRevs = rows.filter(r => r.gun !== 'Cmt' && r.gun !== 'Paz').map(r => r.ciro_tl);
    const mean = weekdayRevs.reduce((a, c) => a + c, 0) / weekdayRevs.length;
    const std = Math.sqrt(weekdayRevs.reduce((a, c) => a + Math.pow(c - mean, 2), 0) / weekdayRevs.length) || 1;
    branchStats[b.id] = { mean, std };
  }

  const anomalies = [];
  for (const r of posRows) {
    const st = branchStats[r.sube_id];
    const isWeekend = r.gun === 'Cmt' || r.gun === 'Paz';
    const zScore = isWeekend ? 0 : (r.ciro_tl - st.mean) / st.std;

    if (!isWeekend && zScore < -2.1) {
      anomalies.push({
        tarih: r.tarih,
        sube_id: r.sube_id,
        sube_adi: r.sube_adi,
        il: r.il,
        tur: 'Ciro Düşüşü',
        seviye: 'Kritik',
        deger: `${Math.round(r.ciro_tl).toLocaleString('tr-TR')} ₺ (Ort: ${Math.round(st.mean).toLocaleString('tr-TR')} ₺)`,
        aciklama: `Hafta içi ortalamasının %${Math.round(Math.abs((r.ciro_tl - st.mean) / st.mean) * 100)} altında (Z=${round2(zScore)}). POS/Otomat arızası veya vardiya kesintisi kontrol edilmeli.`
      });
    }
    if (r.iptal_orani >= 5.0) {
      anomalies.push({
        tarih: r.tarih,
        sube_id: r.sube_id,
        sube_adi: r.sube_adi,
        il: r.il,
        tur: 'Yüksek İptal/İade',
        seviye: 'Yüksek',
        deger: `%${r.iptal_orani} (${Math.round(r.iptal_iade_tl).toLocaleString('tr-TR')} ₺)`,
        aciklama: `Kasa iptal/iade oranı %5 eşiğinin üzerinde. POS iptal yetkileri ve fiş kayıtları denetlenmeli.`
      });
    }
    if (r.indirim_orani >= 6.0) {
      anomalies.push({
        tarih: r.tarih,
        sube_id: r.sube_id,
        sube_adi: r.sube_adi,
        il: r.il,
        tur: 'Anormal İndirim',
        seviye: 'Orta',
        deger: `%${r.indirim_orani} (${Math.round(r.indirim_tl).toLocaleString('tr-TR')} ₺)`,
        aciklama: `Günlük indirim/ikram oranı %6 eşiğini aştı. Personel/ikram tanımları incelenmeli.`
      });
    }
  }

  const ingredients = [
    { code: 'HM-01', name: 'Kaşar Peyniri (Tost)', unit: 'kg', unitCost: 265, baseQty: 140 },
    { code: 'HM-02', name: 'Çekirdek Kahve & Süt', unit: 'kg/L', unitCost: 390, baseQty: 95 },
    { code: 'HM-03', name: 'Unlu Mamul (Poğaça/Sandviç)', unit: 'adet', unitCost: 19, baseQty: 2600 },
    { code: 'HM-04', name: 'Soğuk İçecek (0.5L/Kutu)', unit: 'adet', unitCost: 14.5, baseQty: 4200 },
    { code: 'HM-05', name: 'Çay & Karton Bardak Seti', unit: 'porsiyon', unitCost: 4.8, baseQty: 7500 }
  ];

  const stockRows = [];
  for (const b of branches) {
    const scale = b.baseRev / 45000;
    for (const ing of ingredients) {
      const theoretical = round2(ing.baseQty * scale * randRange(0.88, 1.12));
      const itemMultiplier = ing.code === 'HM-03' ? 1.45 : ing.code === 'HM-02' ? 1.2 : 0.85;
      const wastePct = round2((b.wasteBias * itemMultiplier * randRange(0.85, 1.25)) * 100);
      const actual = round2(theoretical * (1 + wastePct / 100));
      const diffQty = round2(actual - theoretical);
      const lossTl = round2(diffQty * ing.unitCost);

      stockRows.push({
        sube_id: b.id,
        sube_adi: b.name,
        il: b.city,
        urun_kodu: ing.code,
        urun_adi: ing.name,
        birim: ing.unit,
        birim_maliyet_tl: ing.unitCost,
        teorik_tuketim: theoretical,
        fiili_tuketim: actual,
        fire_miktari: diffQty,
        fire_orani: wastePct,
        fire_kaybi_tl: lossTl,
        durum: wastePct >= 6.5 ? 'Kritik' : wastePct >= 4.5 ? 'Uyarı' : 'Normal'
      });
    }
  }

  const purchaseItems = [
    { kod: 'SA-101', urun: 'Tostluk Kaşar Peyniri (2 kg)', tedarikci: 'Marmara Süt & Gıda A.Ş.', birim: 'kg', onceki_fiyat: 232, guncel_fiyat: 265, talep_sube_sayisi: 10, toplam_miktar: 1420, kritik_stok_sube: 4 },
    { kod: 'SA-102', urun: 'UHT Tam Yağlı Süt (1 L)', tedarikci: 'Anadolu Süt Tedarik', birim: 'adet', onceki_fiyat: 31.5, guncel_fiyat: 35.0, talep_sube_sayisi: 9, toplam_miktar: 3600, kritik_stok_sube: 3 },
    { kod: 'SA-103', urun: 'Espresso Çekirdek Kahve (1 kg)', tedarikci: 'RoastMaster Kahve', birim: 'kg', onceki_fiyat: 540, guncel_fiyat: 585, talep_sube_sayisi: 8, toplam_miktar: 310, kritik_stok_sube: 2 },
    { kod: 'SA-104', urun: 'Donuk Poğaça & Börek Grubu', tedarikci: 'Merkez Unlu Mamuller', birim: 'koli', onceki_fiyat: 680, guncel_fiyat: 705, talep_sube_sayisi: 10, toplam_miktar: 480, kritik_stok_sube: 5 },
    { kod: 'SA-105', urun: '0.5L Pet Su & Soğuk İçecek Karma', tedarikci: 'Ege İçecek Dağıtım', birim: 'koli', onceki_fiyat: 175, guncel_fiyat: 179, talep_sube_sayisi: 10, toplam_miktar: 960, kritik_stok_sube: 2 },
    { kod: 'SA-106', urun: 'Karton Bardak 7oz + Karıştırıcı', tedarikci: 'AmbalajPro Sanayi', birim: 'koli', onceki_fiyat: 920, guncel_fiyat: 1030, talep_sube_sayisi: 10, toplam_miktar: 185, kritik_stok_sube: 3 },
    { kod: 'SA-107', urun: 'Tost Ekmeği (Büyük Boy)', tedarikci: 'İstanbul Fırın Grubu', birim: 'paket', onceki_fiyat: 42, guncel_fiyat: 44, talep_sube_sayisi: 10, toplam_miktar: 2150, kritik_stok_sube: 4 }
  ].map(item => {
    const degisimPct = round2(((item.guncel_fiyat - item.onceki_fiyat) / item.onceki_fiyat) * 100);
    return {
      ...item,
      fiyat_degisim_orani: degisimPct,
      toplam_tutar_tl: round2(item.toplam_miktar * item.guncel_fiyat),
      ek_maliyet_tl: round2(item.toplam_miktar * (item.guncel_fiyat - item.onceki_fiyat)),
      alarm: degisimPct >= 10 ? 'Yüksek Artış' : degisimPct >= 6 ? 'İncele' : 'Normal'
    };
  });

  const pnlRows = branches.map(b => {
    const bPos = posRows.filter(r => r.sube_id === b.id);
    const bStock = stockRows.filter(r => r.sube_id === b.id);
    const totalRev = round2(bPos.reduce((a, c) => a + c.ciro_tl, 0));
    const totalWaste = round2(bStock.reduce((a, c) => a + c.fire_kaybi_tl, 0));
    const baseCogsRate = b.type === 'Kafe' ? 0.275 : 0.305;
    const cogsTl = round2(totalRev * baseCogsRate + totalWaste);
    const cogsRate = round2((cogsTl / totalRev) * 100);
    const rentTl = round2(totalRev * b.rentRate);
    const staffTl = b.staffCost;
    const otherOpsTl = round2(totalRev * 0.065);
    const netProfitTl = round2(totalRev - cogsTl - rentTl - staffTl - otherOpsTl);

    return {
      sube_id: b.id,
      sube_adi: b.name,
      il: b.city,
      sube_tipi: b.type,
      aylik_ciro_tl: totalRev,
      gida_maliyeti_tl: cogsTl,
      gida_maliyeti_orani: cogsRate,
      fire_kaybi_tl: totalWaste,
      kira_ihale_payi_tl: rentTl,
      personel_gideri_tl: staffTl,
      diger_giderler_tl: otherOpsTl,
      net_kar_tl: netProfitTl,
      net_marj_orani: round2((netProfitTl / totalRev) * 100)
    };
  });

  const forecastDays = [
    { tarih: '2026-11-25', gun: 'Çar', takvim_notu: 'Normal Poliklinik + Ders Günü', carpan: 1.04 },
    { tarih: '2026-11-26', gun: 'Per', takvim_notu: 'Üniversite Vize Haftası Yoğunluğu', carpan: 1.18 },
    { tarih: '2026-11-27', gun: 'Cum', takvim_notu: 'Vize Haftası + Hastane Yoğunluğu', carpan: 1.22 },
    { tarih: '2026-11-28', gun: 'Cmt', takvim_notu: 'Hafta Sonu (Sadece Hastane Açık)', carpan: 0.56 },
    { tarih: '2026-11-29', gun: 'Paz', takvim_notu: 'Hafta Sonu (Düşük Trafik)', carpan: 0.49 },
    { tarih: '2026-11-30', gun: 'Pzt', takvim_notu: 'Pazartesi Poliklinik Zirvesi', carpan: 1.16 },
    { tarih: '2026-12-01', gun: 'Sal', takvim_notu: 'Normal Operasyon Günü', carpan: 1.02 }
  ].map(f => ({
    ...f,
    tahmini_ciro_tl: Math.round(418000 * f.carpan),
    tost_ekmegi_adet: Math.round(1850 * f.carpan),
    unlu_mamul_adet: Math.round(2400 * f.carpan),
    kahve_porsiyon: Math.round(1620 * f.carpan),
    sicak_cay_porsiyon: Math.round(4850 * f.carpan),
    onerilen_guvenlik_stoku: f.carpan > 1.15 ? '+%10 Tampon' : f.carpan < 0.6 ? '-%35 Azalt' : 'Standart'
  }));

  window.GIDAOPS_DATA = {
    generatedAt: '2026-11-24 14:15',
    periodLabel: '26 Ekim 2026 – 24 Kasım 2026 (30 Gün)',
    branches,
    posRows,
    anomalies,
    stockRows,
    purchaseItems,
    pnlRows,
    forecastDays
  };
})();
