<?php
declare(strict_types=1);

final class AuthController
{
    // ---------- helpers ----------

    private static function str(array $in, string $k, int $max = 255): string
    {
        return mb_substr(trim((string)($in[$k] ?? '')), 0, $max);
    }

    private static function now(): string
    {
        return gmdate('c');
    }

    private static function findUserByEmail(string $email): ?array
    {
        return Db::one('SELECT * FROM users WHERE email = ?', [$email]);
    }

    private static function createUser(string $email, string $name, ?string $googleSub = null): array
    {
        Db::run('INSERT INTO users (email, name, google_sub, created_at) VALUES (?,?,?,?)', [$email, $name, $googleSub, self::now()]);
        return Db::one('SELECT * FROM users WHERE id = ?', [Db::pdo()->lastInsertId()]);
    }

    /** Starts a session; users with an authenticator app must still pass the 2FA step. */
    private static function signIn(array $user, bool $strongAuth = false): string
    {
        $needsMfa = (bool)$user['totp_enabled'] && !$strongAuth;
        Session::start((int)$user['id'], !$needsMfa);
        return $needsMfa ? 'mfa' : 'ok';
    }

    // ---------- session ----------

    public static function me(): never
    {
        $s = Session::current();
        if ($s === null) {
            respond(200, ['user' => null]);
        }
        if (!$s['mfa_ok']) {
            respond(200, ['user' => null, 'mfa_required' => true]);
        }
        respond(200, ['user' => Session::publicUser($s['user'])]);
    }

    public static function logout(): never
    {
        Session::destroy();
        respond(200, ['ok' => true]);
    }

    public static function providers(): never
    {
        respond(200, ['google' => Google::configured()]);
    }

    // ---------- magic link ----------

    public static function magicRequest(array $in): never
    {
        $email = strtolower(self::str($in, 'email'));
        $name = self::str($in, 'name', 100);
        $purpose = ($in['purpose'] ?? '') === 'register' ? 'register' : 'login';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(422, ['error' => 'Please enter a valid email address']);
        }
        if ($purpose === 'register' && $name === '') {
            respond(422, ['error' => 'Please tell us your name']);
        }
        if (!RateLimit::hit('magic-email:' . $email, 5, 900) || !RateLimit::hit('magic-ip:' . RateLimit::ip(), 20, 900)) {
            respond(429, ['error' => 'Too many requests. Please wait a few minutes and try again.']);
        }

        $token = bin2hex(random_bytes(32));
        Db::run(
            'INSERT INTO magic_links (token_hash, email, name, purpose, expires_at) VALUES (?,?,?,?,?)',
            [hash('sha256', $token), $email, $name, $purpose, time() + 900]
        );
        Db::run('DELETE FROM magic_links WHERE expires_at < ?', [time() - 86400]);

        $link = Env::appUrl() . '/auth/verify?token=' . $token;
        $existing = self::findUserByEmail($email);
        // Only email sign-in links to people who can use them; nobody learns whether an account exists.
        if ($purpose === 'login' && $existing === null) {
            $body = "Someone asked to sign in to SwapS.ng with this address, but there is no account yet.\n\nCreate one here:\n" . Env::appUrl() . "/register\n\nIf this wasn't you, ignore this email.";
            $subject = 'Create your SwapS.ng account';
            $dev = null;
        } else {
            $body = "Hi" . ($existing ? ' ' . $existing['name'] : ($name !== '' ? ' ' . $name : '')) . ",\n\nUse this link to " . ($existing ? 'sign in to' : 'finish creating your') . " SwapS.ng. It works once and expires in 15 minutes.\n\n$link\n\nIf you didn't request this, you can ignore this email.";
            $subject = $existing ? 'Your SwapS.ng sign-in link' : 'Confirm your SwapS.ng account';
            $dev = $link;
        }
        Mailer::send($email, $subject, $body);

