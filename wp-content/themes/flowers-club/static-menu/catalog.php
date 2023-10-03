<div class="catalog" data-dynamic-adaptive=".header__icons, 1439">
    <button class="catalog__button button button--gray-pink">
        <span class="catalog__button-icon icon-bullet-list"></span>
        <span class="catalog__button-text">Каталог</span>
    </button>
    <div class="catalog__container">
        <div class="catalog__categories">
            <ul class="catalog__categories-list">
                <?php
                $categories = get_categories([
                    'taxonomy' => 'product_cat',
                    'parent' => 0
                ]);
                $first_category = count($categories) > 0 ? $categories[array_key_first($categories)] : null;
                if (!empty($first_category)):
                    foreach ($categories as $category): ?>

                        <li class="catalog__category-item">
                            <button class="catalog__category-item-button" type="button">
                                <img src="<?= get_template_directory_uri() . '/assets/img/icons/catalog/' . $category->slug . '.svg' ?>"
                                    alt="Плодовые" class="catalog__category-item-icon">
                                <span class="catalog__category-item-text">
                                    <?= $category->name ?>
                                </span>
                            </button>
                        </li>

                    <?php endforeach;
                endif; ?>
            </ul>
        </div>
        <div class="catalog__subcategories">
            <?php if (!empty($first_category)):
                foreach ($categories as $category): ?>

                    <div class="catalog__hidden-subcategory" data-value="<?= $category->name ?>">
                        <h4 class="catalog__subcategories-title">
                            <?= $category->name ?>
                        </h4>
                        <ul class="catalog__subcategories-list">
                            <?php
                            $subcategories = get_terms([
                                'taxonomy' => 'product_cat',
                                'parent' => $category->term_id
                            ]);
                            if (count($subcategories) > 0) {
                                foreach ($subcategories as $subcategory): ?>

                                    <li class="catalog__subcategory-item">
                                        <a class="catalog__subcategory-item-link" href="<?= flcl_get_product_category_url($subcategory) ?>">
                                            <?= $subcategory->name ?>
                                        </a>
                                    </li>

                                <?php endforeach;
                            } ?>
                        </ul>
                    </div>

                <?php endforeach;
            endif; ?>
        </div>
    </div>
</div>