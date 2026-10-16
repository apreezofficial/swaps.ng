<?php
declare(strict_types=1);

final class Quote
{
    /** @return array<string,int>|null null when any input is unknown */
    public static function compute(array $in): ?array
    {
        $tc = (string)($in['targetCategory'] ?? '');
        $tid = (string)($in['targetId'] ?? '');
        $yc = (string)($in['yourCategory'] ?? '');
        $yid = (string)($in['yourId'] ?? '');
        $cond = (string)($in['condition'] ?? '');

        $target = Catalog::PRODUCTS[$tc][$tid] ?? null;
        $mine = Catalog::PRODUCTS[$yc][$yid] ?? null;
        $factor = Catalog::CONDITIONS[$cond] ?? null;
        $delivery = Catalog::CATEGORIES[$tc]['delivery'] ?? null;
        if ($target === null || $mine === null || $factor === null || $delivery === null) {
            return null;
        }

        $yourValue = (int)round($mine[1] * $factor);
        $diff = $target[1] - $yourValue;
        $fee = Catalog::SWAP_FEE;

        return [
            'target_price' => $target[1],
            'your_value'   => $yourValue,
            'difference'   => $diff,
            'swap_fee'     => $fee,
            'delivery_fee' => $delivery,
            'you_pay'      => $diff > 0 ? $diff + $fee + $delivery : 0,
            'you_receive'  => $diff < 0 ? max(-$diff - $fee - $delivery, 0) : 0,
        ];
    }
}
