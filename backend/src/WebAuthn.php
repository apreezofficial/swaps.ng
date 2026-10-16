<?php
declare(strict_types=1);

/** WebAuthn relying party (attestation "none", ES256 + RS256 keys). */
final class WebAuthn
{
    public static function b64e(string $bin): string
    {
        return rtrim(strtr(base64_encode($bin), '+/', '-_'), '=');
    }

    public static function b64d(string $s): string
    {
        $r = base64_decode(strtr($s, '-_', '+/') . str_repeat('=', (4 - strlen($s) % 4) % 4), true);
        if ($r === false) {
            throw new RuntimeException('Invalid base64url');
        }
        return $r;
    }

    public static function origin(): string
    {
        $p = parse_url(Env::appUrl());
        return $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '');
    }

    public static function newChallenge(string $kind, ?int $userId): array
    {
        Db::run('DELETE FROM challenges WHERE expires_at < ?', [time()]);
        $id = bin2hex(random_bytes(16));
        $challenge = random_bytes(32);
        Db::run(
            'INSERT INTO challenges (id, kind, user_id, challenge, expires_at) VALUES (?,?,?,?,?)',
            [$id, $kind, $userId, self::b64e($challenge), time() + 300]
        );
        return [$id, self::b64e($challenge)];
    }

    /** Single-use challenge lookup. */
    public static function takeChallenge(string $id, string $kind): ?array
    {
        $row = Db::one('SELECT * FROM challenges WHERE id = ? AND kind = ? AND expires_at > ?', [$id, $kind, time()]);
        if ($row === null) {
            return null;
        }
        Db::run('DELETE FROM challenges WHERE id = ?', [$id]);
        return $row;
    }

    private static function checkClientData(string $json, string $type, string $challenge): void
    {
        $c = json_decode($json, true);
        if (!is_array($c)
            || ($c['type'] ?? '') !== $type
            || !hash_equals($challenge, (string)($c['challenge'] ?? ''))
            || ($c['origin'] ?? '') !== self::origin()
        ) {
            throw new RuntimeException('Passkey response did not match this request');
        }
    }

    /** @return array{credential_id:string,public_key:string,sign_count:int} */
    public static function verifyRegistration(string $clientDataJSON, string $attestationObject, string $challenge): array
    {
        self::checkClientData($clientDataJSON, 'webauthn.create', $challenge);

        [$att] = Cbor::decode($attestationObject);
        $auth = $att['authData'] ?? null;
        if (!is_string($auth) || strlen($auth) < 55) {
            throw new RuntimeException('Bad attestation');
        }
        if (!hash_equals(hash('sha256', Env::rpId(), true), substr($auth, 0, 32))) {
            throw new RuntimeException('Relying party mismatch');
        }
        $flags = ord($auth[32]);
        if (!($flags & 0x01) || !($flags & 0x40)) {
            throw new RuntimeException('User presence or credential data missing');
        }
        $signCount = unpack('N', substr($auth, 33, 4))[1];
        $idLen = unpack('n', substr($auth, 53, 2))[1];
        $credId = substr($auth, 55, $idLen);
        [$cose] = Cbor::decode($auth, 55 + $idLen);

        return [
            'credential_id' => self::b64e($credId),
            'public_key' => self::coseToPem($cose),
            'sign_count' => (int)$signCount,
        ];
    }

    /** Returns the new sign count. Throws on any failure. */
    public static function verifyAssertion(array $passkey, string $clientDataJSON, string $authData, string $signature, string $challenge): int
    {
        self::checkClientData($clientDataJSON, 'webauthn.get', $challenge);
        if (strlen($authData) < 37 || !hash_equals(hash('sha256', Env::rpId(), true), substr($authData, 0, 32))) {
            throw new RuntimeException('Relying party mismatch');
        }
        if (!(ord($authData[32]) & 0x01)) {
            throw new RuntimeException('User presence missing');
        }
        $signed = $authData . hash('sha256', $clientDataJSON, true);
        if (openssl_verify($signed, $signature, $passkey['public_key'], OPENSSL_ALGO_SHA256) !== 1) {
            throw new RuntimeException('Invalid passkey signature');
        }
        $count = (int)unpack('N', substr($authData, 33, 4))[1];
        $stored = (int)$passkey['sign_count'];
        if (($count > 0 || $stored > 0) && $count <= $stored) {
            throw new RuntimeException('Passkey counter went backwards (possible cloned authenticator)');
        }
        return $count;
    }

    private static function coseToPem(array $k): string
    {
        $kty = $k[1] ?? null;
        if ($kty === 2 && ($k[-1] ?? null) === 1 && isset($k[-2], $k[-3])) { // EC2 P-256 (ES256)
            $point = "\x04" . str_pad($k[-2], 32, "\0", STR_PAD_LEFT) . str_pad($k[-3], 32, "\0", STR_PAD_LEFT);
            $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200') . $point;
            return self::pem($der);
        }
        if ($kty === 3 && isset($k[-1], $k[-2])) { // RSA (RS256)
            $rsa = self::der(0x30, self::derInt($k[-1]) . self::derInt($k[-2]));
            $alg = hex2bin('300d06092a864886f70d0101010500');
            $bits = self::der(0x03, "\0" . $rsa);
            return self::pem(self::der(0x30, $alg . $bits));
        }
        throw new RuntimeException('Unsupported passkey algorithm');
    }

    private static function pem(string $der): string
    {
        return "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END PUBLIC KEY-----\n";
    }

    private static function derLen(int $n): string
    {
        if ($n < 128) {
            return chr($n);
        }
        $b = ltrim(pack('N', $n), "\0");
        return chr(0x80 | strlen($b)) . $b;
    }

    private static function der(int $tag, string $body): string
    {
        return chr($tag) . self::derLen(strlen($body)) . $body;
    }

    private static function derInt(string $bin): string
    {
        $bin = ltrim($bin, "\0");
        if ($bin === '' || (ord($bin[0]) & 0x80)) {
            $bin = "\0" . $bin;
        }
        return self::der(0x02, $bin);
    }
}
