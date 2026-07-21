# markinakv.com — сайт

## Что внутри
- `index.html` — главная
- `neurointegration.html` — страница нейроинтеграции
- `growth-operations.html` — Growth Operations / CV
- `charity.html` — благотворительные проекты
- `support.js`, `image-slot.js` — рантайм, который рендерит страницы (из дизайн-тула Claude), нужен всем страницам
- `uploads/` — фото

Всё внутренние ссылки уже перелинкованы друг на друга (без обращения к claude.ai). Проверено локально — все файлы отдаются 200 OK.

## Деплой: GitHub + Vercel

### 1. Залить в GitHub
```bash
cd markinakv-site
git init
git add .
git commit -m "Первая версия сайта"
```
Дальше на github.com → New repository (например `markinakv-site`, можно приватный) → без README/gitignore при создании → скопировать команды из блока "…or push an existing repository from the command line" и выполнить их (это `git remote add origin ...` и `git push -u origin main`).

### 2. Подключить Vercel
1. vercel.com → войти через GitHub
2. Add New → Project → выбрать репозиторий `markinakv-site`
3. Framework Preset: Other (Vercel сам всё определит, это статика)
4. Root Directory: оставить как есть
5. Deploy

Через минуту получишь рабочий адрес вида `markinakv-site.vercel.app`.

### 3. Привязать домен markinakv.com
Project → Settings → Domains → добавить `markinakv.com` → Vercel покажет DNS-записи (A/CNAME) → прописать их у регистратора домена. Обычно применяется за несколько минут–часов.

### 4. Как обновлять дальше
Через Claude Code на своём компьютере в этой же папке:
```bash
# внести правки в файлы
git add .
git commit -m "правки"
git push
```
Vercel сам пересоберёт и выложит новую версию при каждом пуше в `main`. Ничего вручную заливать не нужно.

## Дальше (не сделано в этой версии)
- Виджет "где я сейчас" по таблице поездок — обсуждали отдельно, добавим отдельным шагом через serverless-функцию на Vercel (`/api/location`), когда будешь готова.
