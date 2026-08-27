<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessSettingController extends Controller
{
    /**
     * Public business settings.
     */
    public function show(): JsonResponse
    {
        $settings = BusinessSetting::firstOrCreate(
            ['id' => 1],
            [
                'business_name' => 'ShopSphere',
                'whatsapp_country_code' => '880',
                'currency' => 'BDT',
                'delivery_charge' => 0,
            ]
        );

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Admin update business settings.
     */
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

            'delivery_charge' => [
                'required',
                'numeric',
                'min:0',
                'max:99999999.99',
            ],
        ]);

        $settings = BusinessSetting::firstOrCreate(
            ['id' => 1],
            [
                'business_name' => 'ShopSphere',
                'whatsapp_country_code' => '880',
                'currency' => 'BDT',
                'delivery_charge' => 0,
            ]
        );

        $settings->update($validated);

        return response()->json([
            'message' =>
                'Business settings updated successfully.',

            'data' =>
                $settings->fresh(),
        ]);
    }
}