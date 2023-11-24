<?php get_header(); ?>
<div class="content">
    <section class="section">
        <div class="content__container">
            <h2 class="section__title">Новости</h2>
            <div class="toggle-slider-container">
                <div class="news swiper toggle-slider" data-params="sliderMedia:849; swiperSelector:.news; wrapperClass:news__list; slideClass:news__list-card; spaceBetween:21; slidesPerView:1.1">
                    <div class="news__list">
                        <?php
                        $query = new WP_Query([
                            'posts_per_page' => 5,
                            'post_type' => 'post',
                            'category_name' => 'news'
                        ]);

                        global $post;
                        if ($query->have_posts()) :
                            $i = 0;
                            $query->the_post();
                        ?>
                            <div class="news__list-card news-card news-card--big">
                                <div class="news-card__image-container">
                                    <img src="<?= get_the_post_thumbnail_url() ?>" alt="Изображение" class="news-card__image">
                                </div>
                                <div class="news-card__text">
                                    <div class="news-card__title">
                                        <a href="<?= get_permalink() ?>">
                                            <?= flcl_title($post->ID, ['maxchars' => 100]) ?>
                                        </a>
                                    </div>
                                    <p class="news-card__description">
                                        <a href="<?= get_permalink() ?>">
                                            <?= kama_excerpt([
                                                'maxchar' => 150
                                            ]); ?>
                                        </a>
                                    </p>
                                </div>
                            </div>
                            <?php
                        endif;

                        if ($query->have_posts()) : while ($query->have_posts()) : $query->the_post();
                            ?>
                                <div class="news__list-card news-card">
                                    <div class="news-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="Изображение" class="news-card__image">
                                    </div>
                                    <div class="news-card__text">
                                        <div class="news-card__title">
                                            <a href="<?= get_permalink() ?>">
                                                <?= flcl_title($post->ID, ['maxchars' => 100]) ?>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                        <?php
                            endwhile;
                        endif;
                        wp_reset_postdata();
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="content__container">
            <div class="choose-article">
                <h3 class="choose-article__title">Выбрать тему:</h3>
                <div class="choose-article swiper toggle-slider" data-params="sliderMedia:0; widthMedia:min; swiperSelector:.choose-article; wrapperClass:choose-article__list; slideClass:choose-article__list-tag;">
                    <div class="choose-article__list" data-choose-taxonomy="main-articles">
                        <div class="choose-article__list-tag tag" data-category-url="#">
                            Все темы
                        </div>
                        <?php
                        $all_categories = get_categories();
                        foreach ($all_categories as $cat) :
                        ?>

                            <div class="choose-article__list-tag tag" data-category-url="<?= get_category_link($cat) ?>">
                                <?= $cat->name ?>
                            </div>

                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <div class="articles swiper toggle-slider" data-params="sliderMedia:849; swiperSelector:.articles; wrapperClass:articles__wrapper; slideClass:article-card; slidesPerView:1">
                <div class="articles__wrapper" data-loadable-feed="name:main-articles"></div>
            </div>
        </div>
    </section>
</div>
</div>
</div>

<?php get_footer(); ?>