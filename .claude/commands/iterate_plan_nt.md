---
description: Mevcut implementasyon planlarini kapsamli arastirma ve guncellemelerle yinele
model: opus
---

# Implementasyon Planini Yinele

Kullanici geri bildirimine gore mevcut implementasyon planlarini guncellemekle gorevlendirildin. Supheci, kapsamli olmali ve degisikliklerin gercek kod tabani gercekligine dayandigindan emin olmalisin.

## Ilk Yanit

Bu komut cagrildiginda:

1. **Sunlari belirlemek icin girdiyi parse et**:
   - Plan dosyasi yolu (ornegin `thoughts/shared/plans/2025-10-16-feature.md`)
   - Istenen degisiklikler/geri bildirim

2. **Farkli girdi senaryolarini ele al**:

   **Plan dosyasi YOKSA**:
   ```
   Mevcut bir implementasyon planini yinelemene yardim edecegim.

   Hangi plani guncellemek istiyorsun? Lutfen plan dosyasi yolunu ver (ornegin `thoughts/shared/plans/2025-10-16-feature.md`).

   Ipuclari: Son planlari `ls -lt thoughts/shared/plans/ | head` ile listeleyebilirsin
   ```
   Kullanici girdisini bekle, sonra geri bildirim icin tekrar kontrol et.

   **Plan dosyasi var ama geri bildirim YOKSA**:
   ```
   Plani [path] konumunda buldum. Hangi degisiklikleri yapmak istiyorsun?

   Ornek:
   - "Migration handling icin bir faz ekle"
   - "Basari kriterlerini performans testleri icerecek sekilde guncelle"
   - "Kapsami X ozelligini dislayacak sekilde ayarla"
   - "Faz 2'yi iki ayri faza bol"
   ```
   Kullanici girdisini bekle.

   **HEM plan dosyasi HEM geri bildirim varsa**:
   - Dogrudan Adim 1'e gec
   - On soru gerekmez

## Surec Adimlari

### Adim 1: Mevcut Plani Oku ve Anla

1. **Mevcut plan dosyasini TAMAMEN oku**:
   - Read aracini limit/offset olmadan kullan
   - Mevcut yapiyi, fazlari ve kapsami anla
   - Basari kriterlerini ve implementasyon yaklasimini not et

2. **Istenen degisiklikleri anla**:
   - Kullanicinin ne eklemek/degistirmek/cikarmak istedigini parse et
   - Degisikliklerin kod tabani arastirmasi gerektirip gerektirmedigini belirle
   - Guncelleme kapsamini belirle

### Adim 2: Gerekiyorsa Arastir

**Yalnizca degisiklikler yeni teknik anlayis gerektiriyorsa arastirma gorevleri baslat.**

Eger kullanici geri bildirimi yeni kod desenlerini anlamayi veya varsayimlari dogrulamayi gerektiriyorsa:

1. **TodoWrite ile arastirma todo listesi olustur**

2. **Arastirma icin paralel alt-gorevler baslat**:
   Her arastirma turu icin dogru ajani kullan:

   **Kod incelemesi icin:**
   - **codebase-locator** - Ilgili dosyalari bulmak icin
   - **codebase-analyzer** - Implementasyon detaylarini anlamak icin
   - **codebase-pattern-finder** - Benzer desenleri bulmak icin

   **Dizinlerde COK spesifik ol**:
   - Promptlarda tam yol baglamini ver

3. **Arastirmanin buldugu yeni dosyalari oku**:
   - Ana baglama TAMAMEN oku
   - Plan gereksinimleriyle capraz kontrol et

4. **Devam etmeden once TUM alt-gorevleri bekle**

### Adim 3: Anlayisini ve Yaklasimini Sun

Degisiklik yapmadan once anlayisini dogrula:

```
Geri bildirimine gore sunlari istedigini anladim:
- [spesifik detayla degisiklik 1]
- [spesifik detayla degisiklik 2]

Arastirmamda bulduklarim:
- [ilgili kod deseni veya kisit]
- [degisikligi etkileyen onemli bulgu]

Plani su sekilde guncellemeyi planliyorum:
1. [yapilacak spesifik degisiklik]
2. [diger degisiklik]

Bu niyetinle uyusuyor mu?
```

Devam etmeden once kullanici onayi al.

### Adim 4: Plani Guncelle

1. **Mevcut planda odakli, hassas duzenlemeler yap**:
   - Cerrahi degisiklikler icin Edit aracini kullan
   - Acikca degistirilmiyorsa mevcut yapiyi koru
   - Tum dosya:satir referanslarini dogru tut
   - Gerekiyorsa basari kriterlerini guncelle

2. **Tutarlilik sagla**:
   - Yeni faz ekleniyorsa mevcut deseni takip etsin
   - Kapsam degisiyorsa "What We're NOT Doing" bolumunu guncelle
   - Yaklasim degisiyorsa "Implementation Approach" bolumunu guncelle
   - Otomatik vs manuel basari kriteri ayrimini koru

