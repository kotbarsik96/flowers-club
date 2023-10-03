<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include get_stylesheet_directory() . '/head.php' ?>
    <title>Восстановление пароля</title>
</head>

<body class="auth-modal__iframe-inner">
    <form class="auth-modal__container password-recovery-form">
        <h3 class="auth-modal__title">
            Восстановление пароля
        </h3>
        <div class="auth-modal__input-container text-input--standard" data-required data-params="completionMask:email">
            <div class="text-input__wrapper">
                <input class="auth-modal__input text-input__input" name="email" type="email"
                    placeholder="Email">
            </div>
            <div class="error">
                Пожалуйста, укажите корректный адрес email
            </div>
        </div>
        <button class="auth-modal__button button" type="submit">
            Сбросить
        </button>
        <div class="auth-modal__offer">
            <a href="<?= get_permalink(FLCL_LOGIN_PAGE) ?>" class="link">
                Войти
            </a>
        </div>
    </form>

    <?php
    wp_footer();