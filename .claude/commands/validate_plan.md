---
description: Implementasyonu plana gore dogrula, basari kriterlerini kontrol et, sorunlari belirle
---

# Plani Dogrula

Bir implementasyon planinin dogru sekilde uygulanip uygulanmadigini dogrulamakla, tum basari kriterlerini kontrol etmekle ve sapma/sorunlari belirlemekle gorevlendirildin.

## Ilk Kurulum

Cagrildiginda:
1. **Baglami belirle** - Mevcut bir konusmada misin yoksa sifirdan mi basliyorsun?
   - Mevcutsa: Bu oturumda neyin implemente edildigini gozden gecir
   - Sifirdansa: Ne yapildigini git ve kod tabani analiziyle kesfetmen gerekir

2. **Plani bul**:
   - Plan yolu verildiyse onu kullan
   - Aksi halde son commitlerde plan referansi ara veya kullaniciya sor

3. **Implementasyon kanitlarini topla**:
   ```bash
   # Son commitleri kontrol et
   git log --oneline -n 20
   git diff HEAD~N..HEAD  # N, implementasyon commitlerini kapsar

   # Kapsamli kontrolleri calistir
   cd $(git rev-parse --show-toplevel) && make check test
   ```

## Dogrulama Sureci

### Adim 1: Baglam Kesfi

Sifirdan basliyorsan veya daha fazla baglama ihtiyacin varsa:

1. **Implementasyon planini** tamamen oku
2. **Neyin degismis olmasi gerektigini belirle**:
   - Degismesi gereken tum dosyalari listele
   - Tum basari kriterlerini not et (otomatik ve manuel)
   - Dogrulanacak temel fonksiyonelligi belirle

3. **Implementasyonu kesfetmek icin paralel arastirma gorevleri baslat**:
   ```
   Gorev 1 - Veritabani degisikliklerini dogrula:
   Migration [N] eklendi mi ve sema degisiklikleri planla eslesiyor mu arastir.
   Kontrol: migration dosyalari, sema surumu, tablo yapisi
   Donus: Ne implemente edildi, plan ne diyordu

   Gorev 2 - Kod degisikliklerini dogrula:
   [feature] ile ilgili degisen tum dosyalari bul.
   Gercek degisiklikleri plan spesifikasyonlariyla karsilastir.
   Donus: Planlanan vs gercek dosya-bazli karsilastirma

   Gorev 3 - Test kapsamini dogrula:
   Planlandigi gibi test eklendi mi/degisti mi kontrol et.
   Test komutlarini calistir ve sonuclari kaydet.
   Donus: Test durumu ve eksik kapsama
   ```

### Adim 2: Sistematik Dogrulama

Plandaki her faz icin:

1. **Tamamlanma durumunu kontrol et**:
   - Plandaki check isaretlerine bak (- [x])
   - Gercek kodun iddia edilen tamamlanma ile eslestigini dogrula

2. **Otomatik dogrulamayi calistir**:
   - "Automated Verification" altindaki her komutu calistir
   - Gecti/kaldi durumunu belgele
   - Basarisizlik varsa kok nedeni incele

3. **Manuel kriterleri degerlendir**:
   - Hangi maddelerin manuel test gerektirdigini listele
   - Kullanici dogrulamasi icin net adimlar ver

4. **Edge case'leri derinlemesine dusun**:
   - Hata durumlari ele alindi mi?
   - Eksik validasyon var mi?
   - Implementasyon mevcut fonksiyonelligi bozabilir mi?

### Adim 3: Dogrulama Raporu Uret

Kapsamli bir dogrulama ozeti olustur:

```markdown
## Validation Report: [Plan Name]

### Implementation Status
✓ Phase 1: [Name] - Fully implemented
✓ Phase 2: [Name] - Fully implemented
⚠️ Phase 3: [Name] - Partially implemented (see issues)

### Automated Verification Results
✓ Build passes: `make build`
✓ Tests pass: `make test`
✗ Linting issues: `make lint` (3 warnings)

### Code Review Findings

#### Matches Plan:
- Database migration correctly adds [table]
- API endpoints implement specified methods
- Error handling follows plan

#### Deviations from Plan:
- Used different variable names in [file:line]
- Added extra validation in [file:line] (improvement)

#### Potential Issues:
- Missing index on foreign key could impact performance
- No rollback handling in migration

### Manual Testing Required:
1. UI functionality:
   - [ ] Verify [feature] appears correctly
   - [ ] Test error states with invalid input

2. Integration:
   - [ ] Confirm works with existing [component]
   - [ ] Check performance with large datasets

### Recommendations:
- Address linting warnings before merge
- Consider adding integration test for [scenario]
- Document new API endpoints
```

## Mevcut Baglamla Calisma

Eger implementasyonun parcasi olduysan:
- Konusma gecmisini incele
- Nelerin tamamlandigini todo listenden kontrol et
- Dogrulamayi bu oturumda yapilan ise odakla
- Kisayollar veya eksik kalan maddeler konusunda durust ol

## Onemli Kurallar

1. **Kapsamli ama pratik ol** - Onemli olana odaklan
2. **Tum otomatik kontrolleri calistir** - Dogrulama komutlarini atlama
3. **Her seyi belgele** - Hem basarilar hem sorunlar
4. **Elestirel dusun** - Implementasyon problemi gercekten cozuor mu sorgula
5. **Bakimi dusun** - Bu cozum uzun vadede bakimi kolay mi?

## Dogrulama Kontrol Listesi

Her zaman sunlari dogrula:
- [ ] Tamamlandi denilen tum fazlar gercekten bitti mi
- [ ] Otomatik testler gecti mi
- [ ] Kod mevcut desenleri takip ediyor mu
- [ ] Regresyon olustu mu
- [ ] Hata yonetimi saglam mi
- [ ] Gerekiyorsa dokumantasyon guncellendi mi
- [ ] Manuel test adimlari net mi

## Diger Komutlarla Iliski

Onerilen is akisi:
1. `/implement_plan` - Implementasyonu uygula
2. `/commit` - Degisiklikler icin atomik commitler olustur
3. `/validate_plan` - Implementasyon dogrulugunu kontrol et
4. `/describe_pr` - PR aciklamasi olustur

Dogrulama, commitler olustuktan sonra en iyi sonucu verir; boylece neyin implemente edildigini anlamak icin git gecmisi analiz edilebilir.

Unutma: Iyi bir dogrulama, sorunlari production'a ulasmadan yakalar. Bosluklari veya iyilestirmeleri belirlerken yapici ama kapsamli ol.
