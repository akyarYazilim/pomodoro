---
description: Arastirma gerektiren en yuksek oncelikli Linear ticket'i arastir
---

## BOLUM I - EGER BIR LINEAR TICKET BELIRTILMISSE

0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Hangi arastirmaya ihtiyac oldugunu ve onceki denemeleri anlamak icin ticket'i ve tum yorumlari oku

## BOLUM I - EGER TICKET BELIRTILMEMISSE

0.  .claude/commands/linear.md dosyasini oku
0a. MCP araclarini kullanarak linear'da "research needed" durumundaki ilk 10 oncelikli ogeyi cek; `links` bolumundeki tum ogeleri not et
0b. Listeden en yuksek oncelikli SMALL veya XS issue'yu sec (SMALL veya XS issue yoksa DERHAL CIK ve kullaniciyi bilgilendir)
0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Hangi arastirmaya ihtiyac oldugunu ve onceki denemeleri anlamak icin ticket'i ve tum yorumlari oku

## BOLUM II - SONRAKI ADIMLAR

derinlemesine dusun

1. MCP araclarini kullanarak ogeyi "research in progress" durumuna tasi
1a. Baglami anlamak icin `links` bolumundeki bagli dokumanlari oku
1b. Arastirma yapmak icin bilgi yetersizse netlestirme isteyen yorum ekle ve ticket'i "research needed" durumuna geri tasi

darastirma ihtiyaclari uzerine derinlemesine dusun

2. arastirmayi yurüt:
2a. Etkili kod tabani arastirmasi icin rehber olarak .claude/commands/research_codebase.md dosyasini oku
2b. Linear yorumlari web arastirmasi gerektirdigini soyluyorsa, dis cozumleri, API'leri veya best practice'leri arastirmak icin WebSearch kullan
2c. Kod tabaninda ilgili implementasyonlari ve desenleri ara
2d. Mevcut benzer ozellikleri veya iliskili kodu incele
2e. Teknik kisitlari ve firsatlari belirle
2f. Tarafsiz ol - ideal implementasyon plani dusunmeye cok zaman harcama, sadece ilgili dosyalari ve sistemlerin bugun nasil calistigini belgele
2g. Bulgulari yeni bir thoughts dokumaninda belgele: `thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md`
   - Format: `YYYY-MM-DD-ENG-XXXX-description.md`
   - Ticket yoksa ENG-XXXX kismini cikar
   - description, arastirma konusunun kisa kebab-case aciklamasi olmali
   - Ornekler:
     - Ticket ile: `2025-01-08-ENG-1478-parent-child-tracking.md`
     - Ticketsiz: `2025-01-08-error-handling-patterns.md`

bulgular uzerine derinlemesine dusun

3. arastirmayi aksiyona donuk icgorulere sentezle:
3a. Ana bulgulari ve teknik kararlari ozetle
3b. Olasi implementasyon yaklasimlarini belirle
3c. Kesfedilen risk veya endiseleri not et
3d. Arastirmayi kaydetmek icin `humanlayer thoughts sync` calistir

4. ticket'i guncelle:
4a. Arastirma dokumanini MCP araclariyla dogru link formatinda ticketa ekle
4b. Arastirma ciktilarini ozetleyen yorum ekle
4c. MCP araclariyla ogeyi "research in review" durumuna tasi

derinlemesine dusun, gorevlerini takip etmek icin TodoWrite kullan. Linear'dan cekerken oncelige gore ilk 10 ogeyi al ama yalnizca TEK bir oge uzerinde calis - ozellikle en yuksek oncelikli issue.

## BOLUM III - Is bitince

Kullanici icin bir mesaj yaz (yer tutuculari gercek degerlerle degistir):

```
✅ ENG-XXXX icin arastirma tamamlandi: [ticket title]

Arastirma konusu: [research topic description]

Arastirma durumu:

thoughts/shared/research/YYYY-MM-DD-ENG-XXXX-description.md konumunda olusturuldu
Thoughts repository'ye senkronize edildi
Linear ticket'a eklendi
Ticket "research in review" durumuna tasindi

Ana bulgular:
- [Major finding 1]
- [Major finding 2]
- [Major finding 3]

Ticket'i gor: https://linear.app/humanlayer/issue/ENG-XXXX/[ticket-slug]
```
