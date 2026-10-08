<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /** GET /orders  — all orders (admin) or my orders (customer) */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with('items');
        if (! $user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        $orders = $query->latest()->get()->map(fn($o) => $this->orderResource($o));
        return response()->json($orders);
    }

    /** GET /orders/{id} */
    public function show(Request $request, $orderNumber)
    {
        $user = $request->user();
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();

        if (! $user->isAdmin() && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json($this->orderResource($order));
    }

    /** POST /orders — place a new order */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name'  => 'required|string',
            'customer_email' => 'required|email',
            'address'        => 'required|string',
            'items'          => 'required|array|min:1',
            'items.*.productId' => 'required|string',
            'items.*.quantity'  => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $user = $request->user();

            $orderItems = [];
            $subtotal = 0;

            foreach ($data['items'] as $line) {
                $product = Product::where('slug', $line['productId'])->firstOrFail();

                if ($product->stock < $line['quantity']) {
                    return response()->json(['message' => "Insufficient stock for {$product->name}"], 422);
                }

                $lineTotal = $product->price * $line['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'name'       => $product->name,
                    'price'      => $product->price,
                    'quantity'   => $line['quantity'],
                    'image'      => $product->images[0] ?? '',
                ];

                $product->decrement('stock', $line['quantity']);
                $product->increment('sold', $line['quantity']);
            }

            $shipping = ($subtotal >= 75) ? 0 : 6;
            $orderNumber = 'SH-' . str_pad(random_int(10000, 99999), 5, '0', STR_PAD_LEFT);

            $order = Order::create([
                'order_number'   => $orderNumber,
                'user_id'        => $user?->id,
                'customer_name'  => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'status'         => 'Pending',
                'shipping'       => $shipping,
                'total'          => $subtotal + $shipping,
                'address'        => $data['address'],
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Clear the user's cart if authenticated
            if ($user) {
                $user->cartItems()->delete();
            }

            return response()->json($this->orderResource($order->load('items')), 201);
        });
    }

    /** PATCH /orders/{id}/status — admin only */
    public function updateStatus(Request $request, $orderNumber)
    {
        $data = $request->validate([
            'status' => 'required|in:Pending,Confirmed,Processing,Shipped,Delivered,Cancelled',
        ]);

        $order = Order::where('order_number', $orderNumber)->firstOrFail();
        $order->update(['status' => $data['status']]);

        return response()->json($this->orderResource($order->load('items')));
    }

    private function orderResource(Order $o): array
    {
        return [
            'id'       => $o->order_number,
            'date'     => $o->created_at->toDateString(),
            'customer' => $o->customer_name,
            'email'    => $o->customer_email,
            'status'   => $o->status,
            'items'    => $o->items->map(fn($i) => [
                'productId' => optional($i->product)->slug ?? $i->product_id,
                'name'      => $i->name,
                'price'     => $i->price,
                'quantity'  => $i->quantity,
                'image'     => $i->image,
            ])->toArray(),
            'shipping' => $o->shipping,
            'total'    => $o->total,
            'address'  => $o->address,
        ];
    }
}
