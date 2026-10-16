# SwapS.ng

Swap what you have for what you want. Cars, phones, TVs, fridges, computers and furniture, with escrow-protected payments.

- `frontend/` Next.js 15 landing site, auth pages and account dashboard
- `backend/` vanilla PHP 8.1+ API (SQLite), no framework

## Run locally

```bash
cd backend
cp .env.example .env
php -S localhost:8000 -t public public/index.php
```

```bash
cd frontend
npm install
npm run dev
```

The Next.js app proxies `/api/*` to the PHP API (`BACKEND_URL`, default `http://localhost:8000`).

## Demo logins (local only)

There are no passwords. Seed the demo accounts, then sign in with a magic link:

```bash
cd backend && php seed.php
```

| Account | Email | 2FA |
| --- | --- | --- |
| Demo | `demo@swaps.ng` | off |
| Demo with 2FA | `demo2fa@swaps.ng` | on |

1. Go to `/login`, enter the email, then click **Open the link** (dev mode shows it instead of sending email).
2. For the 2FA account, enter the current code from `php seed.php --code` (or add secret `DEMOSWAPS2FASECRETKEY` to an authenticator app). Recovery codes: `demo1-swap1`, `demo2-swap2`.

The seed script refuses to run when `APP_ENV=production`.

## Auth

- Passwordless sign-in and registration with a **magic link** (dev mode writes emails to `backend/storage/mail.log`)
- **Passkeys** (WebAuthn, ES256 and RS256)
- **Authenticator app 2FA** (TOTP) with single-use recovery codes
- **Google** sign-in. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`, with redirect URI `${APP_URL}/api/auth/google/callback`

See `backend/README.md` for the API.
