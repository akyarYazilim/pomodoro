---
description: Calismayi baska bir oturuma devretmek icin handoff dokumani olustur
---

# Handoff Olustur

Calismani yeni bir oturumdaki baska bir ajana devretmek icin bir handoff dokumani yazmakla gorevlendirildin. Kapsamli ama ayni zamanda **oz** bir handoff dokumani olusturacaksin. Amac, uzerinde calistigin isin ana detaylarini kaybetmeden baglamini sikistirip ozetlemektir.

## Surec
### 1. Dosya Yolu ve Metadata
Dokumani nasil olusturacagini anlamak icin asagidaki bilgileri kullan:
    - Dosyani `thoughts/shared/handoffs/ENG-XXXX/YYYY-MM-DD_HH-MM-SS_ENG-ZZZZ_description.md` altinda olustur; burada:
        - YYYY-MM-DD bugunun tarihi
        - HH-MM-SS guncel saate gore 24 saat formatinda saat, dakika ve saniye (ornegin `1:00 pm` icin `13:00` kullan)
        - ENG-XXXX ticket numarasi (ticket yoksa `general` ile degistir)
        - ENG-ZZZZ ticket numarasi (ticket yoksa cikar)
        - description kisa bir kebab-case aciklama
    - Ilgili tum metadata'yi olusturmak icin `scripts/spec_metadata.sh` scriptini calistir
    - Ornekler:
        - Ticket ile: `2025-01-08_13-55-22_ENG-2166_create-context-compaction.md`
        - Ticketsiz: `2025-01-08_13-55-22_create-context-compaction.md`

### 2. Handoff yazimi.
Yukaridaki kurallari kullanarak dokumani yaz. Tanimli dosya yolunu kullan ve asagidaki YAML frontmatter desenini uygula. 1. adimda toplanan metadata'yi kullanarak dokumani YAML frontmatter + icerik seklinde yapilandir:

Asagidaki sablon yapisini kullan:
```markdown
---
date: [ISO formatinda zaman dilimi dahil guncel tarih ve saat]
researcher: [thoughts status'ten arastirmaci adi]
git_commit: [guncel commit hash]
branch: [guncel branch adi]
repository: [repo adi]
topic: "[Feature/Task Name] Implementation Strategy"
tags: [implementation, strategy, ilgili-bilesen-adlari]
status: complete
last_updated: [YYYY-MM-DD formatinda guncel tarih]
last_updated_by: [Arastirmaci adi]
type: implementation_strategy
---

# Handoff: ENG-XXXX {cok kisa aciklama}

## Task(s)
{Uzerinde calistigin gorev(ler)in aciklamasi ve her birinin durumu (tamamlandi, devam ediyor, planlandi/konusuldu). Bir implementasyon plani uzerinde calisiyorsan hangi fazda oldugunu mutlaka belirt. Uygunsa, oturum basinda sana verilen ve uzerinden calistigin plan dokumanina ve/veya arastirma dokumanlarina referans ver.}

## Critical References
{Mutlaka takip edilmesi gereken kritik spesifikasyon dokumanlarini, mimari kararlari veya tasarim dokumanlarini listele. Yalnizca en onemli 2-3 dosya yolunu ekle. Yoksa bos birak.}

## Recent changes
{Kod tabaninda yakin zamanda yaptigin degisiklikleri line:file sozdiziminde acikla}

## Learnings
{Ogrendigin onemli seyleri acikla - ornegin desenler, bug kok nedenleri veya sonraki devralan kisinin bilmesi gereken diger kritik bilgiler. Acik dosya yollari listelemeyi dusun.}

## Artifacts
{Urettigin veya guncelledigin artifact'larin tumunu dosya yolu ve/veya file:line referanslariyla eksiksiz listele - ornegin ozellik dokumanlari, implementasyon planlari vb. calismaya devam etmek icin okunmasi gerekenler.}

## Action Items & Next Steps
{Gorevlerine ve durumlarina gore sonraki ajanin tamamlamasi gereken aksiyon maddeleri ve sonraki adimlarin listesi}

## Other Notes
{Diger notlar, referanslar veya faydali bilgiler - ornegin kod tabaninin ilgili bolumleri nerede, ilgili dokumanlar nerede, ya da yukaridaki basliklara girmeyen ama devretmek istedigin onemli ogrenimler}
```
---

### 3. Onayla ve Senkronize Et
Dokumani kaydetmek icin `humanlayer thoughts sync` calistir.

Bu tamamlandiktan sonra kullaniciya <template_response></template_response> XML etiketleri arasindaki sablonla yanit vermelisin. Yanitinda etiketleri dahil ETME.

<template_response>
Handoff olusturuldu ve senkronize edildi! Yeni bir oturumda asagidaki komutla bu handoff'tan devam edebilirsin:

```bash
/resume_handoff path/to/handoff.md
```
</template_response>

ornek olarak (<example_response></example_response> XML etiketleri arasinda - kullaniciya verecegin gercek yanitta bu etiketleri dahil ETME)

<example_response>
Handoff olusturuldu ve senkronize edildi! Yeni bir oturumda asagidaki komutla bu handoff'tan devam edebilirsin:

```bash
/resume_handoff thoughts/shared/handoffs/ENG-2166/2025-01-08_13-44-55_ENG-2166_create-context-compaction.md
```
</example_response>

---
##. Ek Notlar ve Talimatlar
- **daha cok bilgi, daha az degil**. Bu rehber, iyi bir handoff icin minimumu tanimlar. Gerekiyorsa her zaman daha fazla bilgi eklemekten cekinme.
- **kapsamli ve net ol**. Gerektiginde hem ust seviye hedefleri hem alt seviye detaylari dahil et.
- **asiri kod snippet'lerinden kacin**. Kritik bir degisikligi anlatmak icin kisa bir snippet onemli olabilir, ama buyuk kod bloklari veya diff'lerden kacin; gerekli degilse ekleme (ornegin debug ettigin bir hatayla ilgili degilse). Sonradan takip edilebilir `/path/to/file.ext:line` referanslarini tercih et; ornegin `packages/dashboard/src/app/dashboard/page.tsx:12-24`
