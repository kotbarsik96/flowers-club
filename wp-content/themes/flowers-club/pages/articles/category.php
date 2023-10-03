<?php get_header(); ?>

<?php
$cat = get_queried_object();
$slug = $cat->slug;
$query = new WP_Query([
    'category_name' => $slug
]);
?>

<div class="content">
    <section class="section mb-60">
        <div class="content__container">
            <h2 class="section__title section__title--red fw-400">
                <?= $cat->name ?>
            </h2>
            <?php if (!$query->have_posts()): ?>
                <p>
                    Нет статей в этой категории
                </p>
            <?php else: ?>
                <div class="articles swiper toggle-slider"
                    data-params="sliderMedia:849; swiperSelector:.articles; wrapperClass:articles__wrapper; slideClass:article-card; slidesPerView:1">
                    <div class="articles__wrapper" data-loadable-feed="name:main-articles; staticSlug:''<?= $slug ?>''">
                    </div>
                </div>
            <?php endif ?>
        </div>
    </section>
</div>

<?php get_footer(); ?>