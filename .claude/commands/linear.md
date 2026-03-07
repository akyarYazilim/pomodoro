---
description: Linear ticketlarini yonet - olustur, guncelle, yorum ekle ve workflow kaliplarini takip et
---

# Linear - Ticket Yonetimi

Linear ticketlarini yonetmekle gorevlendirildin. Buna thoughts dokumanlarindan ticket olusturma, mevcut ticketlari guncelleme ve ekibin ozel workflow kaliplarini takip etme dahildir.

## Ilk Kurulum

Ilk olarak `mcp__linear__` araclarinin varligini kontrol ederek Linear MCP araclarinin kullanilabilir oldugunu dogrula. Yoksa su yaniti ver:
```
Ticket yonetiminde yardimci olabilmem icin Linear araclarina erisimim olmali. Lutfen Linear MCP sunucusunu etkinlestirmek icin `/mcp` komutunu calistir, sonra tekrar dene.
```

Araclar varsa, kullanici istegine gore yanit ver:

### Genel istekler icin:
```
Linear ticketlari konusunda yardimci olabilirim. Ne yapmak istersin?
1. Thoughts dokumanindan yeni ticket olusturmak
2. Bir ticketa yorum eklemek (konusma baglamimizi kullanirim)
3. Ticket aramak
4. Ticket durumunu veya detaylarini guncellemek
```

### Ozellikle create istekleri icin:
```
Thoughts dokumanindan bir Linear ticket olusturmana yardim edecegim. Lutfen sunlari ver:
1. Thoughts dokumani yolu (veya aranacak konu)
2. Ticket icin ozel odak/acidan bakis (opsiyonel)
```

Sonra kullanici girdisini bekle.

## Ekip Workflow'u ve Durum Ilerlemesi

Ekip, kod implementasyonundan once hizalanmayi saglamak icin belirli bir workflow izler:

1. **Triage** -> Tum yeni ticketlar ilk inceleme icin burada baslar
2. **Spec Needed** -> Daha fazla detay gerekir; cozulecek problem ve cozum taslagi gerekli
3. **Research Needed** -> Plan yazilmadan once inceleme gerekir
4. **Research in Progress** -> Aktif arastirma/incleme suruyor
5. **Research in Review** -> Arastirma bulgulari incelemede (opsiyonel)
6. **Ready for Plan** -> Arastirma bitti, ticketin implementasyon plani yazilmali
7. **Plan in Progress** -> Plan aktif olarak yaziliyor
8. **Plan in Review** -> Plan yazildi ve tartisma asamasinda
9. **Ready for Dev** -> Plan onaylandi, implementasyona hazir
10. **In Dev** -> Aktif gelistirme
11. **Code Review** -> PR gonderildi
12. **Done** -> Tamamlandi

**Temel ilke**: Inceleme ve hizalanma PR asamasinda degil plan asamasinda yapilir; boylece hiz artar ve rework azalir.

## Onemli Konvansiyonlar

### Thoughts Dokumanlari icin URL Esleme
Thoughts dokumanlarina referans verirken her zaman GitHub linkini `links` parametresiyle ver:
- `thoughts/shared/...` -> `https://github.com/humanlayer/thoughts/blob/main/repos/humanlayer/shared/...`
- `thoughts/allison/...` -> `https://github.com/humanlayer/thoughts/blob/main/repos/humanlayer/allison/...`
- `thoughts/global/...` -> `https://github.com/humanlayer/thoughts/blob/main/global/...`

### Varsayilan Degerler
- **Status**: Yeni ticketlari her zaman "Triage" durumunda olustur
- **Project**: Yeni ticketlar icin, aksi belirtilmedikce varsayilan proje "M U L T I C L A U D E" (ID: f11c8d63-9120-4393-bfae-553da0b04fd8)
- **Priority**: Cogu gorev icin varsayilan Medium (3), gerekirse muhakeme kullan veya kullaniciya sor
  - Urgent (1): Kritik blocker, guvenlik issue'lari
  - High (2): Deadline'i olan onemli ozellikler, buyuk buglar
  - Medium (3): Standart implementasyon gorevleri (varsayilan)
  - Low (4): Nice-to-have, kucuk iyilestirmeler
- **Links**: URL baglamak icin `links` parametresini kullan (sadece markdown link degil)

### Otomatik Label Atamasi
Ticket icerigine gore otomatik label uygula:
- **hld**: `hld/` dizini (daemon) ile ilgili ticketlar
- **wui**: `humanlayer-wui/` ile ilgili ticketlar
- **meta**: `hlyr` komutlari, thoughts araci veya `thoughts/` dizini ile ilgili ticketlar

Not: meta, hld/wui ile ayni anda kullanilmaz. Ticket hem hld hem wui alabilir, ama meta ile birlikte olamaz.

