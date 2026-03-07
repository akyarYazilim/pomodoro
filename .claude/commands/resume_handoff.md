---
description: Handoff dokumanindan baglam analizi ve dogrulama ile ise devam et
---

# Handoff dokumanindan ise devam et

Etkilesimli bir surecle handoff dokumanindan ise devam etmekle gorevlendirildin. Bu handoff'lar, onceki calisma oturumlarindan gelen kritik baglam, ogrenimler ve sonraki adimlari icerir; bunlar anlasilmali ve devam ettirilmelidir.

## Ilk Yanit

Bu komut cagrildiginda:

1. **Handoff dokumani yolu verildiyse**:
   - Parametre olarak handoff dokumani yolu verildiyse varsayilan mesaji atla
   - Handoff dokumanini hemen TAMAMEN oku
   - `thoughts/shared/plans` veya `thoughts/shared/research` altinda bag verdigi arastirma/plan dokumanlarini hemen oku. Bu kritik dosyalari okumak icin alt-ajan kullanma.
   - Handoff dokumanindaki ilgili baglami alarak analiz surecine basla, bahsettigi ek dosyalari oku
   - Sonra kullaniciya bir aksiyon plani onerip onay al veya yon netlestirme sorusu sor.

2. **Ticket numarasi verildiyse (ENG-XXXX gibi)**:
   - `thoughts/` dizininin guncel oldugundan emin olmak icin `humanlayer thoughts sync` calistir.
   - Ticket icin en guncel handoff dokumanini bul. Ticketlar `thoughts/shared/handoffs/ENG-XXXX` altinda olur. Ornek: `ENG-2124` icin `thoughts/shared/handoffs/ENG-2124/`. **Bu dizinin icerigini listele.**
   - Dizin icerisinde sifir, bir veya birden fazla dosya olabilir.
   - **Dizinde sifir dosya varsa veya dizin yoksa** kullaniciya sunu soyle: "Uzgunum, bu handoff dokumanini bulamiyorum. Lutfen bana yolunu verebilir misin?"
   - **Dizinde tek dosya varsa** o handoff ile devam et
   - **Birden fazla dosya varsa** dosya adindaki tarih/saat bilgisini (`YYYY-MM-DD_HH-MM-SS`, 24 saat formati) kullanarak _en guncel_ handoff dokumanini sec
   - Handoff dokumanini hemen TAMAMEN oku
   - `thoughts/shared/plans` veya `thoughts/shared/research` altinda bag verdigi arastirma/plan dokumanlarini hemen oku; bu kritik dosyalari okumak icin alt-ajan kullanma
   - Handoff baglamini alarak analiz surecine basla, bahsettigi ek dosyalari oku
   - Sonra kullaniciya bir aksiyon plani onerip onay al veya yon netlestirme sorusu sor.

3. **Parametre yoksa** su sekilde yanit ver:
```
Handoff dokumanindan ise devam etmene yardim edecegim. Mevcut handoff'lari bulayim.

Hangi handoff'tan devam etmek istersin?

Ipuclari: Bu komutu dogrudan handoff yolu ile cagirabilirsin: `/resume_handoff `thoughts/shared/handoffs/ENG-XXXX/YYYY-MM-DD_HH-MM-SS_ENG-XXXX_description.md`

