<?php
declare(strict_types=1);

final class RateLimit
{
    /** Records an attempt; returns false when the bucket is over its limit. */
    public static function hit(string $bucket, int $max, int $windowSeconds): bool
    {
        $now = time();
        Db::run('DELETE FROM attempts WHERE at < ?', [$now - 86400]);
        $row = Db::one('SELECT COUNT(*) AS n FROM attempts WHERE bucket = ? AND at > ?', [$bucket, $now - $windowSeconds]);
        if ((int)$row['n'] >= $max) {
            return false;
        }
        Db::run('INSERT INTO attempts (bucket, at) VALUES (?, ?)', [$bucket, $now]);
        return true;
    }

    public static function ip(): string
    {
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
}