## Aksiyona Ozel Talimatlar

### 1. Thoughts'dan Ticket Olusturma

#### Istegi aldiktan sonra izlenecek adimlar:

1. **Thoughts dokumanini bul ve oku:**
   - Yol verildiyse dogrudan oku
   - Konu/anahtar kelime verildiyse ilgili dokumanlari bulmak icin thoughts/ dizininde Grep ara
   - Birden fazla eslesme varsa listele ve kullanicidan secmesini iste
   - TodoWrite listesi olustur: Dokumani oku -> Icerigi analiz et -> Ticket taslagi cikar -> Kullanici girdisi al -> Ticket olustur

2. **Dokuman icerigini analiz et:**
   - Tartisilan temel problemi veya ozelligi belirle
   - Ana implementasyon detaylarini veya teknik kararlari cikar
   - Bahsedilen belirli kod dosyalarini/alanlarini not et
   - Aksiyon maddelerini veya sonraki adimlari bul
   - Fikrin hangi asamada oldugunu belirle (erken fikir asamasi vs implementasyona hazir)
   - Bu dokumanin ozunu net bir problem tanimina ve cozum yaklasimina indirgemek icin derin dusun

3. **Ilgili baglami kontrol et (dokumanda geciyorsa):**
   - Dokumanda belirli kod dosyalari geciyorsa ilgili bolumleri oku
   - Baska thoughts dokumanlari geciyorsa hizli kontrol et
   - Mevcut Linear ticket referanslari var mi bak

4. **Linear workspace baglamini al:**
   - Team'leri listele: `mcp__linear__list_teams`
   - Birden fazla team varsa kullanicidan secmesini iste
   - Secilen team icin projectleri listele: `mcp__linear__list_projects`

5. **Ticket taslak ozetini hazirla:**
   Kullanicya taslagi sun:
   ```
   ## Taslak Linear Ticket

   **Title**: [Net, aksiyon odakli baslik]

   **Description**:
   [Problemin/hedefin 2-3 cumlelik ozeti]

   ## Ana Detaylar
   - [Thoughts'tan onemli detay maddeleri]
   - [Teknik kararlar veya kisitlar]
   - [Spesifik gereksinimler]

   ## Implementasyon Notlari (uygunsa)
   [Belirtilmis teknik yaklasim/adimlar]

   ## Referanslar
   - Kaynak: `thoughts/[path/to/document.md]` ([View on GitHub](donusturulmus GitHub URL))
   - Ilgili kod: [dosya:satir referanslari]
   - Parent ticket: [uygunsa]

   ---
   Dokumana gore bu isin asamasi: [ideation/planning/ready to implement]
   ```

6. **Etkilesimli iyilestirme:**
   Kullaniciya sor:
   - Bu ozet ticketi dogru yakaliyor mu?
   - Hangi project'e gitmeli? [listeyi goster]
   - Priority ne olmali? (Varsayilan: Medium/3)
   - Ek baglam eklensin mi?
   - Implementasyon detayi daha fazla/az olsun mu?
   - Kendine assign etmek ister misin?

   Not: Ticket varsayilan olarak "Triage" durumunda olusturulur.

7. **Linear ticket'i olustur:**
   ```
   mcp__linear__create_issue with:
   - title: [iyilestirilmis baslik]
   - description: [markdown final aciklama]
   - teamId: [secilen team]
   - projectId: [kullanici belirtmedikce yukaridaki varsayilan proje]
   - priority: [secilen oncelik, varsayilan 3]
   - stateId: [Triage status ID]
   - assigneeId: [istenirse]
   - labelIds: [yukaridaki otomatik label atamasi]
   - links: [{url: "GitHub URL", title: "Document Title"}]
   ```

8. **Olusturma sonrasi aksiyonlar:**
   - Olusan ticket URL'sini goster
   - Kullanicya su opsiyonlari sor:
     - Ek implementasyon detayi iceren yorum eklemek
     - Aksiyon maddeleri icin sub-task olusturmak
     - Orijinal thoughts dokumanini ticket referansiyla guncellemek
   - Thoughts dokumani guncellemesi istenirse:
     ```
     Dokumanin ustune ekle:
     ---
     linear_ticket: [URL]
     created: [date]
     ---
     ```

## Ornek donusumler:

### Uzun thoughts metninden:
```
"I've been thinking about how our resumed sessions don't inherit permissions properly.
This is causing issues where users have to re-specify everything. We should probably
store all the config in the database and then pull it when resuming. Maybe we need
new columns for permission_prompt_tool and allowed_tools..."
```

### Kisa ticket formatina:
```
Title: Fix resumed sessions to inherit all configuration from parent

Description:

## Problem to solve
Currently, resumed sessions only inherit Model and WorkingDir from parent sessions,
causing all other configuration to be lost. Users must re-specify permissions and
settings when resuming.

## Solution
Store all session configuration in the database and automatically inherit it when
resuming sessions, with support for explicit overrides.
```

