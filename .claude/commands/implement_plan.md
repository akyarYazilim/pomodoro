---
description: thoughts/shared/plans altindaki teknik planlari dogrulamayla implemente et
---

# Plani Uygula

`thoughts/shared/plans/` altindaki onayli bir teknik plani implemente etmekle gorevlendirildin. Bu planlar belirli degisiklikler ve basari kriterleri iceren fazlar barindirir.

## Baslangic

Bir plan yolu verildiginde:
- Plani tamamen oku ve mevcut check isaretlerini kontrol et (- [x])
- Orijinal ticket'i ve planda gecen tum dosyalari oku
- **Dosyalari tamamen oku** - asla limit/offset parametresi kullanma, tam baglama ihtiyacin var
- Parcalarin nasil birlestigini derinlemesine dusun
- Ilerlemeyi takip etmek icin todo listesi olustur
- Yapilmasi gerekeni anliyorsan implementasyona basla

Plan yolu verilmediyse bir tane iste.

## Implementasyon Felsefesi

Planlar dikkatle tasarlanir, ama gercek dunya daginik olabilir. Senin isin:
- Buldugun duruma uyum saglarken planin niyetini takip etmek
- Sonraki faza gecmeden once her fazi tamamen uygulamak
- Isinin daha genis kod tabani baglaminda mantikli oldugunu dogrulamak
- Bolumleri tamamladikca plandaki checkbox'lari guncellemek

Seyler planla birebir eslesmediginde nedenini dusun ve net iletisime gec. Plan rehberindir, ama muhakemen de onemlidir.

Bir uyusmazlikla karsilasirsan:
- DUR ve planin neden takip edilemedigini derinlemesine dusun
- Sorunu net sekilde sun:
  ```
  Faz [N] icinde sorun:
  Beklenen: [planin dedigi]
  Bulunan: [gercek durum]
  Neden onemli: [aciklama]

  Nasil ilerlememi istersin?
  ```

## Dogrulama Yaklasimi

Bir fazi uyguladiktan sonra:
- Basari kriteri kontrollerini calistir (genelde `make check test` her seyi kapsar)
- Devam etmeden once sorunlari duzelt
- Hem planda hem todolarda ilerlemeni guncelle
- Plan dosyasinin icinde tamamlanan maddeleri Edit ile isaretle
- **Insan dogrulamasi icin dur**: Bir fazin tum otomatik dogrulamalari tamamlaninca dur ve asamanin manuel test icin hazir oldugunu insana bildir. Su formati kullan:
  ```
  Faz [N] Tamamlandi - Manuel Dogrulama Icin Hazir

  Otomatik dogrulama gecti:
  - [Gecen otomatik kontrolleri listele]

  Lutfen planda listelenen manuel dogrulama adimlarini yapin:
  - [Plandaki manuel dogrulama maddelerini listele]

  Manuel test tamamlandiginda haber verin, Faz [N+1]'e geceyim.
  ```

Ardisik birden fazla fazi calistirman istendiyse son faza kadar duraklamayi atla. Aksi halde yalnizca tek bir faz yaptigini varsay.

kullanici onaylamadan manuel test adimlarindaki maddeleri isaretleme.


## Takilirsan

Bir sey beklendigi gibi calismiyorsa:
- Once ilgili tum kodu okuyup anladigindan emin ol
- Kod tabani plan yazildigindan beri degismis olabilir mi diye dusun
- Uyusmazligi net sekilde sun ve yonlendirme iste

Alt-gorevleri az kullan - daha cok hedefli debug veya bilmedigin alani kesfetmek icin.

## Ise Devam Etme

Planda mevcut check isaretleri varsa:
- Tamamlanan isin yapildigina guven
- Ilk isaretlenmemis maddeden devam et
- Yalnizca bir sey ters gorunurse onceki isi dogrula

Unutma: Sadece kutu isaretlemiyorsun, bir cozum implemente ediyorsun. Son hedefi aklinda tut ve ilerleme momentumunu koru.
