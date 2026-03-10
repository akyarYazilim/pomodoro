# Manuel Test Planı — Pomodoro v1.0

**Tarih**: 2026-03-10
**Kapsam**: Tüm kullanıcı etkileşimleri, sayfalar, API'lar, edge case'ler
**Ortam**: Chrome (desktop + mobil), Safari (iOS), Firefox
**Ön koşul**: `npm run dev` çalışıyor, PostgreSQL (Docker 5433) aktif, `.env` hazır

---

## A — Kimlik Doğrulama (Authentication)

### A1 — Kayıt (/register)

- [ ] A1.1 — Geçerli bilgilerle (ad, e-posta, şifre ≥8 karakter) kayıt olunca /onboarding'e yönlendiriyor
- [ ] A1.2 — Şifre 7 karakter girilince hata mesajı ("En az 8 karakter") gösteriyor
- [ ] A1.3 — Geçersiz e-posta formatında hata mesajı gösteriyor
- [ ] A1.4 — Ad alanı boş bırakılınca hata mesajı gösteriyor
- [ ] A1.5 — Mevcut e-posta ile kayıt denenince 409 hatası + uygun mesaj gösteriyor
- [ ] A1.6 — Tüm alanlar boşken form submit edilemiyor (client-side validation)
- [ ] A1.7 — "Zaten hesabınız var mı?" linki /login'e gidiyor
- [ ] A1.8 — Şifre DB'de bcrypt hash olarak saklanıyor (plaintext değil)

### A2 — Giriş (/login)

- [ ] A2.1 — Doğru e-posta + şifre ile giriş → dashboard'a yönlendirme
- [ ] A2.2 — Yanlış şifre ile giriş denenince hata mesajı
- [ ] A2.3 — Kayıtlı olmayan e-posta ile giriş → hata mesajı
- [ ] A2.4 — "Google ile Giriş Yap" butonu OAuth akışını başlatıyor
- [ ] A2.5 — "Hesabınız yok mu?" linki /register'a gidiyor
- [ ] A2.6 — Giriş yapılmadan /timer'a erişim denenince /login'e redirect

### A3 — Çıkış (Logout)

- [ ] A3.1 — Header'daki logout ikonu tıklanınca oturum kapanıyor
- [ ] A3.2 — Çıkış sonrası /login'e yönlendirme
- [ ] A3.3 — Çıkış sonrası geri tuşu ile korunan sayfaya erişilemiyor

---

## B — Onboarding

### B1 — Akış (/onboarding)

- [ ] B1.1 — İlk kayıt sonrası otomatik olarak /onboarding'e yönlendirme
- [ ] B1.2 — 4 adım göstergesi (progress dots) görünüyor
- [ ] B1.3 — Her adımda "İleri" / "Geri" navigasyonu çalışıyor

### B2 — Adım 1: Persona Seçimi (PersonaStep)

- [ ] B2.1 — 5 seçenek görünüyor: Öğrenci, Freelancer, Uzaktan Çalışan, ADHD, Genel
- [ ] B2.2 — Tek seçim yapılabiliyor (radio behavior)
- [ ] B2.3 — ADHD seçilince sonraki adımda 15dk öneriliyor (25dk yerine)
- [ ] B2.4 — Seçim yapmadan ileri geçilemiyor

### B3 — Adım 2: Günlük Hedef (GoalStep)

- [ ] B3.1 — Dakika girişi kabul ediliyor (1-600 arası)
- [ ] B3.2 — 0 veya negatif değer reddediliyor
- [ ] B3.3 — Varsayılan değer gösteriliyor

### B4 — Adım 3: Timer Ayarları (TimerStep)

- [ ] B4.1 — Pomodoro / Flowtime modu seçilebiliyor
- [ ] B4.2 — Pomodoro seçilince çalışma, kısa mola, uzun mola süreleri ayarlanabiliyor
- [ ] B4.3 — Flowtime seçilince süre ayarı yok
- [ ] B4.4 — Seçilen süreler DB'ye kaydediliyor

### B5 — Adım 4: İlk Görev (FirstTaskStep)

- [ ] B5.1 — Görev oluşturma isteğe bağlı (skip edilebilir)
- [ ] B5.2 — Görev girilip "Tamamla" denince görev DB'ye kaydediliyor
- [ ] B5.3 — Tamamlama sonrası /timer'a yönlendirme
- [ ] B5.4 — DB'de `onboardingComplete: true` set ediliyor

### B6 — Tekrar Erişim

- [ ] B6.1 — Onboarding tamamlanmış kullanıcı /onboarding'e gidince dashboard'a redirect
- [ ] B6.2 — Onboarding tamamlanmamış kullanıcı dashboard'a gidince /onboarding'e redirect

---

## C — Timer

