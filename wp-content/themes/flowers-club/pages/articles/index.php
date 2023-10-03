<?php get_header(); ?>

<div class="content">
    <?php
    $all_categories = get_categories();
    foreach ($all_categories as $cat) :
        $query = new WP_Query([
            'category_name' => $cat->slug,
            'posts_per_page' => 5
        ]);
        global $post;
        if (!$query->have_posts()) continue;
    ?>

        <section class="section mb-60">
            <div class="content__container">
                <h2 class="section__title section__title--red fw-400">
                    <?= $cat->name ?>
                </h2>
                <div class="articles swiper toggle-slider" data-params="sliderMedia:849; swiperSelector:.articles; wrapperClass:articles__wrapper; slideClass:article-card; slidesPerView:1">
                    <div class="articles__wrapper">
                        <?php
                        // проверка if($query->have_posts()) выполняется выше
                        $i = 0;
                        while ($query->have_posts()) : $query->the_post();
                            $i++;

                            if ($i === 1) : ?>
                                <article class="article-card article-card--medium" <?= set_article_data() ?>>
                                    <div class="article-card__mark">
                                        <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark" type="button"></button>
                                    </div>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="<?php the_title(); ?>" class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $post_tags = get_the_tags($post->ID);
                                            if ($post_tags && $post_tags[0]) :
                                                $first_tag = $post_tags[0]; ?>

                                                <li class="article-card__topic"><?= $first_tag->name ?></li>

                                            <?php endif ?>
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y'); ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= the_permalink(); ?>">
                                                <?= flcl_title($post->ID) ?>
                                            </a>
                                        </h4>
                                    </div>
                                </article>
                            <?php elseif ($i === 2) : ?>
                                <article class="article-card article-card--horizontal" <?= set_article_data() ?>>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="<?php the_title(); ?>" class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $post_tags = get_the_tags($post->ID);
                                            if ($post_tags && $post_tags[0]) :
                                                $first_tag = $post_tags[0]; ?>

                                                <li class="article-card__topic"><?= $first_tag->name ?></li>

                                            <?php endif ?>
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y'); ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= the_permalink(); ?>">
                                                <?= flcl_title($post->ID) ?>
                                            </a>
                                        </h4>
                                        <p class="article-card__text">
                                            <?= kama_excerpt(); ?>
                                        </p>
                                    </div>
                                </article>
                            <?php elseif ($i === 3) : ?>
                                <article class="article-card article-card--medium" <?= set_article_data() ?>>
                                    <div class="article-card__mark">
                                        <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark" type="button"></button>
                                    </div>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="<?php the_title(); ?>" class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $post_tags = get_the_tags($post->ID);
                                            if ($post_tags && $post_tags[0]) :
                                                $first_tag = $post_tags[0]; ?>

                                                <li class="article-card__topic"><?= $first_tag->name ?></li>

                                            <?php endif ?>
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y'); ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= the_permalink(); ?>">
                                                <?= flcl_title($post->ID) ?>
                                            </a>
                                        </h4>
                                        <p class="article-card__text">
                                            <?= kama_excerpt(); ?>
                                        </p>
                                    </div>
                                </article>
                            <?php elseif ($i === 4) : ?>
                                <article class="article-card article-card--medium" <?= set_article_data() ?>>
                                    <div class="article-card__mark">
                                        <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark" type="button"></button>
                                    </div>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="<?php the_title(); ?>" class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $post_tags = get_the_tags($post->ID);
                                            if ($post_tags && $post_tags[0]) :
                                                $first_tag = $post_tags[0]; ?>

                                                <li class="article-card__topic"><?= $first_tag->name ?></li>

                                            <?php endif ?>
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y'); ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= the_permalink(); ?>">
                                                <?= flcl_title($post->ID) ?>
                                            </a>
                                        </h4>
                                        <p class="article-card__text">
                                            <?= kama_excerpt(); ?>
                                        </p>
                                    </div>
                                </article>
                            <?php elseif ($i === 5) : ?>
                                <article class="article-card article-card--horizontal article-card--no-image" <?= set_article_data() ?>>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url() ?>" alt="<?php the_title(); ?>" class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $post_tags = get_the_tags($post->ID);
                                            if ($post_tags && $post_tags[0]) :
                                                $first_tag = $post_tags[0]; ?>

                                                <li class="article-card__topic"><?= $first_tag->name ?></li>

                                            <?php endif ?>
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y'); ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= the_permalink(); ?>">
                                                <?= flcl_title($post->ID) ?>
                                            </a>
                                        </h4>
                                        <p class="article-card__text">
                                            <?= kama_excerpt(); ?>
                                        </p>
                                    </div>
                                </article>
                            <?php endif; ?>

                        <?php endwhile; ?>
                    </div>
                </div>
                <a class="articles__link link icon-arrow" href="<?= get_category_link($cat)  ?>">
                    Смотреть больше
                </a>
            </div>
        </section>

    <?php
    endforeach;
    wp_reset_postdata();
    ?>
</div>

<?php get_footer(); ?>