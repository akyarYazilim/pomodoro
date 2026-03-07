---
description: Kod tabanini degerlendirme veya oneri olmadan mevcut haliyle belgele
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
   - Tum alt-ajan sonuclarini derle
   - Canli kod tabani bulgularini birincil dogruluk kaynagi olarak onceliklendir
   - Farkli bilesenlerdeki bulgulari birbirine bagla
   - Referans icin belirli dosya yollari ve satir numaralari ekle
   - Desenleri, baglantilari ve mimari kararlari vurgula
   - Kullanicinin spesifik sorularini somut kanitlarla yanitla

5. **Arastirma dokumani icin metadata topla:**
   - Ilgili tum metadata'yi olusturmak icin Bash() araclarini calistir
   - Dosya adi: `thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md`

6. **Arastirma dokumani olustur:**
   - Toplanan metadata ile YAML frontmatter + icerik olacak sekilde dokumani yaz

7. **GitHub permalinki ekle (uygunsa):**
   - Uygunsa dosya referanslarini permalinke donustur

8. **Bulgulari sun:**
   - Bulgularin ozetini kullaniciya sun
   - Kolay gezinme icin ana dosya referanslarini ekle
   - Takip sorusu veya netlestirme gerekip gerekmedigini sor

9. **Takip sorularini ele al:**
   - Takip sorulari varsa ayni arastirma dokumanina ekle
   - Frontmatter alanlarini guncelle
   - `last_updated_note` ekle ve `## Follow-up Research [timestamp]` bolumu ac
   - Gerekirse yeni alt-ajanlar baslat

## Onemli notlar:
- Verimlilik ve baglam kontrolu icin paralel Task ajanlari kullan
- Her zaman guncel kod tabani arastirmasi yap
- Gelistirici referansi icin somut dosya yolu ve satir numarasina odaklan
- Arastirma dokumanlari self-contained olmali
- Alt-ajan promptlari spesifik ve salt-okunur odakli olmali
- Bilesenler arasi baglantilari belgeleyin
- Zamansal baglami ekleyin
- Mumkunse kalici referans icin GitHub baglantisi verin
- Ana ajani derin dosya okuma yerine senteze odakli tut
- Alt-ajanlarin ornekleri ve kullanim desenlerini belgelemesini sagla
- **KRITIK**: Sen ve alt-ajanlar degerlendirici degil, belgeleyicisiniz
- **UNUTMA**: OLMASI GEREKENI degil, OLANI belgele
- **ONERI YOK**: Yalnizca mevcut durumu acikla
- **Dosya okuma**: Bahsedilen dosyalari alt-gorevlerden once daima TAMAMEN oku
- **Kritik sira**:
  - Alt-gorevlerden once dosyalari oku (adim 1)
  - Sentezden once tum alt-ajanlari bekle (adim 4)
  - Dokumani yazmadan once metadata topla (adim 5 sonra adim 6)
  - Placeholder degerlerle arastirma dokumani yazma
- **Frontmatter tutarliligi**:
  - Arastirma dokumanlarinin basinda daima frontmatter olsun
  - Frontmatter alanlari tutarli olsun
  - Takip arastirma eklendiginde frontmatter'i guncelle
  - Cok kelimeli alanlarda snake_case kullan
  - Tag'ler konu ve bilesenlerle ilgili olsun
