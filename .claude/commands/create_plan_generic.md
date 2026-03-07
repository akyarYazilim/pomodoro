---
description: Kapsamli arastirma ve iterasyonla detayli implementasyon planlari olustur
model: opus
---

# Implementasyon Plani

Etkilesimli ve iteratif bir surecle detayli implementasyon planlari olusturmakla gorevlendirildin. Supheci, kapsamli olmali ve yuksek kaliteli teknik spesifikasyonlar uretmek icin kullaniciyla is birligi icinde calismalisin.

## Ilk Yanit

Bu komut cagrildiginda:

1. **Parametre verilip verilmedigini kontrol et**:
   - Parametre olarak dosya yolu veya ticket referansi verildiyse varsayilan mesaji atla
   - Verilen dosyalari hemen TAMAMEN oku
   - Arastirma surecine basla

2. **Parametre yoksa** su sekilde yanit ver:
```
Detayli bir implementasyon plani olusturmanda yardimci olacagim. Once ne insa ettigimizi anlayarak baslayayim.

Lutfen su bilgileri paylas:
1. Gorev/ticket aciklamasi (veya ticket dosyasina referans)
2. Ilgili baglam, kisitlar veya ozel gereksinimler
3. Ilgili arastirma veya onceki implementasyonlara baglantilar

Bu bilgileri analiz edip seninle birlikte kapsamli bir plan olusturacagim.

Ipuclari: Bu komutu dogrudan bir ticket dosyasiyla da cagirabilirsin: `/create_plan thoughts/allison/tickets/eng_1234.md`
Daha derin analiz icin sunu dene: `/create_plan think deeply about thoughts/allison/tickets/eng_1234.md`
```

Ardindan kullanicinin girdisini bekle.

## Surec Adimlari

### Adim 1: Baglam Toplama ve Ilk Analiz

1. **Bahsedilen tum dosyalari hemen ve TAMAMEN oku**:
   - Ticket dosyalari (ornegin `thoughts/allison/tickets/eng_1234.md`)
   - Arastirma dokumanlari
   - Ilgili implementasyon planlari
   - Bahsedilen JSON/veri dosyalari
   - **ONEMLI**: Dosyalari tamamen okumak icin Read aracini limit/offset olmadan kullan
   - **KRITIK**: Bu dosyalari ana baglamda kendin okumadan alt-gorev baslatma
   - **ASLA** parcali okuma yapma

2. **Baglam toplamak icin ilk arastirma gorevlerini baslat**:
   Kullanicidan soru istemeden once ozellesmis ajanlari paralel kullan:

   - **codebase-locator**: Ticket/gorevle ilgili dosyalari bul
   - **codebase-analyzer**: Mevcut implementasyonun nasil calistigini anla
   - Ilgiliyse **thoughts-locator**: Ozellige dair mevcut thoughts dokumanlarini bul
   - Linear ticket geciyorsa **linear-ticket-reader**: Tum detaylari getir

   Bu ajanlar:
   - Ilgili kaynak dosyalari, configler ve testleri bulur
   - Veri akisini ve ana fonksiyonlari izler
   - dosya:satir referanslariyla aciklama dondurur

3. **Arastirma gorevlerinin belirledigi tum dosyalari oku**:
   - Arastirma bitince ilgili bulunan TUM dosyalari oku
   - Ana baglama TAMAMEN dahil et
   - Boylece devam etmeden once tam anlayis saglanir

4. **Anlayisini analiz et ve dogrula**:
   - Ticket gereksinimleriyle gercek kodu capraz kontrol et
   - Tutarsizliklari veya yanlis anlamalari belirle
   - Dogrulanmasi gereken varsayimlari not et
   - Kod tabaninin gercegine gore kapsam belirle

5. **Bilgilendirilmis ozet ve odakli sorulari sun**:
   ```
   Ticket ve kod tabani arastirmama gore [dogru ozet] yapmamiz gerekiyor.

   Bulduklarim:
   - [dosya:satir referansli mevcut implementasyon detayi]
   - [kesfedilen ilgili desen/kisit]
   - [olasi karmasiklik veya edge case]

   Arastirmanin yanitlayamadigi sorular:
   - [insan yargisi gerektiren teknik soru]
   - [is mantigi netlestirmesi]
   - [implementasyonu etkileyen tasarim tercihi]
   ```

   Yalnizca kod incelemesiyle gercekten yanitlayamadigin sorulari sor.

### Adim 2: Arastirma ve Kesif

Ilk netlestirmelerden sonra:

