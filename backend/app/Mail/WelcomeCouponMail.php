<?php

namespace App\Mail;

use App\Models\Coupon;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeCouponMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public Coupon $coupon)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '会員登録ありがとうございます：はじめてのご購入に使える10%優待コード',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: sprintf(
                '<p>%s 様</p>'
                . '<p>Clarijewelへの会員登録ありがとうございます。<br>はじめてのご購入にご利用いただける優待コードをお送りします。</p>'
                . '<p>優待コード: <strong>%s</strong><br>割引: ご購入金額の%d%%<br>有効期限: %sまで（1回限り）</p>'
                . '<p>ご購入手続きの画面でコードを入力してご利用ください。マイページからもご確認いただけます。</p>'
                . '<p><a href="%s">Clarijewel オンラインストア</a></p>',
                e($this->user->name),
                e($this->coupon->code),
                $this->coupon->discount_value,
                $this->coupon->expires_at->format('Y年n月j日'),
                e(config('app.frontend_url'))
            ),
        );
    }
}
