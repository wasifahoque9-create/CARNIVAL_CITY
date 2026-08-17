FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring bcmath zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

RUN chown -R www-data:www-data storage bootstrap/cache

RUN a2enmod rewrite

COPY apache.conf /etc/apache2/sites-available/000-default.conf
CMD php artisan config:clear && php artisan cache:clear && php artisan storage:link --force && php artisan migrate --force && apache2-foreground