1. **Kullanici bir yanlis anlamayi duzeltirse**:
   - Duzeltmeyi oldugu gibi kabul etme
   - Dogru bilgiyi dogrulamak icin yeni arastirma gorevleri baslat
   - Belirttigi dosya/dizinleri oku
   - Gercekleri dogrulamadan ilerleme

2. **TodoWrite ile arastirma todo listesi olustur**

3. **Kapsamli arastirma icin paralel alt-gorevler baslat**:
   - Farkli yonleri ayni anda arastirmak icin birden fazla Task ajanini kullan
   - Her arastirma tipi icin dogru ajani sec:

   **Derin inceleme icin:**
   - **codebase-locator** - daha spesifik dosyalari bul
   - **codebase-analyzer** - implementasyon detaylarini anla
   - **codebase-pattern-finder** - model alinabilecek benzer ozellikleri bul

   **Tarihsel baglam icin:**
   - **thoughts-locator** - bu alanla ilgili arastirma/plan/kararlari bul
   - **thoughts-analyzer** - en ilgili dokumanlardan ana icgoruleri cikar

   **Ilgili ticketlar icin:**
   - **linear-searcher** - benzer issue veya gecmis implementasyonlari bul

   Her ajan sunlari yapar:
   - Dogru dosya ve kod desenlerini bulur
   - Izlenecek konvansiyonlari tespit eder
   - Entegrasyon noktalarini ve bagimliliklari cikarir
   - dosya:satir referansi dondurur
   - Testleri ve ornekleri bulur

3. **Devam etmeden once TUM alt-gorevlerin tamamlanmasini bekle**

4. **Bulgulari ve tasarim seceneklerini sun**:
   ```
   Arastirmama gore bulduklarim:

   **Mevcut Durum:**
   - [mevcut kodla ilgili temel kesif]
   - [izlenecek desen veya konvansiyon]

   **Tasarim Secenekleri:**
   1. [Secenek A] - [arti/eksi]
   2. [Secenek B] - [arti/eksi]

   **Acik Sorular:**
   - [teknik belirsizlik]
   - [gereken tasarim karari]

   Hangi yaklasim vizyonunla en iyi uyuyor?
   ```

### Adim 3: Plan Yapisini Gelistirme

Yaklasim netlestiginde:

1. **Ilk plan taslagini olustur**:
   ```
   Onerdigim plan yapisi:

   ## Genel Bakis
   [1-2 cumlelik ozet]

   ## Implementasyon Fazlari:
   1. [Faz adi] - [neyi basarir]
   2. [Faz adi] - [neyi basarir]
   3. [Faz adi] - [neyi basarir]

   Bu fazlama mantikli mi? Siralama veya granulerlik ayari gerekir mi?
   ```

2. **Detaya gecmeden once yapisal geri bildirim al**

### Adim 4: Detayli Plan Yazimi

Yapi onaylandiktan sonra:

1. **Plani** `thoughts/shared/plans/YYYY-MM-DD-ENG-XXXX-description.md` dosyasina yaz
   - Format: `YYYY-MM-DD-ENG-XXXX-description.md`
   - Ticket yoksa ENG-XXXX kismini cikar
2. **Su sablonu kullan**:

````markdown
# [Feature/Task Name] Implementation Plan

## Overview

[Ne implement ettigimizin ve nedeninin kisa aciklamasi]

## Current State Analysis

[Simdi ne var, ne eksik, kesfedilen temel kisitlar]

## Desired End State

[Plan tamamlandiginda hedef son durum ve nasil dogrulanacagi]

### Key Discoveries:
- [dosya:satir referansli onemli bulgu]
- [izlenecek desen]
- [icinde calisilacak kisit]

## What We're NOT Doing

[Kapsam disi maddeleri acikca listele]

## Implementation Approach

[Ust seviye strateji ve gerekce]

## Phase 1: [Descriptive Name]

### Overview
[Bu fazin amaci]

### Changes Required:

#### 1. [Component/File Group]
**File**: `path/to/file.ext`
**Changes**: [Degisiklik ozeti]

```[language]
// Eklenecek/degistirilecek kod
```

### Success Criteria:

#### Automated Verification:
- [ ] Migration temiz uygulanir: `make migrate`
- [ ] Unit testler gecer: `make test-component`
- [ ] Type checking gecer: `npm run typecheck`
- [ ] Linting gecer: `make lint`
- [ ] Integration testler gecer: `make test-integration`

#### Manual Verification:
- [ ] UI uzerinden beklendigi gibi calisir
- [ ] Yuk altinda performans kabul edilebilir
- [ ] Edge case yonetimi manuel dogrulandi
- [ ] Ilgili ozelliklerde regresyon yok

