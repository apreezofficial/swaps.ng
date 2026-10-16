<?php
declare(strict_types=1);

final class Google
{
    private const STATE_COOKIE = 'swp_oauth';

    public static function configured(): bool
    {
        return Env::get('GOOGLE_CLIENT_ID') !== '' && Env::get('GOOGLE_CLIENT_SECRET') !== '';
    }

    public static function redirectUri(): string
    {
        return Env::appUrl() . '/api/auth/google/callback';
    }

    public static function authUrl(): string
    {
        $state = bin2hex(random_bytes(16));
        setcookie(self::STATE_COOKIE, $state, [
            'expires' => time() + 600, 'path' => '/', 'secure' => Env::secure(), 'httponly' => true, 'samesite' => 'Lax',
        ]);
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => Env::get('GOOGLE_CLIENT_ID'),
            'redirect_uri' => self::redirectUri(),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'prompt' => 'select_account',
        ]);
    }

    /** @return array{sub:string,email:string,name:string}|null */
    public static function exchange(string $code, string $state): ?array
    {
        $expected = $_COOKIE[self::STATE_COOKIE] ?? '';
        setcookie(self::STATE_COOKIE, '', ['expires' => time() - 3600, 'path' => '/']);
        if ($expected === '' || !hash_equals((string)$expected, $state)) {
            return null;
        }
        $ch = curl_init('https://oauth2.googleapis.com/token');
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_POSTFIELDS => http_build_query([
                'code' => $code,
                'client_id' => Env::get('GOOGLE_CLIENT_ID'),
                'client_secret' => Env::get('GOOGLE_CLIENT_SECRET'),
                'redirect_uri' => self::redirectUri(),
                'grant_type' => 'authorization_code',
            ]),
        ]);
        $res = curl_exec($ch);
        curl_close($ch);
        $tok = is_string($res) ? json_decode($res, true) : null;
        $idToken = is_array($tok) ? ($tok['id_token'] ?? '') : '';
        $parts = explode('.', (string)$idToken);
        if (count($parts) !== 3) {
            return null;
        }
        // Token came straight from Google's token endpoint over TLS, so the signature check is optional;
        // we still validate audience, issuer, expiry and email verification.
        $claims = json_decode(WebAuthn::b64d($parts[1]), true);
        if (!is_array($claims)
            || ($claims['aud'] ?? '') !== Env::get('GOOGLE_CLIENT_ID')
            || !in_array($claims['iss'] ?? '', ['https://accounts.google.com', 'accounts.google.com'], true)
            || ($claims['exp'] ?? 0) < time()
            || empty($claims['email_verified'])
            || empty($claims['email'])
            || empty($claims['sub'])
        ) {
            return null;
        }
        return ['sub' => (string)$claims['sub'], 'email' => strtolower((string)$claims['email']), 'name' => (string)($claims['name'] ?? '')];
    }
}
