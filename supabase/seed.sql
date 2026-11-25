-- ==============================================================================
-- VELORA E-COMMERCE SEED DATA
-- Run after supabase/schema.sql in Supabase SQL Editor.
-- ==============================================================================

insert into public.categories (name, slug, description, image_url, display_order)
values
  ('Audio & Acoustics', 'audio-acoustics', 'Studio-grade wireless headphones, room-filling speakers, and analog hi-fi.', '/images/prod-headphones.jpg', 1),
  ('Workspace & Tech', 'workspace-tech', 'Tactile mechanical keyboards, precision lighting, and walnut desk docks.', '/images/prod-keyboard.jpg', 2),
  ('Home & Kitchen', 'home-kitchen', 'Architectural lighting, stoneware ceramics, and precision brew gear.', '/images/prod-kettle.jpg', 3),
  ('Everyday Carry', 'everyday-carry', 'Waxed canvas packs, protective wool sleeves, and minimalist timepieces.', '/images/prod-backpack.svg', 4)
on conflict (slug) do nothing;

insert into public.products (
  category_id, name, slug, sku, description, price, compare_at_price, discount_percent,
  stock_quantity, image_url, gallery_urls, specs, rating_average, review_count, popularity_score, is_featured
)
values
  (
    (select id from public.categories where slug = 'audio-acoustics'),
    'Aether Studio ANC Headphones',
    'aether-studio-anc-headphones',
    'VLR-AUD-101',
    'Precision-tuned 40mm planar drivers wrapped in machined aluminum yokes and memory-foam lambskin cushions. Features adaptive hybrid noise cancellation, 45-hour battery life, and multipoint Bluetooth 5.4.',
    299.00, 349.00, 15, 28,
    '/images/prod-headphones.jpg',
    array['/images/prod-headphones.jpg', '/images/hero-lifestyle.jpg'],
    '{"Drivers":"40mm Custom Planar","Battery":"45 Hours (ANC On)","Connectivity":"Bluetooth 5.4 / USB-C Lossless","Weight":"268g"}'::jsonb,
    4.8, 3, 98, true
  ),
  (
    (select id from public.categories where slug = 'audio-acoustics'),
    'Klang Wool Acoustic Speaker',
    'klang-wool-acoustic-speaker',
    'VLR-AUD-102',
    '360-degree omnidirectional room speaker upholstered in Kvadrat heather wool with a CNC-milled aluminum top dial. Warm, balanced acoustics engineered for open living spaces.',
    229.00, null, 0, 19,
    '/images/prod-speaker.jpg',
    array['/images/prod-speaker.jpg'],
    '{"Output":"60W Class-D Bi-Amp","Connectivity":"AirPlay 2, Wi-Fi, Bluetooth 5.3","Materials":"Kvadrat Wool & Anodized Aluminum"}'::jsonb,
    4.7, 2, 86, true
  ),
  (
    (select id from public.categories where slug = 'audio-acoustics'),
    'Solis Walnut Belt-Drive Turntable',
    'solis-walnut-turntable',
    'VLR-AUD-103',
    'Hand-finished solid American walnut plinth paired with a heavy damped aluminum platter, carbon-fiber tonearm, and built-in switchable phono preamplifier.',
    449.00, 520.00, 14, 8,
    '/images/prod-turntable.jpg',
    array['/images/prod-turntable.jpg'],
    '{"Drive":"Precision Optical Belt Drive","Speeds":"33⅓ & 45 RPM","Cartridge":"Ortofon OM10 Elliptical"}'::jsonb,
    4.9, 2, 91, false
  ),
  (
    (select id from public.categories where slug = 'workspace-tech'),
    'Tactile 75% Mechanical Keyboard',
    'tactile-75-mechanical-keyboard',
    'VLR-WRK-201',
    'Gasket-mounted 75% anodized aluminum mechanical keyboard with hot-swappable lubed tactile switches, PBT dye-sub ivory & terracotta keycaps, and tri-mode wireless connectivity.',
    179.00, 210.00, 15, 34,
    '/images/prod-keyboard.jpg',
    array['/images/prod-keyboard.jpg'],
    '{"Layout":"75% Compact (84 Keys + Rotary Knob)","Switches":"Hot-Swappable Tactile 55g","Battery":"4000mAh"}'::jsonb,
    4.9, 2, 96, true
  ),
  (
    (select id from public.categories where slug = 'workspace-tech'),
    'Lumina Brass & Teal Desk Lamp',
    'lumina-brass-teal-desk-lamp',
    'VLR-WRK-202',
    'Architectural cantilevered desk lamp in matte forest teal steel and brushed solid brass. High-CRI 97+ glare-free LED illumination with stepless touch dimming.',
    145.00, null, 0, 22,
    '/images/prod-lamp.svg',
    array['/images/prod-lamp.svg', '/images/hero-lifestyle.jpg'],
    '{"CRI":"97+ Full Spectrum LED","ColorTemp":"2700K – 5000K Stepless","Materials":"Powder-Coated Steel & Solid Brass"}'::jsonb,
    4.8, 1, 88, true
  ),
  (
    (select id from public.categories where slug = 'workspace-tech'),
    'Forma Walnut Laptop Dock & Tray',
    'forma-walnut-laptop-dock',
    'VLR-WRK-203',
    'Dual-purpose vertical laptop stand and 15W Qi2 wireless charging desk tray crafted from oiled walnut and slate-anodized aluminum.',
    118.00, 135.00, 12, 41,
    '/images/prod-dock.jpg',
    array['/images/prod-dock.jpg'],
    '{"Compatibility":"Laptops 11mm – 24mm thick","Charging":"15W Qi2 Magnetic Pad","Finish":"Natural Oiled Walnut"}'::jsonb,
    4.6, 1, 81, false
  ),
  (
    (select id from public.categories where slug = 'home-kitchen'),
    'Koto Gooseneck Pour-Over Kettle',
    'koto-gooseneck-kettle',
    'VLR-HOM-301',
    'Variable-temperature electric pour-over kettle with precision PID control, counterbalanced walnut handle, and built-in brew stopwatch.',
    165.00, 195.00, 15, 16,
    '/images/prod-kettle.jpg',
    array['/images/prod-kettle.jpg'],
    '{"Capacity":"0.9 Liters","TempRange":"104°F – 212°F","Power":"1200W Quick-Heat Base"}'::jsonb,
    4.9, 2, 94, true
  ),
  (
    (select id from public.categories where slug = 'home-kitchen'),
    'Sora Speckled Stoneware Mug & Carafe',
    'sora-stoneware-mug-carafe',
    'VLR-HOM-302',
    'Wheel-thrown artisanal stoneware pour-over carafe and matching pair of tactile mugs finished in a satin sand-speckled reactive glaze.',
    78.00, null, 0, 45,
    '/images/prod-mugset.svg',
    array['/images/prod-mugset.svg'],
    '{"SetIncludes":"600ml Carafe + 2 x 300ml Mugs","Material":"High-Fire Japanese Clay"}'::jsonb,
    4.7, 1, 79, false
  ),
  (
    (select id from public.categories where slug = 'home-kitchen'),
    'Fjord Organic Merino Throw Blanket',
    'fjord-merino-throw-blanket',
    'VLR-HOM-303',
    'Loom-woven 100% extra-fine Australian merino wool throw in sage-olive and oatmeal herringbone.',
    138.00, 168.00, 18, 23,
    '/images/prod-throw.svg',
    array['/images/prod-throw.svg'],
    '{"Dimensions":"140 x 200 cm","Material":"100% RWS Certified Merino Wool"}'::jsonb,
    4.8, 1, 83, false
  ),
  (
    (select id from public.categories where slug = 'everyday-carry'),
    'Nomad Waxed Canvas Commuter Pack',
    'nomad-waxed-canvas-pack',
    'VLR-CRY-401',
    'Weatherproof 22L daily commuter backpack cut from 18oz Scottish dry-waxed cotton canvas with vegetable-tanned bridle leather accents.',
    195.00, 235.00, 17, 14,
    '/images/prod-backpack.svg',
    array['/images/prod-backpack.svg'],
    '{"Capacity":"22 Liters","LaptopFit":"Up to 16-inch MacBook Pro"}'::jsonb,
    4.9, 2, 93, true
  ),
  (
    (select id from public.categories where slug = 'everyday-carry'),
    'Nordic Heritage Field Chronograph',
    'nordic-field-chronograph',
    'VLR-CRY-402',
    '39mm 316L brushed surgical steel case housing a sapphire crystal lens, sunlit cream dial, and quick-release Italian cognac leather strap.',
    260.00, null, 0, 12,
    '/images/prod-watch.svg',
    array['/images/prod-watch.svg'],
    '{"CaseSize":"39mm x 9.8mm","Crystal":"Domed Sapphire","WaterResistance":"10 ATM / 100m"}'::jsonb,
    4.8, 1, 85, false
  ),
  (
    (select id from public.categories where slug = 'everyday-carry'),
    'Atelier Merino Felt 14" Laptop Sleeve',
    'atelier-felt-laptop-sleeve',
    'VLR-CRY-403',
    'Tailored 3mm German merino wool-felt sleeve reinforced with full-grain saddle leather trim and solid brass zipper pull.',
    68.00, 85.00, 20, 5,
    '/images/prod-sleeve.svg',
    array['/images/prod-sleeve.svg'],
    '{"Fit":"14-inch Laptops & Tablets","Materials":"3mm Merino Felt + Full-Grain Leather"}'::jsonb,
    4.7, 1, 77, false
  )
on conflict (slug) do nothing;
