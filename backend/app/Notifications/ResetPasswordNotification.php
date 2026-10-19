<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url');
        $resetUrl = sprintf(
            '%s/reset-password?token=%s&email=%s',
            rtrim($frontendUrl, '/'),
            $this->token,
            urlencode($notifiable->getEmailForPasswordReset())
        );

        return (new MailMessage)
            ->subject('パスワード再設定のご案内')
            ->line('パスワード再設定のリクエストを受け付けました。')
            ->action('パスワードを再設定する', $resetUrl)
            ->line('このリンクの有効期限は60分です。心当たりがない場合はこのメールを無視してください。');
    }
}
