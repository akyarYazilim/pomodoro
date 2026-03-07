---
description: Worktree kurulumu ile en yuksek oncelikli kucuk Linear ticket'i implemente et
model: sonnet
---

## BOLUM I - EGER BIR TICKET BELIRTILMISSE

0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Implementasyon planini ve tum endiseleri anlamak icin ticket'i ve tum yorumlari oku

## BOLUM I - EGER TICKET BELIRTILMEMISSE

0.  .claude/commands/linear.md dosyasini oku
0a. MCP araclarini kullanarak linear'da "ready for dev" durumundaki ilk 10 oncelikli ogeyi cek; `links` bolumundeki tum ogeleri not et
0b. Listeden en yuksek oncelikli SMALL veya XS issue'yu sec (SMALL veya XS issue yoksa DERHAL CIK ve kullaniciyi bilgilendir)
0c. Secilen ogeyi ticket numarasiyla birlikte thoughts'a cekmek icin `linear` cli kullan - ./thoughts/shared/tickets/ENG-xxxx.md
0d. Implementasyon planini ve tum endiseleri anlamak icin ticket'i ve tum yorumlari oku

## BOLUM II - SONRAKI ADIMLAR

derinlemesine dusun

1. MCP araclariyla ogeyi "in dev" durumuna tası
1a. `links` bolumunden bagli implementasyon plan dokumanini belirle
1b. Plan yoksa ticket'i "ready for spec" durumuna geri tasi ve aciklamayla CIK

derinlemesine implementasyonu dusun

2. implementasyon icin worktree kur:
2a. `hack/create_worktree.sh` dosyasini oku ve Linear branch adiyla yeni worktree olustur: `./hack/create_worktree.sh ENG-XXXX BRANCH_NAME`
2b. implementasyon oturumu baslat: `humanlayer-nightly launch --model opus --dangerously-skip-permissions --dangerously-skip-permissions-timeout 15m --title "implement ENG-XXXX" -w ~/wt/humanlayer/ENG-XXXX "/implement_plan and when you are done implementing and all tests pass, read ./claude/commands/commit.md and create a commit, then read ./claude/commands/describe_pr.md and create a PR, then add a comment to the Linear ticket with the PR link"`

derinlemesine dusun, gorevlerini takip etmek icin TodoWrite kullan. Linear'dan cekerken oncelige gore ilk 10 ogeyi al ama yalnizca TEK bir oge uzerinde calis - ozellikle en yuksek oncelikli SMALL veya XS issue.
