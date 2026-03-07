---
description: Tarihsel baglam icin thoughts dizinini kullanarak kod tabanini mevcut haliyle belgele
model: opus
---

# Kod Tabanini Arastir

Kullanici sorularini yanitlamak icin kod tabaninda kapsamli arastirma yapman, paralel alt-ajanlar calistirman ve bulgulari sentezlemen gerekiyor.

## KRITIK: TEK GOREVIN KOD TABANINI BUGUN OLDUGU GIBI BELGELEMEK VE ACIKLAMAK
- Kullanici acikca istemedikce iyilestirme veya degisiklik onerme
- Kullanici acikca istemedikce kok neden analizi yapma
- Kullanici acikca istemedikce gelecege donuk gelistirme onerileri sunma
- Implementasyonu elestirme veya problem tespiti yapma
- Refactor, optimizasyon veya mimari degisiklik onermeme
- Yalnizca neyin var oldugunu, nerede oldugunu, nasil calistigini ve bilesenlerin nasil etkilesimini acikla
- Mevcut sistemin teknik bir haritasini/dokumantasyonunu olusturuyorsun

## Baslangic Kurulumu:

Bu komut cagrildiginda su sekilde yanit ver:
```
Kod tabanini arastirmaya hazirim. Lutfen arastirma sorunuzu veya ilgi alaninizi paylasin, ilgili bilesenleri ve baglantilari inceleyerek bunu kapsamli sekilde analiz edeyim.
```

Ardindan kullanicinin arastirma sorgusunu bekle.

## Arastirma sorgusunu aldiktan sonra izlenecek adimlar:

1. **Dogrudan bahsedilen dosyalari once oku:**
   - Kullanici belirli dosyalardan bahsediyorsa (ticket, dokuman, JSON), once bu dosyalari TAMAMEN oku
   - **ONEMLI**: Dosyalari tamamen okumak icin Read aracini limit/offset parametresi OLMADAN kullan
   - **KRITIK**: Herhangi bir alt-gorev baslatmadan once bu dosyalari ana baglamda kendin oku
   - Bu, arastirmayi parcalamadan once tam baglama sahip olmani saglar

2. **Arastirma sorusunu analiz et ve parcala:**
   - Kullanicinin sorgusunu birlestirilebilir arastirma alanlarina bol
   - Kullanicinin ariyor olabilecegi alttaki desenler, baglantilar ve mimari etkiler uzerine derin dusunmeye zaman ayir
   - Incelenecek belirli bilesenleri, desenleri veya kavramlari belirle
   - Tum alt gorevleri takip etmek icin TodoWrite ile arastirma plani olustur
   - Hangi dizinlerin, dosyalarin veya mimari desenlerin ilgili oldugunu dusun

3. **Kapsamli arastirma icin paralel alt-ajan gorevleri baslat:**
   - Farkli yonleri eszamanli arastirmak icin birden fazla Task ajani olustur
   - Artik belirli arastirma gorevlerini bilen ozellesmis ajanlarimiz var:

   **Kod tabani arastirmasi icin:**
   - Dosya ve bilesenlerin NEREDE oldugunu bulmak icin **codebase-locator** ajanini kullan
   - Belirli kodun NASIL calistigini anlamak icin **codebase-analyzer** ajanini kullan (elestirmeden)
   - Mevcut desen orneklerini bulmak icin **codebase-pattern-finder** ajanini kullan (degerlendirmeden)

   **ONEMLI**: Tum ajanlar belgeleme odaklidir, elestirmen degil. Sorun tespit etmeden veya iyilestirme onermeden var olani aciklarlar.

   **thoughts dizini icin:**
   - Konuyla ilgili hangi dokumanlarin oldugunu kesfetmek icin **thoughts-locator** ajanini kullan
   - Belirli dokumanlardan ana icgoruleri cikarmak icin **thoughts-analyzer** ajanini kullan (yalnizca en ilgili olanlar)

   **Web arastirmasi icin (yalnizca kullanici acikca isterse):**
   - Dis dokumantasyon ve kaynaklar icin **web-search-researcher** ajanini kullan
   - Web arastirma ajani kullanirsan, bulgularla birlikte BAGLANTI donmelerini iste ve final raporuna bu baglantilari DAHIL ET

   **Linear ticketlari icin (ilgiliyse):**
   - Belirli bir ticketin tum detaylarini almak icin **linear-ticket-reader** ajanini kullan
   - Ilgili ticketlari veya tarihsel baglami bulmak icin **linear-searcher** ajanini kullan

   Buradaki ana fikir ajanlari akilli sekilde kullanmaktir:
   - Once var olani bulmak icin locator ajanlariyla basla
   - Sonra en umut veren bulgularda analyzer ajanlariyla nasil calistiklarini belgelet
   - Farkli seyleri ararken birden fazla ajani paralel calistir
   - Her ajan kendi isini bilir - sadece ne aradigini soyle
   - NASIL arayacaklarina dair uzun prompt yazma - ajanlar zaten biliyor
   - Ajanlara degerlendirme veya iyilestirme degil belgeleme yaptiklarini hatirlat

4. **Tum alt-ajanlarin tamamlanmasini bekle ve bulgulari sentezle:**
   - ONEMLI: Devam etmeden once TUM alt-ajan gorevlerinin tamamlanmasini bekle
   - Tum alt-ajan sonuclarini derle (hem kod tabani hem thoughts bulgulari)
   - Canli kod tabani bulgularini birincil dogruluk kaynagi olarak onceliklendir
   - thoughts/ bulgularini ek tarihsel baglam olarak kullan
   - Farkli bilesenlerdeki bulgulari birbirine bagla
   - Referans icin belirli dosya yollari ve satir numaralari ekle
   - Tum thoughts/ yollarinin dogru oldugunu dogrula
   - Desenleri, baglantilari ve mimari kararlari vurgula
   - Kullanicinin spesifik sorularini somut kanitlarla yanitla

5. **Arastirma dokumani icin metadata topla:**
   - Ilgili tum metadata'yi olusturmak icin `hack/spec_metadata.sh` scriptini calistir
   - Dosya adi: `thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md`

6. **Arastirma dokumani olustur:**
   - Toplanan metadata ile YAML frontmatter + icerik olacak sekilde dokumani yaz

7. **GitHub permalinki ekle (uygunsa):**
   - Uygunsa dosya referanslarini permalinke donustur

8. **Senkronize et ve bulgulari sun:**
   - `humanlayer thoughts sync` calistir
   - Ozeti ve ana dosya referanslarini kullaniciya sun

9. **Takip sorularini ele al:**
   - Takip sorularini ayni arastirma dokumanina ekle
   - Frontmatter alanlarini guncelle

## Onemli notlar:
- Verimlilik ve baglam kontrolu icin paralel Task ajanlari kullan
- Her zaman guncel kod tabani arastirmasi yap
- thoughts/ dizini, canli bulgulara ek tarihsel baglam saglar
- Somut dosya yolu ve satir numarasi ver
- Dokumanlari self-contained tut
- **KRITIK**: Sen ve alt-ajanlar degerlendirici degil, belgeleyicisiniz
- **UNUTMA**: OLMASI GEREKENI degil, OLANI belgele
- **ONERI YOK**: Sadece mevcut durumu acikla
- Dosya okuma sirasina sadik kal
- thoughts/searchable/ icin yollarda yalnizca `searchable/` kismini kaldir
- Frontmatter alanlarini tutarli kullan
