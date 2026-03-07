---
description: Kapsamli arastirma ile implementasyon planlari olustur (thoughts dizini yok)
model: opus
---

# Implementasyon Plani

Etkilesimli, iteratif bir surec ile detayli implementasyon planlari olusturmakla gorevlendirildin. Supheci, kapsamli olmali ve yuksek kaliteli teknik spesifikasyonlar uretmek icin kullaniciyla is birligi icinde calismalisin.

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

Ipuclari: Bu komutu dogrudan bir ticket dosyasiyla da cagirabilirsin: `/create_plan thoughts/shared/tickets/eng_1234.md`
Daha derin analiz icin sunu dene: `/create_plan think deeply about thoughts/shared/tickets/eng_1234.md`
```

Ardindan kullanicinin girdisini bekle.

## Surec Adimlari

### Adim 1: Baglam Toplama ve Ilk Analiz

1. **Bahsedilen tum dosyalari hemen ve TAMAMEN oku**:
   - Ticket dosyalari (ornegin `thoughts/shared/tickets/eng_1234.md`)
   - Arastirma dokumanlari
   - Ilgili implementasyon planlari
   - Bahsedilen JSON/veri dosyalari
   - **ONEMLI**: Dosyalari tamamen okumak icin Read aracini limit/offset olmadan kullan
   - **KRITIK**: Bu dosyalari ana baglamda kendin okumadan alt-gorev baslatma
   - **ASLA** parcali okuma yapma

2. **Baglam toplamak icin ilk arastirma gorevlerini baslat**:
   Kullanicidan soru istemeden once ozellesmis ajanlari paralel kullan:

   - **codebase-locator**: Ticket/gorevle ilgili tum dosyalari bul
   - **codebase-analyzer**: Mevcut implementasyonun nasil calistigini anla
   - Linear ticket geciyorsa **linear-ticket-reader**: Tum detaylari getir

   Bu ajanlar:
   - Ilgili kaynak dosyalari, configler ve testleri bulur
   - Odaklanilacak dizinleri belirler (ornegin WUI geciyorsa humanlayer-wui/)
   - Veri akisini ve ana fonksiyonlari izler
   - dosya:satir referanslariyla detayli aciklama dondurur

3. **Arastirma gorevlerinin belirledigi tum dosyalari oku**:
   - Arastirma tamamlandiktan sonra ilgili bulunan TUM dosyalari oku
   - Ana baglama TAMAMEN dahil et
   - Boylece devam etmeden once tam anlayis saglanir

4. **Anlayisini analiz et ve dogrula**:
   - Ticket gereksinimlerini gercek kodla capraz kontrol et
   - Tutarsizlik veya yanlis anlamalari belirle
   - Dogrulanmasi gereken varsayimlari not et
   - Kod tabani gercegine gore gercek kapsam belirle

5. **Bilgilendirilmis ozet ve odakli sorulari sun**:
   ```
   Ticket ve kod tabani arastirmama gore [dogru ozet] yapmamiz gerekiyor.

   Bulduklarim:
   - [dosya:satir referansli mevcut implementasyon detayi]
   - [kesfedilen ilgili desen veya kisit]
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
   - Farkli yonleri ayni anda arastirmak icin birden fazla Task ajani olustur
   - Her arastirma turu icin dogru ajani kullan:

   **Derin inceleme icin:**
   - **codebase-locator** - daha spesifik dosyalari bul
   - **codebase-analyzer** - implementasyon detaylarini anla
   - **codebase-pattern-finder** - model alinabilecek benzer ozellikleri bul

   **Ilgili ticketlar icin:**
   - **linear-searcher** - benzer issue veya gecmis implementasyonlari bul

   Her ajan sunlari yapar:
   - Dogru dosya ve kod desenlerini bulur
   - Izlenecek konvansiyonlari belirler
   - Entegrasyon noktalarini ve bagimliliklari bulur
   - dosya:satir referanslari dondurur
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

Yaklasimda anlasildiginda:

1. **Ilk plan taslagini olustur**:
   ```
   Onerdigim plan yapisi:

   ## Genel Bakis
   [1-2 cumlelik ozet]

   ## Implementasyon Fazlari:
   1. [Faz adi] - [neyi basarir]
   2. [Faz adi] - [neyi basarir]
   3. [Faz adi] - [neyi basarir]

   Bu fazlama mantikli mi? Siralamayi veya granulerligi ayarlamali miyim?
   ```

2. **Detaya gecmeden once yapisal geri bildirim al**

### Adim 4: Detayli Plan Yazimi

Yapi onayindan sonra:

1. **Plani** `thoughts/shared/plans/YYYY-MM-DD-ENG-XXXX-description.md` yoluna yaz
   - Format: `YYYY-MM-DD-ENG-XXXX-description.md`
   - Ticket yoksa ENG-XXXX kismini cikar
