<div class="category-card">
    <a class="category-card__image" href="<?= flcl_get_product_category_url($category) ?>">
        <img src="<?= flcl_get_product_category_thumb($category) ?>" alt="<?= $category->name; ?>"
            class="category-card__image-img">
    </a>
    <div class="category-card__info">
        <div class="category-card__title">
            <a href="<?= flcl_get_product_category_url($category) ?>">
                <?= $category->name; ?>
            </a>
        </div>
    </div>
</div>