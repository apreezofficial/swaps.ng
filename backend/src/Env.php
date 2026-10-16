<?php
declare(strict_types=1);

final class Env
{
    private static ?array $vars = null;

    public static function get(string $key, string $default = ''): string
    {
        if (self::$vars === null) {
            self::$vars = [];
            $file = __DIR__ . '/../.env';
            if (is_file($file)) {
                foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    $line = trim($line);
                    if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                        continue;
                    }
                    [$k, $v] = explode('=', $line, 2);
                    self::$vars[trim($k)] = trim(trim($v), "\"'");
                }
            }
        }
        $v = self::$vars[$key] ?? getenv($key);
        return ($v === false || $v === null || $v === '') ? $default : (string)$v;
    }

    public static function appUrl(): string
    {
        return rtrim(self::get('APP_URL', 'http://localhost:3100'), '/');
    }

    /** WebAuthn relying-party id = host of the site */
    public static function rpId(): string
    {
        return (string)parse_url(self::appUrl(), PHP_URL_HOST);
    }

    public static function isProd(): bool
    {
        return self::get('APP_ENV', 'development') === 'production';
    }

    public static function secure(): bool
    {
        return str_starts_with(self::appUrl(), 'https://');
    }
}
