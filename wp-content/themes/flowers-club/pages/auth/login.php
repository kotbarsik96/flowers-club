<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include get_stylesheet_directory() . '/head.php' ?>
    <title>Вход</title>
</head>

<body class="auth-modal__iframe-inner">
    <form class="auth-modal__container login-form">
        <h3 class="auth-modal__title">
            Войти
        </h3>
        <div class="auth-modal__input-container text-input--standard" data-required data-params="completionMask:email">
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="login" type="text" placeholder="address@email.com">
            </div>
            <div class="error">
                Пожалуйста, укажите email в формате: address@example.com
            </div>
        </div>
        <div class="auth-modal__input-container text-input--standard" data-required>
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="password" type="password" placeholder="Пароль">
                <button class="text-input__password-see icon-eye-slash" type="button" aria-label="Показать/скрыть пароль"></button>
            </div>
            <div class="error">
                Неверно указаны логин или пароль
            </div>
        </div>
        <div class="auth-modal__forgot-password">
            <a class="link" href="<?= get_permalink(FLCL_PASSWORD_RECOVERY_PAGE) ?>">
                Забыли пароль?
            </a>
        </div>
        <button class="auth-modal__button button" type="submit">
            Войти
        </button>
        <div class="auth-modal__offer">
            Нет аккаунта?
            <a href="<?= get_permalink(FLCL_SIGNUP_PAGE) ?>" class="link">Регистрация</a>
        </div>
    </form>

    <?php
    wp_footer();
