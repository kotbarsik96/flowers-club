<?php get_header();
$category = get_queried_object();
$products = wc_get_products([
    'category' => $category->slug
]);

$products = $flcl_product_attrs->map_products($products);

wp_add_inline_script('shop', 'const categorySlug = "' . $category->slug . '";', 'before');
?>

<div class="content">
    <div class="content__container">
        <?php flcl_breadcrumbs() ?>
        <div class="shop">
            <div class="shop__filter filter" data-dynamic-adaptive="#shop-cards-filter-mobile, 767">
                <button class="filter__button" type="button">
                    <span class="filter__button-icon icon-filter"></span>
                    <span class="filter__button-text">Фильтр</span>
                </button>
                <div class="filter__body">
                    <div class="filter__body-header">
                        <button class="filter__close-button" type="button">
                            <span class="filter__button-icon menu-button __active">
                                <span class="menu-button__item"></span>
                                <span class="menu-button__item"></span>
                                <span class="menu-button__item"></span>
                            </span>
                            <span class="filter__button-text">Фильтры</span>
                        </button>
                    </div>
                    <?php
                    global $flcl_product_attrs;
                    $only_filtering = $flcl_product_attrs->get_only_filtering();
                    ?>

                    <div class="filter__body-blocks">
                        <?php foreach ($only_filtering as $filter_key => $filter_data): ?>
                            <div class="filter__block">
                                <h4 class="filter__block-title">
                                    <?= $filter_data['title'] ?>
                                </h4>
                                <?php if ($filter_data['filter_type'] === 'range_double'):
                                    $max_range_value = $flcl_product_attrs->get_max_range_value($filter_key, $products);
                                    if (array_key_exists('multiple', $filter_data))
                                        $max_range_value = $max_range_value * $filter_data['multiple'];
                                    ?>

                                    <div class="filter__block-content">
                                        <div class="range range--double"
                                            data-params="minValue:0; name:<?= $filter_key ?>; maxValue:<?= $max_range_value ?>; <?= array_key_exists('suffix', $filter_data) ? 'valueSuffix:' . $filter_data['suffix'] . ';' : '' ?> <?= array_key_exists('prefix', $filter_data) ? 'valuePrefix:' . $filter_data['prefix'] . ';' : '' ?>">
                                            <div class="range__values">
                                                <input class="range__value-item range__value-item--min" type="text">
                                                <input class="range__value-item range__value-item--max" type="text">
                                            </div>
                                            <div class="range__scale">
                                                <div class="range__bar"></div>
                                                <div class="range__toggler range__toggler--min"></div>
                                                <div class="range__toggler range__toggler--max"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            <?php elseif ($filter_data['filter_type'] === 'checkboxes'): ?>

                                <div class="input-buttons-list" data-params="name:<?= $filter_key ?>">
                                    <?php
                                    $checkboxes = $flcl_product_attrs->get_input_buttons($filter_key, $products);
                                    foreach ($checkboxes as $value): ?>

                                        <label class="checkbox-item">
                                            <input type="checkbox" name="<?= $filter_key ?>" value="<?= $value ?>">
                                            <span class="checkbox-item__checkbox icon-checkmark"></span>
                                            <span class="checkbox-item__text">
                                                <?= $value ?>
                                            </span>
                                        </label>

                                    <?php endforeach ?>
                                </div>
                            </div>

                        <?php endif ?>
                    <?php endforeach ?>
                </div>
            </div>
        </div>
        <div class="shop__cards">
            <div class="shop__cards-head">
                <div id="shop-cards-filter-mobile"></div>
                <div class="shop__selects">
                    <div class="shop__selects-title">Сортировка:</div>
                    <div class="select shop__selects-sort">
                        <div class="select__value-container">
                            <div class="select__value icon-chevron-down"></div>
                        </div>
                        <ul class="select__options-list" role="listbox">
                            <li class="select__option" data-value="recommended" role="option" aria-selected>
                                рекомендуем
                            </li>
                            <li class="select__option" data-value="alphabetAsc" role="option">
                                алфавит: а-я
                            </li>
                            <li class="select__option" data-value="alphabetDesc" role="option">
                                алфавит: я-а
                            </li>
                            <li class="select__option" data-value="priceAsc" role="option">
                                цена: от дешевых к дорогим
                            </li>
                            <li class="select__option" data-value="priceDesc" role="option">
                                цена: от дорогих к дешевым
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="shop__empty-list">
                <span class="icon-eye-slash"></span>
                <span>
                    К сожалению, товары не найдены. Попробуйте выбрать другие фильтры
                </span>
            </div>
            <ul class="shop__products-list products-list"></ul>
        </div>
    </div>
</div>
</div>

<?php get_footer(); ?>