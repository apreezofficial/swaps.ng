<?php
declare(strict_types=1);

foreach (['Env', 'Db', 'RateLimit', 'Mailer', 'Session', 'Totp', 'Cbor', 'WebAuthn', 'Google', 'AuthController', 'Catalog', 'Quote', 'Waitlist'] as $c) {
    require __DIR__ . "/../src/$c.php";
}

$origin = Env::get('ALLOWED_ORIGIN', Env::appUrl());
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $code, array $body): never
{
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/', '/') ?: '/';

if ($method === 'OPTIONS') {
    respond(204, []);
}

$input = [];
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input') ?: '[]', true);
    if (!is_array($input)) {
        respond(400, ['error' => 'Invalid JSON body']);
    }
}

try {
    switch (true) {
        case $method === 'GET' && $path === '/api/health':
            respond(200, ['status' => 'ok']);

        case $method === 'GET' && $path === '/api/catalog':
            respond(200, Catalog::all());

        case $method === 'POST' && $path === '/api/quote':
            $q = Quote::compute($input);
            $q === null ? respond(422, ['error' => 'Unknown product, category or condition']) : respond(200, $q);

        case $method === 'POST' && $path === '/api/waitlist':
            $email = trim((string)($input['email'] ?? ''));
            $name = mb_substr(trim((string)($input['name'] ?? '')), 0, 100);
            $interest = mb_substr(trim((string)($input['interest'] ?? '')), 0, 50);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                respond(422, ['error' => 'Please enter a valid email address']);
            }
            try {
                $new = Waitlist::add($email, $name, $interest);
            } catch (Throwable) {
                respond(500, ['error' => 'Could not save right now, try again']);
            }
            respond($new ? 201 : 200, ['ok' => true, 'already' => !$new]);

        // ---- auth ----
        case $method === 'GET' && $path === '/api/auth/me':
            AuthController::me();
        case $method === 'POST' && $path === '/api/auth/logout':
            AuthController::logout();
        case $method === 'GET' && $path === '/api/auth/providers':
            AuthController::providers();

        case $method === 'POST' && $path === '/api/auth/magic/request':
            AuthController::magicRequest($input);
        case $method === 'POST' && $path === '/api/auth/magic/verify':
            AuthController::magicVerify($input);

        case $method === 'GET' && $path === '/api/auth/google/start':
            AuthController::googleStart();
        case $method === 'GET' && $path === '/api/auth/google/callback':
            AuthController::googleCallback();

        case $method === 'POST' && $path === '/api/auth/2fa/verify':
            AuthController::twoFactorVerify($input);
        case $method === 'POST' && $path === '/api/auth/totp/setup':
            AuthController::totpSetup();
        case $method === 'POST' && $path === '/api/auth/totp/enable':
            AuthController::totpEnable($input);
        case $method === 'POST' && $path === '/api/auth/totp/disable':
            AuthController::totpDisable($input);
        case $method === 'POST' && $path === '/api/auth/recovery/regenerate':
            AuthController::recoveryRegenerate($input);

        case $method === 'GET' && $path === '/api/auth/passkeys':
            AuthController::passkeyList();
        case $method === 'DELETE' && preg_match('#^/api/auth/passkeys/(\d+)$#', $path, $m) === 1:
            AuthController::passkeyDelete((int)$m[1]);
        case $method === 'POST' && $path === '/api/auth/passkey/register/options':
            AuthController::passkeyRegisterOptions();
        case $method === 'POST' && $path === '/api/auth/passkey/register/verify':
            AuthController::passkeyRegisterVerify($input);
        case $method === 'POST' && $path === '/api/auth/passkey/login/options':
            AuthController::passkeyLoginOptions();
        case $method === 'POST' && $path === '/api/auth/passkey/login/verify':
            AuthController::passkeyLoginVerify($input);

        default:
            respond(404, ['error' => 'Not found']);
    }
} catch (Throwable $e) {
    error_log($e);
    respond(500, ['error' => Env::isProd() ? 'Something went wrong' : $e->getMessage()]);
}