### 2. Mevcut Ticketlara Yorum ve Link Ekleme

Kullanici bir ticketa yorum eklemek istediginde:

1. **Hangi ticket oldugunu belirle:**
   - Ilgili ticketi mevcut konusma baglamindan cikar
   - Emin degilsen `mcp__linear__get_issue` ile ticket detayini gosterip kullanicidan dogrulama al
   - Konusulan son islerde ticket referanslarini ara

2. **Yorumlari netlik icin formatla:**
   - Daha fazla detay gerekmiyorsa yorumlari kisa tutmaya calis (~10 satir)
   - Insan okuyucu icin en degerli icerige odaklan
   - Sadece ne yapildigi degil, neden onemli oldugu
   - Ilgili dosya referanslarini backtick ve GitHub linkleriyle ekle

3. **Dosya referans formati:**
   - Yollari backtick ile sar: `thoughts/allison/example.md`
   - Sonrasina GitHub linki ekle: `([View](url))`
   - Hem thoughts/ hem kod dosyalari icin bunu uygula

4. **Yorum yapi ornegi:**
   ```markdown
   Implemented retry logic in webhook handler to address rate limit issues.

   Key insight: The 429 responses were clustered during batch operations,
   so exponential backoff alone wasn't sufficient - added request queuing.

   Files updated:
   - `hld/webhooks/handler.go` ([GitHub](link))
   - `thoughts/shared/rate_limit_analysis.md` ([GitHub](link))
   ```

5. **Linkleri dogru yonet:**
   - Yorumla birlikte link ekleniyorsa: Issue'yi linkle guncelle VE yorumda da linkten bahset
   - Sadece link ekleniyorsa: yine de tarihce icin kisa yorum birak
   - Harici URL'leri her zaman issue'nin kendisine `links` parametresiyle ekle

6. **Linkli yorum icin:**
   ```
   # Once issue'yi linkle guncelle
   mcp__linear__update_issue with:
   - id: [ticket ID]
   - links: [mevcut linkler + yeni link ve baslik]

   # Sonra linkten bahseden yorumu olustur
   mcp__linear__create_comment with:
   - issueId: [ticket ID]
   - body: [ana icgoruler ve dosya referanslariyla formatli yorum]
   ```

7. **Sadece link icin:**
   ```
   # Issue'yi linkle guncelle
   mcp__linear__update_issue with:
   - id: [ticket ID]
   - links: [mevcut linkler + yeni link ve baslik]

   # Tarihce icin kisa yorum ekle
   mcp__linear__create_comment with:
   - issueId: [ticket ID]
   - body: "Added link: `path/to/document.md` ([View](url))"
   ```

### 3. Ticket Arama

Kullanici ticket bulmak istediginde:

1. **Arama kriterlerini topla:**
   - Sorgu metni
   - Team/Project filtreleri
   - Status filtreleri
   - Tarih araliklari (createdAt, updatedAt)

2. **Aramayi calistir:**
   ```
   mcp__linear__list_issues with:
   - query: [arama metni]
   - teamId: [belirtilmisse]
   - projectId: [belirtilmisse]
   - stateId: [status filtresi varsa]
   - limit: 20
   ```

3. **Sonuclari sun:**
   - Ticket ID, title, status, assignee goster
   - Birden fazla project varsa project bazinda grupla
   - Linear direkt linklerini ekle

### 4. Ticket Status Guncelleme

Ticketlar workflow'da ilerletilirken:

1. **Mevcut status'u al:**
   - Ticket detayini cek
   - Workflow'daki mevcut status'u goster

