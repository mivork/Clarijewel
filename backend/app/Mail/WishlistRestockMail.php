<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WishlistRestockMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Product $product)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "お気に入り商品が再入荷しました（{$this->product->name}）",
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: sprintf(
                '<p>お気に入り登録いただいている商品が再びご購入可能になりました。</p><p>%s（&yen;%s）</p>',
                e($this->product->name),
                number_format($this->product->price)
            ),
        );
    }
}
