---
description: Paralel alt-ajanlar kullanarak kod tabanini kapsamli arastir
model: opus
---

# Kod Tabanini Arastir

Kullanici sorularini yanitlamak icin kod tabaninda kapsamli arastirma yapman, paralel alt-ajanlar calistirman ve bulgularini sentezlemen gerekiyor.

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

   Ajanlari akilli sekilde kullanmak esastir:
   - Once var olani bulmak icin locator ajanlariyla basla
   - Sonra en umut veren bulgularda analyzer ajanlarini kullan
   - Farkli seyleri ararken birden fazla ajani paralel calistir
   - Her ajan kendi isini bilir - sadece ne aradigini soyle
   - NASIL arayacaklarina dair uzun prompt yazma - ajanlar zaten biliyor

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
   - Ilgili metadata'yi olustur
   - Dosya adi: `thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md`

6. **Arastirma dokumani olustur:**
   - Toplanan metadata ile YAML frontmatter + icerik olacak sekilde dokumani yaz

7. **GitHub permalinki ekle (uygunsa):**
   - Uygunsa dosya referanslarini permalinke donustur

8. **Senkronize et ve bulgulari sun:**
   - Bulgularin ozetini kullaniciya sun
   - Kolay gezinme icin ana dosya referanslarini ekle
   - Takip sorulari veya netlestirme ihtiyaci olup olmadigini sor

9. **Takip sorularini ele al:**
   - Takip sorulari varsa ayni arastirma dokumanina ekle
   - Frontmatter alanlarini guncelle
   - Gerekiyorsa yeni alt-ajanlar baslat

## Onemli notlar:
- Verimlilik ve baglam kontrolu icin paralel Task ajanlari kullan
- Her zaman guncel kod tabani arastirmasi yap
- thoughts/ dizini canli bulgulara ek tarihsel baglam saglar
- Somut dosya yolu ve satir numarasi ver
- Dokumanlari self-contained tut
- Alt-ajan promptlari spesifik ve salt-okunur odakli olsun
- Bilesenler arasi baglantilari dikkate al
- Zamansal baglami ekle
- Mumkunse kalici referans icin GitHub baglantisi ver
- Ana ajani derin dosya okuma yerine senteze odakli tut
- Alt-ajanlari tanimdan fazlasini bulmaya, ornek ve kullanim desenleri cikarmaya yonlendir
- Yalnizca research alt dizini degil, thoughts/ dizininin tamamini incele
- **Dosya okuma**: Bahsedilen dosyalari alt-gorevlerden once daima TAMAMEN oku
- **Kritik sira**: Numarali adimlari aynen takip et
  - Alt-gorevlerden once dosyalari oku (adim 1)
  - Sentezden once tum alt-ajanlari bekle (adim 4)
  - Dokumani yazmadan once metadata topla (adim 5, sonra adim 6)
  - Placeholder degerlerle arastirma dokumani yazma
- **Yol kullanimi**: thoughts/searchable/ arama icin hard linkler icerir
  - Yollari belgelendirirken yalnizca `searchable/` kismini kaldir
  - Diger alt dizinleri aynen koru
- **Frontmatter tutarliligi**:
  - Arastirma dokumanlarinin basinda daima frontmatter olsun
  - Frontmatter alanlari tutarli olsun
  - Takip arastirma eklendiginde frontmatter'i guncelle
  - Cok kelimeli alanlar icin snake_case kullan
  - Tag'ler arastirma konusu ve bilesenlerle ilgili olsun
