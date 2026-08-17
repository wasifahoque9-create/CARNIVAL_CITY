<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Confirmation #'.$this->order->id)
            ->greeting('Hello '.$notifiable->name.'!')
            ->line('Your order #'.$this->order->id.' has been placed successfully.')
            ->line('Total: $'.number_format((float) $this->order->total_amount, 2))
            ->line('Status: '.$this->order->status->value)
            ->line('Thank you for shopping with ShopSphere!');
    }
}
