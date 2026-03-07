---
description: Loglari, veritabani durumunu ve git gecmisini inceleyerek sorunlari debug et
---

# Debug

Manuel test veya implementasyon sirasinda sorunlari debug etmeye yardim etmekle gorevlendirildin. Bu komut, dosya duzenlemeden loglari, veritabani durumunu ve git gecmisini inceleyerek problemleri arastirmani saglar. Bunu, birincil pencerenin baglamini kullanmadan bir debug oturumunu baslatma yolu olarak dusun.

## Ilk Yanit

Plan/ticket dosyasi ILE cagrildiginda:
```
[file name] ile ilgili sorunlari debug etmeye yardimci olacagim. Mevcut durumu anlayayim.

Karsilastigin spesifik problem ne?
- Neyi test etmeye/implemente etmeye calisiyordun?
- Ne ters gitti?
- Herhangi bir hata mesaji var mi?

Neler oldugunu anlamak icin loglari, veritabanini ve git durumunu arastiracagim.
```

Parametresiz cagrildiginda:
```
Mevcut sorununu debug etmeye yardim edecegim.

Lutfen neyin ters gittigini acikla:
- Ne uzerinde calisiyorsun?
- Hangi spesifik problem oldu?
- En son ne zaman calisiyordu?

Sorunu tespit etmeye yardim etmek icin loglari, veritabani durumunu ve son degisiklikleri arastirabilirim.
```

## Ortam Bilgisi

Su temel konumlara ve araclara erisimin var:

**Loglar** (`make daemon` ve `make wui` tarafindan otomatik olusturulur):
- MCP loglari: `~/.humanlayer/logs/mcp-claude-approvals-*.log`
- Birlesik WUI/Daemon loglari: `~/.humanlayer/logs/wui-${BRANCH_NAME}/codelayer.log`
- Ilk satir sunu gosterir: `[timestamp] starting [service] in [directory]`

**Veritabani**:
- Konum: `~/.humanlayer/daemon-{BRANCH_NAME}.db`
- Session, event, approval vb. iceren SQLite veritabani
- `sqlite3` ile dogrudan sorgulanabilir

**Git Durumu**:
- Mevcut branch, son commitler, commit edilmemis degisiklikler
- `commit` ve `describe_pr` komutlarina benzer sekilde

**Servis Durumu**:
- Daemon calisiyor mu kontrol et: `ps aux | grep hld`
- WUI calisiyor mu kontrol et: `ps aux | grep wui`
- Socket varligi: `~/.humanlayer/daemon.sock`

## Surec Adimlari

### Adim 1: Problemi Anla

Kullanici sorunu anlattiktan sonra:

1. **Verilen baglami oku** (plan veya ticket dosyasi):
   - Ne implemente/test ettiklerini anla
   - Hangi fazda veya adimda olduklarini not et
   - Beklenen davranis ile gercek davranisi ayir

2. **Hizli durum kontrolu**:
   - Mevcut git branch ve son commitler
   - Commit edilmemis degisiklikler
   - Sorunun ne zaman basladigi

### Adim 2: Sorunu Arastir

Verimli inceleme icin paralel Task ajanlari baslat:

```
Gorev 1 - Son Loglari Kontrol Et:
Hatalar icin en guncel loglari bul ve analiz et:
1. Son daemon logunu bul: ls -t ~/.humanlayer/logs/daemon-*.log | head -1
2. Son WUI logunu bul: ls -t ~/.humanlayer/logs/wui-*.log | head -1
3. Problem zaman araligindaki hata, uyari veya issue'lari ara
4. Calisma dizinini not et (logun ilk satiri)
5. Stack trace veya tekrar eden hatalari ara
Donus: Zaman damgalariyla temel hata/uyarilar
```

```
Gorev 2 - Veritabani Durumu:
Mevcut veritabani durumunu kontrol et:
1. Veritabanina baglan: sqlite3 ~/.humanlayer/daemon.db
2. Semayi kontrol et: ilgili tablolar icin .tables ve .schema
3. Son verileri sorgula:
   - SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;
   - SELECT * FROM conversation_events WHERE created_at > datetime('now', '-1 hour');
   - Soruna gore diger sorgular
4. Takili durumlar veya anomalileri ara
Donus: Ilgili veritabani bulgulari
```

```
Gorev 3 - Git ve Dosya Durumu:
Son zamanda ne degistigini anla:
1. git status ve mevcut branch'i kontrol et
2. Son commitlere bak: git log --oneline -10
3. Commit edilmemis degisiklikleri kontrol et: git diff
4. Beklenen dosyalarin varligini dogrula
5. Dosya izin sorunlari var mi bak
Donus: Git durumu ve dosya sorunlari
```

### Adim 3: Bulgulari Sun

Arastirma sonucunda odakli bir debug raporu sun:

```markdown
## Debug Report

### What's Wrong
[Kanita dayali, net sorun ozeti]

### Evidence Found

**From Logs** (`~/.humanlayer/logs/`):
- [Zaman damgali hata/uyari]
- [Desen veya tekrar eden issue]

**From Database**:
```sql
-- Ilgili sorgu ve sonuc
[Veritabanindan bulgu]
```

**From Git/Files**:
- [Ilgili olabilecek son degisiklikler]
- [Dosya durumu sorunlari]

### Root Cause
[Kanita dayali en olasi aciklama]

### Next Steps

1. **Once Sunu Dene**:
   ```bash
   [Spesifik komut veya aksiyon]
   ```

2. **Bu ise yaramazsa**:
   - Servisleri yeniden baslat: `make daemon` ve `make wui`
   - WUI hatalari icin browser console'u kontrol et
   - Debug ile calistir: `HUMANLAYER_DEBUG=true make daemon`

### Erisemiyor Musun?
Bazi sorunlar erisimim disinda olabilir:
- Browser console hatalari (tarayicida F12)
- MCP server ic durumu
- Sistem seviyesi sorunlar

Belirli bir seyi daha derin arastirmami ister misin?
```

## Onemli Notlar

- **Manuel test senaryolarina odaklan** - bu komut implementasyon sirasinda debug icindir
- **Her zaman problem aciklamasi iste** - neyin bozuk oldugunu bilmeden debug olmaz
- **Dosyalari tamamen oku** - baglam okurken limit/offset kullanma
- **`commit` veya `describe_pr` gibi dusun** - git durumunu ve degisiklikleri anla
- **Kullaniciya geri yonlendir** - bazi sorunlar (browser console, MCP internalleri) erisim disi
- **Dosya duzenleme yok** - yalnizca inceleme

## Hizli Referans

**Son Loglari Bul**:
```bash
ls -t ~/.humanlayer/logs/daemon-*.log | head -1
ls -t ~/.humanlayer/logs/wui-*.log | head -1
```

**Veritabani Sorgulari**:
```bash
sqlite3 ~/.humanlayer/daemon.db ".tables"
sqlite3 ~/.humanlayer/daemon.db ".schema sessions"
sqlite3 ~/.humanlayer/daemon.db "SELECT * FROM sessions ORDER BY created_at DESC LIMIT 5;"
```

**Servis Kontrolu**:
```bash
ps aux | grep hld     # Daemon calisiyor mu?
ps aux | grep wui     # WUI calisiyor mu?
```

**Git Durumu**:
```bash
git status
git log --oneline -10
git diff
```

Unutma: Bu komut, birincil pencerenin baglamini tuketmeden inceleme yapmana yardim eder. Manuel testte issue'ya takildiginda log, veritabani veya git durumuna inmek icin idealdir.
