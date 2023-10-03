<?php get_header();
function flcl_get_test_categories()
{
    return [
        (object) [
            'term_id' => 47,
            'name' => 'Абрикосы',
            'slug' => 'apricot',
            'term_group' => 0,
            'term_taxonomy_id' => 47,
            'taxonomy' => 'product_cat',
            'description' => '',
            'parent' => 46,
            'count' => 1,
            'filter' => 'raw',
        ],
        (object) [
            'term_id' => 48,
            'name' => 'Яблони',
            'slug' => 'apple-trees',
            'term_group' => 0,
            'term_taxonomy_id' => 48,
            'taxonomy' => 'product_cat',
            'description' => '',
            'parent' => 46,
            'count' => 1,
            'filter' => 'raw',
        ],
    ];
}

function get_rendered_categories()
{
    $categories = [];
    // вывести все дочерние категории, когда выбрана родительская
    if (is_product_category()) {
        $parent_id = get_queried_object()->term_id;
        $categories = array_values(get_terms([
            'taxonomy' => 'product_cat',
            'parent' => $parent_id
        ]));
    }
    // вывести все родительские категории
    else {
        $categories = array_values(get_terms([
            'taxonomy' => 'product_cat',
            'parent' => 0
        ]));
    }
    $amount = count($categories);
    if ($amount < 1)
        return '';

    if ($amount <= 2) {
        // большая большая
        ob_start(); ?>

        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[0]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[0]) ?>">
                    <?= $categories[0]->name ?>
                </a>
            </div>
        </div>
        <?php if (array_key_exists(1, $categories)): ?>
            <div class="catalog-cards__bigger">
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[1]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[1]) ?>">
                        <?= $categories[1]->name ?>
                    </a>
                </div>
            </div>
        <?php endif ?>

        <?php
        return ob_get_clean();
    }
    if ($amount <= 4) {
        // большая большая
        // длинная длинная
        ob_start(); ?>

        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[0]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[0]) ?>">
                    <?= $categories[0]->name ?>
                </a>
            </div>
            <?php if (array_key_exists(2, $categories)): ?>
                <div class="catalog-card catalog-card--long"
                    style="background-image: url('<?= flcl_get_product_category_thumb($categories[2]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[2]) ?>">
                        <?= $categories[2]->name ?>
                    </a>
                </div>
            <?php endif ?>
        </div>
        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[1]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[1]) ?>">
                    <?= $categories[1]->name ?>
                </a>
            </div>
            <?php if (array_key_exists(3, $categories)): ?>
                <div class="catalog-card catalog-card--long"
                    style="background-image: url('<?= flcl_get_product_category_thumb($categories[3]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[3]) ?>">
                        <?= $categories[3]->name ?>
                    </a>
                </div>
            <?php endif ?>
        </div>

        <?php return ob_get_clean();
    }
    if ($amount === 5) {
        // большая  большая 
        // длинная  мал мал 
        ob_start(); ?>

        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[0]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[0]) ?>">
                    <?= $categories[0]->name ?>
                </a>
            </div>
            <?php if (array_key_exists(2, $categories)): ?>
                <div class="catalog-card catalog-card--long"
                    style="background-image: url('<?= flcl_get_product_category_thumb($categories[2]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[2]) ?>">
                        <?= $categories[2]->name ?>
                    </a>
                </div>
            <?php endif ?>
        </div>
        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[1]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[1]) ?>">
                    <?= $categories[1]->name ?>
                </a>
            </div>
            <div class="catalog-cards__smaller">
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[3]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[3]) ?>">
                        <?= $categories[3]->name ?>
                    </a>
                </div>
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[4]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[4]) ?>">
                        <?= $categories[4]->name ?>
                    </a>
                </div>
            </div>
        </div>

        <?php return ob_get_clean();
    }
    if ($amount <= 8) {
        // большая  мал мал 
        //    ^     мал мал
        // длинная  мал мал 
        ob_start(); ?>

        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[0]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[0]) ?>">
                    <?= $categories[0]->name ?>
                </a>
            </div>
            <div class="catalog-card catalog-card--long"
                style="background-image: url('<?= flcl_get_product_category_thumb($categories[1]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[1]) ?>">
                    <?= $categories[1]->name ?>
                </a>
            </div>
        </div>
        <div class="catalog-cards__smaller">
            <?php for ($i = 2; $i < 8; $i++): ?>
                <?php if (!array_key_exists($i, $categories))
                    break; ?>
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[$i]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[$i]) ?>">
                        <?= $categories[$i]->name ?>
                    </a>
                </div>
            <?php endfor; ?>
        </div>

        <?php return ob_get_clean();
    }
    if ($amount === 9) {
        // большая  мал мал 
        //    ^     мал мал
        // мал мал  мал мал 
        ob_start();
        $i = 1;
        ?>

        <div class="catalog-cards__bigger">
            <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[0]) ?>')">
                <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[0]) ?>">
                    <?= $categories[0]->name ?>
                </a>
            </div>
            <div class="catalog-cards__smaller">
                <?php for ($i; $i < 3; $i++): ?>
                    <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[$i]) ?>')">
                        <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[$i]) ?>">
                            <?= $categories[$i]->name ?>
                        </a>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
        <div class="catalog-cards__smaller">
            <?php for ($i; $i < 9; $i++): ?>
                <?php if (!array_key_exists($i, $categories))
                    break; ?>
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[$i]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[$i]) ?>">
                        <?= $categories[$i]->name ?>
                    </a>
                </div>
            <?php endfor; ?>
        </div>

        <?php return ob_get_clean();
    }
    if ($amount > 9) {
        // мал мал мал мал
        // мал мал мал мал
        // мал мал мал мал
        // мал мал мал мал...
        ob_start(); ?>

        <div class="catalog-cards__smaller catalog-cards__smaller--full">
            <?php for ($i = 0; $i < $amount; $i++): ?>
                <?php if (!array_key_exists($i, $categories))
                    break; ?>
                <div class="catalog-card" style="background-image: url('<?= flcl_get_product_category_thumb($categories[$i]) ?>')">
                    <a class="catalog-card__button button" href="<?= flcl_get_product_category_url($categories[$i]) ?>">
                        <?= $categories[$i]->name ?>
                    </a>
                </div>
            <?php endfor; ?>
        </div>

        <?php return ob_get_clean();
    }
}
?>

<div class="content">
    <div class="content__container">
        <div class="catalog-cards">
            <?= get_rendered_categories(); ?>
        </div>
    </div>
</div>

<?php get_footer(); ?>