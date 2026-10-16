<?php
declare(strict_types=1);

final class Waitlist
{
    private const FILE = __DIR__ . '/../storage/waitlist.json';

    /** @return bool true if newly added, false if already present */
    public static function add(string $email, string $name, string $interest): bool
    {
        $fp = fopen(self::FILE, 'c+');
        if ($fp === false || !flock($fp, LOCK_EX)) {
            throw new RuntimeException('storage unavailable');
        }
        $rows = json_decode(stream_get_contents($fp) ?: '[]', true) ?: [];
        foreach ($rows as $r) {
            if (strcasecmp($r['email'], $email) === 0) {
                flock($fp, LOCK_UN);
                fclose($fp);
                return false;
            }
        }
        $rows[] = ['email' => $email, 'name' => $name, 'interest' => $interest, 'at' => gmdate('c')];
        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($rows, JSON_PRETTY_PRINT));
        fflush($fp);
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }
}
