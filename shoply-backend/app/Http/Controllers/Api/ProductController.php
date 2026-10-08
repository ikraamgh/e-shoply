<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }
        if ($request->filled('featured')) {
            $query->where('featured', true);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->get()->map(fn($p) => $this->productResource($p));
        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();
        return response()->json($this->productResource($product));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'slug'        => 'required|string|unique:products,slug',
            'name'        => 'required|string|max:255',
            'tagline'     => 'nullable|string',
            'description' => 'nullable|string',
            'price'       => 'required|numeric|min:0',
            'compare_at'  => 'nullable|numeric|min:0',
            'category_id' => 'required|string',
            'images'      => 'nullable|array',
            'images.*'    => 'url',
            'stock'       => 'required|integer|min:0',
            'featured'    => 'boolean',
        ]);

        // resolve category slug -> id
        $cat = Category::where('slug', $data['category_id'])->firstOrFail();
        $data['category_id'] = $cat->id;

        $product = Product::create($data);
        return response()->json($this->productResource($product->load('category')), 201);
    }

    public function update(Request $request, $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'tagline'     => 'nullable|string',
            'description' => 'nullable|string',
            'price'       => 'sometimes|numeric|min:0',
            'compare_at'  => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|string',
            'images'      => 'nullable|array',
            'images.*'    => 'url',
            'stock'       => 'sometimes|integer|min:0',
            'featured'    => 'boolean',
        ]);

        if (isset($data['category_id'])) {
            $cat = Category::where('slug', $data['category_id'])->firstOrFail();
            $data['category_id'] = $cat->id;
        }

        $product->update($data);
        return response()->json($this->productResource($product->load('category')));
    }

    public function destroy($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }

    private function productResource(Product $p): array
    {
        return [
            'id'          => $p->slug,
            'name'        => $p->name,
            'tagline'     => $p->tagline,
            'description' => $p->description,
            'price'       => $p->price,
            'compareAt'   => $p->compare_at,
            'categoryId'  => $p->category?->slug,
            'images'      => $p->images ?? [],
            'rating'      => $p->rating,
            'reviews'     => $p->reviews,
            'stock'       => $p->stock,
            'sold'        => $p->sold,
            'featured'    => $p->featured,
        ];
    }
}