2. **Su sablon yapisini kullan**:

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

[Ayni yapiyla devam...]

---

## Testing Strategy

### Unit Tests:
- [Ne test edilmeli]
- [Temel edge case'ler]

### Integration Tests:
- [Uctan uca senaryolar]

### Manual Testing Steps:
1. [Ozelligi dogrulama adimi]
2. [Baska bir dogrulama adimi]
3. [Manuel test edge case'i]

## Performance Considerations

[Gereken performans notlari]

## Migration Notes

[Varsa migration yaklasimi]

## References

- Original ticket: `thoughts/shared/tickets/eng_XXXX.md`
- Related research: `thoughts/shared/research/[relevant].md`
- Similar implementation: `[file:line]`
````

### Adim 5: Gozden Gecir

1. **Taslak plan konumunu sun**:
   ```
   Ilk implementasyon planini olusturdum:
   `thoughts/shared/plans/YYYY-MM-DD-ENG-XXXX-description.md`

   Lutfen inceleyip sunlari belirt:
   - Fazlar dogru kapsamda mi?
   - Basari kriterleri yeterince spesifik mi?
   - Ayarlanmasi gereken teknik detay var mi?
   - Eksik edge case veya dusunce var mi?
   ```

2. **Geri bildirime gore iterasyon yap**:
   - Eksik faz ekle
   - Teknik yaklasimi ayarla
   - Basari kriterlerini netlestir (otomatik + manuel)
   - Kapsam maddeleri ekle/cikar

3. **Kullanici memnun olana kadar rafine et**

## Onemli Kurallar

1. **Supheci ol**: Muglak gereksinimleri sorgula, varsayma
2. **Etkilesimli ol**: Tum plani tek seferde yazma
3. **Kapsamli ol**: Tum baglam dosyalarini tamamen oku, somut dosya:satir ver
4. **Pratik ol**: Artimsal ve test edilebilir degisikliklere odaklan
5. **Ilerlemeyi takip et**: TodoWrite kullan
6. **Final planda acik soru olmasin**: Cozulmemis sorularla plani bitirme

## Basari Kriteri Kurallari

Basari kriterlerini her zaman ikiye ayir:

1. **Automated Verification**:
   - Calistirilabilir komutlar
   - Dosya varligi/derleme/typecheck/test

2. **Manual Verification**:
   - UI/UX fonksiyonelligi
   - Gercek kosul performansi
   - Zor otomasyon edge case'leri
   - Kullanici kabul kriterleri

## Yaygin Desenler

### Veritabani degisiklikleri:
- Schema/migration ile basla
- Store methodlarini ekle
- Is mantigini guncelle
- API ile ac
- Client'lari guncelle

### Yeni ozellikler:
- Once mevcut desenleri arastir
- Veri modeliyle basla
- Backend mantigini kur
- API endpointleri ekle
- UI'yi en son implement et

### Refactoring:
- Mevcut davranisi belgele
- Artimsal degisiklikler planla
- Geriye uyumlulugu koru
- Migration stratejisi ekle

## Alt-gorev Baslatma Best Practice'leri

Arastirma alt-gorevi baslatirken:

1. Verimlilik icin birden fazla gorevi paralel baslat
2. Her gorev belirli bir alana odakli olsun
3. Ne aranacagi, hangi dizinlerde aranacagi, hangi bilginin cikarilacagi ve cikti formati net olsun
4. Dizin konusunda cok spesifik ol:
   - Ticket'ta "WUI" geciyorsa `humanlayer-wui/`
   - "daemon" geciyorsa `hld/`
   - "WUI" kastediyorsan genel "UI" deme
   - Promptta tam yol baglamini ver
5. Salt-okunur araclari belirt
6. dosya:satir referansi iste
7. Sentezden once tum gorevlerin bitmesini bekle
8. Sonuclari dogrula:
   - Beklenmeyen sonuc varsa takip gorevi ac
   - Bulgulari gercek kod tabaniyla capraz kontrol et
   - Yanlis gorunen sonuclari kabul etme

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
User: /create_plan
Assistant: Detayli bir implementasyon plani olusturmanda yardimci olacagim...

User: Claude alt-gorevleri icin parent-child tracking eklememiz gerekiyor. thoughts/shared/tickets/eng_1478.md'e bak.
Assistant: Once ticket dosyasini tamamen okuyayim...

[Dosyayi tamamen okur]

Ticket'a gore hld daemon icindeki Claude alt-gorev eventleri icin parent-child iliskilerini takip etmemiz gerekiyor. Planlamaya baslamadan once bazi sorularim var...

[Etkilesimli surec devam eder...]
```
