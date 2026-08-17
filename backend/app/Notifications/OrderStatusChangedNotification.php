<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChangedNotification extends Notification
{

    public function __construct(
        public Order $order,
        public string $previousStatus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order #'.$this->order->id.' Status Updated')
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Your order #'.$this->order->id.' status has changed.')
            ->line('Previous status: '.$this->previousStatus)
            ->line('New status: '.$this->order->status->value)
            ->line('Thank you for shopping with ShopSphere!');
    }
}
