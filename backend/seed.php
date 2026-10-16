<?php
declare(strict_types=1);

/**
 * Local demo data.   php seed.php          create/refresh demo accounts
 *                    php seed.php --code   print the current 2FA code for the 2FA demo account
 * Refuses to run in production.
 */
foreach (['Env', 'Db', 'Totp'] as $c) {
    require __DIR__ . "/src/$c.php";
}

if (Env::isProd()) {
    fwrite(STDERR, "Refusing to seed demo data when APP_ENV=production\n");
    exit(1);
}

const DEMO = ['email' => 'demo@swaps.ng', 'name' => 'Demo User'];
const DEMO_2FA = ['email' => 'demo2fa@swaps.ng', 'name' => 'Demo 2FA User', 'secret' => 'DEMOSWAPS2FASECRETKEY', 'recovery' => ['demo1-swap1', 'demo2-swap2']];

if (in_array('--code', $argv, true)) {
    echo Totp::code(DEMO_2FA['secret'], intdiv(time(), 30)), "\n";
    exit(0);
}

function upsert(array $u, ?string $secret = null): int
{
    Db::run('INSERT OR IGNORE INTO users (email, name, created_at) VALUES (?,?,?)', [$u['email'], $u['name'], gmdate('c')]);
    $id = (int)Db::one('SELECT id FROM users WHERE email = ?', [$u['email']])['id'];
    Db::run('UPDATE users SET name = ?, totp_secret = ?, totp_enabled = ?, totp_last_step = 0 WHERE id = ?', [$u['name'], $secret, $secret ? 1 : 0, $id]);
    Db::run('DELETE FROM recovery_codes WHERE user_id = ?', [$id]);
    return $id;
}

upsert(DEMO);
$id2 = upsert(DEMO_2FA, DEMO_2FA['secret']);
foreach (DEMO_2FA['recovery'] as $code) {
    Db::run('INSERT INTO recovery_codes (user_id, code_hash) VALUES (?,?)', [$id2, hash('sha256', strtolower(preg_replace('/[^a-z0-9]/i', '', $code)))]);
}

echo "Demo accounts ready:\n";
echo "  " . DEMO['email'] . "      (no 2FA)\n";
echo "  " . DEMO_2FA['email'] . "   (2FA on, secret " . DEMO_2FA['secret'] . ", recovery codes " . implode(', ', DEMO_2FA['recovery']) . ")\n";
echo "Sign in at /login, then use the \"Open the link\" dev button. Current 2FA code: php seed.php --code\n";
