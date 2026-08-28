<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use SerializesModels;

    public function __construct(public string $code) {}

    public function build()
    {
        return $this->subject('Your ShopSphere Verification Code')
            ->view('emails.otp')
            ->with(['code' => $this->code]);
    }
}