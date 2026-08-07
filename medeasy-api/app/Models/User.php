<?php

namespace App\Models;

// Illuminate\Foundation\Auth\User gives us the base auth-user behavior
// (Authenticatable, Authorizable, CanResetPassword) without needing to
// compose each trait by hand.
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin;
    }

    public function coursesCreated(): HasMany
    {
        return $this->hasMany(Course::class, 'created_by');
    }

    public function topicProgress(): HasMany
    {
        return $this->hasMany(TopicProgress::class);
    }
}
