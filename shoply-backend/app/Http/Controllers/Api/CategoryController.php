<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->get()->map(function ($cat) {
            return [
                'id'    => $cat->slug,
                'name'  => $cat->name,
                'image' => $cat->image,
                'count' => $cat->products_count,
            ];
        });

        return response()->json($categories);
    }
}
