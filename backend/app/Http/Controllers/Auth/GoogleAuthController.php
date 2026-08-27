// app/Http/Controllers/Auth/GoogleAuthController.php
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use App\Models\User;
use Illuminate\Support\Facades\Http;

class GoogleAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['id_token' => 'required|string']);

        // Verify token against Google's public keys
        $keys = Http::get('https://www.googleapis.com/oauth2/v3/certs')->json();
        $payload = JWT::decode(
            $request->id_token,
            JWK::parseKeySet($keys)
        );

        if ($payload->aud !== config('services.google.client_id')) {
            return response()->json(['message' => 'Invalid token audience'], 401);
        }

        $user = User::updateOrCreate(
            ['email' => $payload->email],
            [
                'name' => $payload->name,
                'google_id' => $payload->sub,
                'email_verified_at' => now(),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }
}