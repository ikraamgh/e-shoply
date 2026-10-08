<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'slug', 'name', 'tagline', 'description', 'price', 'compare_at',
        'category_id', 'images', 'rating', 'reviews', 'stock', 'sold', 'featured',
    ];

    protected $casts = [
        'images' => 'array',
        'featured' => 'boolean',
        'price' => 'float',
        'compare_at' => 'float',
        'rating' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function wishlistItems()
    {
        return $this->hasMany(Wishlist::class);
    }
}
