<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

// app/Mail/OtpMail.php
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
   
   