veya bir ticket numarasi ile o ticketin en guncel handoff'undan devam etmek icin: `/resume_handoff ENG-XXXX`
```

Sonra kullanicinin girdisini bekle.

## Surec Adimlari

### Adim 1: Handoff'u Oku ve Analiz Et

1. **Handoff dokumanini tamamen oku**:
   - Read aracini limit/offset olmadan kullan
   - Tum bolumleri cikar:
     - Task(lar) ve durumlari
     - Son degisiklikler
     - Ogrenimler
     - Artifacts
     - Aksiyon maddeleri ve sonraki adimlar
     - Diger notlar

2. **Odakli arastirma gorevleri baslat**:
   Handoff icerigine gore mevcut durumu dogrulamak icin paralel gorevler ac:

   ```
   Gorev 1 - Artifact baglamini topla:
   Handoff'ta gecen tum artifact'lari oku.
   1. "Artifacts" altinda listelenen feature dokumanlarini oku
   2. Referans verilen implementasyon planlarini oku
   3. Bahsedilen arastirma dokumanlarini oku
   4. Ana gereksinim ve kararlari cikar
   Araclar: Read
   Donus: Artifact icerikleri ve ana kararlarin ozeti
   ```

3. **Devam etmeden once TUM alt-gorevleri bekle**

4. **Belirlenen kritik dosyalari oku**:
   - "Learnings" bolumundeki dosyalari tamamen oku
   - "Recent changes" bolumundeki dosyalari okuyarak degisiklikleri anla
   - Arastirmada bulunan yeni ilgili dosyalari oku

### Adim 2: Sentezle ve Analizi Sun

1. **Kapsamli analiz sun**:
   ```
   [date] tarihli [researcher] tarafindan hazirlanan handoff'u analiz ettim. Mevcut durum:

   **Orijinal Task'lar:**
   - [Task 1]: [Handoff durumu] -> [Mevcut dogrulama]
   - [Task 2]: [Handoff durumu] -> [Mevcut dogrulama]

   **Dogrulanan Ana Ogrenimler:**
   - [dosya:satir referansli ogrenim] - [Hala gecerli/Degisti]
   - [Kesfedilen desen] - [Hala uygulanabilir/Guncellendi]

   **Son Degisiklik Durumu:**
   - [Degisiklik 1] - [Dogrulandi/Eksik/Modified]
   - [Degisiklik 2] - [Dogrulandi/Eksik/Modified]

   **Incelenen Artifacts:**
   - [Dokuman 1]: [Ana cikarim]
   - [Dokuman 2]: [Ana cikarim]

   **Onerilen Sonraki Aksiyonlar:**
   Handoff aksiyon maddeleri ve mevcut duruma gore:
   1. [En mantikli sonraki adim]
   2. [Ikinci oncelik]
   3. [Kesfedilen ek gorevler]

   **Tespit Edilen Olasi Sorunlar:**
   - [Bulunan cakismlar veya regresyonlar]
   - [Eksik bagimlilik veya kirik kod]

   [onerilen aksiyon 1] ile devam edeyim mi, yoksa yaklasimi ayarlamak ister misin?
   ```

2. **Devam etmeden once onay al**

### Adim 3: Aksiyon Plani Olustur

1. **TodoWrite ile gorev listesi olustur**:
   - Handoff'taki aksiyon maddelerini todo'ya donustur
   - Analiz sirasinda bulunan yeni gorevleri ekle
   - Bagimlilik ve handoff yonlendirmesine gore onceliklendir

2. **Plani sun**:
   ```
   Handoff ve mevcut analize gore bir gorev listesi olusturdum:

   [todo listesi]

   Ilk gorevle baslamaya hazir misin: [gorev aciklamasi]?
   ```

### Adim 4: Implementasyona Basla

1. **Onaylanan ilk gorevle basla**
2. **Implementasyon boyunca handoff'taki ogrenimlere referans ver**
3. **Handoff'ta belgelenen desen ve yaklasimlari uygula**
4. **Gorevler tamamlandikca ilerlemeyi guncelle**

## Kurallar

1. **Analizde kapsamli ol**:
   - Once tum handoff dokumanini oku
   - Bahsedilen TUM degisikliklerin hala var oldugunu dogrula
   - Regresyon veya cakismlari kontrol et
   - Referans verilen tum artifact'lari oku

2. **Etkilesimli ol**:
   - Ise baslamadan once bulgulari sun
   - Yaklasim icin mutabakat al
   - Rota duzeltmelerine izin ver
   - Handoff durumu ile mevcut durumu karsilastirarak adapte ol

3. **Handoff bilgeligini kullan**:
   - "Learnings" bolumune ozellikle dikkat et
   - Belgelenmis desenleri ve yaklasimlari uygula
   - Bahsedilen hatalari tekrar etme
   - Kesfedilmis cozumlerin uzerine insa et

4. **Surekliligi takip et**:
   - Gorev surekliligi icin TodoWrite kullan
   - Commit'lerde handoff dokumanina referans ver
   - Orijinal plandan sapmalari belgele
   - Is bitince yeni handoff olusturmayi dusun

5. **Aksiyon oncesi dogrula**:
   - Handoff durumunun mevcut durumla ayni oldugunu varsayma
   - Tum dosya referanslarinin hala var oldugunu dogrula
   - Handoff'tan sonra gelen kirici degisiklikleri kontrol et
   - Desenlerin hala gecerli oldugunu onayla

## Yaygin Senaryolar

### Senaryo 1: Temiz Devam
- Handoff'taki tum degisiklikler mevcut
- Cakisma veya regresyon yok
- Aksiyon maddelerinde net sonraki adimlar var
- Onerilen aksiyonlarla devam et

### Senaryo 2: Kod Tabani Ayrismis
- Bazi degisiklikler eksik veya degistirilmis
- Handoff'tan sonra yeni ilgili kod eklenmis
- Farklari uzlastirmak gerekir
- Mevcut duruma gore plani adapte et

### Senaryo 3: Eksik Handoff Calismasi
- Handoff'ta gorevler "in_progress" olarak isaretli
- Once yarim kalan isi tamamlamak gerekir
- Kismi implementasyonlar yeniden anlasilabilir
- Yeni ise gecmeden once tamamlamaya odaklan

### Senaryo 4: Bayat Handoff
- Uzerinden uzun zaman gecmis
- Buyuk refactor olmus
- Orijinal yaklasim artik gecerli olmayabilir
- Stratejiyi yeniden degerlendirmek gerekir

## Ornek Etkilesim Akisi

```
User: /resume_handoff specification/feature/handoffs/handoff-0.md
Assistant: Bu handoff dokumanini okuyup analiz edeyim...

[Handoff tamamen okunur]
[Arastirma gorevleri baslatilir]
[Tamamlanmasi beklenir]
[Belirlenen dosyalar okunur]

[date] tarihli handoff'u analiz ettim. Mevcut durum su sekilde...

[Analiz sunulur]

Webhook validation fix implementasyonuyla devam edeyim mi, yoksa yaklasimi ayarlamak ister misin?

User: Evet, webhook validation ile devam et
Assistant: [Todo listesi olusturur ve implementasyona baslar]
```
