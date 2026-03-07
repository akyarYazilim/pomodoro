# Workflow Orkestrasyonu

## 1. Varsayılan Plan Modu

- Önemsiz olmayan HER görev için plan moduna gir (3+ adım veya mimari karar içeren işler).
- Bir şey ters giderse DUR ve hemen yeniden plan yap — zorlamaya devam etme.
- Plan modunu sadece geliştirme için değil, doğrulama adımları için de kullan.
- Belirsizliği azaltmak için başta detaylı spesifikasyon yaz.

---

## 2. Ana Context Penceresini Temiz Tutmak İçin Subagent Stratejisi

- Araştırma, keşif ve paralel analizleri subagent’lara devret.
- Karmaşık problemler için subagent kullanarak daha fazla hesaplama gücü kullan.
- Her subagent’a tek görev ver, böylece odaklı çalışsın.

---

## 3. Kendini Geliştirme Döngüsü

- Kullanıcıdan HER düzeltme aldıktan sonra `tasks/lessons.md` dosyasını güncelle.
- Aynı hatanın tekrar edilmesini önleyecek kurallar yaz.
- Hata oranı düşene kadar bu dersleri sürekli iyileştir.
- Oturum başında ilgili proje için lessons dosyasını gözden geçir.

---

## 4. Bitirmeden Önce Doğrulama

- Çalıştığını kanıtlamadan hiçbir görevi tamamlanmış sayma.
- Gerekliyse ana davranış ile yaptığın değişiklikleri karşılaştır (diff).
- Kendine sor: "Bir staff engineer bunu onaylar mı?"
- Testleri çalıştır, logları kontrol et, doğruluğu göster.

---

## 5. Zarafet Talep Et (Dengeli)

- Önemsiz olmayan değişikliklerde dur ve sor:  
  "Bunun daha zarif bir yolu var mı?"
- Eğer çözüm hack gibi hissediyorsa şunu sor:  
  "Şimdi bildiklerimi bilseydim bunu en zarif şekilde nasıl yazardım?"
- Basit ve bariz çözümler için bunu yapma — gereksiz over-engineering yapma.
- Sunmadan önce kendi işini sorgula.

---

## 6. Otonom Hata Düzeltme

- Bir bug raporu verildiğinde direkt düzelt. Elinden tutulmasını bekleme.
- Loglara, hatalara ve failing testlere bak → sonra çöz.
- Kullanıcıdan sürekli bağlam isteme.
- Fail eden CI testlerini nasıl yapılacağını sorulmadan düzelt.

---

# Görev Yönetimi

1. **Önce Planla**  
   Planı `tasks/todo.md` dosyasına işaretlenebilir maddeler olarak yaz.

2. **Planı Doğrula**  
   Implementasyona başlamadan önce planı kontrol et.

3. **İlerlemeyi Takip Et**  
   Yaptığın işleri işaretleyerek tamamla.

4. **Değişiklikleri Açıkla**  
   Her adımda yüksek seviyeli bir özet ver.

5. **Sonuçları Dokümante Et**  
   İnceleme sonucunu `tasks/todo.md` dosyasına ekle.

6. **Dersleri Kaydet**  
   Kullanıcı düzeltmelerinden sonra `tasks/lessons.md` dosyasını güncelle.

---

# Temel Prensipler

## Basitlik Öncelikli
Her değişikliği mümkün olduğunca basit yap. Minimum kodu etkilesin.

## Tembellik Yok
Kök nedeni bul. Geçici çözümler yok. Senior developer standardı.

## Minimum Etki
Değişiklikler sadece gerekli olan yeri etkilemeli. Yeni bug’lar oluşturma.