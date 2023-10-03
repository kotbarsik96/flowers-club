<?php get_header(); ?>

<div class="content profile">
    <ul class="profile__nav-tile nav-tile nav-tile-container tile">
        <li class="nav-tile__item">
            <a class="nav-tile__button __active" href="/flowers-club/profile/full">
                <span class="nav-tile__mobile-icon icon-user"></span>
                Профиль
            </a>
        </li>
        <li class="nav-tile__item">
            <a class="nav-tile__button" href="/flowers-club/profile/consultations">
                <span class="nav-tile__mobile-icon icon-chats"></span>
                Консультации
            </a>
        </li>
        <li class="nav-tile__item">
            <a class="nav-tile__button" href="/flowers-club/profile/finance">
                <span class="nav-tile__mobile-icon icon-ruble-circle"></span>
                Финансы
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
                    <a class="nav-tile__button" href="/flowers-club/profile/security">
                        <span class="icon-preferences nav-tile__mobile-icon"></span>
                        Изменить пароль
                    </a>
                </li>
                <li class="nav-tile__item">
                    <button class="nav-tile__button" type="button">
                        Выйти
                        <span class="icon-out"></span>
                    </button>
                </li>
            </ul>
        </li>
    </ul>
    <div class="profile__content">
        <div class="tile dialogue-container">
            <div class="tile__head">
                <button class="tile__head-back icon-arrow" type="button" aria-label="обновить"></button>
                <h3 class="tile__title">
                    Артем Валентинович
                </h3>
            </div>
            <div class="dialogue-container__inner">
                <div class="dialogue-box">
                    <div class="dialogue-box__wrapper">
                        <div class="dialogue-box__date-wrapper dialogue-box__date-wrapper--current">
                            <span>13 марта</span>
                        </div>
                        <div class="dialogue-box__message-wrapper dialogue-box__message-wrapper--companion">
                            <div class="dialogue-box__message dialogue-message dialogue-message--companion">
                                <div class="dialogue-message__text">
                                    Добрый день, Евгения
                                </div>
                                <div class="dialogue-message__time">
                                    12:50
                                </div>
                            </div>
                        </div>
                        <div class="dialogue-box__message-wrapper dialogue-box__message-wrapper--companion">
                            <div class="dialogue-box__message dialogue-message dialogue-message--companion">
                                <div class="dialogue-message__text">
                                    Отвечу на ваш вопрос за 300р
                                </div>
                                <div class="dialogue-message__buttons">
                                    <button class="dialogue-message__button button">
                                        Принять
                                    </button>
                                    <button class="dialogue-message__button button button--red">
                                        Отказать
                                    </button>
                                </div>
                                <div class="dialogue-message__time">
                                    12:50
                                </div>
                            </div>
                        </div>
                        <div class="dialogue-box__message-wrapper">
                            <div class="dialogue-box__message dialogue-message">
                                <div class="dialogue-message__text">
                                    Здравстуйте. Пытаюсь проростить яблоню, но не знаю как это сделать.
                                </div>
                                <div class="dialogue-message__time">
                                    12:52
                                </div>
                            </div>
                        </div>
                        <div class="dialogue-box__date-wrapper">
                            <span>14 марта</span>
                        </div>
                    </div>
                </div>
                <div class="dialogue-container__input">
                    <div class="dialogue-container__input-user">
                        <img src="/flowers-club/img/users/marmi/avatar.jpg" alt="Аватар" class="dialogue-container__input-user-avatar">
                    </div>
                    <div class="dialogue-container__input-user-content">
                        <textarea class="dialogue-container__input-user-textarea" name="dialogue-message" placeholder="Введите текст сообщения..."></textarea>
                        <label class="dialogue-container__input-user-attach">
                            <input type="file">
                            <span class="icon-clip"></span>
                            Прикрепить фото
                        </label>
                        <button class="dialogue-container__input-user-send button" type="button">
                            Отправить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php get_footer(); ?>