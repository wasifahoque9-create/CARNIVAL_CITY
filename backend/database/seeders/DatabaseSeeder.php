<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@shopsphere.com'],
            [
                'name' => 'ShopSphere Admin',
                'phone' => '+10000000001',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ]
        );

        $customer = User::updateOrCreate(
            ['email' => 'customer@shopsphere.com'],
            [
                'name' => 'Demo Customer',
                'phone' => '+10000000002',
                'password' => Hash::make('password'),
                'role' => UserRole::Customer,
                'email_verified_at' => now(),
            ]
        );

        Address::updateOrCreate(
            [
                'user_id' => $customer->id,
                'line1' => '123 Gadget Avenue',
            ],
            [
                'label' => 'Home',
                'line2' => 'Apt 4B',
                'city' => 'Tech City',
                'postal_code' => '10001',
                'country' => 'USA',
                'is_default' => true,
            ]
        );

        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
