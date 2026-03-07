---
description: Plan icin worktree olustur ve implementasyon oturumu baslat
---

2. implementasyon icin worktree kur:
2a. `hack/create_worktree.sh` dosyasini oku ve Linear branch adiyla yeni worktree olustur: `./hack/create_worktree.sh ENG-XXXX BRANCH_NAME`

3. gerekli verileri belirle:

branch name
plan dosyasi yolu (yalnizca goreli yol kullan)
launch prompt
calistirilacak komut

**ONEMLI YOL KULLANIMI:**
- thoughts/ dizini ana repo ve worktree'ler arasinda senkronizedir
- Her zaman herhangi bir dizin on eki olmadan yalnizca `thoughts/shared/...` ile baslayan goreli yolu kullan
- Ornek: `thoughts/shared/plans/fix-mcp-keepalive-proper.md` (tam mutlak yol degil)
- Bu, thoughts dosyalari senkronize olup worktree'den erisilebilir oldugu icin calisir

3a. Human'a mesaj gondererek kullanicidan onay al

```
girdi bazinda, su detaylarla bir worktree olusturmayi planliyorum:

worktree yolu: ~/wt/humanlayer/ENG-XXXX
branch adi: BRANCH_NAME
plan dosyasi yolu: $FILEPATH
launch prompt:

    /implement_plan at $FILEPATH and when you are done implementing and all tests pass, read ./claude/commands/commit.md and create a commit, then read ./claude/commands/describe_pr.md and create a PR, then add a comment to the Linear ticket with the PR link

calistirilacak komut:

    humanlayer launch --model opus -w ~/wt/humanlayer/ENG-XXXX "/implement_plan at $FILEPATH and when you are done implementing and all tests pass, read ./claude/commands/commit.md and create a commit, then read ./claude/commands/describe_pr.md and create a PR, then add a comment to the Linear ticket with the PR link"
```

kullanicidan gelen geri bildirimi uygula, sonra:

4. implementasyon oturumunu baslat: `humanlayer launch --model opus -w ~/wt/humanlayer/ENG-XXXX "/implement_plan at $FILEPATH and when you are done implementing and all tests pass, read ./claude/commands/commit.md and create a commit, then read ./claude/commands/describe_pr.md and create a PR, then add a comment to the Linear ticket with the PR link"`
