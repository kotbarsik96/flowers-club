<?php get_header(); ?>

<?php
global $post;
$tags = get_the_tags($post->ID);
$first_tag = null;
if (isset($tags[0]))
    $first_tag = $tags[0];
?>


<div class="content">
    <section class="section article-page" <?= set_article_data($post) ?>>
        <?php flcl_breadcrumbs() ?>
        <h3 class="article-page__title">
            <span class="content__container">
                <?= $first_tag->name ?>
            </span>
        </h3>
        <div class="article-page__header" style="background-image: url('<?= get_the_post_thumbnail_url($post->ID) ?>')">
            <button class="article-page__button button" type="button">
                <span class="icon-bookmark-colored"></span>
                <span class="article-page__button-text">Сохранить</span>
            </button>
        </div>
        <div class="article-page__body">
            <div class="article-page__meta">
                <ul class="article-card__topics">
                    <li class="article-card__topic">
                        <?= $first_tag->name ?>
                    </li>
                </ul>
                <div class="article-card__date icon-calendar">
                    <?= get_the_date('d.m.Y') ?>
                </div>
                <h3 class="article-page__meta-title">
                    <?= the_title(); ?>
                </h3>
            </div>
            <div class="article-page__content">
                <?php the_content(); ?>
            </div>
            <div class="article-page__comments comments">
                <div class="content__container">
                    <div class="comments__buttons">
                        <div class="comments__buttons-likes-comments">
                            <button
                                class="comments__button comments__button-like <?= $posts_likes->has_like($post->ID, get_current_user_id()) ? '__active' : '' ?>"
                                <?php
                                $likes = $posts_likes->get_likes_amount($post->ID);
                                echo empty($likes) ? '0' : $likes;
                                ?>
                                type="button" aria-label="Нравится (<?= empty($likes) ? '0' : $likes ?>)">
                                <span class="comments__button-content icon-heart"></span>
                                <span class="comments__button-content comments__button-content--small">
                                    <?= empty($likes) ? '0' : $likes ?>
                                </span>
                            </button>
                            <button class="comments__button to-comments" type="button">
                                <span class="comments__button-content">
                                    <span class="icon-chat"></span>
                                    <span class="comments__button-text">Комментировать</span>
                                </span>
                                <span class="comments__button-content comments__button-content--small">
                                    <?= get_comments_number($post->ID) ?? '0' ?>
                                </span>
                            </button>
                        </div>
                        <button class="comments__button comments__button--repost" type="button" aria-label="Поделиться">
                            <span class="comments__button-content icon-repost"></span>
                        </button>
                    </div>

                    <?php comments_template() ?>
                </div>
            </div>
        </div>
    </section>
    <section class="section">
        <div class="content__container">
            <div class="articles-flex swiper toggle-slider"
                data-params="sliderMedia:1199; swiperSelector:.articles-flex; wrapperClass:articles-flex__list; slideClass:articles-flex__item; spaceBetween:6;">
                <h3 class="articles-flex__title">Читать похожие статьи</h3>
                <ul class="articles-flex__list">
                    <?php
                    $tags_ids = array_map(function ($item) {
                        return $item->term_id;
                    }, get_the_tags($post->ID));
                    $tags_ids = implode(',', $tags_ids);
                    $query = new WP_Query([
                        'tag__in' => $tags_ids,
                        'posts_per_page' => 4,
                        'paged' => 1
                    ]);
                    global $post;
                    if ($query->have_posts()):
                        while ($query->have_posts()):
                            $query->the_post(); ?>

                            <li class="articles-flex__item">
                                <article class="article-card article-card--small" <?= set_article_data() ?>>
                                    <div class="article-card__mark">
                                        <button class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark"
                                            type="button" aria-label="В закладки"></button>
                                    </div>
                                    <div class="article-card__image-container">
                                        <img src="<?= get_the_post_thumbnail_url($post->ID) ?>" alt="<?php the_title() ?>"
                                            class="article-card__image">
                                    </div>
                                    <div class="article-card__info">
                                        <ul class="article-card__topics">
                                            <?php
                                            $all_tags = get_the_tags($post->ID);
                                            $first_tag = $all_tags[0];
                                            if ($first_tag):
                                                ?>
                                                <li class="article-card__topic">
                                                    <?= $first_tag->name ?>
                                                </li>
                                            <?php endif; ?>
                                            <!-- <li class="article-card__topic">Советы</li> -->
                                        </ul>
                                        <div class="article-card__date icon-calendar">
                                            <?= get_the_date('d.m.Y') ?>
                                        </div>
                                        <h4 class="article-card__title">
                                            <a href="<?= get_permalink() ?>">
                                                <?= flcl_title($post->ID); ?>
                                            </a>
                                        </h4>
                                    </div>
                                </article>
                            </li>

                            <?php
                        endwhile;
                    endif;
                    wp_reset_postdata();
                    ?>
                </ul>
            </div>
        </div>
    </section>
</div>

<?php get_footer(); ?>