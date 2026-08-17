<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends VerifyEmail
{

    protected function verificationUrl($notifiable): string
    {
        $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

        return $frontend.'/verify-email?id='.$notifiable->getKey().'&hash='.sha1($notifiable->getEmailForVerification());
    }

    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your ShopSphere Account')
            ->greeting('Welcome to ShopSphere!')
            ->line('Please verify your email address to complete registration.')
            ->action('Verify Email', $verificationUrl)
            ->line('If you did not create an account, no further action is required.');
    }
}