2. **Sonraki status'u oner:**
   - Triage -> Spec Needed (detay/problem tanimi eksik)
   - Spec Needed -> Research Needed (problem/cozum taslagi netlesince)
   - Research Needed -> Research in Progress (arastirma basliyor)
   - Research in Progress -> Research in Review (opsiyonel; Ready for Plan'a atlanabilir)
   - Research in Review -> Ready for Plan (arastirma onaylandi)
   - Ready for Plan -> Plan in Progress (plan yazimi basliyor)
   - Plan in Progress -> Plan in Review (plan yazildi)
   - Plan in Review -> Ready for Dev (plan onaylandi)
   - Ready for Dev -> In Dev (gelistirme basladi)

3. **Baglamla guncelle:**
   ```
   mcp__linear__update_issue with:
   - id: [ticket ID]
   - stateId: [yeni status ID]
   ```

   Status degisimini aciklayan yorum eklemeyi dusun.

## Onemli Notlar

- Kullanicilari description ve commentlerde `@[name](ID)` formatiyla etiketle, or: `@[dex](16765c85-2286-4c0f-ab49-0d4d79222ef5)`
- Ticketlari kisa ama tam tut - hizli taranabilir icerik hedefle
- Tum ticketlarda net bir "problem to solve" olmasi gerekir; kullanici sadece implementasyon detayi verirse MUTLAKA su soruyu sor: "To write a good ticket, please explain the problem you're trying to solve from a user perspective"
- "what" ve "why" odakli ol; "how" yalnizca iyi tanimliysa ekle
- Kaynak materyal linklerini her zaman `links` parametresiyle koru
- Istek yoksa erken asama brainstorming'den ticket olusturma
- Dogru Linear markdown formatini kullan
- Kod referanslarini su formatta ver: `path/to/file.ext:linenum`
- Project/status tahmin etmek yerine netlestirme sor
- Linear description'larin code block dahil tam markdown destekledigini unutma
- Harici URL'ler icin her zaman `links` parametresini kullan (sadece markdown link degil)
- unutma - mutlaka bir "Problem to solve" almalisin!

## Yorum Kalitesi Kurallari

Yorum olustururken insan okuyucu icin **en degerli bilgiyi** cikarmaya odaklan:

- **Ozetten cok ana icgoru**: "aha" anı veya kritik anlayis ne?
- **Kararlar ve trade-offlar**: Hangi yaklasim secildi, neyi mumkun/engelli kildi
- **Cozulen blockerlar**: Ilerlemeyi ne durduruyordu, nasil cozuldu
- **Durum degisimleri**: Simdi ne farkli ve sonraki adimlar icin anlami ne
- **Surprizler/kesifler**: Isi etkileyen beklenmedik bulgular

Kacin:
- Baglamsiz mekanik degisiklik listeleri
- Kod difflerinden zaten acik olan seyi tekrar etmek
- Deger katmayan jenerik ozetler

Unutma: Hedef, gelecekteki bir okuyucunun (kendin dahil) bu guncellemede neyin onemli oldugunu hizlica anlamasi.

## Sik Kullanilan ID'ler

### Engineering Team
- **Team ID**: `6b3b2115-efd4-4b83-8463-8160842d2c84`

### Label ID'leri
- **bug**: `ff23dde3-199b-421e-904c-4b9f9b3d452c`
- **hld**: `d28453c8-e53e-4a06-bea9-b5bbfad5f88a`
- **meta**: `7a5abaae-f343-4f52-98b0-7987048b0cfa`
- **wui**: `996deb94-ba0f-4375-8b01-913e81477c4b`

### Workflow State ID'leri
- **Triage**: `77da144d-fe13-4c3a-a53a-cfebd06c0cbe` (type: triage)
- **spec needed**: `274beb99-bff8-4d7b-85cf-04d18affbc82` (type: unstarted)
- **research needed**: `d0b89672-8189-45d6-b705-50afd6c94a91` (type: unstarted)
- **research in progress**: `c41c5a23-ce25-471f-b70a-eff1dca60ffd` (type: unstarted)
- **research in review**: `1a9363a7-3fae-42ee-a6c8-1fc714656f09` (type: unstarted)
- **ready for plan**: `995011dd-3e36-46e5-b776-5a4628d06cc8` (type: unstarted)
- **plan in progress**: `a52b4793-d1b6-4e5d-be79-b2254185eed0` (type: started)
- **plan in review**: `15f56065-41ea-4d9a-ab8c-ec8e1a811a7a` (type: started)
- **ready for dev**: `c25bae2f-856a-4718-aaa8-b469b7822f58` (type: started)
- **in dev**: `6be18699-18d7-496e-a7c9-37d2ddefe612` (type: started)
- **code review**: `8ca7fda1-08d4-48fb-a0cf-954246ccbe66` (type: started)
- **Ready for Deploy**: `a3ad0b54-17bf-4ad3-b1c1-2f56c1f2515a` (type: started)
- **Done**: `8159f431-fbc7-495f-a861-1ba12040f672` (type: completed)
- **Backlog**: `6cf6b25a-054a-469b-9845-9bd9ab39ad76` (type: backlog)
- **PostIts**: `a57f2ab3-c6f8-44c7-a36b-896154729338` (type: backlog)
- **Todo**: `ddf85246-3a7c-4141-a377-09069812bbc3` (type: unstarted)
- **Duplicate**: `2bc0e829-9853-4f76-ad34-e8732f062da2` (type: canceled)
- **Canceled**: `14a28d0d-c6aa-4d8e-9ff2-9801d4cc7de1` (type: canceled)


## Linear User ID'leri

- allison: b157f9e4-8faf-4e7e-a598-dae6dec8a584
- dex: 16765c85-2286-4c0f-ab49-0d4d79222ef5
- sundeep: 0062104d-9351-44f5-b64c-d0b59acb516b
