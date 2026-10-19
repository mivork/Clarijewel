<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index(): JsonResponse
    {
        $consultations = Consultation::query()
            ->with('user:id,name,email')
            ->orderByDesc('priority')
            ->orderBy('preferred_datetime')
            ->get();

        return response()->json($consultations);
    }

    public function updateStatus(Request $request, Consultation $consultation): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,completed,canceled'],
        ]);

        $consultation->update($validated);

        return response()->json($consultation->fresh('user:id,name,email'));
    }
}
