<?php get_header();
$flcl_user_data = get_userdata(get_current_user_id());
$user_gardening_conditions = explode(',', $flcl_user_data->user_gardening_conditions ?? '');
$user_soil = explode(',', $flcl_user_data->user_soil ?? '');
?>

<div class="content profile">
    <?php get_static_menu('account-sidebar') ?>
    <div class="profile__content">
        <form class="form tile account-settings-form" data-params="failValidatePopup:true">
            <section class="form__section">
                <div class="form__section-head">
                    <h4 class="form__title">
                        <label for="profile-about">О себе</label>
                    </h4>
                    <div class="form__section-description">
                        <span class="required-sign"></span>
                        <span>отмечены поля, обязательные для заполнения</span>
                    </div>
                </div>
                <div class="text-input text-input--textarea">
                    <div class="text-input__wrapper">
                        <textarea class="text-input__input" name="user_about"
                            id="profile-about" maxlength="200"><?= $flcl_user_data->user_about ?></textarea>
                    </div>
                </div>
            </section>
            <section class="form__section">
                <div class="form__section-head">
                    <h4 class="form__title">
                        <label class="required-sign" for="user-name">
                            Имя
                        </label>
                    </h4>
                </div>
                <div class="text-input text-input--standard" data-required>
                    <div class="text-input__wrapper">
                        <input class="text-input__input" id="user-name" name="first_name" type="text"
                            value="<?= $flcl_user_data->first_name ?>">
                    </div>
                    <div class="error">
                        Пожалуйста, укажите имя
                    </div>
                </div>
            </section>
            <section class="form__section">
                <div class="form__section-head">
                    <h4 class="form__title">
                        <label for="user-surname">Фамилия</label>
                    </h4>
                    <div class="form__section-description form__section-description--flex">
                        <label class="form__section-description-text" for="show-user-name">
                            Показывать фамилию на сайте
                        </label>
                        <label class="toggle-button">
                            <input id="show-user-name" type="checkbox" name="user_show_last_name"
                                <?= $flcl_user_data->user_show_last_name ? 'checked' : '' ?>>
                            <span class="toggle-button__container"></span>
                        </label>
                    </div>
                </div>
                <div class="text-input text-input--standard">
                    <div class="text-input__wrapper">
                        <input class="text-input__input" id="user-surname" name="last_name" type="text"
                            value="<?= $flcl_user_data->last_name ?>">
                    </div>
                    <div class="error">
                        Пожалуйста, укажите фамилию
                    </div>
                </div>
            </section>
            <section class="form__section">
                <div class="form__section-head">
                    <h4 class="form__title">
                        <label for="user-patronymic">Отчество</label>
                    </h4>
                </div>
                <div class="text-input text-input--standard">
                    <div class="text-input__wrapper">
                        <input class="text-input__input" id="user-patronymic" name="patronymic_name" type="text"
                            value="<?= $flcl_user_data->patronymic_name ?>">
                    </div>
                </div>
            </section>
            <section class="form__section">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            Пол
                        </h4>
                    </div>
                    <div class="radio-select">
                        <label class="radio-select__label">
                            <input type="radio" name="user_gender" value="Мужской"
                                <?= $flcl_user_data->user_gender === 'Мужской' ? 'checked' : '' ?>>
                            <span class="radio-select__icon icon-wrapper icon-wrapper--circle icon-male-sign"></span>
                            <span class="radio-select__text">Мужской</span>
                        </label>
                        <label class="radio-select__label">
                            <input type="radio" name="user_gender" value="Женский"
                                <?= $flcl_user_data->user_gender === 'Женский' ? 'checked' : '' ?>>
                            <span class="radio-select__icon icon-wrapper icon-wrapper--circle icon-female-sign"></span>
                            <span class="radio-select__text">Женский</span>
                        </label>
                    </div>
                </div>
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label for="user-birthdate">
                                Дата рождения
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard"
                        data-params="isDate:true; minYear:-99; maxYear:currentYear;">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" type="text" id="user-birthdate" name="user_birthdate"
                                placeholder="01/01/2000" value="<?= $flcl_user_data->user_birthdate ?>">
                            <span class="text-input__icon icon-calendar"></span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label class="required-sign" for="user-email">
                                E-mail
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard" data-required data-params="completionMask:email">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user-email" name="user_email" type="text"
                                value="<?= $flcl_user_data->user_email ?>">
                        </div>
                        <div class="error">
                            Пожалуйста, укажите Email
                        </div>
                    </div>
                </div>
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label class="required-sign" for="user-phone">
                                Телефон
                            </label>
                        </h4>
                    </div>
                    <div class="text-input--standard" data-required
                        data-params="completionMask:phone; numbersOnly:true; typeOnly:\s\(\)\-\+; isStrictCompletionMask:true">
                        <div class="text-input__wrapper">
                            <input class="auth-modal__input text-input__input" name="user_phone" type="text"
                                placeholder="+7 ___ ___-__-__" value="<?= $flcl_user_data->user_phone ?>">
                        </div>
                        <div class="error">
                            Пожалуйста, укажите номер телефона (формат: +7 ( ___ ) ___-__-__)
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label for="user-city">
                                Город
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user-city" name="user_city" type="text"
                                value="<?= $flcl_user_data->user_city ?>">
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section checkboxes-list--flex">
                <label class="checkbox-item checkbox-item--gray">
                    <input type="checkbox" name="user_personal_data_proccessing_agreed"
                        <?= $flcl_user_data->user_personal_data_proccessing_agreed ? 'checked' : '' ?>>
                    <span
                        class="checkbox-item__checkbox icon-checkmark checkbox-item__checkbox icon-checkmark--bigger icon-checkmark"
                        style="--checkbox_color: var(--gray_pink)"></span>
                    <span class="checkbox-item__text">
                        соглашаюсь на
                        <span class="checkbox-item__link">
                            обработку персональных данных
                        </span>
                    </span>
                </label>
                <label class="checkbox-item checkbox-item--gray">
                    <input type="checkbox" name="user_mailing_agreed" <?= $flcl_user_data->user_mailing_agreed ? 'checked' : '' ?>>
                    <span class="checkbox-item__checkbox icon-checkmark checkbox-item__checkbox icon-checkmark--bigger"
                        style="--checkbox_color: var(--blue);"></span>
                    <span class="checkbox-item__text">
                        соглашаюсь получать рассылку
                    </span>
                </label>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label for="user-gardening_experience">
                                Садоводческий стаж с
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user-gardening_experience"
                                name="user_gardening_experience_since" type="text"
                                value="<?= $flcl_user_data->user_gardening_experience_since ?>">
                        </div>
                    </div>
                </div>
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label for="user-usda_zone">
                                Зона USDA
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user-usda_zone" name="user_usda_zone" type="text"
                                value="<?= $flcl_user_data->user_usda_zone ?>">
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label for="user_favorite_plants">
                                Любимые растения
                            </label>
                        </h4>
                    </div>
                    <div class="text-input text-input--standard">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user_favorite_plants" name="user_favorite_plants"
                                type="text" value="<?= $flcl_user_data->user_favorite_plants ?>">
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            Условия в саду
                        </h4>
                    </div>
                    <div class="checkboxes-list">
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_gardening_conditions['purged']" <?= in_array('purged', $user_gardening_conditions) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Продуваемый
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_gardening_conditions['silent']" <?= in_array('silent', $user_gardening_conditions) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Тихий (ветров мало)
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_gardening_conditions['opened']" <?= in_array('opened', $user_gardening_conditions) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Открытый
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_gardening_conditions['protected']"
                                <?= in_array('protected', $user_gardening_conditions) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Защищенное место (в лесу)
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_gardening_conditions['other']" <?= in_array('other', $user_gardening_conditions) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Другое
                            </span>
                        </label>
                    </div>
                </div>
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            Почва в саду
                        </h4>
                    </div>
                    <div class="checkboxes-list">
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_soil['clay']" <?= in_array('clay', $user_soil) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Глина
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_soil['loam']" <?= in_array('loam', $user_soil) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Суглинок
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_soil['sand']" <?= in_array('sand', $user_soil) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Песок
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_soil['peatlands']" <?= in_array('peatlands', $user_soil) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Торфяники
                            </span>
                        </label>
                        <label class="checkbox-item">
                            <input type="checkbox" name="user_soil['other']" <?= in_array('other', $user_soil) ? 'checked' : '' ?>>
                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                            <span class="checkbox-item__text">
                                Другое
                            </span>
                        </label>
                    </div>
                </div>
            </section>
            <button class="button button--simple" type="submit">
                Сохранить изменения
            </button>
        </form>
        <form class="form tile user-shipment-address-settings" data-params="failValidatePopup:true">
            <div class="form__section-head">
                <h2 class="form__main-title">
                    Адрес доставки
                </h2>
                <div class="form__section-description">
                    <span class="required-sign"></span>
                    <span>отмечены поля, обязательные для заполнения</span>
                </div>
            </div>
            <section class="form__section">
                <div class="form__section-head">
                    <h4 class="form__title">
                        <label class="required-sign" for="user_address-city">
                            Населенный пункт
                        </label>
                    </h4>
                </div>
                <div class="text-input">
                    <div class="text-input__wrapper">
                        <input class="text-input__input" id="user_address-city" type="text"
                            name="user_shipment_location" value="<?= $flcl_user_data->user_shipment_location ?? '' ?>">
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label class="required-sign" for="user_address-street">
                                Улица
                            </label>
                        </h4>
                    </div>
                    <div class="text-input">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user_address-street" type="text"
                                name="user_shipment_street" value="<?= $flcl_user_data->user_shipment_street ?? '' ?>">
                        </div>
                    </div>
                </div>
                <div class="form__section-item form__item-flex">
                    <div class="form__item-item">
                        <div class="form__section-head">
                            <h4 class="form__title">
                                <label class="required-sign" for="user_address-house">
                                    Дом
                                </label>
                            </h4>
                        </div>
                        <div class="text-input text-input--standard">
                            <div class="text-input__wrapper">
                                <input class="text-input__input" id="user_address-house" type="text"
                                    name="user_shipment_house"
                                    value="<?= $flcl_user_data->user_shipment_house ?? '' ?>">
                            </div>
                        </div>
                    </div>
                    <div class="form__item-item">
                        <div class="form__section-head">
                            <h4 class="form__title">
                                <label class="required-sign" for="user_address-flat">
                                    Квартира
                                </label>
                            </h4>
                        </div>
                        <div class="text-input">
                            <div class="text-input__wrapper">
                                <input class="text-input__input" id="user_address-flat" type="text"
                                    name="user_shipment_flat" value="<?= $flcl_user_data->user_shipment_flat ?? '' ?>">
                            </div>
                        </div>
                    </div>
                    <div class="form__item-item">
                        <div class="form__section-head">
                            <h4 class="form__title">
                                <label for="user_address-frame">
                                    Корпус
                                </label>
                            </h4>
                        </div>
                        <div class="text-input">
                            <div class="text-input__wrapper">
                                <input class="text-input__input" id="user_address-frame" type="text"
                                    name="user_shipment_frame"
                                    value="<?= $flcl_user_data->user_shipment_frame ?? '' ?>">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="form__section form__section--flex">
                <div class="form__section-item">
                    <div class="form__section-head">
                        <h4 class="form__title">
                            <label class="required-sign" for="user_address-index">
                                Индекс
                            </label>
                        </h4>
                    </div>
                    <div class="text-input">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" id="user_address-index" type="text"
                                name="user_shipment_mail_index"
                                value="<?= $flcl_user_data->user_shipment_mail_index ?? '' ?>">
                        </div>
                    </div>
                </div>
            </section>
            <button class="button button--simple" type="submit">
                Сохранить изменения
            </button>
        </form>
    </div>
</div>

<?php get_footer(); ?>