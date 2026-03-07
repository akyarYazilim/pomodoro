---
description: Is arkadasinin branch'ini incelemek icin worktree kur
---

# Local Review

Bir ekip arkadasinin branch'i icin yerel inceleme ortami kurmakla gorevlendirildin. Bu; worktree olusturma, bagimliliklari kurma ve yeni bir Claude Code oturumu baslatmayi icerir.

## Surec

`gh_username:branchName` gibi bir parametreyle cagrildiginda:

1. **Girdiyi parse et**:
   - `username:branchname` formatindan GitHub kullanici adini ve branch adini cikar
   - Parametre verilmediyse su formatta iste: `gh_username:branchName`

2. **Ticket bilgisini cikar**:
   - Branch adinda ticket numarasi ara (ornegin `eng-1696`, `ENG-1696`)
   - Kisa worktree dizin adi olusturmak icin bunu kullan
   - Ticket bulunmazsa branch adinin sanitize edilmis halini kullan

3. **Remote ve worktree'yi kur**:
   - `git remote -v` ile remote zaten var mi kontrol et
   - Yoksa ekle: `git remote add USERNAME git@github.com:USERNAME/humanlayer`
   - Remote'dan fetch et: `git fetch USERNAME`
   - Worktree olustur: `git worktree add -b BRANCHNAME ~/wt/humanlayer/SHORT_NAME USERNAME/BRANCHNAME`

4. **Worktree'yi konfigure et**:
   - Claude ayarlarini kopyala: `cp .claude/settings.local.json WORKTREE/.claude/`
   - Kurulumu calistir: `make -C WORKTREE setup`
   - Thoughts'i initialize et: `cd WORKTREE && humanlayer thoughts init --directory humanlayer`

## Hata Yonetimi

- Worktree zaten varsa once kaldirmasi gerektigini kullaniciya bildir
- Remote fetch fail olursa kullanici adi/repo varligini kontrol et
- Setup fail olursa hatayi ver ama launch ile devam et

## Ornek Kullanim

```
/local_review samdickson22:sam/eng-1696-hotkey-for-yolo-mode
```

Bu islem sunlari yapar:
- `samdickson22` remote'unu ekler
- `~/wt/humanlayer/eng-1696` konumunda worktree olusturur
- Ortami kurar
