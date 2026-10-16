<?php
declare(strict_types=1);

/** Minimal CBOR decoder — enough for WebAuthn attestation objects and COSE keys. */
final class Cbor
{
    /** @return array{0:mixed,1:int} [value, next offset] */
    public static function decode(string $d, int $o = 0): array
    {
        if ($o >= strlen($d)) {
            throw new RuntimeException('CBOR: unexpected end');
        }
        $b = ord($d[$o++]);
        $major = $b >> 5;
        $info = $b & 0x1f;

        if ($major === 7) {
            return match ($info) {
                20 => [false, $o],
                21 => [true, $o],
                22, 23 => [null, $o],
                default => throw new RuntimeException('CBOR: unsupported simple/float'),
            };
        }

        $len = self::length($d, $o, $info);

        switch ($major) {
            case 0:
                return [$len, $o];
            case 1:
                return [-1 - $len, $o];
            case 2:
            case 3:
                if ($o + $len > strlen($d)) {
                    throw new RuntimeException('CBOR: truncated string');
                }
                return [substr($d, $o, $len), $o + $len];
            case 4:
                $arr = [];
                for ($i = 0; $i < $len; $i++) {
                    [$arr[], $o] = self::decode($d, $o);
                }
                return [$arr, $o];
            case 5:
                $map = [];
                for ($i = 0; $i < $len; $i++) {
                    [$k, $o] = self::decode($d, $o);
                    [$v, $o] = self::decode($d, $o);
                    $map[$k] = $v;
                }
                return [$map, $o];
            case 6:
                return self::decode($d, $o); // ignore tag
        }
        throw new RuntimeException('CBOR: bad major type');
    }

    private static function length(string $d, int &$o, int $info): int
    {
        if ($info < 24) {
            return $info;
        }
        $n = match ($info) { 24 => 1, 25 => 2, 26 => 4, 27 => 8, default => throw new RuntimeException('CBOR: indefinite length unsupported') };
        if ($o + $n > strlen($d)) {
            throw new RuntimeException('CBOR: truncated length');
        }
        $v = 0;
        for ($i = 0; $i < $n; $i++) {
            $v = ($v << 8) | ord($d[$o + $i]);
        }
        $o += $n;
        return $v;
    }
}
