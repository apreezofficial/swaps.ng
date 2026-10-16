# SwapS.ng API (vanilla PHP 8.1+)

```
php -S localhost:8000 -t public public/index.php
```

- `GET  /api/health`
- `GET  /api/catalog`
- `POST /api/quote`    `{targetCategory,targetId,yourCategory,yourId,condition}`
- `POST /api/waitlist` `{email,name?,interest?}`

Set `ALLOWED_ORIGIN` to your frontend origin in production.
