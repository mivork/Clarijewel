<?php

namespace Tests\Feature;

use App\Mail\WelcomeCouponMail;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class WelcomeCouponTest extends TestCase
{
    use RefreshDatabase;

    private function verifyUrl(User $user): string
    {
        return URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->email),
        ]);
    }

    public function test_register_stores_marketing_opt_in(): void
    {
        $this->postJson('/api/register', [
            'name' => '山田 花子',
            'email' => 'hanako@example.com',
            'password' => 'password123',
            'marketing_opt_in' => true,
        ])->assertCreated();

        $this->assertTrue(User::where('email', 'hanako@example.com')->first()->marketing_opt_in);
    }

    public function test_email_verification_issues_one_welcome_coupon_and_mails_it(): void
    {
        Mail::fake();
        $user = User::factory()->unverified()->create();

        $this->get($this->verifyUrl($user))->assertRedirect();
        // 確認リンクを2回踏んでも二重発行しない
        $this->get($this->verifyUrl($user))->assertRedirect();

        $coupons = Coupon::where('user_id', $user->id)->get();
        $this->assertCount(1, $coupons);
        $this->assertSame('percentage', $coupons[0]->discount_type);
        $this->assertSame(10, (int) $coupons[0]->discount_value);
        $this->assertSame(1, (int) $coupons[0]->max_uses);
        $this->assertTrue($coupons[0]->first_order_only);
        $this->assertStringStartsWith('WELCOME-', $coupons[0]->code);
        Mail::assertSent(WelcomeCouponMail::class, fn ($mail) => $mail->hasTo($user->email));
    }

    public function test_personal_coupon_can_only_be_used_by_its_owner(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $coupon = app(\App\Services\WelcomeCouponService::class)->issueFor($owner);

        $this->actingAs($owner)
            ->postJson('/api/coupons/validate', ['code' => $coupon->code, 'subtotal' => 50000])
            ->assertOk()
            ->assertJson(['discount_amount' => 5000, 'total_after_discount' => 45000]);

        $this->actingAs($other)
            ->postJson('/api/coupons/validate', ['code' => $coupon->code, 'subtotal' => 50000])
            ->assertStatus(422);
    }

    public function test_first_order_only_coupon_is_rejected_after_a_paid_order(): void
    {
        $user = User::factory()->create();
        $coupon = app(\App\Services\WelcomeCouponService::class)->issueFor($user);

        $this->actingAs($user)->getJson('/api/coupons/mine')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.code', $coupon->code);

        Order::create(['user_id' => $user->id, 'status' => 'paid', 'total_amount' => 30000]);

        $this->actingAs($user)
            ->postJson('/api/coupons/validate', ['code' => $coupon->code, 'subtotal' => 50000])
            ->assertStatus(422);
        $this->actingAs($user)->getJson('/api/coupons/mine')->assertJsonCount(0);
    }

    public function test_failed_payment_gives_the_coupon_back(): void
    {
        $user = User::factory()->create();
        $coupon = app(\App\Services\WelcomeCouponService::class)->issueFor($user);
        $coupon->update(['used_count' => 1]);

        $order = Order::create([
            'user_id' => $user->id,
            'status' => 'pending',
            'total_amount' => 45000,
            'coupon_code' => $coupon->code,
            'discount_amount' => 5000,
        ]);

        app(OrderFulfillmentService::class)->releaseStock($order, 'failed');

        $this->assertSame(0, (int) $coupon->fresh()->used_count);
        $this->assertTrue($coupon->fresh()->isUsableBy($user));
    }

    public function test_personal_coupons_are_hidden_from_public_and_admin_lists(): void
    {
        $user = User::factory()->create();
        app(\App\Services\WelcomeCouponService::class)->issueFor($user);
        Coupon::create(['code' => 'SPRING', 'discount_type' => 'fixed', 'discount_value' => 1000, 'public' => true]);

        $this->getJson('/api/coupons/public')->assertJsonCount(1)->assertJsonPath('0.code', 'SPRING');

        $admin = User::factory()->create();
        $admin->is_admin = true;
        $admin->save();
        $this->actingAs($admin)->getJson('/api/admin/coupons')->assertJsonCount(1);
    }
}
