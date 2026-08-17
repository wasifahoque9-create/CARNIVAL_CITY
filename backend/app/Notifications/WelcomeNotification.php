<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to ShopSphere')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Thank you for registering with ShopSphere.')
            ->line('Browse our latest gadgets and enjoy shopping with us!');
    }
}
