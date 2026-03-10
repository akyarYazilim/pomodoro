# v1.0.0 — Full MVP Release Notes

**Tarih**: 2026-03-10
**Commit aralığı**: `2ed717e → 8f4a1e2` (15 commit)
**Repo**: https://github.com/akyarYazilim/pomodoro

---

## Doğrulama Sonuçları

| Kontrol | Sonuç |
|---------|-------|
| Testler (214 adet, 21 dosya) | ✅ Tümü geçti |
| TypeScript (`tsc --noEmit`) | ✅ Hatasız |
| Statements coverage | ✅ 90.86% |
| Branches coverage | ✅ 80.18% |
| Functions coverage | ✅ 90.29% |
| Lines coverage | ✅ 91.85% |

---

## Sprint 5-1 — Bug Fixler + Eksik Bağlantılar

**Commit**: `dcc6fc3` (Sprint 5-8 birleşik)

### Değişiklikler
- `sounds.breakEnd()` — `useTimer.ts`'de break bitiminde çağrılıyor
- `sounds.taskDone()` — `useTasks.ts`'de görev tamamlamada çağrılıyor
- `DailyStats` interface: `pomodoroCount` + `flowtimeCount` alanları eklendi
- Session recorder `activeSessionIdRef` dead branch kaldırıldı
- `TaskForm`: `description` textarea + `dueDate` date input eklendi
- Timer ayarları JWT callback'e eklendi (`pomodoroMinutes`, `shortBreakMinutes`, `longBreakMinutes`, `defaultTimerMode`)
- `stores/timer-store.ts`: `initFromSession` action eklendi
- `app/(dashboard)/settings/page.tsx` oluşturuldu
- `app/api/user/settings/route.ts` PATCH endpoint eklendi
- `components/LandingPage.tsx` dead code silindi

---

## Sprint 6-2 — UX Kalitesi

**Commit**: `dcc6fc3`

### Değişiklikler
- Timer tamamlanma micro-animasyonu (`animate-bounce` + confetti efekti)
- `BreakPrompt`: mola önerileri (20-20-20 kuralı, yürüyüş, su iç)
- `ContinueDialog` — Flowtime bitti, devam mı? (Devam/Mola/Bitir)
- Timer hızlı başlat: 5dk/10dk/15dk butonları
- Compassionate dil — streak sıfırlanma mesajları pozitif çerçevelendi

---

## Sprint 7-3 — Retention Mekanizmaları

**Commit**: `dcc6fc3`

### Değişiklikler
- **Streak Freeze**: `streakFreezeCount` + `lastStreakFreezeUsed` DB alanları
- `StreakDisplay`: 🧊 badge (1 freeze hakkı, haftalık yenileme)
- `/api/user/notifications` POST/DELETE — push token yönetimi
- `NotificationPermissionCard` — tarayıcı bildirim izni
- `WeeklySummaryCard` — haftalık özet (trend ikon + progress bar)

---

## Sprint 8-4 — ADHD + Erişilebilirlik

**Commit**: `dcc6fc3`

### Değişiklikler
- `TaskList`: Odak modu toggle — sadece 3 yüksek öncelikli görev gösterir
- AI task decomposition: "🪓 Parçala" butonu + `/api/coach/decompose`
- Timer renk kademelendirmesi: yeşil → sarı → kırmızı (son 5 dk)
- Hyperfocus modu — sessiz, durmayan sayaç

---

## Sprint 9-5 — Onboarding 2.0

**Commit**: `ef4221c`

### Değişiklikler
- `PersonaStep` — kullanıcı tipi seçimi (Öğrenci/Freelancer/ADHD/Genel)
- Persona'ya göre kişiselleştirilmiş default timer süresi önerisi
- `MilestoneCard` — ilk seans, 3. gün, 7. gün milestone kutlaması
- Dashboard kişiselleştirilmiş karşılama mesajı

---

## Sprint 10-6 — Stats 2.0

**Commit**: `fbcef3a`

### Değişiklikler
- Haftalık karşılaştırma badge — "Bu hafta %23 daha fazla odaklandın"
- `MoodDialog` — seans sonrası 1-3 yıldız mood rating
- `QualityScore` — ortalama mood × tamamlama oranı skoru
- `PersonalRecords` — en uzun seans 🏆, en iyi gün rekoru
- `GoalCompletionCard` — günlük hedef aşılınca burnout uyarısı