3. **Kalite standartlarini koru**:
   - Yeni icerik icin belirli dosya yolu ve satir numarasi ver
   - Olculebilir basari kriterleri yaz
   - Otomatik dogrulama icin `make` komutlarini kullan
   - Dili net ve aksiyon alinabilir tut

### Adim 5: Senkronize Et ve Gozden Gecir

**Yapilan degisiklikleri sun**:
   ```
   Plani `thoughts/shared/plans/[filename].md` konumunda guncelledim.

   Yapilan degisiklikler:
   - [spesifik degisiklik 1]
   - [spesifik degisiklik 2]

   Guncellenen plan artik:
   - [ana iyilestirme]
   - [diger iyilestirme]

   Baska ayar ister misin?
   ```

**Geri bildirime gore tekrar yinelemeye hazir ol**

## Onemli Kurallar

1. **Supheci ol**:
   - Problemli gorunen degisiklik taleplerini korlemesine kabul etme
   - Muğlak geri bildirimi sorgula - netlestirme iste
   - Teknik uygulanabilirligi kod arastirmasiyla dogrula
   - Mevcut plan fazlariyla olasi cakismlari belirt

2. **Cerrahi ol**:
   - Toplu yeniden yazim degil, hassas duzenleme yap
   - Degismesi gerekmeyen iyi icerigi koru
   - Yalnizca gerekli kisimlar icin arastirma yap
   - Guncellemeleri asiri muhendislik etme

3. **Kapsamli ol**:
   - Degisiklikten once tum mevcut plani oku
   - Yeni teknik anlayis gerekiyorsa kod desenlerini arastir
   - Guncellenen bolumlerin kalite standardini koru
   - Basari kriterlerinin olculebilir kaldigini dogrula

4. **Etkilesimli ol**:
   - Degisiklik yapmadan once anlayisini dogrula
   - Yapmadan once neyi degistirecegini goster
   - Rota duzeltmelerine izin ver
   - Iletisim kurmadan arastirmaya kaybolma

5. **Ilerlemeyi takip et**:
   - Karmasikse update gorevlerini TodoWrite ile takip et
   - Arastirma tamamlandikca todo'lari guncelle
   - Biten gorevleri tamamlandi olarak isle

6. **Acik soru birakma**:
   - Istenen degisiklik soru doguruyorsa SOR
   - Hemen arastir veya netlestir
   - Cozulmemis sorularla plani guncelleme
   - Her degisiklik tam ve aksiyon alinabilir olmali

## Basari Kriteri Kurallari

Basari kriterlerini guncellerken her zaman iki kategorili yapiyi koru:

1. **Automated Verification** (calistirma ajanlari calistirabilir):
   - Calistirilabilir komutlar: `make test`, `npm run lint` vb.
   - Olmasi gereken belirli dosyalar
   - Derleme/type checking

2. **Manual Verification** (insan testi gerekir):
   - UI/UX fonksiyonelligi
   - Gercek kosullarda performans
   - Otomatiklestirmesi zor edge case'ler
   - Kullanici kabul kriterleri

## Alt-gorev Baslatma Best Practice'leri

Arastirma alt-gorevleri baslatirken:

1. **Gercekten gerekliyse baslat** - basit degisiklikler icin arastirma yapma
2. **Verimlilik icin paralel gorev baslat**
3. **Her gorev belirli bir alana odakli olsun**
4. **Detayli talimat ver**, su sekilde:
   - Tam olarak ne aranacak
   - Hangi dizinlerde aranacak
   - Hangi bilgi cikarilacak
   - Beklenen cikti formati
5. **Yanitlarda dosya:satir referanslari iste**
6. **Sentezden once tum gorevlerin tamamlanmasini bekle**
7. **Alt-gorev sonuclarini dogrula** - bir sey ters gorunurse takip gorevi ac

## Ornek Etkilesim Akislari

**Senaryo 1: Kullanici her seyi baslangicta verir**
```
User: /iterate_plan thoughts/shared/plans/2025-10-16-feature.md - add phase for error handling
Assistant: [Plani okur, hata yonetimi desenlerini arastirir, plani gunceller]
```

**Senaryo 2: Kullanici sadece plan dosyasini verir**
```
User: /iterate_plan thoughts/shared/plans/2025-10-16-feature.md
Assistant: Plani buldum. Hangi degisiklikleri yapmak istiyorsun?
User: Faz 2'yi iki faza bol - biri backend, biri frontend
Assistant: [Guncellemeyle devam eder]
```

**Senaryo 3: Kullanici arguman vermez**
```
User: /iterate_plan
Assistant: Hangi plani guncellemek istiyorsun? Lutfen yolu ver...
User: thoughts/shared/plans/2025-10-16-feature.md
Assistant: Plani buldum. Hangi degisiklikleri yapmak istiyorsun?
User: Faz 4 icin daha spesifik basari kriterleri ekle
Assistant: [Guncellemeyle devam eder]
```
