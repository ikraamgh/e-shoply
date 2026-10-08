<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $ids = $request->user()->wishlistItems()->pluck('product_id');
        $products = Product::whereIn('id', $ids)->get();
        return response()->json($products->pluck('slug')->values());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['productId' => 'required|string']);
        $product = Product::where('slug', $data['productId'])->firstOrFail();

        Wishlist::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return $this->index($request);
    }

    public function destroy(Request $request, $productSlug)
    {
        $product = Product::where('slug', $productSlug)->firstOrFail();
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->delete();

        return $this->index($request);
    }
}
