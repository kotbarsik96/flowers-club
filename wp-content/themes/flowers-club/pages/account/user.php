<?php get_header();
$user_id = get_user_id_from_slug();
$flcl_user_data = get_userdata($user_id);
$is_current_user = (int) $user_id === (int) get_current_user_id();
?>

<div class="content profile">
    <?php
    if ($is_current_user)
        get_static_menu('account-sidebar');
    ?>
    <div class="profile__content">
        <div class="profile__user profile-user tile">
            <div class="profile-user__main">
                <div class="profile-user__upper">
                    <div class="profile-user__avatar-name">
                        <div class="profile-user__avatar">
                            <img class="profile-user__avatar-img" src="<?= get_avatar_url($flcl_user_data) ?>"
                                alt="Аватар" id="profile-user-avatar">
                            <label class="profile-user__avatar-edit icon-wrapper icon-wrapper--circle icon-pen"
                                type="button">
                                <input type="file" accept="image/png, image/jpeg" name="avatar"
                                    data-params="thumbnailBlocks:#profile-user-avatar">
                            </label>
                        </div>
                        <div class="profile-user__name-location">
                            <div class="profile-user__name">
                                <?= $flcl_user_data->first_name ?>
                                <?php
                                if ($flcl_user_data->user_show_last_name)
                                    echo $flcl_user_data->last_name ?? '';
                                ?>
                            </div>
                            <div class="profile-user__location">
                                <span class="icon-location"></span>
                                <?= $flcl_user_data->user_city ?? 'Город не указан' ?>
                            </div>
                        </div>
                    </div>
                    <div class="profile-user__buttons" data-dynamic-adaptive=".profile__buttons-mobile, 599">
                        <!-- <button class="button" type="button">
                            <span class="icon-crown"></span>
                            Вступить в клуб
                        </button> -->
                        <?php if ($is_current_user): ?>
                            <a href="<?= get_page_link(FLCL_ACCOUNT_SETTINGS_PAGE) ?>" class="button button--gray-pink"
                                type="button">
                                Изменить профиль
                            </a>
                        <?php endif ?>
                    </div>
                </div>
                <div class="profile-user__description">
                    <p>
                        <?= $flcl_user_data->user_about ?? 'Пользователь не написал о себе' ?>
                    </p>
                </div>
                <div class="profile-user__stats">
                    <ul class="profile-user__stats-forum stats-forum">
                        <li class="stats-forum__item">
                            <div class="stats-forum__item-title">
                                Публикаций
                            </div>
                            <div class="stats-forum__item-number">
                                <?= count_user_posts($flcl_user_data->ID, 'post') ?>
                            </div>
                        </li>
                        <li class="stats-forum__item">
                            <div class="stats-forum__item-title">
                                Комментариев
                            </div>
                            <div class="stats-forum__item-number">
                                0
                            </div>
                        </li>
                    </ul>
                    <ul class="profile-stats">
                        <li class="profile-stats__item">
                            <div class="profile-stats__title">Стаж садовода</div>
                            <div class="profile-stats__number">
                                <?php
                                $experience_string = '';
                                $current_year = (int) date('Y');
                                $years = $flcl_user_data->user_gardening_experience_since ?? $current_year;
                                $years = (int) ($years);
                                $diff = $current_year - $years;
                                if ($diff < 1)
                                    $experience_string = 'Меньше года';
                                elseif ($diff > 20)
                                    $experience_string = 'Более 20 лет';
                                else
                                    $experience_string = strval($diff) . ' ' . suffix_to_years($diff);
                                echo $experience_string;
                                ?>
                            </div>
                        </li>
                        <li class="profile-stats__item">
                            <div class="profile-stats__title">Зона USDA</div>
                            <div class="profile-stats__number">
                                <?= isset($flcl_user_data->user_usda_zone) ? $usda_zones[$flcl_user_data->user_usda_zone] ?? 'Не указано' : 'Не указано' ?>
                            </div>
                        </li>
                        <li class="profile-stats__item">
                            <div class="profile-stats__title">Любимые растения</div>
                            <div class="profile-stats__number">
                                <?= $flcl_user_data->user_favorite_plants ?? 'Нет' ?>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="profile-user__tabs tabs">
                <div class="tabs__buttons-list">
                    <button class="tabs__button">
                        Мой сад
                    </button>
                    <button class="tabs__button">
                        Избранные статьи
                    </button>
                    <button class="tabs__button">
                        Понравившиеся товары
                    </button>
                </div>
                <div class="tabs__content">
                    <div class="tabs__content-item">
                        <ul class="articles-flex__list">
                            <?php
                            $show_posts = 4;
                            $query = new WP_Query([
                                'author' => $flcl_user_data->ID,
                                'posts_per_page' => $show_posts,
                                'paged' => 1
                            ]);
                            global $post;
                            if ($query->have_posts()):
                                while ($query->have_posts()):
                                    $query->the_post()
                                        ?>
                                    <li class="articles-flex__item">
                                        <article
                                            class="article-card article-card--big article-card--title-only article-card--flexible"
                                            <?= set_article_data() ?>>
                                            <div class="article-card__image-container">
                                                <img src="<?= get_the_post_thumbnail_url() ?>"
                                                    alt="<?= flcl_title($post->ID) ?>" class="article-card__image">
                                            </div>
                                            <div class="article-card__info">
                                                <h4 class="article-card__title">
                                                    <a href="<?= get_permalink() ?>">
                                                        <?= flcl_title($post->ID) ?>
                                                    </a>
                                                </h4>
                                            </div>
                                        </article>
                                    </li>
                                <?php endwhile; ?>

                            <?php else: ?>
                                Пользователь еще не сделал публикаций
                            <?php endif; ?>
                        </ul>
                    </div>
                    <div class="tabs__content-item">
                        <ul class="articles-flex__list">
                            <?php
                            $fva_key = FAVORITE_ARTICLES_KEY;
                            $favorite_articles = $flcl_user_data->$fva_key ?? '';
                            if ($favorite_articles)
                                $favorite_articles = explode(',', $favorite_articles);
                            else
                                $favorite_articles = [];

                            $query = count($favorite_articles) > 0
                                ? new WP_Query([
                                    'post__in' => $favorite_articles,
                                ])
                                : null;

                            if (!empty($query) && $query->have_posts()):
                                while ($query->have_posts()):
                                    $query->the_post() ?>

                                    <li class="articles-flex__item">
                                        <article class="article-card article-card--flexible" <?= set_article_data() ?>>
                                            <div class="article-card__mark">
                                                <button
                                                    class="article-card__icon icon-wrapper icon-wrapper--circle icon-bookmark"
                                                    type="button"></button>
                                            </div>
                                            <div class="article-card__image-container">
                                                <img src="<?= get_the_post_thumbnail_url() ?>"
                                                    alt="<?= flcl_title($post->ID) ?>" class="article-card__image">
                                            </div>
                                            <div class="article-card__info">
                                                <ul class="article-card__topics">
                                                    <li class="article-card__topic">Советы</li>
                                                </ul>
                                                <div class="article-card__date icon-calendar">
                                                    <?= get_the_date('d.m.Y') ?>
                                                </div>
                                                <h4 class="article-card__title">
                                                    <a href="<?= get_permalink() ?>">
                                                        <?= flcl_title($post->ID) ?>
                                                    </a>
                                                </h4>
                                            </div>
                                        </article>
                                    </li>

                                <?php endwhile ?>

                            <?php else: ?>
                                Пользователь еще не добавил постов в "Избранное"
                            <?php endif ?>
                        </ul>
                    </div>
                    <div class="tabs__content-item">
                        <ul class="products-list">
                            <?php
                            $fvp_key = FAVORITE_PRODUCTS_KEY;
                            $favorite_products = $flcl_user_data->$fvp_key;
                            if ($favorite_products)
                                $favorite_products = explode(',', $favorite_products);
                            else
                                $favorite_products = [];

                            if (count($favorite_products) > 0):
                                foreach ($favorite_products as $product_id): ?>

                                    <li class="products-list__item">
                                        <?= flcl_get_product_card($product_id) ?>
                                    </li>

                                <?php endforeach; ?>

                            <? else: ?>

                                Пользователь еще не добавил товары в "Избранное"

                            <?php endif; ?>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="profile__buttons-mobile"></div>
        </div>
    </div>
</div>

<?php get_footer(); ?>