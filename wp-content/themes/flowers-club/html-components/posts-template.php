<?php
$args = [
    'posts_per_page' => $postsPerPage,
    'paged' => $pageNumber
];

if ($category !== "all")
    $args['category_name'] = $category;

$query = new WP_Query($args);

$i = 0;
$cycleI = 0;
global $post;
if ($query->have_posts()):
    while ($query->have_posts()):
        $query->the_post();
        ?>

        <?php if ($cycleI === 0): ?>
            <article class="article-card article-card--big" <?= $ajaxQueryType === 'initial' || $ajaxQueryType === 'concat' ? 'data-animate="method:popUp"' : '' ?>             <?= set_article_data() ?>>
                <div class="article-card__mark">
                    <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark" type="button"></button>
                </div>
                <div class="article-card__image-container">
                    <?php
                    $thumb_url = get_the_post_thumbnail_url($post);
                    if ($thumb_url) { ?>
                        <img src="<?= $thumb_url ?>" alt="<?= the_title() ?>" class="article-card__image">
                    <?php } ?>
                </div>
                <div class="article-card__info">
                    <ul class="article-card__topics">
                        <?php
                        $post_tags = get_the_tags($post->ID);
                        if ($post_tags && $post_tags[0]):
                            $first_tag = $post_tags[0]; ?>

                            <li class="article-card__topic">
                                <?= $first_tag->name ?>
                            </li>

                        <?php endif ?>
                    </ul>
                    <div class="article-card__date icon-calendar">
                        <?= get_the_date('d.m.Y'); ?>
                    </div>
                    <h4 class="article-card__title">
                        <a href="<?= the_permalink(); ?>">
                            <?= flcl_title($post->ID); ?>
                        </a>
                    </h4>
                </div>
            </article>
        <?php endif ?>

        <?php if ($cycleI === 1 || $cycleI === 2 || $cycleI === 4 || $cycleI === 5): ?>
            <article class="article-card article-card--medium" <?= $ajaxQueryType === 'initial' || $ajaxQueryType === 'concat' ? 'data-animate="method:popUp"' : '' ?>             <?= set_article_data() ?>>
                <div class="article-card__mark">
                    <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark" type="button"></button>
                </div>
                <div class="article-card__image-container">
                    <?php
                    $thumb_url = get_the_post_thumbnail_url($post);
                    if ($thumb_url) { ?>
                        <img src="<?= $thumb_url ?>" alt="<?= the_title() ?>" class="article-card__image">
                    <?php } ?>
                </div>
                <div class="article-card__info">
                    <ul class="article-card__topics">
                        <?php
                        $post_tags = get_the_tags($post->ID);
                        if ($post_tags && $post_tags[0]):
                            $first_tag = $post_tags[0]; ?>

                            <li class="article-card__topic">
                                <?= $first_tag->name ?>
                            </li>

                        <?php endif ?>
                    </ul>
                    <div class="article-card__date icon-calendar">
                        <?= get_the_date('d.m.Y'); ?>
                    </div>
                    <h4 class="article-card__title">
                        <a href="<?php the_permalink(); ?>">
                            <?= flcl_title($post->ID); ?>
                        </a>
                    </h4>
                </div>
            </article>
        <?php endif ?>

        <?php if ($cycleI === 3): ?>
            <article class="article-card article-card--horizontal" <?= $ajaxQueryType === 'initial' || $ajaxQueryType === 'concat' ? 'data-animate="method:popUp"' : '' ?>             <?= set_article_data() ?>>
                <div class="article-card__image-container">
                    <?php
                    $thumb_url = get_the_post_thumbnail_url($post);
                    if ($thumb_url) { ?>
                        <img src="<?= $thumb_url ?>" alt="<?= the_title() ?>" class="article-card__image">
                    <?php } ?>
                </div>
                <div class="article-card__info">
                    <ul class="article-card__topics">
                        <?php
                        $post_tags = get_the_tags($post->ID);
                        if ($post_tags && $post_tags[0]):
                            $first_tag = $post_tags[0]; ?>

                            <li class="article-card__topic">
                                <?= $first_tag->name ?>
                            </li>

                        <?php endif ?>
                    </ul>
                    <div class="article-card__date icon-calendar">
                        <?= get_the_date('d.m.Y'); ?>
                    </div>
                    <h4 class="article-card__title">
                        <a href="<?php the_permalink(); ?>">
                            <?= flcl_title($post->ID); ?>
                        </a>
                    </h4>
                    <p class="article-card__text">
                        <?= kama_excerpt(['autop' => false]); ?>
                    </p>
                </div>
            </article>
        <?php endif ?>

        <?php if ($cycleI === 6): ?>
            <article class="article-card article-card--horizontal article-card--no-image" <?= $ajaxQueryType === 'initial' || $ajaxQueryType === 'concat' ? 'data-animate="method:popUp"' : '' ?>             <?= set_article_data() ?>>
                <div class="article-card__image-container">
                    <?php
                    $thumb_url = get_the_post_thumbnail_url($post);
                    if ($thumb_url) { ?>
                        <img src="<?= $thumb_url ?>" alt="<?= the_title() ?>" class="article-card__image">
                    <?php } ?>
                </div>
                <div class="article-card__info">
                    <ul class="article-card__topics">
                        <?php
                        $post_tags = get_the_tags($post->ID);
                        if ($post_tags && $post_tags[0]):
                            $first_tag = $post_tags[0]; ?>

                            <li class="article-card__topic">
                                <?= $first_tag->name ?>
                            </li>

                        <?php endif ?>
                    </ul>
                    <div class="article-card__date icon-calendar">
                        <?= get_the_date('d.m.Y'); ?>
                    </div>
                    <h4 class="article-card__title">
                        <a href="<?php the_permalink(); ?>">
                            <?= flcl_title($post->ID); ?>
                        </a>
                    </h4>
                    <p class="article-card__text">
                        <?= kama_excerpt(['autop' => false]); ?>
                        <?= kama_excerpt(['autop' => false]); ?>
                    </p>
                </div>
            </article>
        <?php endif ?>

        <?php
        $i++;
        $cycleI++;
        if ($cycleI >= CYCLE_POSTS_PER_PAGE)
            $cycleI = 0;
    ?>
    <?php endwhile;
endif;
wp_reset_postdata();