### C1 — Pomodoro Modu

#### C1.1 — Temel Akış

- [ ] C1.1.1 — "Başla" butonuna tıklanınca timer geri sayımı başlıyor (25:00'dan)
- [ ] C1.1.2 — Her saniye sayaç 1 azalıyor (MM:SS formatı doğru)
- [ ] C1.1.3 — Timer 00:00'a ulaşınca faz değişiyor (FOCUS → SHORT_BREAK)
- [ ] C1.1.4 — 4 pomodoro sonrası LONG_BREAK fazına geçiyor
- [ ] C1.1.5 — Pomodoro sayacı (✓✓✓) doğru gösteriliyor (0-3 arası)
- [ ] C1.1.6 — LONG_BREAK sonrası sayaç sıfırlanıyor ve yeni döngü başlıyor

#### C1.2 — Kontroller

- [ ] C1.2.1 — IDLE'da: "Başla" butonu görünüyor
- [ ] C1.2.2 — RUNNING'da: Durdur (■), Duraklat (⏸), Atla (⏭) butonları
- [ ] C1.2.3 — PAUSED'da: Sıfırla, Devam Et, Atla butonları
- [ ] C1.2.4 — Duraklat → Devam Et kaldığı yerden devam ediyor
- [ ] C1.2.5 — Durdur (■) butonu timer'ı IDLE'a sıfırlıyor
- [ ] C1.2.6 — Atla butonu mevcut fazı atlıyor (FOCUS → BREAK veya BREAK → FOCUS)

#### C1.3 — Quick Start

- [ ] C1.3.1 — IDLE'da 5dk, 10dk, 15dk hızlı başlat butonları görünüyor
- [ ] C1.3.2 — "5dk" tıklanınca timer 05:00'dan başlıyor
- [ ] C1.3.3 — "10dk" tıklanınca timer 10:00'dan başlıyor
- [ ] C1.3.4 — "15dk" tıklanınca timer 15:00'dan başlıyor
- [ ] C1.3.5 — Quick start sonrası normal pomodoro akışı devam ediyor

#### C1.4 — Break Prompt

- [ ] C1.4.1 — FOCUS fazı bitince BreakPrompt kartı görünüyor
- [ ] C1.4.2 — Mola tipi gösteriliyor (Kısa Mola / Uzun Mola)
- [ ] C1.4.3 — Rastgele bir mola önerisi görünüyor (her seferinde farklı)
- [ ] C1.4.4 — "Molayı Başlat" → mola geri sayımı başlıyor
- [ ] C1.4.5 — "Atla" → mola atlanıyor, FOCUS fazına dönüyor

#### C1.5 — Deep Focus Mode

- [ ] C1.5.1 — IDLE'da "Deep Focus" toggle butonu görünüyor
- [ ] C1.5.2 — Aktifleştirilince molalar atlanıyor, sürekli FOCUS
- [ ] C1.5.3 — Timer çalışırken toggle devre dışı
- [ ] C1.5.4 — Deep focus sırasında pomodoro sayacı artmaya devam ediyor

### C2 — Flowtime Modu

- [ ] C2.1 — Mode selector'dan Flowtime seçilebiliyor
- [ ] C2.2 — "Başla" tıklanınca timer yukarı doğru sayıyor (00:00'dan)
- [ ] C2.3 — Quick start butonları görünmüyor (Flowtime'da yok)
- [ ] C2.4 — Skip butonu görünmüyor (Flowtime'da faz yok)
- [ ] C2.5 — Durdur tıklanınca ContinueDialog açılıyor
- [ ] C2.6 — ContinueDialog: "Devam Et" → timer devam ediyor
- [ ] C2.7 — ContinueDialog: "Bitir" → seans kaydediliyor, timer sıfırlanıyor
- [ ] C2.8 — Geçen süre doğru gösteriliyor

### C3 — Mode Selector

- [ ] C3.1 — IDLE'da Pomodoro/Flowtime arası geçiş yapılabiliyor
- [ ] C3.2 — Timer RUNNING iken mod değiştirilemez (selector disabled)
- [ ] C3.3 — Mod değiştirince timer sıfırlanıyor
- [ ] C3.4 — Aktif mod vurgulanıyor

### C4 — Task Selector

- [ ] C4.1 — Görev dropdown'ı açılıyor, aktif görevler listeleniyor
- [ ] C4.2 — Görev seçilince timer'a bağlanıyor
- [ ] C4.3 — Seçili görev X ile temizlenebiliyor
- [ ] C4.4 — Görev öncelik badge'i (P1/P2/P3/P4) dropdown'da görünüyor
- [ ] C4.5 — Timer çalışırken görev değiştirilemez
- [ ] C4.6 — Görev yokken "Henüz görev yok" mesajı

### C5 — Session Recording

- [ ] C5.1 — Timer tamamlanınca seans otomatik kaydediliyor (POST /api/sessions)
- [ ] C5.2 — MoodDialog açılıyor (😔 😐 😊 🔥)
- [ ] C5.3 — Mood seçilince seans güncelleniyor (PATCH /api/sessions/:id)
- [ ] C5.4 — "Geç" butonu mood olmadan kapatıyor
- [ ] C5.5 — Seans, seçili görev ile birlikte kaydediliyor (taskId)
- [ ] C5.6 — Streak güncelleniyor (seans sonrası)
- [ ] C5.7 — Session History listesi güncelleniyor (son 5 seans)

### C6 — Session History

- [ ] C6.1 — Son 5 tamamlanan seans listeleniyor
- [ ] C6.2 — Görev adı veya mod adı gösteriliyor
- [ ] C6.3 — Süre (dakika olarak) gösteriliyor
- [ ] C6.4 — Zaman damgası (HH:MM) gösteriliyor
- [ ] C6.5 — Seans yokken "Henüz seans yok" mesajı

### C7 — Arka Plan Davranışı

- [ ] C7.1 — Sekme değiştirildiğinde timer durmadan devam ediyor
- [ ] C7.2 — Sekmeye geri dönüldüğünde doğru süre gösteriliyor (sync)
- [ ] C7.3 — Tarayıcı minimize edilip açıldığında timer doğru
- [ ] C7.4 — 5+ dakika arka planda kaldıktan sonra süre hâlâ doğru

### C8 — Timer Animasyonları

- [ ] C8.1 — Seans tamamlanınca bounce animasyonu oynatılıyor
- [ ] C8.2 — Konfeti efekti görünüyor (tamamlama kutlaması)
- [ ] C8.3 — Timer sayacı smooth geçiş yapıyor

---

## D — Görevler (Tasks)

### D1 — Görev Listesi

- [ ] D1.1 — /tasks sayfası yükleniyor, skeleton loading gösteriliyor
- [ ] D1.2 — Görevler öncelik sırasına göre listeleniyor (P1 → P4)
- [ ] D1.3 — Görev sayısı badge'i doğru gösteriliyor
- [ ] D1.4 — Hiç görev yokken boş durum mesajı
- [ ] D1.5 — Tamamlanan görevler ayrı bölümde ("Tamamlananlar")
- [ ] D1.6 — Tamamlanan görev başlığı üstü çizili

### D2 — Görev Oluşturma

- [ ] D2.1 — "Ekle" butonu formu açıyor
- [ ] D2.2 — Başlık zorunlu (boş bırakılamaz)
- [ ] D2.3 — Açıklama (textarea, opsiyonel, max 500 karakter)
- [ ] D2.4 — Öncelik seçici (P1-P4, varsayılan P3)
- [ ] D2.5 — Tahmini süre girişi (opsiyonel, dakika)
- [ ] D2.6 — Bitiş tarihi seçici (opsiyonel)
- [ ] D2.7 — "Ekle" submit → görev listeye ekleniyor + toast mesajı
- [ ] D2.8 — "İptal" formu kapatıyor, veri kaybolmuyor
- [ ] D2.9 — Başlık alanı autofocus

### D3 — Görev İşlemleri

- [ ] D3.1 — Checkbox tıklanınca görev tamamlanıyor (bounce animasyon)
- [ ] D3.2 — Tamamlanan görev tekrar tıklanınca "TODO"ya dönüyor
- [ ] D3.3 — Çöp kutusu ikonu ile görev siliniyor (ARCHIVED)
- [ ] D3.4 — Timer ikonu ile görev timer'a bağlanıyor ve /timer'a yönlendirme
- [ ] D3.5 — Silme sonrası görev listeden kalkıyor

### D4 — AI Görev Parçalama (Decompose)

- [ ] D4.1 — Makas (✂) ikonu tıklanınca AI alt adımlar üretiyor
- [ ] D4.2 — Alt adımlar görev altında listeleniyor
- [ ] D4.3 — Her alt adımın yanında "+" butonu → yeni görev olarak ekleme
- [ ] D4.4 — "+" ile eklenen alt görev P4 öncelikle oluşturuluyor
- [ ] D4.5 — AI yanıtı boşsa uygun hata mesajı

### D5 — Odak Modu (Focus Mode)

- [ ] D5.1 — "Odak" butonu tıklanınca sadece en yüksek 3 öncelikli görev görünüyor
- [ ] D5.2 — "Tümü" butonuyla tüm görevler tekrar görünüyor
- [ ] D5.3 — Odak modunda görev ekleme hâlâ çalışıyor

---

## E — İstatistikler (Stats)

### E1 — Günlük Özet (DailySummary)

- [ ] E1.1 — Bugünkü toplam odak dakikası doğru gösteriliyor
- [ ] E1.2 — Bugünkü seans sayısı doğru
- [ ] E1.3 — Seans yokken 0 gösteriliyor

### E2 — Seri (Streak)

- [ ] E2.1 — Mevcut seri gün sayısı doğru
- [ ] E2.2 — En uzun seri gösteriliyor
- [ ] E2.3 — 🧊 Streak Freeze badge'i görünüyor (freeze varsa)
- [ ] E2.4 — Freeze kullanılınca seri korunuyor (bir gün kaçırılınca)
- [ ] E2.5 — Animasyonlu alev ikonu aktif seride görünüyor
- [ ] E2.6 — Seri yokken 0 gün gösteriliyor

### E3 — Haftalık Özet (WeeklySummary)

- [ ] E3.1 — Bu haftanın toplam dakikası gösteriliyor
- [ ] E3.2 — Geçen haftaya göre trend ikonu (↑/↓)
- [ ] E3.3 — Progress bar hedefle orantılı

### E4 — Kalite Skoru (QualityScore)

- [ ] E4.1 — Ortalama mood skoru gösteriliyor (1-4 arası)
- [ ] E4.2 — Mood emoji'si doğru (😔/😐/😊/🔥)
- [ ] E4.3 — "N/M seans değerlendirildi" doğru
- [ ] E4.4 — Hiç mood yokken uygun boş durum mesajı

### E5 — Kişisel Rekorlar (PersonalRecords)

- [ ] E5.1 — En uzun seans (dakika) gösteriliyor
- [ ] E5.2 — En verimli gün (dakika) gösteriliyor
- [ ] E5.3 — En uzun seri (gün) gösteriliyor
- [ ] E5.4 — Rekor yokken "-" veya 0 gösteriliyor

### E6 — Haftalık Grafik (FocusChart)

- [ ] E6.1 — Son 7 günün bar chart'ı render ediliyor
- [ ] E6.2 — X ekseni: gün kısaltmaları (Pzt, Sal, ...)
- [ ] E6.3 — Y ekseni: dakika
- [ ] E6.4 — Hover'da tooltip ile tam dakika değeri
- [ ] E6.5 — Veri yokken boş grafik düzgün görünüyor

### E7 — Milestone Kutlamaları

- [ ] E7.1 — İlk seans tamamlanınca kutlama banner'ı
- [ ] E7.2 — 3. gün serisinde "Alışkanlık oluşuyor" mesajı
- [ ] E7.3 — 7. gün serisinde özel kutlama kartı
- [ ] E7.4 — Milestone kapatılabiliyor (dismiss)

### E8 — Hedef Tamamlama (GoalCompletion)

- [ ] E8.1 — Günlük hedefe ulaşılınca kutlama kartı
- [ ] E8.2 — %150+ aşılınca "Dinlenmeyi de unutma" mesajı
- [ ] E8.3 — Hedef set edilmemişse kart görünmüyor

---

## F — Ayarlar (Settings)

### F1 — Timer Ayarları

- [ ] F1.1 — Mevcut timer modu doğru seçili gösteriliyor
- [ ] F1.2 — Pomodoro seçilince süre butonları görünüyor
- [ ] F1.3 — Çalışma süresi seçenekleri: 15dk, 20dk, 25dk, 30dk, 45dk
- [ ] F1.4 — Kısa mola seçenekleri: 5dk, 10dk, 15dk, 20dk
- [ ] F1.5 — Uzun mola seçenekleri: 10dk, 15dk, 20dk, 30dk
- [ ] F1.6 — Flowtime seçilince süre butonları gizleniyor

### F2 — Günlük Hedef

- [ ] F2.1 — Mevcut hedef doğru gösteriliyor
- [ ] F2.2 — 0-600 arası değer kabul ediliyor
- [ ] F2.3 — Geçersiz değer (negatif, >600) reddediliyor

### F3 — Kaydetme

- [ ] F3.1 — "Kaydet" butonu değişiklikleri DB'ye yazıyor
- [ ] F3.2 — Başarı toast mesajı gösteriliyor
- [ ] F3.3 — Kaydetme sırasında loading state
- [ ] F3.4 — Hata durumunda hata toast mesajı
- [ ] F3.5 — Sayfa yenilenince ayarlar korunuyor
- [ ] F3.6 — Timer sayfasına dönünce yeni süreler aktif

### F4 — JWT Senkronizasyonu

- [ ] F4.1 — Ayarlar değiştirilince JWT token güncelleniyor
- [ ] F4.2 — Timer-store yeni değerlerle yeniden başlatılıyor
- [ ] F4.3 — İkinci bir sekmede de yeni ayarlar geçerli (refresh sonrası)

---

## G — AI Koç (Coach)

### G1 — Günlük İpucu

- [ ] G1.1 — Dashboard'da günlük ipucu kartı yükleniyor
- [ ] G1.2 — İpucu Türkçe ve anlamlı
- [ ] G1.3 — Aynı gün ikinci yüklemede cache'ten geliyor (hızlı)
- [ ] G1.4 — Yeni gün yeni ipucu üretiyor

### G2 — Chat Arayüzü

- [ ] G2.1 — /coach sayfası yükleniyor
- [ ] G2.2 — Mesaj girişi placeholder: "Bir şey sor..."
- [ ] G2.3 — Mesaj yazıp Enter ile gönderme
- [ ] G2.4 — Gönder butonu ile gönderme
- [ ] G2.5 — Kullanıcı mesajı sağda gösteriliyor
- [ ] G2.6 — AI yanıtı solda gösteriliyor
- [ ] G2.7 — Yanıt beklerken "typing" animasyonu (3 nokta)
- [ ] G2.8 — Yanıt gelince otomatik scroll aşağı
- [ ] G2.9 — Mesaj gönderilirken input disabled
- [ ] G2.10 — Boş mesaj gönderilemez

### G3 — Hata Durumları

- [ ] G3.1 — API key yoksa uygun hata mesajı
- [ ] G3.2 — Rate limit (20 mesaj) aşılınca 429 hatası + mesaj
- [ ] G3.3 — Ağ hatası durumunda hata mesajı gösteriliyor
- [ ] G3.4 — AI yanıtı boş gelirse fallback mesajı

---

## H — Birlikte Çalışma (Body Doubling / Rooms)

### H1 — Oda Oluşturma

- [ ] H1.1 — /room sayfasında "Yeni Oda Oluştur" butonu
- [ ] H1.2 — Oda adı girişi (opsiyonel)
- [ ] H1.3 — "Oluştur" tıklanınca 6 haneli kod üretiliyor
- [ ] H1.4 — Otomatik olarak oda sayfasına (/room/[code]) yönlendirme
- [ ] H1.5 — Oda adı girilmezse varsayılan "Çalışma Odası" kullanılıyor

### H2 — Odaya Katılma

- [ ] H2.1 — "Odaya Katıl" butonu → kod girişi formu
- [ ] H2.2 — 6 karakter girilene kadar "Katıl" butonu disabled
- [ ] H2.3 — Geçerli kod ile katılma → oda sayfasına yönlendirme
- [ ] H2.4 — Geçersiz/olmayan kod → "Oda bulunamadı" hatası
- [ ] H2.5 — Kod girişi büyük harf + monospace font

### H3 — Oda Sayfası

- [ ] H3.1 — Oda adı başlıkta gösteriliyor
- [ ] H3.2 — Oda kodu gösteriliyor
- [ ] H3.3 — Kopyala butonu kodu panoya kopyalıyor + check ikonu feedback
- [ ] H3.4 — "N çalışan / M toplam" badge'i doğru
- [ ] H3.5 — "Timer'ı başlatınca durumun otomatik güncellenir" bilgisi

### H4 — Katılımcılar Sekmesi

- [ ] H4.1 — "Katılımcılar" sekmesi varsayılan açık
- [ ] H4.2 — Çalışanlar bölümü: avatar + ad + yeşil "Çalışıyor" badge
- [ ] H4.3 — Bekleyenler bölümü: avatar + ad (badge yok)
- [ ] H4.4 — Mevcut kullanıcıda "(sen)" etiketi
- [ ] H4.5 — Timer başlatılınca durum otomatik "Çalışıyor" oluyor (SSE ile güncelleme)
- [ ] H4.6 — Timer durduğunda durum otomatik "Bekliyor" oluyor
- [ ] H4.7 — Diğer katılımcının durumu gerçek zamanlı güncelleniyor (~3sn)

### H5 — Leaderboard Sekmesi

- [ ] H5.1 — "Bu Hafta" sekmesine geçiş çalışıyor
- [ ] H5.2 — Sıralı liste: pozisyon + avatar + ad + odak süresi
- [ ] H5.3 — Süre formatı: "Xh YYdk" veya "YYdk"
- [ ] H5.4 — Trend ikonu: ↑ (yeşil), ↓ (kırmızı), - (nötr)
- [ ] H5.5 — Mevcut kullanıcı "(sen)" ile işaretli
- [ ] H5.6 — Bu hafta seans yoksa boş durum mesajı

### H6 — Çoklu Kullanıcı Senaryosu

- [ ] H6.1 — 2 farklı tarayıcıda aynı oda koduna katılım
- [ ] H6.2 — Birisi timer başlatınca diğeri "Çalışıyor" görüyor
- [ ] H6.3 — İkisi de timer başlatınca ikisi de "Çalışıyor"
- [ ] H6.4 — Birisi durduğunda sadece o "Bekliyor" oluyor
- [ ] H6.5 — Leaderboard her iki kullanıcıyı da gösteriyor

---

## I — Ekip (Team / B2B)

### I1 — Ekip Oluşturma

- [ ] I1.1 — /team sayfasında ekip yoksa oluşturma formu
- [ ] I1.2 — Ekip adı girişi (zorunlu)
- [ ] I1.3 — "Takım Oluştur" → ekip oluşturuluyor + sayfa güncelleniyor
- [ ] I1.4 — Boş isimle oluşturma denenemiyor
- [ ] I1.5 — Oluşturan kişi otomatik OWNER rolünde

### I2 — Ekip Dashboard

- [ ] I2.1 — Ekip adı başlıkta gösteriliyor
- [ ] I2.2 — Üye sayısı gösteriliyor
- [ ] I2.3 — Yenile butonu verileri güncelliyor
- [ ] I2.4 — Haftalık toplam odak dakikası (TeamStats)
- [ ] I2.5 — Tamamlanan görev sayısı
- [ ] I2.6 — Üye leaderboard'u (sıralı, süreli)

### I3 — Üye Davet

- [ ] I3.1 — "Üye Davet Et" butonu modal açıyor (sadece OWNER/ADMIN)
- [ ] I3.2 — E-posta girişi + "Davet Gönder" butonu
- [ ] I3.3 — Geçerli e-posta ile davet gönderiliyor + başarı mesajı
- [ ] I3.4 — Geçersiz e-posta formatı reddediliyor
- [ ] I3.5 — Mevcut üye davet edilince 409 hatası
- [ ] I3.6 — Bekleyen davetler listesi gösteriliyor
- [ ] I3.7 — Normal üye (MEMBER) "Üye Davet Et" butonunu görmüyor

### I4 — Davet Kabul

- [ ] I4.1 — Davet linki ile /teams/invite/[token] erişim
- [ ] I4.2 — Davet önizlemesi: ekip adı + davet eden
- [ ] I4.3 — "Kabul Et" → ekibe katılım + /team'e yönlendirme
- [ ] I4.4 — Süresi geçmiş token → hata mesajı
- [ ] I4.5 — Zaten kullanılmış token → hata mesajı
- [ ] I4.6 — Geçersiz token → 404

### I5 — Fiyatlandırma

- [ ] I5.1 — Sayfa altında "$5/kişi/ay · Aylık fatura" notu

---

## J — Pro / Ödeme (Billing)

### J1 — Upgrade Sayfası (/upgrade)

- [ ] J1.1 — Free vs Pro özellik karşılaştırması gösteriliyor
- [ ] J1.2 — Free: Timer, 10 görev, 7 gün stat, 3 tema
- [ ] J1.3 — Pro: Sınırsız stat, sınırsız görev, AI sınırsız, push, temalar, cloud sync
- [ ] J1.4 — Plan seçimi: Aylık / Yıllık / Lifetime
- [ ] J1.5 — Yıllık planda "%50 indirim" badge'i
- [ ] J1.6 — Lifetime'da "En iyi fiyat" badge'i
- [ ] J1.7 — Seçili plan vurgulanıyor

### J2 — Stripe Checkout

- [ ] J2.1 — "Pro Satın Al →" butonu Stripe checkout'a yönlendiriyor
- [ ] J2.2 — Yönlendirme sırasında "Yönlendiriliyor..." loading state
- [ ] J2.3 — Stripe'ta ödeme tamamlanınca plan güncelleniyor
- [ ] J2.4 — Webhook: checkout.session.completed → DB'de plan: "PRO"
- [ ] J2.5 — Webhook: subscription.deleted → plan: "FREE"

### J3 — Pro Kullanıcı Deneyimi

- [ ] J3.1 — Pro kullanıcı /upgrade'de "Zaten Pro kullanıcısısın" mesajı
- [ ] J3.2 — Sidebar'da Pro badge görünüyor
- [ ] J3.3 — Pro özellikler kilitsiz (AI sınırsız, sınırsız görev, vb.)
- [ ] J3.4 — Free kullanıcı Pro özelliğe tıklayınca UpgradeModal açılıyor

### J4 — Feature Gates (Free Limitler)

- [ ] J4.1 — Free: max 10 aktif görev (11. görev eklenmeye çalışılınca uyarı)
- [ ] J4.2 — Free: son 7 gün istatistik (daha eski veriler kilidi)
- [ ] J4.3 — Free: AI koç günde 5 mesaj limiti
- [ ] J4.4 — ProBadge/ProLocked bileşenleri doğru yerlerde görünüyor

---

## K — PWA (Progressive Web App)

### K1 — Kurulum

- [ ] K1.1 — Chrome'da (Android/Desktop) install banner görünüyor
- [ ] K1.2 — "Yükle" butonu native install prompt açıyor
- [ ] K1.3 — iOS Safari'de "Paylaş → Ana Ekrana Ekle" talimatı
- [ ] K1.4 — Banner kapatılınca bir daha gösterilmiyor (localStorage)
- [ ] K1.5 — PWA olarak yüklendikten sonra standalone modda açılıyor

### K2 — Offline Davranış

- [ ] K2.1 — İnternet kesildiğinde OfflineIndicator (sarı bar) görünüyor
- [ ] K2.2 — "Çevrimdışı — timer çalışmaya devam ediyor" mesajı
- [ ] K2.3 — Timer offline'da çalışmaya devam ediyor
- [ ] K2.4 — İnternet geldiğinde indicator kayboluyor
- [ ] K2.5 — Offline'da API çağrıları hata veriyor ama UI crash etmiyor

### K3 — Service Worker

- [ ] K3.1 — Lighthouse PWA skoru ≥90
- [ ] K3.2 — manifest.json doğru yükleniyor (name, icons, theme_color)
- [ ] K3.3 — Uygulama ikonu doğru gösteriliyor

---

## L — Tema ve Görünüm

### L1 — Dark Mode

- [ ] L1.1 — Header'daki tema ikonu tıklanınca light ↔ dark geçişi
- [ ] L1.2 — Light modda ☀ (Sun) ikonu, dark modda 🌙 (Moon) ikonu
- [ ] L1.3 — Tema tercihi localStorage'a kaydediliyor
- [ ] L1.4 — Sayfa yenilendiğinde seçili tema korunuyor
- [ ] L1.5 — Tüm sayfalar dark modda düzgün görünüyor
- [ ] L1.6 — Metin okunabilir (kontrast yeterli)
- [ ] L1.7 — Hydration mismatch yok (başlangıçta flicker yok)

### L2 — Responsive Tasarım

- [ ] L2.1 — Desktop: Sidebar sol tarafta sabit
- [ ] L2.2 — Mobil: Alt tab navigasyon (MobileNav)
- [ ] L2.3 — Timer sayacı büyük ve dokunma hedefi ≥44px
- [ ] L2.4 — Formlar mobilde düzgün görünüyor
- [ ] L2.5 — Kartlar küçük ekranda stack oluyor
- [ ] L2.6 — Grafik (FocusChart) mobilde responsive

---

## M — Bildirimler (Notifications)

### M1 — İzin Yönetimi

- [ ] M1.1 — Stats sayfasında NotificationPermissionCard görünüyor
- [ ] M1.2 — "Etkinleştir" butonu tarayıcı izin dialogu açıyor
- [ ] M1.3 — İzin verilince buton "Kapat" oluyor + token DB'ye kaydediliyor
- [ ] M1.4 — İzin reddedilince uygun mesaj gösteriliyor
- [ ] M1.5 — "Kapat" butonu token'ı DB'den siliyor
- [ ] M1.6 — Hydration mismatch yok (SSR'da Notification API yok)

---

## N — Navigasyon

### N1 — Sidebar (Desktop)

- [ ] N1.1 — Tüm linkler doğru sayfalara gidiyor
- [ ] N1.2 — Aktif sayfa vurgulanıyor
- [ ] N1.3 — Pro badge (Pro kullanıcıda) görünüyor
- [ ] N1.4 — "Pro'ya Geç ⭐" linki (Free kullanıcıda) görünüyor
- [ ] N1.5 — 7 navigasyon maddesi: Timer, Görevler, İstatistik, AI Koç, Ayarlar, Birlikte, Ekip

### N2 — Mobile Nav (Alt Bar)

- [ ] N2.1 — 6 ikon + etiket gösteriliyor
- [ ] N2.2 — Aktif sekme vurgulanıyor
- [ ] N2.3 — Dokunma hedefi ≥44px (min-height: 56px)
- [ ] N2.4 — Tüm linkler doğru çalışıyor

---

## O — Dashboard

### O1 — Ana Sayfa (/)

- [ ] O1.1 — Kişiselleştirilmiş karşılama: "Merhaba [Ad]!"
- [ ] O1.2 — Haftalık odak özeti: "Bu hafta X dakika odaklandın"
- [ ] O1.3 — Günlük stat kartı (toplam dakika + seans sayısı)
- [ ] O1.4 — Streak kartı (mevcut + en uzun)
- [ ] O1.5 — Günlük AI ipucu kartı (SuggestionCard)
- [ ] O1.6 — Hızlı erişim kartları: Timer, Görevler, İstatistik
- [ ] O1.7 — Yeni kullanıcı (0 seans) için boş durum mesajı
- [ ] O1.8 — Milestone kartı görünüyor (varsa)
- [ ] O1.9 — GoalCompletion kartı (hedef aşılmışsa)

---

## P — Hata Durumları ve Edge Case'ler

### P1 — Ağ Hataları

- [ ] P1.1 — API çağrısı başarısızsa UI crash etmiyor
- [ ] P1.2 — Hata mesajı kullanıcıya gösteriliyor (toast veya inline)
- [ ] P1.3 — Retry mekanizması çalışıyor (gerekli yerlerde)
- [ ] P1.4 — Offline'da form submit denenince anlamlı hata

### P2 — Yetkilendirme

- [ ] P2.1 — Başka kullanıcının görevine erişim → 403
- [ ] P2.2 — Başka kullanıcının seansına erişim → 403
- [ ] P2.3 — Ekip admini olmadan davet gönderme → 403
- [ ] P2.4 — Geçersiz token ile API çağrısı → 401

### P3 — Veri Doğrulama

- [ ] P3.1 — Çok uzun görev başlığı (1000+ karakter) → reddediliyor veya kırpılıyor
- [ ] P3.2 — Özel karakterler (<script>, SQL injection) → sanitize ediliyor
- [ ] P3.3 — Negatif dakika değeri → reddediliyor
- [ ] P3.4 — Geçersiz mood değeri (0, 5, -1) → reddediliyor
- [ ] P3.5 — Boş JSON body → 400 hatası

### P4 — Eşzamanlılık

- [ ] P4.1 — İki sekmede aynı anda timer başlatma → sorunsuz
- [ ] P4.2 — Aynı anda iki görev oluşturma → ikisi de kaydediliyor
- [ ] P4.3 — Hızlı tıklama (double click) → tekil işlem

### P5 — Tarayıcı Uyumluluğu

- [ ] P5.1 — Chrome (desktop) — tüm özellikler çalışıyor
- [ ] P5.2 — Chrome (Android) — timer, PWA, touch hedefleri
- [ ] P5.3 — Safari (iOS) — timer, PWA install talimatı
- [ ] P5.4 — Firefox — temel özellikler çalışıyor
- [ ] P5.5 — Edge — temel özellikler çalışıyor

### P6 — Performans

- [ ] P6.1 — Sayfa yükleme < 3sn (ilk yükleme)
- [ ] P6.2 — Timer sayacı kasma yapmıyor (60fps)
- [ ] P6.3 — 100+ görev ile liste performansı kabul edilebilir
- [ ] P6.4 — Stats sayfası grafik render < 1sn
- [ ] P6.5 — Çok sayıda seans (1000+) ile istatistik hesaplama doğru

---

## Q — Sesler (Sounds)

### Q1 — Ses Çalma

- [ ] Q1.1 — breakEnd() sesi break fazı bitince çalıyor
- [ ] Q1.2 — taskDone() sesi görev tamamlanınca çalıyor
- [ ] Q1.3 — workComplete() sesi pomodoro tamamlanınca çalıyor
- [ ] Q1.4 — Ses dosyaları yükleniyor (404 hatası yok)
- [ ] Q1.5 — Ses seviyesi uygun (çok yüksek değil)

> **NOT**: breakEnd() ve taskDone() şu an çağrılmıyor — bilinen bug (#3, #5 numaralı bug)

---

## R — Özet İstatistikler

| Bölüm | Test Sayısı |
|-------|-------------|
| A — Auth | 16 |
| B — Onboarding | 14 |
| C — Timer | 43 |
| D — Görevler | 21 |
| E — İstatistikler | 24 |
| F — Ayarlar | 14 |
| G — AI Koç | 14 |
| H — Rooms | 26 |
| I — Ekip | 17 |
| J — Billing | 14 |
| K — PWA | 11 |
| L — Tema | 13 |
| M — Bildirimler | 6 |
| N — Navigasyon | 9 |
| O — Dashboard | 9 |
| P — Edge Cases | 21 |
| Q — Sesler | 5 |
| **TOPLAM** | **277** |

---

## Test Notları

- Her test maddesinin sonucunu `[x]` (geçti) veya `[!]` (başarısız + not) olarak işaretleyin
- Başarısız testleri aşağıdaki formatta raporlayın:
  ```
  [!] C1.1.3 — Timer 00:00'a ulaşınca faz değişmiyor
  → Beklenen: SHORT_BREAK fazına geçiş
  → Gerçek: FOCUS'ta kalıyor, sayaç -1'e düşüyor
  → Ekran görüntüsü: screenshots/c1-1-3.png
  ```
- Kritik yol testleri (C, D, E bölümleri) öncelikli çalıştırılmalı
- Çoklu kullanıcı testleri (H6) için 2 farklı tarayıcı/profil kullanın
