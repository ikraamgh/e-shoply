<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $lines = $request->user()->cartItems()->with('product.category')->get();
        return response()->json($this->cartResource($lines));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'productId' => 'required|string',
            'quantity'  => 'integer|min:1',
        ]);

        $product = Product::where('slug', $data['productId'])->firstOrFail();
        $qty = $data['quantity'] ?? 1;

        if ($product->stock === 0) {
            return response()->json(['message' => 'Out of stock'], 422);
        }

        $cart = Cart::firstOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $product->id],
            ['quantity' => 0]
        );

        $cart->quantity = min($product->stock, $cart->quantity + $qty);
        $cart->save();

        $lines = $request->user()->cartItems()->with('product.category')->get();
        return response()->json($this->cartResource($lines));
    }

    public function update(Request $request, $productSlug)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1']);
        $product = Product::where('slug', $productSlug)->firstOrFail();

        Cart::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->update(['quantity' => min($product->stock, $data['quantity'])]);

        $lines = $request->user()->cartItems()->with('product.category')->get();
        return response()->json($this->cartResource($lines));
    }

    public function destroy(Request $request, $productSlug)
    {
        $product = Product::where('slug', $productSlug)->firstOrFail();
        Cart::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        $lines = $request->user()->cartItems()->with('product.category')->get();
        return response()->json($this->cartResource($lines));
    }

    public function clear(Request $request)
    {
        $request->user()->cartItems()->delete();
        return response()->json([]);
    }

    private function cartResource($lines): array
    {
        return $lines->map(function ($l) {
            return [
                'productId' => $l->product->slug,
                'quantity'  => $l->quantity,
            ];
        })->values()->toArray();
    }
}
