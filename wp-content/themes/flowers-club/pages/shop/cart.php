<?php get_header(); ?>

<div class="content">
    <section class="section">
        <div class="content__container">
            <h1 class="section__title section__title--bigger">Корзина</h1>
            <?php
            $cart = wc()->cart->get_cart();
            if (count($cart) > 0): ?>

                <div class="cart">
                    <div class="cart__header">
                        <div class="cart__item-image"></div>
                        <div class="cart__item-title"></div>
                        <div class="cart__header-item cart__header-price">Цена</div>
                        <div class="cart__header-item cart__header-amount">Количество</div>
                        <div class="cart__header-item cart__header-total">Сумма</div>
                    </div>
                    <ul class="cart__list">
                        <?php foreach ($cart as $cart_item):
                            $product = $cart_item['data']; ?>

                            <li class="cart__item" data-cart-item-key="<?= $cart_item['key'] ?>">
                                <a href="<?= get_permalink($product->get_id()) ?>">
                                    <img class="cart__item-image" src="<?= flcl_get_product_thumb($product) ?>"
                                        alt="<?= $product->get_name() ?>">
                                </a>
                                <div class="cart__item-title">
                                    <a href="<?= get_permalink($product->get_id()) ?>">
                                        <?= $product->get_name() ?>
                                    </a>
                                </div>
                                <div class="cart__item-position cart__item-price">
                                    <span class="price__value">
                                        <?= $product->get_price() ?>
                                    </span>
                                    <span class="price__currency">
                                        <?= get_woocommerce_currency_symbol() ?>
                                    </span>
                                </div>
                                <div class="cart__item-position cart__item-amount">
                                    <div class="amount-change"
                                        data-params="minValue:1; maxValue:99; value:<?= $cart_item['quantity'] ?>"></div>
                                </div>
                                <div class="cart__item-position cart__item-total">
                                    <span class="price__value">
                                        <?= $product->get_price() * $cart_item['quantity'] ?>
                                    </span>
                                    <span class="price__currency">
                                        <?= get_woocommerce_currency_symbol() ?>
                                    </span>
                                </div>
                                <button class="cart__item-remove icon-trash-can" type="button" aria-label="Убрать из корзины"></button>
                            </li>

                        <?php endforeach; ?>
                    </ul>
                    <div class="cart__bottom">
                        <div class="cart__total">
                            <div class="cart__total-title">Сумма к оплате</div>
                            <div class="cart__total-price">
                                <span class="price__value">
                                    <?= round(wc()->cart->total) ?>
                                </span>
                                <span class="price__currency">
                                    <?= get_woocommerce_currency_symbol() ?>
                                </span>
                            </div>
                        </div>
                        <a class="button" href="#" type="button">
                            Перейти к оформлению заказа
                        </a>
                    </div>
                </div>

            <?php else:

                include get_template_directory() . '/html-components/shop/cart/empty.php';

            endif ?>
        </div>
    </section>
    <section class="section products-recommend">
        <div class="content__container">
            <h3 class="section__title">
                Вам может понравиться
            </h3>
            <ul class="products-list">
                <li class="products-list__item">
                    <!-- flcl_get_product_card()... -->
                </li>
            </ul>
        </div>
    </section>
</div>

<?php get_footer(); ?>