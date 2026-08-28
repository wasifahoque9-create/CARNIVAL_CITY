<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Order $order
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $customerName =
            $this->order->user?->name
            ?? $this->order->guest_name
            ?? 'Customer';

        return (new MailMessage)
            ->subject(
                'Order Confirmation #'.$this->order->id
            )
            ->view('emails.orders.placed', [
                'order' => $this->order,
                'customerName' => $customerName,
            ]);
    }
}