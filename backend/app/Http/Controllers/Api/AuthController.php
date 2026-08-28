<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\GoogleLoginRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register
    |--------------------------------------------------------------------------
    */

    /**
     * Register using email + password.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $email = strtolower(
            trim((string) $request->string('email'))
        );

        $user = User::create([
            'name' => (string) $request->string('name'),
            'email' => $email,
            'phone' => $request->input('phone'),

            'password' => Hash::make(
                (string) $request->string('password')
            ),

            /*
             * Normal email registration created a real password.
             */
            'password_set' => true,

            /*
             * Do not automatically verify normal email registrations.
             */
            'email_verified_at' => null,

            'role' => UserRole::Customer,
        ]);

        event(new Registered($user));

        $user->notify(new WelcomeNotification());

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',

            'user' => new UserResource(
                $user->load('addresses')
            ),

            'token' => $token,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Login
    |--------------------------------------------------------------------------
    */

    /**
     * Login using email + password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $email = strtolower(
            trim((string) $request->string('email'))
        );

        $password = (string) $request->string('password');

        $user = User::where('email', $email)->first();

        /*
         * Keep account-not-found and incorrect-password
         * responses generic.
         */
        if (! $user) {
            return response()->json([
                'message' => 'Invalid email or password.',
                'code' => 'INVALID_CREDENTIALS',
            ], 401);
        }

        /*
         * IMPORTANT:
         *
         * Google-created accounts can contain an internally generated
         * placeholder password.
         *
         * password_set = false means the customer has never created
         * an actual account password.
         */
        if (! $user->password_set) {
            return response()->json([
                'message' =>
                    'This account currently uses Google sign-in. Sign in with Google or set an account password first.',

                'code' => 'PASSWORD_NOT_SET',
            ], 422);
        }

        if (
            empty($user->password) ||
            ! Hash::check($password, $user->password)
        ) {
            return response()->json([
                'message' => 'Invalid email or password.',
                'code' => 'INVALID_CREDENTIALS',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',

            'user' => new UserResource(
                $user->load('addresses')
            ),

            'token' => $token,

            'authentication' => [
                'google' => ! empty($user->google_id),
                'password' => (bool) $user->password_set,
                'needs_password_setup' => false,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Logout
    |--------------------------------------------------------------------------
    */

    /**
     * Logout current Sanctum session.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()
            ?->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Email Verification
    |--------------------------------------------------------------------------
    */

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = User::findOrFail(
            $request->integer('id')
        );

        if (
            ! hash_equals(
                sha1($user->getEmailForVerification()),
                (string) $request->input('hash')
            )
        ) {
            return response()->json([
                'message' => 'Invalid verification link.',
            ], 403);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email verified successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Forgot Password
    |--------------------------------------------------------------------------
    */

    /**
     * Send password reset link.
     *
     * Works for:
     * - normal email/password accounts
     * - Google accounts
     */
    public function forgotPassword(
        ForgotPasswordRequest $request
    ): JsonResponse {
        $status = Password::sendResetLink([
            'email' => strtolower(
                trim((string) $request->string('email'))
            ),
        ]);

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Password reset link sent to your email.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Reset Password
    |--------------------------------------------------------------------------
    */

    /**
     * Reset account password.
     */
    public function resetPassword(
        ResetPasswordRequest $request
    ): JsonResponse {
        $status = Password::reset(
            [
                'email' => strtolower(
                    trim((string) $request->string('email'))
                ),

                'password' =>
                    (string) $request->string('password'),

                'password_confirmation' =>
                    (string) $request->string(
                        'password_confirmation'
                    ),

                'token' =>
                    (string) $request->string('token'),
            ],

            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),

                    /*
                     * Password reset creates a real user password.
                     *
                     * This is especially important for a Google-created
                     * account using Forgot Password for the first time.
                     */
                    'password_set' => true,
                ]);

                $user->setRememberToken(
                    Str::random(60)
                );

                $user->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' =>
                'Password reset successfully. Please log in.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Google Login / Registration
    |--------------------------------------------------------------------------
    */

    /**
     * Login or register using Google.
     */
    public function googleLogin(
        GoogleLoginRequest $request
    ): JsonResponse {
        /*
        |--------------------------------------------------------------------------
        | Google Public Keys
        |--------------------------------------------------------------------------
        */

        try {
            $keys = Cache::remember(
                'google.jwks',
                now()->addDay(),
                function () {
                    $response = Http::timeout(10)
                        ->get(
                            'https://www.googleapis.com/oauth2/v3/certs'
                        );

                    if (! $response->successful()) {
                        throw new \RuntimeException(
                            'Unable to retrieve Google signing keys.'
                        );
                    }

                    return $response->json();
                }
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' =>
                    'Unable to verify Google authentication at this time.',
            ], 503);
        }

        /*
        |--------------------------------------------------------------------------
        | Decode Google ID Token
        |--------------------------------------------------------------------------
        */

        try {
            $payload = JWT::decode(
                (string) $request->string('id_token'),
                JWK::parseKeySet($keys)
            );
        } catch (\Throwable $e) {
            return response()->json([
                'message' =>
                    'Invalid or expired Google token.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Audience
        |--------------------------------------------------------------------------
        */

        $googleClientId = config(
            'services.google.client_id'
        );

        if (empty($googleClientId)) {
            return response()->json([
                'message' =>
                    'Google authentication is not configured.',
            ], 500);
        }

        $audience = $payload->aud ?? null;

        $validAudience = false;

        if (is_string($audience)) {
            $validAudience = hash_equals(
                $googleClientId,
                $audience
            );
        } elseif (is_array($audience)) {
            $validAudience = in_array(
                $googleClientId,
                $audience,
                true
            );
        }

        if (! $validAudience) {
            return response()->json([
                'message' =>
                    'Invalid token audience.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Authorized Party
        |--------------------------------------------------------------------------
        */

        if (
            isset($payload->azp) &&
            ! hash_equals(
                $googleClientId,
                (string) $payload->azp
            )
        ) {
            return response()->json([
                'message' =>
                    'Invalid Google authorized party.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Issuer
        |--------------------------------------------------------------------------
        */

        if (
            ! isset($payload->iss) ||
            ! in_array(
                (string) $payload->iss,
                [
                    'https://accounts.google.com',
                    'accounts.google.com',
                ],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'Invalid Google token issuer.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Google Email
        |--------------------------------------------------------------------------
        */

        $emailVerified = filter_var(
            $payload->email_verified ?? false,
            FILTER_VALIDATE_BOOLEAN
        );

        if (! $emailVerified) {
            return response()->json([
                'message' =>
                    'Google email is not verified.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | Required Google Data
        |--------------------------------------------------------------------------
        */

        if (
            empty($payload->email) ||
            empty($payload->sub)
        ) {
            return response()->json([
                'message' =>
                    'Required Google account information is missing.',
            ], 401);
        }

        $email = strtolower(
            trim((string) $payload->email)
        );

        $googleId = (string) $payload->sub;

        $name = trim(
            (string) ($payload->name ?? '')
        );

        /*
        |--------------------------------------------------------------------------
        | Find Existing Account
        |--------------------------------------------------------------------------
        */

        $existingUser = User::where(
            'email',
            $email
        )->first();

        /*
         * Prevent the same email from silently being reassigned
         * to another Google identity.
         */
        if (
            $existingUser &&
            ! empty($existingUser->google_id) &&
            $existingUser->google_id !== $googleId
        ) {
            return response()->json([
                'message' =>
                    'This email is already linked to another Google account.',

                'code' =>
                    'GOOGLE_ACCOUNT_CONFLICT',
            ], 409);
        }

        /*
         * Also make sure the incoming Google ID isn't already attached
         * to a completely different user/email.
         */
        $googleUser = User::where(
            'google_id',
            $googleId
        )->first();

        if (
            $googleUser &&
            $existingUser &&
            $googleUser->id !== $existingUser->id
        ) {
            return response()->json([
                'message' =>
                    'This Google account conflicts with an existing account.',

                'code' =>
                    'GOOGLE_ACCOUNT_CONFLICT',
            ], 409);
        }

        if (
            $googleUser &&
            strtolower($googleUser->email) !== $email
        ) {
            return response()->json([
                'message' =>
                    'This Google account is already associated with another email address.',

                'code' =>
                    'GOOGLE_ACCOUNT_CONFLICT',
            ], 409);
        }

        /*
        |--------------------------------------------------------------------------
        | Determine New / Existing User
        |--------------------------------------------------------------------------
        */

        $isNewUser = ! $existingUser && ! $googleUser;

        /*
        |--------------------------------------------------------------------------
        | Create or Update User
        |--------------------------------------------------------------------------
        |
        | New Google users receive a random internal password.
        |
        | IMPORTANT:
        | password_set = false tells the application that this random
        | hash is NOT a password selected by the customer.
        |
        */

        $user = User::updateOrCreate(
            [
                'email' => $email,
            ],
            [
                'name' =>
                    $existingUser?->name
                    ?? $googleUser?->name
                    ?? ($name !== '' ? $name : 'Google User'),

                'google_id' => $googleId,

                'email_verified_at' =>
                    $existingUser?->email_verified_at
                    ?? $googleUser?->email_verified_at
                    ?? now(),

                'password' =>
                    $existingUser?->password
                    ?? $googleUser?->password
                    ?? Hash::make(Str::random(32)),

                /*
                 * Existing account keeps its current status.
                 *
                 * Brand-new Google user starts with false.
                 */
                'password_set' =>
                    $existingUser?->password_set
                    ?? $googleUser?->password_set
                    ?? false,

                'role' =>
                    $existingUser?->role
                    ?? $googleUser?->role
                    ?? UserRole::Customer,
            ]
        );

        /*
         * Google has already verified ownership of the email.
         */
        if (! $user->hasVerifiedEmail()) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        /*
        |--------------------------------------------------------------------------
        | New User Events
        |--------------------------------------------------------------------------
        */

        if ($isNewUser) {
            event(new Registered($user));

            $user->notify(
                new WelcomeNotification()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create Sanctum Token
        |--------------------------------------------------------------------------
        */

        $token = $user->createToken(
            'auth-token'
        )->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                $isNewUser
                    ? 'Registration successful.'
                    : 'Login successful.',

            'user' => new UserResource(
                $user->load('addresses')
            ),

            'token' => $token,

            'authentication' => [
                'google' => true,

                /*
                 * Do NOT use !empty($user->password) here.
                 *
                 * Google users have an internally generated password,
                 * so password_set is the source of truth.
                 */
                'password' =>
                    (bool) $user->password_set,

                'needs_password_setup' =>
                    ! $user->password_set,

                'can_set_password' => true,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Set Password
    |--------------------------------------------------------------------------
    */

    /**
     * Set a local account password.
     *
     * This allows a Google user to subsequently login with:
     *
     * email + password
     *
     * as well as Google.
     */
    public function setPassword(
        Request $request
    ): JsonResponse {
        $request->validate([
            'password' => ['required', 'string', 'confirmed'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /*
         * Store the customer's actual account password.
         *
         * This is NOT their Gmail/Google password.
         */
        $user->forceFill([
            'password' => Hash::make(
                (string) $request->string('password')
            ),

            'password_set' => true,
        ])->save();

        return response()->json([
            'message' =>
                'Password set successfully.',

            'user' => new UserResource(
                $user->load('addresses')
            ),

            'authentication' => [
                'google' =>
                    ! empty($user->google_id),

                'password' => true,

                'needs_password_setup' => false,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Send Phone OTP
    |--------------------------------------------------------------------------
    */

    /**
     * Send phone OTP.
     */
    public function sendOtp(
        SendOtpRequest $request
    ): JsonResponse {
        $phone =
            (string) $request->string('phone');

        $recent = Otp::where(
            'phone',
            $phone
        )
            ->where(
                'created_at',
                '>',
                now()->subSeconds(60)
            )
            ->exists();

        if ($recent) {
            return response()->json([
                'message' =>
                    'Please wait before requesting another code.',
            ], 429);
        }

        $code = (string) random_int(
            100000,
            999999
        );

        Otp::create([
            'phone' => $phone,

            'code' =>
                Hash::make($code),

            'expires_at' =>
                now()->addMinutes(5),

            'used' => false,
        ]);

        $smsResponse = Http::timeout(10)
            ->post(
                config('services.sms.url'),
                [
                    'api_token' =>
                        config('services.sms.token'),

                    'phone' => $phone,

                    'message' =>
                        "Your ShopSphere verification code is {$code}",
                ]
            );

        if (! $smsResponse->successful()) {
            return response()->json([
                'message' =>
                    'Unable to send OTP. Please try again.',
            ], 503);
        }

        return response()->json([
            'message' =>
                'OTP sent successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Phone OTP
    |--------------------------------------------------------------------------
    */

    /**
     * Verify phone OTP.
     */
    public function verifyOtp(
        VerifyOtpRequest $request
    ): JsonResponse {
        $phone =
            (string) $request->string('phone');

        $record = Otp::where(
            'phone',
            $phone
        )
            ->where('used', false)
            ->latest()
            ->first();

        if (
            ! $record ||
            $record->expires_at->isPast()
        ) {
            return response()->json([
                'message' =>
                    'OTP expired or not found. Please request a new one.',
            ], 422);
        }

        if (
            ! Hash::check(
                (string) $request->string('otp'),
                $record->code
            )
        ) {
            return response()->json([
                'message' => 'Invalid OTP.',
            ], 422);
        }

        $record->update([
            'used' => true,
        ]);

        User::where(
            'phone',
            $phone
        )->update([
            'phone_verified_at' => now(),
        ]);

        return response()->json([
            'verified' => true,

            'message' =>
                'Phone verified successfully.',
        ]);
    }
}