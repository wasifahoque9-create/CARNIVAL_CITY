FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    git unzip curl libpq-dev libzip-dev zip \
    && docker-php-ext-install pdo pdo_pgsql zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

WORKDIR /app/backend

RUN composer install --no-dev --optimize-autoloader

RUN cp .env.example .env || true

RUN php artisan key:generate --force || true

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=$PORT