<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Users ─────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'admin@shoply.dev'], [
            'name'     => 'Store Admin',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
        ]);

        $alex = User::firstOrCreate(['email' => 'alex@shoply.dev'], [
            'name'     => 'Alex Rivera',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        $mia = User::firstOrCreate(['email' => 'mia@example.com'], [
            'name'     => 'Mia Chen',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        $noah = User::firstOrCreate(['email' => 'noah@example.com'], [
            'name'     => 'Noah Patel',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        $sara = User::firstOrCreate(['email' => 'sara@example.com'], [
            'name'     => 'Sara Okafor',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        $liam = User::firstOrCreate(['email' => 'liam@example.com'], [
            'name'     => 'Liam Novak',
            'password' => Hash::make('password'),
            'role'     => 'customer',
        ]);

        // ── Categories ────────────────────────────────────────────────────
        $catHome = Category::firstOrCreate(['slug' => 'home'], ['name' => 'Home & Kitchen', 'count' => 128]);
        $catTravel = Category::firstOrCreate(['slug' => 'travel'], ['name' => 'Travel & Carry', 'count' => 64]);
        $catWorkspace = Category::firstOrCreate(['slug' => 'workspace'], ['name' => 'Workspace', 'count' => 92]);
        $catWellness = Category::firstOrCreate(['slug' => 'wellness'], ['name' => 'Wellness', 'count' => 76]);

        $desc = 'Designed in small batches and built to last. Each piece is made from responsibly sourced materials and finished by hand, so no two are exactly alike. Easy to care for and made to be used every day.';

        // ── Products ──────────────────────────────────────────────────────
        $products = [
            ['slug' => 'ceramic-pour-over', 'name' => 'Ceramic Pour-Over', 'tagline' => 'Hand-glazed stoneware', 'price' => 48, 'category_id' => $catHome->id, 'rating' => 4.8, 'reviews' => 214, 'stock' => 24, 'sold' => 940, 'featured' => true],
            ['slug' => 'steel-water-bottle', 'name' => 'Steel Water Bottle', 'tagline' => '750ml, keeps cold 24h', 'price' => 34, 'category_id' => $catTravel->id, 'rating' => 4.7, 'reviews' => 388, 'stock' => 56, 'sold' => 1210, 'featured' => true],
            ['slug' => 'linen-cushion', 'name' => 'Linen Cushion', 'tagline' => 'Washed French linen', 'price' => 56, 'compare_at' => 70, 'category_id' => $catHome->id, 'rating' => 4.9, 'reviews' => 132, 'stock' => 4, 'sold' => 860, 'featured' => true],
            ['slug' => 'sage-mug-set', 'name' => 'Sage Mug Set', 'tagline' => 'Set of two, 300ml', 'price' => 42, 'category_id' => $catHome->id, 'rating' => 4.9, 'reviews' => 501, 'stock' => 38, 'sold' => 1530, 'featured' => true],
            ['slug' => 'leather-tote', 'name' => 'Everyday Leather Tote', 'tagline' => 'Full-grain, vegetable tanned', 'price' => 189, 'compare_at' => 220, 'category_id' => $catTravel->id, 'rating' => 4.6, 'reviews' => 97, 'stock' => 12, 'sold' => 410],
            ['slug' => 'arc-desk-lamp', 'name' => 'Arc Desk Lamp', 'tagline' => 'Dimmable warm LED', 'price' => 129, 'category_id' => $catWorkspace->id, 'rating' => 4.7, 'reviews' => 76, 'stock' => 0, 'sold' => 320],
            ['slug' => 'botanical-trio', 'name' => 'Botanical Skincare Trio', 'tagline' => 'Oil, serum & cream', 'price' => 78, 'category_id' => $catWellness->id, 'rating' => 4.8, 'reviews' => 245, 'stock' => 31, 'sold' => 780],
            ['slug' => 'eucalyptus-vase', 'name' => 'Stone Bud Vase', 'tagline' => 'Textured ceramic', 'price' => 38, 'category_id' => $catHome->id, 'rating' => 4.5, 'reviews' => 63, 'stock' => 19, 'sold' => 290],
            ['slug' => 'travel-flask', 'name' => 'Mini Travel Flask', 'tagline' => '350ml, leakproof', 'price' => 26, 'category_id' => $catTravel->id, 'rating' => 4.4, 'reviews' => 154, 'stock' => 80, 'sold' => 670],
            ['slug' => 'desk-organizer', 'name' => 'Oak Desk Organizer', 'tagline' => 'Solid oak, three slots', 'price' => 64, 'category_id' => $catWorkspace->id, 'rating' => 4.6, 'reviews' => 41, 'stock' => 7, 'sold' => 180],
            ['slug' => 'face-oil', 'name' => 'Radiant Face Oil', 'tagline' => 'Jojoba + rosehip, 30ml', 'price' => 32, 'compare_at' => 40, 'category_id' => $catWellness->id, 'rating' => 4.7, 'reviews' => 310, 'stock' => 45, 'sold' => 990],
            ['slug' => 'linen-throw', 'name' => 'Washed Linen Throw', 'tagline' => 'Generous 130×180cm', 'price' => 98, 'category_id' => $catHome->id, 'rating' => 4.8, 'reviews' => 88, 'stock' => 15, 'sold' => 350],
            ['slug' => 'notebook-set', 'name' => 'Linen Notebook Set', 'tagline' => 'A5, dot grid, set of 3', 'price' => 22, 'category_id' => $catWorkspace->id, 'rating' => 4.5, 'reviews' => 120, 'stock' => 64, 'sold' => 540],
            ['slug' => 'bath-salts', 'name' => 'Mineral Bath Soak', 'tagline' => 'Eucalyptus & sea salt', 'price' => 24, 'category_id' => $catWellness->id, 'rating' => 4.6, 'reviews' => 72, 'stock' => 3, 'sold' => 260],
        ];

        $productMap = [];
        foreach ($products as $p) {
            $product = Product::firstOrCreate(
                ['slug' => $p['slug']],
                array_merge($p, ['description' => $desc, 'images' => []])
            );
            $productMap[$p['slug']] = $product;
        }

        // ── Orders ────────────────────────────────────────────────────────
        $mkOrder = function (string $number, User $user, string $date, string $status, array $lines) use ($productMap) {
            if (Order::where('order_number', $number)->exists()) return;

            $items = [];
            $subtotal = 0;
            foreach ($lines as [$slug, $qty]) {
                $p = $productMap[$slug];
                $subtotal += $p->price * $qty;
                $items[] = ['product_id' => $p->id, 'name' => $p->name, 'price' => $p->price, 'quantity' => $qty, 'image' => ''];
            }
            $shipping = $subtotal >= 75 ? 0 : 6;

            $order = Order::create([
                'order_number'   => $number,
                'user_id'        => $user->id,
                'customer_name'  => $user->name,
                'customer_email' => $user->email,
                'status'         => $status,
                'shipping'       => $shipping,
                'total'          => $subtotal + $shipping,
                'address'        => '24 Harbor Lane, Portland, OR 97201',
                'created_at'     => $date,
            ]);

            foreach ($items as $item) {
                $order->items()->create($item);
            }
        };

        $mkOrder('SH-10428', $alex, '2026-09-28', 'Processing', [['sage-mug-set', 1], ['linen-cushion', 2]]);
        $mkOrder('SH-10397', $alex, '2026-09-14', 'Shipped', [['leather-tote', 1]]);
        $mkOrder('SH-10311', $alex, '2026-08-30', 'Delivered', [['ceramic-pour-over', 1], ['face-oil', 1]]);
        $mkOrder('SH-10255', $alex, '2026-08-02', 'Cancelled', [['arc-desk-lamp', 1]]);
        $mkOrder('SH-10431', $mia, '2026-10-01', 'Pending', [['botanical-trio', 2]]);
        $mkOrder('SH-10430', $noah, '2026-09-30', 'Processing', [['steel-water-bottle', 3]]);
        $mkOrder('SH-10429', $sara, '2026-09-29', 'Shipped', [['linen-throw', 1], ['eucalyptus-vase', 1]]);
        $mkOrder('SH-10426', $liam, '2026-09-27', 'Delivered', [['desk-organizer', 1], ['notebook-set', 2]]);
    }
}
