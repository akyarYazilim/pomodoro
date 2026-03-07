---
description: Repository sablonlarini takip ederek kapsamli PR aciklamalari olustur
---

# PR Aciklamasi Olustur

Repository'nin standart sablonunu takip ederek kapsamli bir pull request aciklamasi olusturmakla gorevlendirildin.

## Izlenecek adimlar:

1. **PR aciklama sablonunu oku:**

    - Asagidaki PR aciklama sablonunu kullan:

        ```md
        ## What problem(s) was I solving?

        ## What user-facing changes did I ship?

        ## How I implemented it

        ## How to verify it

        ### Manual Testing

        ## Description for the changelog
        ```

    - Tum bolumleri ve gereksinimleri anlamak icin sablonu dikkatle oku

2. **Aciklamasi yazilacak PR'i belirle:**
   - Mevcut branch'in iliskili bir PR'i var mi kontrol et: `gh pr view --json url,number,title,state 2>/dev/null`
   - Mevcut branch icin PR yoksa veya main/master'daysan acik PR'leri listele: `gh pr list --limit 10 --json number,title,headRefName,author`
   - Kullanicidan hangi PR'i aciklamak istedigini sor

3. **Mevcut aciklamayi kontrol et:**
   - `/tmp/{repo_name}/prs/{number}_description.md` dosyasinin zaten var olup olmadigini kontrol et
   - Varsa oku ve kullaniciya bunu guncelleyecegini bildir
   - Son aciklama yazildigindan beri neyin degistigini degerlendir

4. **Kapsamli PR bilgisini topla:**
   - Tam PR diff'ini al: `gh pr diff {number}`
   - Varsayilan remote repository yok hatasi alirsan kullaniciya `gh repo set-default` calistirmasini ve uygun repository'yi secmesini soyle
   - Commit gecmisini al: `gh pr view {number} --json commits`
   - Base branch'i incele: `gh pr view {number} --json baseRefName`
   - PR metadata'sini al: `gh pr view {number} --json url,title,number,state`

5. **Degisiklikleri kapsamli analiz et:** (kod degisikliklerini, mimari etkilerini ve olasi etkilerini derinlemesine dusun)
   - Tum diff'i dikkatle oku
   - Baglam icin diff'te gosterilmeyen ama referans verilen dosyalari oku
   - Her degisikligin amacini ve etkisini anla
   - Kullaniciya dokunan degisiklikleri dahili implementasyon detaylarindan ayir
   - Breaking change veya migration gereksinimlerini ara

6. **Dogrulama gereksinimlerini ele al:**
   - Sablondaki "How to verify it" bolumunde checklist maddeleri var mi bak
   - Her dogrulama adimi icin:
     - Calistirabilecegin bir komutsa (`make check test`, `npm test` vb.) calistir
     - Gecerse checkbox'i isaretle: `- [x]`
     - Kalirsa isaretsiz birak ve neyin kaldigini not et: aciklamayla `- [ ]`
     - Manuel test gerekiyorsa (UI etkilesimi, dis servisler) isaretsiz birak ve kullaniciya not dus
   - Tamamlayamadigin dogrulama adimlarini belgele

7. **Aciklamayi olustur:**
   - Sablondaki her bolumu kapsamli sekilde doldur:
     - Her soru/bolumu analizine gore yanitla
     - Cozulen problemleri ve yapilan degisiklikleri spesifik yaz
     - Uygun yerde kullanici etkisine odaklan
     - Uygun bolumlerde teknik detay ver
     - Kisa bir changelog girdisi yaz
   - Tum checklist maddelerinin ele alindigindan emin ol (isaretli veya aciklamali)

8. **Aciklamayi kaydet ve senkronize et:**
   - Tamamlanan aciklamayi `/tmp/{repo_name}/prs/{number}_description.md` dosyasina yaz
   - Uretilen aciklamayi kullaniciya goster

9. **PR'i guncelle:**
   - PR aciklamasini dogrudan guncelle: `gh pr edit {number} --body-file /tmp/{repo_name}/prs/{number}_description.md`
   - Guncellemenin basarili oldugunu dogrula
   - Isaretsiz kalan dogrulama adimlari varsa merge oncesi tamamlamasi icin kullaniciya hatirlat

## Onemli notlar:
- Bu komut farkli repository'lerde calisir - her zaman yerel sablonu oku
- Kapsamli ama oz ol - aciklamalar hizli taranabilir olmali
- "Ne" kadar "neden"e de odaklan
- Breaking change veya migration notlarini belirgin sekilde dahil et
- PR birden fazla bilesene dokunuyorsa aciklamayi buna gore organize et
- Mumkun oldugunda dogrulama komutlarini her zaman calistirmayi dene
- Hangi dogrulama adimlarinin manuel test gerektirdigini net ilet
