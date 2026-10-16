export const SWAP_FEE = 1000;

export const CATEGORIES = [
  { id: 'cars', label: 'Cars', blurb: 'Sedans, SUVs & more', delivery: 25000 },
  { id: 'phones', label: 'Phones', blurb: 'iPhone, Samsung, Tecno', delivery: 2000 },
  { id: 'tv', label: 'Televisions', blurb: 'Smart & 4K screens', delivery: 6000 },
  { id: 'fridge', label: 'Refrigerators', blurb: 'Single, double & SBS', delivery: 8000 },
  { id: 'computers', label: 'Computers', blurb: 'Laptops & desktops', delivery: 3000 },
  { id: 'furniture', label: 'Furniture', blurb: 'Sofas, beds & dining', delivery: 10000 },
];

export const PRODUCTS = {
  cars: [
    { id: 'camry12', name: 'Toyota Camry 2012', price: 6500000 },
    { id: 'accord10', name: 'Honda Accord 2010', price: 4800000 },
    { id: 'rx350', name: 'Lexus RX350 2011', price: 9200000 },
  ],
  phones: [
    { id: 'ip15p', name: 'iPhone 15 Pro 256GB', price: 1450000 },
    { id: 'ip13', name: 'iPhone 13 128GB', price: 650000 },
    { id: 's23u', name: 'Samsung S23 Ultra', price: 1100000 },
    { id: 'camon20', name: 'Tecno Camon 20', price: 190000 },
  ],
  tv: [
    { id: 'sam55', name: 'Samsung 55" 4K Smart', price: 520000 },
    { id: 'lg43', name: 'LG 43" Smart TV', price: 280000 },
    { id: 'his65', name: 'Hisense 65" ULED', price: 780000 },
  ],
  fridge: [
    { id: 'lgdd', name: 'LG Double Door', price: 650000 },
    { id: 'his200', name: 'Hisense 200L', price: 260000 },
    { id: 'samsbs', name: 'Samsung Side-by-Side', price: 1350000 },
  ],
  computers: [
    { id: 'mba', name: 'MacBook Air M2', price: 1300000 },
    { id: 'elite', name: 'HP EliteBook 450', price: 450000 },
    { id: 'xps', name: 'Dell XPS 13', price: 950000 },
  ],
  furniture: [
    { id: 'lsofa', name: 'L-shape Sofa', price: 480000 },
    { id: 'dining', name: '6-seater Dining Set', price: 620000 },
    { id: 'bed', name: 'King Bed + Mattress', price: 750000 },
  ],
};

export const CONDITIONS = [
  { id: 'like_new', label: 'Like new', factor: 1 },
  { id: 'good', label: 'Good', factor: 0.85 },
  { id: 'fair', label: 'Fair', factor: 0.7 },
];

// Mirrors backend/src/Quote.php — used as an offline fallback.
export function computeQuote({ targetCategory, targetId, yourCategory, yourId, condition }) {
  const target = PRODUCTS[targetCategory]?.find((p) => p.id === targetId);
  const mine = PRODUCTS[yourCategory]?.find((p) => p.id === yourId);
  const cond = CONDITIONS.find((c) => c.id === condition);
  const cat = CATEGORIES.find((c) => c.id === targetCategory);
  if (!target || !mine || !cond || !cat) return null;
  const yourValue = Math.round(mine.price * cond.factor);
  const diff = target.price - yourValue;
  const delivery = cat.delivery;
  return {
    target_price: target.price,
    your_value: yourValue,
    difference: diff,
    swap_fee: SWAP_FEE,
    delivery_fee: delivery,
    you_pay: diff > 0 ? diff + SWAP_FEE + delivery : 0,
    you_receive: diff < 0 ? Math.max(-diff - SWAP_FEE - delivery, 0) : 0,
  };
}

export const naira = (n) =>
  '₦' + new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(n);

// Same-origin: Next.js proxies /api/* to the PHP backend (see next.config.mjs).
export const API = process.env.NEXT_PUBLIC_API_URL || '';
