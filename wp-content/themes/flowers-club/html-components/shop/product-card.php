<?php 
global $product_user_ratings;
?>

<div <?= flcl_set_product_data($product, 'product-card') ?>>
    <div class="product-card__buttons">
        <button
            class="product-card__button product-to-favorites product-card__button--like icon-wrapper icon-wrapper--circle icon-heart"></button>
        <button
            class="product-card__button product-card__button--cart icon-wrapper icon-wrapper--circle icon-cart <?= find_in_cart($product->get_id()) ? '__active' : '' ?>"></button>
    </div>
    <div class="product-card__image">
        <a href="<?= get_permalink($product->get_id()) ?>">
            <img class="product-card__image-img" src="<?= flcl_get_product_thumb($product) ?>"
                alt="<?= $product->get_name() ?>">
        </a>
    </div>
    <div class="product-card__info">
        <div class="product-card__rating star-rating" data-params="defaultAmount:<?= $product_user_ratings->get_average_rating_value($product->get_id()) ?>; noInteract:true"></div>
        <div class="product-card__title">
            <a href="<?= get_permalink($product->get_id()) ?>">
                <?= $product->get_name() ?>
            </a>
        </div>
        <div class="product-card__price">
            <?= $product->get_price() . ' ' . get_woocommerce_currency_symbol() ?>
        </div>
    </div>
</div>