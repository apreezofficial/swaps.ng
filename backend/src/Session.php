<?php
declare(strict_types=1);

final class Session
{
    private const COOKIE = 'swp_session';
    private const TTL = 60 * 60 * 24 * 30;

    private static ?array $cache = null;
    private static bool $loaded = false;

    public static function start(int $userId, bool $mfaOk): void
    {
        $token = bin2hex(random_bytes(32));
        Db::run(
            'INSERT INTO sessions (id_hash, user_id, mfa_ok, expires_at, created_at) VALUES (?,?,?,?,?)',
            [hash('sha256', $token), $userId, $mfaOk ? 1 : 0, time() + self::TTL, time()]
        );
        // MFA-pending sessions are short lived
        if (!$mfaOk) {
            Db::run('UPDATE sessions SET expires_at = ? WHERE id_hash = ?', [time() + 600, hash('sha256', $token)]);
        }
        self::setCookie($token, time() + self::TTL);
        self::$loaded = false;
    }

    /** @return array{user:array,mfa_ok:bool,hash:string}|null */
    public static function current(): ?array
    {
        if (self::$loaded) {
            return self::$cache;
        }
        self::$loaded = true;
        self::$cache = null;
        $token = $_COOKIE[self::COOKIE] ?? '';
        if (!is_string($token) || $token === '') {
            return null;
        }
        $h = hash('sha256', $token);
        $row = Db::one(
            'SELECT s.mfa_ok, u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id_hash = ? AND s.expires_at > ?',
            [$h, time()]
        );
        if ($row === null) {
            return null;
        }
        $mfa = (bool)$row['mfa_ok'];
        unset($row['mfa_ok']);
        return self::$cache = ['user' => $row, 'mfa_ok' => $mfa, 'hash' => $h];
    }

    /** Full session (MFA satisfied) or 401. */
    public static function requireUser(): array
    {
        $s = self::current();
        if ($s === null || !$s['mfa_ok']) {
            respond(401, ['error' => 'Not signed in']);
        }
        return $s['user'];
    }

    public static function promote(string $hash): void
    {
        Db::run('UPDATE sessions SET mfa_ok = 1, expires_at = ? WHERE id_hash = ?', [time() + self::TTL, $hash]);
        // re-issue cookie lifetime is not possible without the raw token; cookie keeps its original expiry (30d)
        self::$loaded = false;
    }

    public static function destroy(): void
    {
        $token = $_COOKIE[self::COOKIE] ?? '';
        if (is_string($token) && $token !== '') {
            Db::run('DELETE FROM sessions WHERE id_hash = ?', [hash('sha256', $token)]);
        }
        self::setCookie('', time() - 3600);
        self::$loaded = false;
    }

    private static function setCookie(string $value, int $expires): void
    {
        setcookie(self::COOKIE, $value, [
            'expires' => $expires,
            'path' => '/',
            'secure' => Env::secure(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    public static function publicUser(array $u): array
    {
        return [
            'id' => (int)$u['id'],
            'email' => $u['email'],
            'name' => $u['name'],
            'totp_enabled' => (bool)$u['totp_enabled'],
            'google_linked' => !empty($u['google_sub']),
            'passkeys' => (int)(Db::one('SELECT COUNT(*) n FROM passkeys WHERE user_id = ?', [$u['id']])['n'] ?? 0),
        ];
    }
}
