<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    /**
     * Download order invoice PDF.
     *
     * Access allowed for:
     * - Order owner
     * - Admin
     * - Guest customer with matching guest cart token
     */
    public function download(
        Request $request,
        Order $order
    ) {
        /*
        |--------------------------------------------------------------------------
        | Authentication / Guest Verification
        |--------------------------------------------------------------------------
        */

        $user = $request->user(
            'sanctum'
        );

        $guestToken = $request->header(
            'X-Guest-Cart-Token'
        );

        $guestToken = $guestToken
            ? trim((string) $guestToken)
            : null;

        $isOwner =
            $user &&
            $order->user_id ===
                $user->id;

        $isAdmin =
            $user &&
            $user->isAdmin();

        $isGuestOwner =
            ! $order->user_id &&
            $order->guest_token &&
            $guestToken &&
            hash_equals(
                (string) $order->guest_token,
                (string) $guestToken
            );

        if (
            ! $isOwner &&
            ! $isAdmin &&
            ! $isGuestOwner
        ) {
            abort(
                403,
                'You are not authorized to download this invoice.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Load Order Data
        |--------------------------------------------------------------------------
        */

        $order->load([
            'items.product',
            'items.variant',
            'shippingAddress',
            'payment',
            'user',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Business Information
        |--------------------------------------------------------------------------
        */

        $businessSettings =
            BusinessSetting::firstOrCreate(
                ['id' => 1],
                [
                    'business_name' =>
                        'ShopSphere',

                    'whatsapp_country_code' =>
                        '880',

                    'currency' =>
                        'BDT',

                    'delivery_charge' =>
                        0,
                ]
            );

        /*
        |--------------------------------------------------------------------------
        | Generate PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'pdf.invoice',
            [
                'order' =>
                    $order,

                'business' =>
                    $businessSettings,
            ]
        );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        /*
        |--------------------------------------------------------------------------
        | Download File
        |--------------------------------------------------------------------------
        */

        $fileName =
            'invoice-' .
            str_pad(
                (string) $order->id,
                6,
                '0',
                STR_PAD_LEFT
            ) .
            '.pdf';

        return $pdf->download(
            $fileName
        );
    }
}