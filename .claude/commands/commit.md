---
description: Kullanici onayi ile ve Claude atfi olmadan git commit olustur
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

3. **Planini kullaniciya sun:**
   - Her commit icin eklemeyi planladigin dosyalari listele
   - Kullanacagin commit mesaj(lar)ini goster
   - Su soruyu sor: "Bu degisikliklerle [N] commit olusturmayi planliyorum. Devam edeyim mi?"

4. **Onay uzerine uygula:**
   - `git add` komutunu belirli dosyalarla kullan (`-A` veya `.` asla kullanma)
   - Planladigin mesajlarla commitleri olustur
   - Sonucu `git log --oneline -n [number]` ile goster

## Onemli:
- **ASLA co-author bilgisi veya Claude atfi ekleme**
- Commitler yalnizca kullanici tarafindan yazilmis gorunmeli
- "Generated with Claude" mesaji ekleme
- "Co-Authored-By" satiri ekleme
- Commit mesajlarini kullanici yazmis gibi yaz

## Unutma:
- Bu oturumda yapilanlarin tam baglamina sahipsin
- Ilgili degisiklikleri birlikte grupla
- Mumkun oldugunda commitleri odakli ve atomik tut
- Kullanici muhakemene guveniyor - senden commit atmani istedi
