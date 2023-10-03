<ul class="profile__nav-tile nav-tile nav-tile-container tile">
    <li class="nav-tile__item">
        <a class="nav-tile__button <?= is_user_page() ? '__active' : '' ?>" href="<?= get_user_page_url() ?>">
            <span class="nav-tile__mobile-icon icon-user"></span>
            Профиль
        </a>
    </li>
    <li class="nav-tile__mobile-hidden">
        <div class="nav-tile__item nav-tile__item--mobile-toggle">
            <button class="nav-tile__button" type="button">
                <span class="nav-tile__mobile-icon icon-preferences"></span>
                Настройки
            </button>
        </div>
        <ul class="nav-tile nav-tile--mobile tile">
            <li class="nav-tile__item">
                <a class="nav-tile__button <?= is_page('password-change') ? '__active' : '' ?>"
                    href="<?= get_permalink(FLCL_PASSWORD_CHANGE_PAGE) ?>">
                    <span class="icon-preferences nav-tile__mobile-icon"></span>
                    Изменить пароль
                </a>
            </li>
            <li class="nav-tile__item">
                <button class="nav-tile__button" type="button" data-logout-button>
                    Выйти
                    <span class="icon-out"></span>
                </button>
            </li>
        </ul>
    </li>
</ul>