<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\GoogleLoginRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\SendOtpRequest;
use App\Http\Requests\Api\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\Otp;
use App\Models\User;
use App\Notifications\WelcomeNotification;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->input('phone'),
            'password' => $request->string('password'),
            'email_verified_at' => now(),
            'role' => UserRole::Customer,
        ]);

        event(new Registered($user));
        $user->notify(new WelcomeNotification());

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => new UserResource($user->load('addresses')),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = User::findOrFail($request->integer('id'));

        if (! hash_equals(sha1($user->getEmailForVerification()), (string) $request->input('hash'))) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $user->markEmailAsVerified();

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)], 422);
        }

        return response()->json(['message' => 'Password reset link sent to your email.']);
    }

    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
        $keys = Cache::remember('google.jwks', now()->addDay(), function () {
            return Http::get('https://www.googleapis.com/oauth2/v3/certs')->json();
        });

        try {
            $payload = JWT::decode($request->string('id_token'), JWK::parseKeySet($keys));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid or expired Google token.'], 401);
        }

        if ($payload->aud !== config('services.google.client_id')) {
            return response()->json(['message' => 'Invalid token audience.'], 401);
        }

        if (! ($payload->email_verified ?? false)) {
            return response()->json(['message' => 'Google email is not verified.'], 401);
        }

        $existingUser = User::where('email', $payload->email)->first();
        $isNewUser = ! $existingUser;

        $user = User::updateOrCreate(
            ['email' => $payload->email],
            [
                'name' => $existingUser->name ?? $payload->name,
                'google_id' => $payload->sub,
                'email_verified_at' => $existingUser->email_verified_at ?? now(),
                'password' => $existingUser->password ?? Hash::make(Str::random(32)),
                'role' => $existingUser->role ?? UserRole::Customer,
            ]
        );

        if ($isNewUser) {
            event(new Registered($user));
            $user->notify(new WelcomeNotification());
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => $isNewUser ? 'Registration successful.' : 'Login successful.',
            'user' => new UserResource($user->load('addresses')),
            'token' => $token,
        ]);
    }

    public function sendOtp(SendOtpRequest $request): JsonResponse
    {
        $phone = $request->string('phone');

        // Throttle: don't allow a new OTP within 60 seconds of the last one
        $recent = Otp::where('phone', $phone)
            ->where('created_at', '>', now()->subSeconds(60))
            ->exists();

        if ($recent) {
            return response()->json(['message' => 'Please wait before requesting another code.'], 429);
        }

        $code = (string) random_int(100000, 999999);

        Otp::create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(5),
            'used' => false,
        ]);

        Http::post(config('services.sms.url'), [
            'api_token' => config('services.sms.token'),
            'phone' => $phone,
            'message' => "Your ShopSphere verification code is {$code}",
        ]);

        return response()->json(['message' => 'OTP sent successfully.']);
    }

    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $record = Otp::where('phone', $request->string('phone'))
            ->where('used', false)
            ->latest()
            ->first();

        if (! $record || $record->expires_at->isPast()) {
            return response()->json(['message' => 'OTP expired or not found. Please request a new one.'], 422);
        }

        if (! Hash::check($request->string('otp'), $record->code)) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        $record->update(['used' => true]);

        User::where('phone', $request->string('phone'))
            ->update(['phone_verified_at' => now()]);

        return response()->json(['verified' => true, 'message' => 'Phone verified successfully.']);
    }
}