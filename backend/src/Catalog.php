<?php
declare(strict_types=1);

final class Catalog
{
    public const SWAP_FEE = 1000;

    public const CATEGORIES = [
        'cars'      => ['label' => 'Cars',          'delivery' => 25000],
        'phones'    => ['label' => 'Phones',        'delivery' => 2000],
        'tv'        => ['label' => 'Televisions',   'delivery' => 6000],
        'fridge'    => ['label' => 'Refrigerators', 'delivery' => 8000],
        'computers' => ['label' => 'Computers',     'delivery' => 3000],
        'furniture' => ['label' => 'Furniture',     'delivery' => 10000],
    ];

    public const PRODUCTS = [
        'cars' => [
            'camry12' => ['Toyota Camry 2012', 6500000],
            'accord10' => ['Honda Accord 2010', 4800000],
            'rx350' => ['Lexus RX350 2011', 9200000],
        ],
        'phones' => [
            'ip15p' => ['iPhone 15 Pro 256GB', 1450000],
            'ip13' => ['iPhone 13 128GB', 650000],
            's23u' => ['Samsung S23 Ultra', 1100000],
            'camon20' => ['Tecno Camon 20', 190000],
        ],
        'tv' => [
            'sam55' => ['Samsung 55" 4K Smart', 520000],
            'lg43' => ['LG 43" Smart TV', 280000],
            'his65' => ['Hisense 65" ULED', 780000],
        ],
        'fridge' => [
            'lgdd' => ['LG Double Door', 650000],
            'his200' => ['Hisense 200L', 260000],
            'samsbs' => ['Samsung Side-by-Side', 1350000],
        ],
        'computers' => [
            'mba' => ['MacBook Air M2', 1300000],
            'elite' => ['HP EliteBook 450', 450000],
            'xps' => ['Dell XPS 13', 950000],
        ],
        'furniture' => [
            'lsofa' => ['L-shape Sofa', 480000],
            'dining' => ['6-seater Dining Set', 620000],
            'bed' => ['King Bed + Mattress', 750000],
        ],
    ];

    public const CONDITIONS = ['like_new' => 1.0, 'good' => 0.85, 'fair' => 0.7];

    public static function all(): array
    {
        $out = [];
        foreach (self::CATEGORIES as $id => $c) {
            $items = [];
            foreach (self::PRODUCTS[$id] as $pid => [$name, $price]) {
                $items[] = ['id' => $pid, 'name' => $name, 'price' => $price];
            }
            $out[] = ['id' => $id, 'label' => $c['label'], 'delivery_fee' => $c['delivery'], 'products' => $items];
        }
        return ['swap_fee' => self::SWAP_FEE, 'categories' => $out];
    }
}
