<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShippedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "ご注文の商品を発送しました（注文番号: {$this->order->id}）",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: sprintf(
                '<p>ご注文いただいた商品を発送しました。</p><p>注文番号: %d<br>追跡番号: %s</p>',
                $this->order->id,
                e($this->order->tracking_number ?? '未設定')
            ),
        );
    }
}
