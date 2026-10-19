<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    private const CATEGORY_LABEL = [
        'general' => '商品・ご注文について',
        'product' => '鑑定書・保証について',
        'salon' => '店舗・ご来店予約について',
        'recruit' => '採用について',
        'other' => 'その他',
    ];

    public function __construct(public Inquiry $inquiry)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "【Clarijewel】新しいお問い合わせが届きました（{$this->inquiry->name}様）",
            replyTo: [$this->inquiry->email],
        );
    }

    public function content(): Content
    {
        $categoryLabel = self::CATEGORY_LABEL[$this->inquiry->category] ?? $this->inquiry->category;

        return new Content(
            htmlString: sprintf(
                '<p>Webサイトから新しいお問い合わせが届きました。</p>
                <table cellpadding="4">
                    <tr><th align="left">お名前</th><td>%s</td></tr>
                    <tr><th align="left">メールアドレス</th><td>%s</td></tr>
                    <tr><th align="left">電話番号</th><td>%s</td></tr>
                    <tr><th align="left">種別</th><td>%s</td></tr>
                </table>
                <p>お問い合わせ内容:</p>
                <p>%s</p>
                <p>管理画面から対応状況を更新できます。</p>',
                e($this->inquiry->name),
                e($this->inquiry->email),
                e($this->inquiry->phone ?? '未入力'),
                e($categoryLabel),
                nl2br(e($this->inquiry->message))
            ),
        );
    }
}
