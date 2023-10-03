<?php
$current_user = wp_get_current_user();
?>

<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include get_template_directory() . '/head.php' ?>
    <title>Клуб Садоводов</title>
</head>

<body class="<?= is_user_logged_in() ? 'logged-user' : '' ?>">
    <div class="wrapper">
        <div class="container">
            <aside class="site-menu">
                <div class="site-menu__icons"></div>
                <div class="site-menu__logo">
                    <a href="<?= get_permalink(FLCL_HOME_PAGE)?>">
                        <img src="<?= get_template_directory_uri() ?>/assets/img/icons/logo.png" alt="Клуб Садоводов">
                    </a>
                </div>
                <nav class="site-menu__nav site-nav">
                    <?php flcl_nav_menu([
                        'menu' => 'header-menu',
                        'menu_class' => 'site-nav__list'
                    ]); ?>
                </nav>
                <div class="site-menu__user-block">
                    <div id="header-user-links-mobile"></div>
                    <a class="button" href="#">
                        <span class="icon-crown"></span>
                        Вступить в клуб
                    </a>
                </div>
                <?php if (!is_user_logged_in()): ?>
                    <button class="button button--white site-menu__sign-up" type="button"
                        data-modal-call="name:auth; refresh:true; iframeSrc:''<?= get_permalink(FLCL_SIGNUP_PAGE) ?>''">
                        Регистрация
                    </button>
                <?php endif ?>
                <ul class="site-menu__socials">
                    <li class="site-menu__socials-item">
                        <a class="site-menu__socials-icon icon-telegram" href="https://web.telegram.org/z/"></a>
                    </li>
                    <li class="site-menu__socials-item">
                        <a class="site-menu__socials-icon icon-vk" href="https://vk.com/"></a>
                    </li>
                    <li class="site-menu__socials-item">
                        <a class="site-menu__socials-icon icon-youtube" href="https://www.youtube.com/"></a>
                    </li>
                </ul>
                <div class="site-menu__user-agreement">
                    <a class="link" href="<?= get_page_link(15) ?>">Пользовательское соглашение</a>
                </div>
                <?php if (is_user_logged_in()): ?>
                    <div class="site-menu__logout">
                        <button class="link" type="button" data-logout-button>Выйти из аккаунта</button>
                    </div>
                <?php endif ?>
            </aside>
            <header class="header">
                <?php
                if (flcl_is_shop_page())
                    get_static_menu('catalog');
                ?>
                <div class="header__logo">
                    <a href="<?= get_permalink(FLCL_HOME_PAGE) ?>">
                        <img src="<?= get_template_directory_uri() ?>/assets/img/icons/logo.png" alt="Клуб Садоводов">
                    </a>
                </div>
                <div class="header__icons"></div>
                <div class="header__search">
                    <div class="search __shown" data-disable-toggle="(min-width: 1440px)">
                        <div class="search-wrapper">
                            <div class="search-wrapper__icon icon-search"></div>
                            <input class="search-wrapper__input" type="text" placeholder="Поиск">
                        </div>
                    </div>
                </div>
                <button class="header__menu-button menu-button" type="button">
                    <span class="menu-button__item"></span>
                    <span class="menu-button__item"></span>
                    <span class="menu-button__item"></span>
                </button>
                <div class="header__user-block">
                    <a class="icon-cart icon-wrapper <?= count(wc()->cart->get_cart()) > 0 ? 'icon-wrapper--notify' : '' ?>" href="<?= get_permalink(FLCL_CART_PAGE) ?>"
                        data-dynamic-adaptive=".header__icons, 1439"></a>

                    <!-- авторизованный -->
                    <?php if (is_user_logged_in()): ?>

                        <!-- <a class="icon-bell icon-wrapper icon-wrapper--notify" data-dynamic-adaptive=".site-menu__icons, 1439" href="#"></a> -->
                        <a class="user-avatar" data-dynamic-adaptive=".site-menu__user-block, 1439"
                            href="<?= get_user_page_url() ?>">
                            <img src="<?= get_avatar_url($current_user) ?>" alt="Аватар">
                        </a>

                        <!-- неавторизованный -->
                    <?php else: ?>

                        <span class="fw-500" data-dynamic-adaptive="#header-user-links-mobile, 1439">
                            <button class="link" type="button"
                                data-modal-call="name:auth; refresh:true; iframeSrc:''<?= get_permalink(FLCL_LOGIN_PAGE) ?>''">
                                Войти
                            </button>
                            <span class="link">/</span>
                            <button class="link" type="button"
                                data-modal-call="name:auth; refresh:true; iframeSrc:''<?= get_permalink(FLCL_SIGNUP_PAGE) ?>''">
                                Регистрация
                            </button>
                        </span>

                    <?php endif ?>
                </div>
            </header>