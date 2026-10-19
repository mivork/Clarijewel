<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InquiryReceivedMail;
use App\Models\Inquiry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class InquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'category' => ['required', 'in:general,product,salon,recruit,other'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $inquiry = Inquiry::create($validated);

        $adminEmails = User::where('is_admin', true)->pluck('email');
        if ($adminEmails->isNotEmpty()) {
            Mail::to($adminEmails->all())->send(new InquiryReceivedMail($inquiry));
        }

        return response()->json($inquiry, 201);
    }
}