**Implementation Note**: Bu faz ve tum otomatik dogrulamalar tamamlandiginda, sonraki faza gecmeden once manuel test onayi icin dur.

---

## Phase 2: [Descriptive Name]

[Ayni yapi...]

---

## Testing Strategy

### Unit Tests:
- [Ne test edilmeli]
- [Temel edge case'ler]

### Integration Tests:
- [Uctan uca senaryolar]

### Manual Testing Steps:
1. [Ozelligi dogrulama adimi]
2. [Diger dogrulama adimi]
3. [Manuel test edge case'i]

## Performance Considerations

[Gereken performans notlari]

## Migration Notes

[Varsa migration yaklasimi]

## References

- Original ticket: `thoughts/allison/tickets/eng_XXXX.md`
- Related research: `thoughts/shared/research/[relevant].md`
- Similar implementation: `[file:line]`
````

### Adim 5: Senkronize Et ve Gozden Gecir

1. **thoughts dizinini senkronize et**:
   - Planin dogru indexlenmesini ve erisilebilir olmasini saglar

2. **Taslak plan konumunu sun**:
   ```
   Ilk implementasyon planini olusturdum:
   `thoughts/shared/plans/YYYY-MM-DD-ENG-XXXX-description.md`

   Lutfen inceleyip sunlari belirt:
   - Fazlar dogru kapsamda mi?
   - Basari kriterleri yeterince spesifik mi?
   - Teknik ayar gerektiren kisim var mi?
   - Eksik edge case var mi?
   ```

3. **Geri bildirime gore iterasyon yap**:
   - Eksik faz ekle
   - Teknik yaklasimi guncelle
   - Otomatik/manuel basari kriterlerini netlestir
   - Kapsam maddelerini ekle/cikar

4. **Kullanici memnun olana kadar rafine et**

## Onemli Kurallar

1. **Supheci ol**: Muglak gereksinimleri sorgula, varsayma
2. **Etkilesimli ol**: Tek seferde tum plani yazma
3. **Kapsamli ol**: Tum baglami tamamen oku, somut dosya:satir ver
4. **Pratik ol**: Artimsal ve test edilebilir degisikliklere odaklan
5. **Ilerlemeyi takip et**: TodoWrite kullan
6. **Final planda acik soru birakma**: Cozulmemis sorularla plani bitirme

## Basari Kriteri Kurallari

Basari kriterlerini her zaman ikiye ayir:

1. **Automated Verification**:
   - Calistirilabilir komutlar
   - Varlik/derleme/typecheck/test kontrolleri

2. **Manual Verification**:
   - UI/UX, gercek kosul performansi, zor otomasyon edge case'leri

## Yaygin Desenler

### Veritabani degisiklikleri:
- Schema/migration
- Store methodlari
- Is mantigi
- API
- Client guncellemeleri

### Yeni ozellikler:
- Mevcut desen arastirmasi
- Veri modeli
- Backend mantigi
- API endpointleri
- UI en son

### Refactoring:
- Mevcut davranisi belgele
- Artimsal degisiklik planla
- Geriye uyumluluk koru
- Migration stratejisi ekle

## Alt-gorev Baslatma Best Practice'leri

1. Verimlilik icin paralel gorev baslat
2. Her gorev tek bir alana odakli olsun
3. Ne aranacagi, nerede aranacagi, hangi cikti istendigi net olsun
4. Promptlarda tam yol baglamini ver
5. Salt-okunur araclari belirt
6. dosya:satir referansi iste
7. Sentezden once tum gorevlerin bitmesini bekle
8. Sonuclari dogrula, supheli sonucu tekrar arastir

Ornek:
```python
tasks = [
    Task("Veritabani semasini arastir", db_research_prompt),
    Task("API desenlerini bul", api_research_prompt),
    Task("UI bilesenlerini incele", ui_research_prompt),
    Task("Test desenlerini kontrol et", test_research_prompt)
]
```

## Ornek Etkilesim Akisi

```
User: /implementation_plan
Assistant: Detayli bir implementasyon plani olusturmanda yardimci olacagim...

User: Claude alt-gorevleri icin parent-child tracking eklememiz gerekiyor. thoughts/allison/tickets/eng_1478.md'e bak.
Assistant: Once ticket dosyasini tamamen okuyayim...

[Dosyayi tamamen okur]

Ticket'a gore daemon icindeki alt-gorev eventleri icin parent-child iliskilerini takip etmemiz gerekiyor. Planlamaya baslamadan once bazi sorularim var...

[Etkilesimli surec devam eder...]
```
