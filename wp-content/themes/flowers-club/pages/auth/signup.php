<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include get_stylesheet_directory() . '/head.php' ?>
    <title>Регистрация</title>
</head>

<body class="auth-modal__iframe-inner">
    <form class="auth-modal__container signup-form">
        <h3 class="auth-modal__title">
            Регистрация
        </h3>
        <div class="auth-modal__text">
            <!-- По номеру телефона и паролю -->
            По email и паролю
        </div>
        <div class="auth-modal__input-container text-input--standard" data-required>
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="user_name" type="text" placeholder="Имя">
            </div>
            <div class="error">
                Пожалуйста, укажите имя
            </div>
        </div>
        <!-- <div class="auth-modal__input-container text-input--standard" data-required data-params="completionMask:phone; isStrictCompletionMask:true">
            <div class="text-input__wrapper">
                <img src="< ?= get_template_directory_uri() ?>/assets/img/signup/country_russia.svg" alt="RU" class="auth-modal__input-container-country">
                <input class="auth-modal__input text-input__input" name="signup" type="text" placeholder="+7 ___ ___-__-__">
            </div>
        </div> -->
        <div class="auth-modal__input-container text-input--standard" data-required data-params="completionMask:email">
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="email" type="text"
                    placeholder="address@email.com">
            </div>
            <div class="error">
                Пожалуйста, укажите email в формате: address@example.com
            </div>
        </div>
        <div class="auth-modal__input-container text-input--standard" data-required>
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="password" type="password" placeholder="Пароль">
                <button class="text-input__password-see icon-eye-slash" type="button"></button>
            </div>
            <div class="error">
                <?= INCORRECT_PASSWORD_TEXT ?>
            </div>
        </div>
        <div class="auth-modal__conditions">
            Нажимая на кнопку, Вы соглашаетесь с тем, что прочитали
            <a class="link" href="<?= get_template_directory_uri() ?>/assets/conditions/user-agreement">
                пользовательское соглашение
            </a>
        </div>
        <button class="auth-modal__button button" type="submit">
            ЗАРЕГИСТРИРОВАТЬСЯ
        </button>
        <div class="auth-modal__offer">
            Уже есть аккаунт?
            <a href="<?= get_permalink(204) ?>" class="link">Войти</a>
        </div>
    </form>

    <?php
    wp_footer();