---

## Sprint 11-7 — Monetizasyon

**Commit**: `88578d3`

### Değişiklikler
- `User.plan` DB alanı (free/pro/lifetime) + Stripe alanları
- `lib/utils/feature-flags.ts` — `isPro()` helper + `PRO_FEATURES` + `FREE_LIMITS`
- Stripe checkout: `/api/billing/checkout` + `/api/billing/webhook`
- JWT/Session: `plan` alanı token'a eklendi
- `ProBadge.tsx` + `ProLocked` overlay bileşeni
- `UpgradeModal.tsx` — pro özelliğe tıklanınca açılan modal
- `/upgrade` sayfası — 3 plan seçeneği (aylık/yıllık/lifetime)
- Sidebar: Pro kullanıcıya ProBadge, ücretsiz kullanıcıya "Pro'ya Geç ⭐"

### Notlar
- Stripe API version: `"2026-02-25.clover"`
- Stripe client factory pattern (build sırasında STRIPE_SECRET_KEY hatası önlendi)
- Gerekli env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_LIFETIME_PRICE_ID`

---

## Sprint 12-8 — PWA + Offline

**Commit**: `4250b1f`

### Değişiklikler
- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker (cache-first strateji)
- `useNetworkStatus` hook — online/offline durumu
- `OfflineIndicator` — offline bannerı
- `InstallBanner` — iOS/Android kurulum CTA
- Arka plan timer doğruluğu: Page Visibility API ile drift düzeltme

---

## Sprint 13-9 — Body Doubling (Sosyal)

**Commit**: `da3c991`

### Değişiklikler
- Prisma: `SharedRoom` + `RoomMember` + `add_shared_rooms` migration
- API: POST `/api/rooms`, GET `/api/rooms/[code]`, POST join, PATCH status, SSE stream, GET leaderboard
- `useRoom` hook — SSE EventSource + createRoom/joinRoom/updateStatus
- `RoomParticipants.tsx` + `Leaderboard.tsx`
- `/room` (oluştur/katıl) + `/room/[code]` (canlı oda)
- `components/ui/avatar.tsx` — yeni bileşen (shadcn'de yoktu)
- Timer durumu → oda working status otomatik sync

---

## Sprint 14-10 — B2B Team Dashboard

**Commit**: `8f4a1e2`

### Değişiklikler
- Prisma: `Team` + `TeamMember` + `TeamInvite` + `TeamRole` enum + `add_team_b2b` migration
- API:
  - `POST /api/teams` — takım oluştur (OWNER olarak ata)
  - `GET /api/teams` — kullanıcının takımı
  - `GET /api/teams/[id]/stats` — haftalık üye istatistikleri (groupBy)
  - `POST /api/teams/[id]/invite` — e-posta ile üye davet (OWNER/ADMIN)
  - `GET/POST /api/teams/invite/[token]` — davet önizleme + kabul
- `useTeam` hook — takım yönetimi, davet, istatistik
- `TeamStats` — 3 kart: toplam saat, görev, üye sayısı + `TrendBadge`
- `TeamMembers` — sıralı üye leaderboard (avatar, rol badge, odak süresi, trend)
- `InviteDialog` — inline kart formu (modal değil)
- `/team` sayfası — takım oluştur veya dashboard göster
- Sidebar + MobileNav: "Ekip" linki eklendi

---

## Mimari Kararlar

| Katman | Ne için |
|--------|---------|
| Zustand store | Cross-component shared + mutable (timer, tasks) |
| Custom hook | Tek sayfaya ait, read-only API (stats, team, room) |
| Local useState | UI-only ephemeral (form, dropdown) |
| Bileşen | Sadece render + event delegation |

---

## Bilinen Açık Konular

1. **NotificationPermissionCard hydration**: `Notification.permission` SSR'da `mounted` guard gerekiyor
2. **Stripe env değişkenleri**: Production'da `.env.production` içinde set edilmeli
3. **Team fiyatlandırma**: UI'da "$5/kişi/ay" hardcoded — Stripe'a bağlanmamış
