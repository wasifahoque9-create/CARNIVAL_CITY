<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = BusinessSetting::firstOrCreate(
            ['id' => 1],
            [
                'business_name' => 'ShopSphere',
                'whatsapp_country_code' => '880',
                'currency' => 'BDT',
            ]
        );

        return response()->json([
            'data' => $settings,
        ]);
    }

    public function update(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'business_name' => [
                'required',
                'string',
                'max:150',
            ],

            'business_email' => [
                'nullable',
                'email',
                'max:190',
            ],

            'business_phone' => [
                'nullable',
                'string',
                'max:50',
            ],

            'whatsapp_country_code' => [
                'required',
                'string',
                'max:10',
            ],

            'whatsapp_number' => [
                'required',
                'string',
                'max:30',
            ],

            'business_address' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'currency' => [
                'required',
                'string',
                'max:10',
            ],

            'facebook_url' => [
                'nullable',
                'url',
                'max:500',
            ],

            'instagram_url' => [
                'nullable',
                'url',
                'max:500',
            ],
        ]);

        $settings = BusinessSetting::firstOrCreate(
            ['id' => 1]
        );

        $settings->update($validated);

        return response()->json([
            'message' => 'Business settings updated successfully.',
            'data' => $settings->fresh(),
        ]);
    }
}