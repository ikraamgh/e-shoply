<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Shoply
|--------------------------------------------------------------------------
|
| Public:   /api/products, /api/categories
| Auth:     Bearer token (Sanctum) required
| Admin:    role=admin required
|
*/

// ── Public ────────────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // Products & Categories (read-only public)
    Route::get('/products',          [ProductController::class, 'index']);
    Route::get('/products/{slug}',   [ProductController::class, 'show']);
    Route::get('/categories',        [CategoryController::class, 'index']);

    // ── Authenticated ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout',    [AuthController::class, 'logout']);
        Route::get('/me',         [AuthController::class, 'me']);
        Route::put('/me',         [AuthController::class, 'updateMe']);

        // Cart
        Route::get('/cart',                    [CartController::class, 'index']);
        Route::post('/cart',                   [CartController::class, 'store']);
        Route::patch('/cart/{slug}',           [CartController::class, 'update']);
        Route::delete('/cart/{slug}',          [CartController::class, 'destroy']);
        Route::delete('/cart',                 [CartController::class, 'clear']);

        // Wishlist
        Route::get('/wishlist',                [WishlistController::class, 'index']);
        Route::post('/wishlist',               [WishlistController::class, 'store']);
        Route::delete('/wishlist/{slug}',      [WishlistController::class, 'destroy']);

        // Orders
        Route::get('/orders',                  [OrderController::class, 'index']);
        Route::post('/orders',                 [OrderController::class, 'store']);
        Route::get('/orders/{orderNumber}',    [OrderController::class, 'show']);

        // ── Admin only ─────────────────────────────────────────────────────
        Route::middleware('admin')->group(function () {
            Route::post('/products',           [ProductController::class, 'store']);
            Route::put('/products/{slug}',     [ProductController::class, 'update']);
            Route::delete('/products/{slug}',  [ProductController::class, 'destroy']);

            Route::patch('/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);

            Route::get('/users',               [UserController::class, 'index']);
        });
    });
});
