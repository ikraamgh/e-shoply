<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /** GET /users — admin only */
    public function index()
    {
        $users = User::withCount('orders')
            ->selectRaw('*, (SELECT COALESCE(SUM(total),0) FROM orders WHERE user_id = users.id) as spent')
            ->get()
            ->map(fn($u) => [
                'id'      => $u->id,
                'name'    => $u->name,
                'email'   => $u->email,
                'role'    => $u->role,
                'orders'  => $u->orders_count,
                'spent'   => (float) $u->spent,
                'joined'  => $u->created_at->toDateString(),
            ]);

        return response()->json($users);
    }
}
