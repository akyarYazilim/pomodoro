---
description: Ready for spec durumundaki en yuksek oncelikli Linear ticket icin implementasyon plani olustur
---

## BOLUM I - EGER BIR TICKET BELIRTILMISSE

0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Gecmis implementasyonlari ve arastirmalari, bunlarla ilgili soru ve endiseleri ogrenmek icin ticket'i ve tum yorumlari oku


### BOLUM I - EGER TICKET BELIRTILMEMISSE

0.  .claude/commands/linear.md dosyasini oku
0a. MCP araclarini kullanarak linear'da "ready for spec" durumundaki ilk 10 oncelikli ogeyi cek; `links` bolumundeki tum ogeleri not et
0b. Listeden en yuksek oncelikli SMALL veya XS issue'yu sec (SMALL veya XS issue yoksa DERHAL CIK ve kullaniciyi bilgilendir)
0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Gecmis implementasyonlari ve arastirmalari, bunlarla ilgili soru ve endiseleri ogrenmek icin ticket'i ve tum yorumlari oku

### BOLUM II - SONRAKI ADIMLAR

derinlemesine dusun

1. MCP araclarini kullanarak ogeyi "plan in progress" durumuna tasi
1a. ./claude/commands/create_plan.md dosyasini oku
1b. `links` bolumune gore ogenin bagli implementasyon plan dokumani olup olmadigini belirle
1d. Plan varsa isin bitti, ticket linkiyle yanit ver
1e. Arastirma yetersizse veya yanitlanmamis sorular varsa, ./claude/commands/create_plan.md talimatlarini izleyerek yeni plan dokumani olustur

derinlemesine dusun

2. Plan tamamlaninca `humanlayer thoughts sync` calistir ve MCP araclariyla dokumani ticketa bagla; link iceren kisa bir yorum olustur (gerekirse .claude/commands/linear.md dosyasini tekrar oku)
2a. MCP araclariyla ogeyi "plan in review" durumuna tasi

derinlemesine dusun, gorevlerini takip etmek icin TodoWrite kullan. Linear'dan cekerken oncelige gore ilk 10 ogeyi al ama yalnizca TEK bir oge uzerinde calis - ozellikle en yuksek oncelikli SMALL veya XS issue.

### BOLUM III - Is bitince


Kullanici icin bir mesaj yaz (yer tutuculari gercek degerlerle degistir):

```
✅ ENG-XXXX icin implementasyon plani tamamlandi: [ticket title]

Yaklasim: [selected approach description]

Planin durumu:

thoughts/shared/plans/YYYY-MM-DD-ENG-XXXX-description.md konumunda olusturuldu
Thoughts repository'ye senkronize edildi
Linear ticket'a eklendi
Ticket "plan in review" durumuna tasindi

Implementasyon fazlari:
- Faz 1: [phase 1 description]
- Faz 2: [phase 2 description]
- Faz 3: [phase 3 description if applicable]

Ticket'i gor: https://linear.app/humanlayer/issue/ENG-XXXX/[ticket-slug]
```
