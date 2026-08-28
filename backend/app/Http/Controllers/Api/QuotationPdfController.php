<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessSetting;
use App\Models\QuotationRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class QuotationPdfController extends Controller
{
    /**
     * Download quotation PDF.
     *
     * Access:
     * - Admin
     * - Logged-in quotation owner
     *
     * Guest quotation PDF access can be added later
     * with a dedicated secure token if needed.
     */
    public function download(
        Request $request,
        QuotationRequest $quotationRequest
    ) {
        $user = $request->user(
            'sanctum'
        );

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        $isAdmin =
            $user &&
            $user->isAdmin();

        $isOwner =
            $user &&
            $quotationRequest->user_id &&
            $quotationRequest->user_id ===
                $user->id;

        if (
            ! $isAdmin &&
            ! $isOwner
        ) {
            abort(
                403,
                'You are not authorized to download this quotation.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Load Quotation Data
        |--------------------------------------------------------------------------
        */

        $quotationRequest->load([
            'items.product',
            'items.variant',
            'user',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Business Settings
        |--------------------------------------------------------------------------
        */

        $business =
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
        | Final Quotation Amount
        |--------------------------------------------------------------------------
        |
        | If admin has provided quoted_amount,
        | use that.
        |
        | Otherwise use estimated_total.
        |
        */

        $finalAmount =
            $quotationRequest
                ->quoted_amount !== null
                ? (float) $quotationRequest
                    ->quoted_amount
                : (float) $quotationRequest
                    ->estimated_total;

        /*
        |--------------------------------------------------------------------------
        | Generate PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'pdf.quotation',
            [
                'quotation' =>
                    $quotationRequest,

                'business' =>
                    $business,

                'finalAmount' =>
                    $finalAmount,
            ]
        );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        /*
        |--------------------------------------------------------------------------
        | Filename
        |--------------------------------------------------------------------------
        */

        $fileName =
            'quotation-' .
            str_pad(
                (string) $quotationRequest->id,
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