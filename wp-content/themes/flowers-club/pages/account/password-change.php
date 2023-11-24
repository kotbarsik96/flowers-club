<?php get_header(); ?>

<div class="content profile">
    <?php get_static_menu('account-sidebar') ?>
    <div class="profile__content">
        <form class="tile auth-modal__container password-change-form">
            <h3 class="auth-modal__title">
                Изменение пароля
            </h3>
            <div class="auth-modal__input-container text-input--standard">
                <div class="text-input__wrapper">
                    <input class="auth-modal__input text-input__input" name="current-password" type="password"
                        placeholder="Введите текущий пароль">
                    <button class="text-input__password-see icon-eye-slash" type="button" aria-label="Показать/скрыть пароль"></button>
                </div>
                <div class="error">
                    Неверно указан пароль
                </div>
            </div>
            <div class="auth-modal__input-container text-input--standard">
                <div class="text-input__wrapper">
                    <input class="auth-modal__input text-input__input" name="new-password" type="password"
                        placeholder="Введите новый пароль">
                    <button class="text-input__password-see icon-eye-slash" type="button" aria-label="Показать/скрыть пароль"></button>
                </div>
                <div class="error">
                    <?= INCORRECT_PASSWORD_TEXT ?>
                </div>
            </div>
            <div class="auth-modal__input-container text-input--standard">
                <div class="text-input__wrapper">
                    <input class="auth-modal__input text-input__input" name="new-password-repeat" type="password"
                        placeholder="Повторите новый пароль">
                    <button class="text-input__password-see icon-eye-slash" type="button" aria-label="Показать/скрыть пароль"></button>
                </div>
                <div class="error">
                    Пароли не совпадают
                </div>
            </div>
            <button class="auth-modal__button button" type="submit">
                Изменить
            </button>
        </form>
    </div>
</div>

<?php get_footer(); ?>