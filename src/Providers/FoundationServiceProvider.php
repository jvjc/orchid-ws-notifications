<?php

declare(strict_types=1);

namespace Victor\WebsocketNotification\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Class FoundationServiceProvider.
 * After update run: php artisan vendor:publish --tag=public --force
 */
class FoundationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this
            ->registerPublicAssets();
    }

    public function registerPublicAssets(): self
    {
        $this->publishes([
            __DIR__.'/../../public' => public_path('vendor/wssnoty'),
        ], 'public');

        return $this;
    }
}