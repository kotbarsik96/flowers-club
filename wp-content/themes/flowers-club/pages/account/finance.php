<?php get_header(); ?>

<div class="content profile">
    <?php get_static_menu('account-sidebar') ?>
    <div class="profile__content">
        <div class="tile balance tabs">
            <div class="tabs__dependencies">
                <div class="tabs__dependency-item">
                    <div class="tile__head">
                        <h3 class="tile__title">История</h3>
                        <button class="balance__refresh icon-refresh" type="button" aria-label="обновить"></button>
                    </div>
                    <div class="tile__description">
                        Информация о финансовых движениях
                    </div>
                </div>
                <div class="tabs__dependency-item">
                    <div class="tile__head">
                        <h3 class="tile__title">Реквизиты</h3>
                    </div>
                </div>
            </div>
            <div class="tile__tabs-container">
                <div class="tabs__buttons-list">
                    <button class="tabs__button" type="button">История баланса</button>
                    <button class="tabs__button" type="button">Реквизиты</button>
                </div>
                <div class="tabs__content">
                    <div class="tabs__content-item">
                        <div class="balance__content balance__history">
                            <div class="balance__history-head">
                                <div>
                                    <div class="balance__history-title">
                                        Баланс
                                    </div>
                                    <div class="balance__history-value">
                                        1590.00 руб.
                                    </div>
                                </div>
                                <div data-dynamic-adaptive=".balance__history-mobile-buttons, 519">
                                    <button class="button button--gray-pink" type="button">
                                        Пополнить баланс
                                    </button>
                                </div>
                            </div>
                            <div class="balance__history-table-container">
                                <table class="balance__history-table table tile">
                                    <tr class="table__r table__r--h">
                                        <th class="table__h">Дата</th>
                                        <th class="table__h">Тип операции</th>
                                        <th class="table__h">Сумма</th>
                                    </tr>
                                    <tr class="table__r">
                                        <td class="table__d">01.04.2020</td>
                                        <td class="table__d">Зачисление</td>
                                        <td class="table__d">1590.00 руб.</td>
                                    </tr>
                                    <tr class="table__r">
                                        <td class="table__d">01.04.2020</td>
                                        <td class="table__d">Зачисление</td>
                                        <td class="table__d">1590.00 руб.</td>
                                    </tr>
                                    <tr class="table__r">
                                        <td class="table__d">01.04.2020</td>
                                        <td class="table__d">Зачисление</td>
                                        <td class="table__d">1590.00 руб.</td>
                                    </tr>
                                    <tr class="table__r">
                                        <td class="table__d">01.04.2020</td>
                                        <td class="table__d">Зачисление</td>
                                        <td class="table__d">1590.00 руб.</td>
                                    </tr>
                                </table>
                                <button class="balance__show-more link link--red icon-chevron-down" type="button">
                                    Показать еще
                                </button>
                            </div>
                            <div class="balance__history-mobile-buttons"></div>
                        </div>
                    </div>
                    <div class="tabs__content-item">
                        <div class="balance__content balance__requisite">
                            <ul class="balance__requisite-list">
                                <li class="balance__requisite-item">
                                    <div class="balance__requisite-item-text">
                                        Платежная карта: 4100 34******7223
                                    </div>
                                    <div class="balance__requisite-item-buttons">
                                        <button class="icon-pen" type="button" aria-label="редактировать"></button>
                                        <button class="icon-trash-can" type="button" aria-label="удалить"></button>
                                    </div>
                                </li>
                                <li class="balance__requisite-item">
                                    <div class="balance__requisite-item-text">
                                        Платежная карта: 4100 34******7223
                                    </div>
                                    <div class="balance__requisite-item-buttons">
                                        <button class="icon-pen" type="button" aria-label="редактировать"></button>
                                        <button class="icon-trash-can" type="button" aria-label="удалить"></button>
                                    </div>
                                </li>
                            </ul>
                            <button class="balance__requisite-save button" type="button">
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php get_footer(); ?>