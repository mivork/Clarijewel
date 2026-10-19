<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(): JsonResponse
    {
        $inquiries = Inquiry::query()
            ->orderByDesc('created_at')
            ->get();

        return response()->json($inquiries);
    }

    public function updateStatus(Request $request, Inquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:unread,read'],
        ]);

        $inquiry->update($validated);

        return response()->json($inquiry->fresh());
    }
}
