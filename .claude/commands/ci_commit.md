---
description: Oturum degisiklikleri icin acik ve atomik mesajlarla git commit olustur
---

# Degisiklikleri Commit Et

Bu oturum sirasinda yapilan degisiklikler icin git commitleri olusturmakla gorevlendirildin.

## Surec:

1. **Neyin degistigini dusun:**
   - Konusma gecmisini gozden gecir ve neyin tamamlandigini anla
   - Mevcut degisiklikleri gormek icin `git status` calistir
   - Yapilan degisiklikleri anlamak icin `git diff` calistir
   - Degisikliklerin tek commit mi yoksa birden fazla mantiksal commit mi olmasi gerektigini degerlendir

2. **Commit(lerini) planla:**
   - Hangi dosyalarin birlikte gruplanmasi gerektigini belirle
   - Acik ve aciklayici commit mesajlari taslakla
   - Commit mesajlarinda emir kipini kullan
   - Yalnizca ne degistigine degil, neden degistigine odaklan

3. **Onay uzerine uygula:**
   - `git add` komutunu belirli dosyalarla kullan (`-A` veya `.` asla kullanma)
   - `thoughts/` dizinini veya icindeki hicbir seyi asla commit etme!
   - Dummy dosyalari, test scriptlerini veya senin olusturdugun ya da olusturulmus gorunen ama degisikliklerinin parcasi olmayan veya dogrudan degisikliklerinden kaynaklanmayan baska dosyalari asla commit etme (ornegin uretilmis kod)
   - Tum degisikliklerin `git commit -m` ile commit edilene kadar planladigin mesajlarla commit olustur

## Unutma:
- Bu oturumda yapilanlarin tam baglamina sahipsin
- Ilgili degisiklikleri birlikte grupla
- Mumkun oldugunda commitleri odakli ve atomik tut
- Kullanici muhakemene guveniyor - senden commit atmani istedi
- **ONEMLI**: asla durup kullanicidan geri bildirim isteme.
