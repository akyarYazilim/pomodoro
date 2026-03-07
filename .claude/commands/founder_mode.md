---
description: Implementasyondan sonra deneysel ozellikler icin Linear ticket ve PR olustur
---

Dogru ticketing ve PR kurulumu olmadan ilerlemis deneysel bir ozellik uzerinde calisiyorsun.

Commit'i yeni attigini varsayarak, sonraki adimlar su sekilde:


1. Az once attigin commit'in SHA'sini al (eger commit atmadisan `.claude/commands/commit.md` dosyasini oku ve bir commit olustur)

2. `.claude/commands/linear.md` dosyasini oku - az once implemente ettigin seyi derinlemesine dusun, sonra yaptigin is hakkinda bir linear ticket olustur ve ticket'i 'in dev' durumuna al - ticket'ta "problem to solve" ve "proposed solution" icin ### basliklari olmali
3. Onerilen git branch adini almak icin ticket'i fetch et
4. git checkout main
5. git checkout -b 'BRANCHNAME'
6. git cherry-pick 'COMMITHASH'
7. git push -u origin 'BRANCHNAME'
8. gh pr create --fill
9. `.claude/commands/describe_pr.md` dosyasini oku ve talimatlari uygula
