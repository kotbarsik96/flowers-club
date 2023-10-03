<?php get_header();
$product_id = get_queried_object()->ID;
$product = wc_get_product($product_id);
$product_attributes = $product->get_attributes();

$product_description_raw = $product->get_description();
$product_description_raw = preg_replace('/\s{2,}/', '', $product_description_raw);
preg_match('/\[product_description\].*\[\/product_description\]/', $product_description_raw, $prod_descr_matches);
preg_match('/\[product_in_particular\].*\[\/product_in_particular\]/', $product_description_raw, $prod_particular_matches);

$product_description = array_key_exists(0, $prod_descr_matches) ? $prod_descr_matches[0] : '';
$product_in_particular = array_key_exists(0, $prod_particular_matches) ? $prod_particular_matches[0] : '';

$product_user_ratings->get_average_rating_value($product->get_id());
?>

<div <?= flcl_set_product_data($product, 'content product-page') ?>>
    <div class="content__container">
        <?php flcl_breadcrumbs(); ?>
    </div>
    <section class="product-page__info">
        <div class="product-page__image-container toggle-slider"
            data-params="sliderMedia:767; swiperSelector:.product-page__image-container; wrapperClass:product-page__images; slideClass:product-page__image-item; slidesPerView:1">
            <img class="product-page__main-img" src="<?= wp_get_attachment_url($product->get_image_id()) ?>"
                alt="<?= $product->get_name() ?>" data-dynamic-adaptive=".product-page__image-item--main, 767">
            <ul class="product-page__images">
                <li class="product-page__image-item product-page__image-item--main"></li>
                <?php
                $product_gallery = $product->get_gallery_image_ids() ?? [];
                foreach ($product_gallery as $product_image_id): ?>

                    <li class="product-page__image-item">
                        <img src="<?= wp_get_attachment_url($product_image_id) ?>" alt="<?= $product->get_name() ?>"
                            class="product-page__img">
                    </li>

                <?php endforeach; ?>
            </ul>
        </div>
        <div class="product-page__body product-body">
            <div class="product-body__main">
                <div class="product-body__main-info">
                    <h2 class="product-body__title">
                        <?= $product->get_name() ?>
                    </h2>
                    <div class="product-body__pricing">
                        <div class="product-body__pricing-price">
                            <?php if ($product->get_sale_price()): ?>
                                <span class="product-body__pricing-old">
                                    <?= $product->get_regular_price() . ' ' . get_woocommerce_currency_symbol() ?>
                                </span>
                            <?php endif ?>
                            <span class="product-body__pricing-current">
                                <?= $product->get_price() . ' ' . get_woocommerce_currency_symbol() ?>
                            </span>
                        </div>
                        <div class="product-body__pricing-amount">
                            <div class="amount-change" data-params="minValue:1; maxValue:99"></div>
                        </div>
                    </div>
                    <div class="product-body__block">
                        <div class="product-body__vendor-code">
                            Артикул:
                            <?= $product->get_sku() ?>
                        </div>
                        <div class="product-body__rating star-rating" data-params="noInteract:true; defaultAmount:<?= $product_user_ratings->get_average_rating_value($product->get_id()) ?>">
                        </div>
                    </div>
                    <div class="product-body__block product-body__block--descriptions">
                        <div class="product-body__description">
                            <span class="product-body__description-title">Вес:</span>
                            <span class="product-body__description-content">
                                <?= $product->get_weight() * 1000 ?>
                                г
                            </span>
                        </div>
                    </div>
                </div>

                <div class="product-body__buttons">
                    <?php
                    $in_cart = find_in_cart($product->get_id());
                    if ($in_cart): ?>

                        <div class="product-body__in-cart">
                            Товар уже в корзине:
                            <?= $in_cart['quantity'] ?>
                            шт.
                        </div>

                    <?php endif ?>

                    <?php
                    $product_status = $product->get_stock_status();

                    if ($product_status === 'instock'): ?>

                        <button class="button product-page__to-cart" type="button">
                            <span class="icon-cart"></span>
                            <span class="product-page__to-cart-text">
                                <?php if (find_in_cart($product->get_id())): ?>
                                    Убрать
                                <?php else: ?>
                                    В корзину
                                <?php endif ?>
                            </span>
                        </button>

                    <?php elseif ($product_status === 'outofstock'): ?>

                        <button class="button" disabled type="button">
                            Нет в наличии
                        </button>

                    <?php endif ?>

                    <button class="product-page__like-button button product-to-favorites" type="button">
                        <span class="icon-heart"></span>
                        <span class="product-page__like-button-text">
                            <?php if (flcl_is_in_favorites(FAVORITE_PRODUCTS_KEY, $product->get_id())): ?>
                                В избранном
                            <?php else: ?>
                                В избранное
                            <?php endif ?>
                        </span>
                    </button>
                </div>
            </div>
            <div class="product-body__user-review">
                <?php 
                    $user_rated_value = $product_user_ratings->rated_by_user($product->get_id());
                ?>
                <div class="product-body__user-review-title">
                    Ваша оценка:
                </div>
                <div class="star-rating star-rating--user" data-params="defaultAmount:<?= $user_rated_value ?? 0 ?>"></div>
                <?php if ($user_rated_value): ?>

                    <button class="button product-page__remove-review" type="button">
                        Убрать оценку
                    </button>

                <?php endif ?>
            </div>
            <div class="product-body__tabs tabs">
                <div class="tabs__buttons-list">
                    <button class="tabs__button">
                        Описание
                    </button>
                    <button class="tabs__button">
                        Особенности
                    </button>
                    <button class="tabs__button">
                        Отзывы
                    </button>
                </div>
                <div class="tabs__content">
                    <div class="tabs__content-item">
                        <div class="product-tab">
                            <ul class="product-tab__attributes">
                                <?php
                                $freeze_resistance = $product->get_attribute('freeze_resistance');
                                $max_height = $product->get_attribute('max_height');
                                $highlights = $product->get_attribute('highlights');
                                ?>

                                <?php if (!empty($freeze_resistance)): ?>

                                    <li class="product-tab__attributes-item">
                                        <img class="product-tab__attributes-icon"
                                            src="<?= get_template_directory_uri() . '/assets/img/icons/product/freeze_resistance.svg' ?>">
                                        <div class="product-tab__attributes-text">
                                            морозостойкость до -
                                            <?= $freeze_resistance ?>
                                            °C
                                        </div>
                                    </li>

                                <?php endif ?>
                                <?php if ($max_height): ?>

                                    <li class="product-tab__attributes-item">
                                        <img class="product-tab__attributes-icon"
                                            src="<?= get_template_directory_uri() . '/assets/img/icons/product/ruler.svg' ?>">
                                        <div class="product-tab__attributes-text">
                                            высота до
                                            <?= $max_height ?>
                                            м
                                        </div>
                                    </li>

                                <?php endif ?>
                                <?php if ($highlights): ?>

                                    <li class="product-tab__attributes-item">
                                        <img class="product-tab__attributes-icon"
                                            src="<?= get_template_directory_uri() . '/assets/img/icons/product/grade.svg' ?>">
                                        <div class="product-tab__attributes-text">
                                            <?= $highlights ?>
                                        </div>
                                    </li>

                                <?php endif ?>
                            </ul>
                            <?= do_shortcode($product_description) ?>
                            <?php

                            $combinations = $product->get_attribute('combines');
                            if (!empty($combinations)): ?>

                                <div class="product-tab__products-list products-list">

                                    <?php
                                    $combintaions = preg_replace('/\s+/', '', $combinations);
                                    $combinations = explode('|', $combinations);

                                    foreach ($combinations as $slug): ?>

                                        <?= flcl_get_product_category_card($slug) ?>

                                    <?php endforeach; ?>

                                </div>

                            <?php endif; ?>
                        </div>
                    </div>
                    <div class="tabs__content-item">
                        <?= do_shortcode($product_in_particular) ?>
                    </div>
                    <div class="tabs__content-item">
                        <div class="comments">
                            <?php comments_template(); ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<?php get_footer(); ?>