        $res = ['ok' => true];
        if (!Env::isProd() && $dev !== null) {
            $res['dev_link'] = $dev;
        }
        respond(200, $res);
    }

    public static function magicVerify(array $in): never
    {
        $token = self::str($in, 'token', 200);
        if (!RateLimit::hit('magic-verify:' . RateLimit::ip(), 30, 900)) {
            respond(429, ['error' => 'Too many attempts']);
        }
        $h = hash('sha256', $token);
        $row = Db::one('SELECT * FROM magic_links WHERE token_hash = ? AND used = 0 AND expires_at > ?', [$h, time()]);
        // single use: only the request that flips `used` wins
        if ($row === null || Db::run('UPDATE magic_links SET used = 1 WHERE token_hash = ? AND used = 0', [$h]) !== 1) {
            respond(400, ['error' => 'This link has expired or was already used. Request a new one.']);
        }

        $user = self::findUserByEmail($row['email']);
        if ($user === null) {
            if ($row['purpose'] !== 'register') {
                respond(200, ['status' => 'no_account', 'email' => $row['email']]);
            }
            $user = self::createUser($row['email'], $row['name']);
        }
        respond(200, ['status' => self::signIn($user)]);
    }

    // ---------- Google ----------

    public static function googleStart(): never
    {
        if (!Google::configured()) {
            header('Location: ' . Env::appUrl() . '/login?error=google_not_configured');
            exit;
        }
        header('Location: ' . Google::authUrl());
        exit;
    }

    public static function googleCallback(): never
    {
        $app = Env::appUrl();
        if (isset($_GET['error']) || empty($_GET['code']) || empty($_GET['state'])) {
            header("Location: $app/login?error=google_cancelled");
            exit;
        }
        $g = Google::exchange((string)$_GET['code'], (string)$_GET['state']);
        if ($g === null) {
            header("Location: $app/login?error=google_failed");
            exit;
        }
        $user = Db::one('SELECT * FROM users WHERE google_sub = ?', [$g['sub']]) ?? self::findUserByEmail($g['email']);
        if ($user === null) {
            $user = self::createUser($g['email'], $g['name'], $g['sub']);
        } elseif (empty($user['google_sub'])) {
            Db::run('UPDATE users SET google_sub = ? WHERE id = ?', [$g['sub'], $user['id']]);
            $user['google_sub'] = $g['sub'];
        }
        $status = self::signIn($user);
        header('Location: ' . $app . ($status === 'mfa' ? '/auth/2fa' : '/dashboard'));
        exit;
    }

    // ---------- 2FA (authenticator app) ----------

    public static function totpSetup(): never
    {
        $u = Session::requireUser();
        if ($u['totp_enabled']) {
            respond(409, ['error' => 'Authenticator is already enabled']);
        }
        $secret = Totp::generateSecret();
        Db::run('UPDATE users SET totp_pending = ? WHERE id = ?', [$secret, $u['id']]);
        respond(200, ['secret' => $secret, 'otpauth_url' => Totp::url($secret, $u['email'])]);
    }

    public static function totpEnable(array $in): never
    {
        $u = Session::requireUser();
        if (!RateLimit::hit('totp-enable:' . $u['id'], 10, 600)) {
            respond(429, ['error' => 'Too many attempts']);
        }
        if (empty($u['totp_pending'])) {
            respond(400, ['error' => 'Start setup first']);
        }
        $step = Totp::verify($u['totp_pending'], self::str($in, 'code', 12));
        if ($step === null) {
            respond(422, ['error' => 'That code is not right. Check your authenticator app and try again.']);
        }
        Db::run(
            'UPDATE users SET totp_secret = totp_pending, totp_pending = NULL, totp_enabled = 1, totp_last_step = ? WHERE id = ?',
            [$step, $u['id']]
        );
        respond(200, ['ok' => true, 'recovery_codes' => self::newRecoveryCodes((int)$u['id'])]);
    }

    public static function totpDisable(array $in): never
    {
        $u = Session::requireUser();
        if (!$u['totp_enabled']) {
            respond(400, ['error' => 'Authenticator is not enabled']);
        }
        if (!self::checkSecondFactor($u, self::str($in, 'code', 20))) {
            respond(422, ['error' => 'Invalid code']);
        }
        Db::run('UPDATE users SET totp_secret = NULL, totp_pending = NULL, totp_enabled = 0 WHERE id = ?', [$u['id']]);
        Db::run('DELETE FROM recovery_codes WHERE user_id = ?', [$u['id']]);
        respond(200, ['ok' => true]);
    }

    public static function recoveryRegenerate(array $in): never
    {
        $u = Session::requireUser();
        if (!$u['totp_enabled'] || !self::checkSecondFactor($u, self::str($in, 'code', 20))) {
            respond(422, ['error' => 'Invalid code']);
        }
        respond(200, ['recovery_codes' => self::newRecoveryCodes((int)$u['id'])]);
    }

    /** Completes sign-in for a session that is waiting on its second factor. */
    public static function twoFactorVerify(array $in): never
    {
        $s = Session::current();
        if ($s === null || $s['mfa_ok']) {
            respond(401, ['error' => 'Your sign-in expired. Please start again.']);
        }
        $u = $s['user'];
        if (!RateLimit::hit('2fa:' . $u['id'], 8, 600)) {
            respond(429, ['error' => 'Too many attempts. Try again in a few minutes.']);
        }
        if (!self::checkSecondFactor($u, self::str($in, 'code', 20))) {
            respond(422, ['error' => 'That code is not right']);
        }
        Session::promote($s['hash']);
        respond(200, ['status' => 'ok']);
    }

    /** Accepts a TOTP code (with replay protection) or a single-use recovery code. */
    private static function checkSecondFactor(array $u, string $code): bool
    {
        if (empty($u['totp_secret'])) {
            return false;
        }
        $step = Totp::verify($u['totp_secret'], $code, (int)$u['totp_last_step']);
        if ($step !== null) {
            return Db::run('UPDATE users SET totp_last_step = ? WHERE id = ? AND totp_last_step < ?', [$step, $u['id'], $step]) === 1;
        }
        $norm = strtolower(preg_replace('/[^a-z0-9]/i', '', $code) ?? '');
        if (strlen($norm) === 10) {
            return Db::run(
                'UPDATE recovery_codes SET used = 1 WHERE user_id = ? AND code_hash = ? AND used = 0',
                [$u['id'], hash('sha256', $norm)]
            ) === 1;
        }
        return false;
    }

    /** @return string[] */
    private static function newRecoveryCodes(int $userId): array
    {
        Db::run('DELETE FROM recovery_codes WHERE user_id = ?', [$userId]);
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $raw = strtolower(substr(bin2hex(random_bytes(6)), 0, 10));
            Db::run('INSERT INTO recovery_codes (user_id, code_hash) VALUES (?,?)', [$userId, hash('sha256', $raw)]);
            $codes[] = substr($raw, 0, 5) . '-' . substr($raw, 5);
        }
        return $codes;
    }

    // ---------- passkeys ----------

    public static function passkeyList(): never
    {
        $u = Session::requireUser();
        respond(200, ['passkeys' => Db::all(
            'SELECT id, name, created_at, last_used_at FROM passkeys WHERE user_id = ? ORDER BY id DESC',
            [$u['id']]
        )]);
    }

    public static function passkeyDelete(int $id): never
    {
        $u = Session::requireUser();
        Db::run('DELETE FROM passkeys WHERE id = ? AND user_id = ?', [$id, $u['id']]);
        respond(200, ['ok' => true]);
    }

    public static function passkeyRegisterOptions(): never
    {
        $u = Session::requireUser();
        [$id, $challenge] = WebAuthn::newChallenge('register', (int)$u['id']);
        $exclude = array_map(
            fn ($p) => ['type' => 'public-key', 'id' => $p['credential_id']],
            Db::all('SELECT credential_id FROM passkeys WHERE user_id = ?', [$u['id']])
        );
        respond(200, [
            'challengeId' => $id,
            'publicKey' => [
                'challenge' => $challenge,
                'rp' => ['name' => 'SwapS.ng', 'id' => Env::rpId()],
                'user' => ['id' => WebAuthn::b64e('u' . $u['id']), 'name' => $u['email'], 'displayName' => $u['name'] ?: $u['email']],
                'pubKeyCredParams' => [['type' => 'public-key', 'alg' => -7], ['type' => 'public-key', 'alg' => -257]],
                'authenticatorSelection' => ['residentKey' => 'required', 'userVerification' => 'preferred'],
                'attestation' => 'none',
                'excludeCredentials' => $exclude,
                'timeout' => 60000,
            ],
        ]);
    }

    public static function passkeyRegisterVerify(array $in): never
    {
        $u = Session::requireUser();
        $ch = WebAuthn::takeChallenge(self::str($in, 'challengeId', 64), 'register');
        if ($ch === null || (int)$ch['user_id'] !== (int)$u['id']) {
            respond(400, ['error' => 'This request expired. Please try again.']);
        }
        $r = $in['credential']['response'] ?? [];
        try {
            $key = WebAuthn::verifyRegistration(
                WebAuthn::b64d((string)($r['clientDataJSON'] ?? '')),
                WebAuthn::b64d((string)($r['attestationObject'] ?? '')),
                $ch['challenge']
            );
        } catch (Throwable $e) {
            respond(422, ['error' => 'Could not verify your passkey: ' . $e->getMessage()]);
        }
        $name = self::str($in, 'name', 60) ?: 'Passkey';
        try {
            Db::run(
                'INSERT INTO passkeys (user_id, credential_id, public_key, sign_count, name, created_at) VALUES (?,?,?,?,?,?)',
                [$u['id'], $key['credential_id'], $key['public_key'], $key['sign_count'], $name, self::now()]
            );
        } catch (PDOException) {
            respond(409, ['error' => 'This passkey is already registered']);
        }
        respond(200, ['ok' => true]);
    }

    public static function passkeyLoginOptions(): never
    {
        if (!RateLimit::hit('passkey-opts:' . RateLimit::ip(), 40, 900)) {
            respond(429, ['error' => 'Too many attempts']);
        }
        [$id, $challenge] = WebAuthn::newChallenge('login', null);
        respond(200, [
            'challengeId' => $id,
            'publicKey' => [
                'challenge' => $challenge,
                'rpId' => Env::rpId(),
                'userVerification' => 'preferred',
                'timeout' => 60000,
            ],
        ]);
    }

    public static function passkeyLoginVerify(array $in): never
    {
        $ch = WebAuthn::takeChallenge(self::str($in, 'challengeId', 64), 'login');
        if ($ch === null) {
            respond(400, ['error' => 'This request expired. Please try again.']);
        }
        $cred = $in['credential'] ?? [];
        $r = $cred['response'] ?? [];
        $pk = Db::one('SELECT * FROM passkeys WHERE credential_id = ?', [self::str($cred, 'id', 512)]);
        if ($pk === null) {
            respond(422, ['error' => 'We don\'t recognise this passkey']);
        }
        try {
            $count = WebAuthn::verifyAssertion(
                $pk,
                WebAuthn::b64d((string)($r['clientDataJSON'] ?? '')),
                WebAuthn::b64d((string)($r['authenticatorData'] ?? '')),
                WebAuthn::b64d((string)($r['signature'] ?? '')),
                $ch['challenge']
            );
        } catch (Throwable $e) {
            respond(422, ['error' => 'Passkey sign-in failed: ' . $e->getMessage()]);
        }
        Db::run('UPDATE passkeys SET sign_count = ?, last_used_at = ? WHERE id = ?', [$count, self::now(), $pk['id']]);
        $user = Db::one('SELECT * FROM users WHERE id = ?', [$pk['user_id']]);
        // a passkey is already phishing-resistant multi-factor, so it skips the authenticator step
        self::signIn($user, true);
        respond(200, ['status' => 'ok']);
    }
}
