<?php
$comm_meta = get_comment_meta($comm->comment_ID);
$author_data = get_userdata($comm->user_id);

$author_name = $author_data->user_login;
if ($author_data->first_name) {
    $author_name = $author_data->first_name;
    if ($author_data->last_name && $author_data->user_show_last_name) {
        $author_name .= ' ' . $author_data->last_name;
    }
}
?>

<li class="comment" id="comment_<?= $comm->comment_ID ?>">
    <div class="comment__container">
        <div class="comment__user-data">
            <a class="comment__avatar" href="<?= $author_data->user_url ?>">
                <img class="comment__avatar-img" src="<?= get_avatar_url($author_data->ID) ?>" alt="Аватар">
            </a>
            <?php if (get_current_user_id() === $author_data->ID): ?>

                <div class="comment__controls">
                    <button class="link comment__control-edit" type="button">
                        Редактировать
                    </button>
                    <button class="link link--red comment__control-delete" type="button">
                        Удалить
                    </button>
                </div>

            <?php endif ?>
        </div>
        <div class="comment__body">
            <div class="comment__profile-name">
                <a href="<?= $author_data->user_url ?>" class="link">
                    <?= $author_name ?>
                </a>
            </div>
            <div class="comment__content">
                <p class="comment__content-text">
                    <?= $comm->comment_content ?>
                </p>
                <div class="comment__attached-images-list">
                    <?php
                    include get_stylesheet_directory() . '/html-components/comment-thumb.php';
                    ?>
                </div>
            </div>
            <div class="comment__bottom">
                <div class="comment__buttons">
                    <button class="comment__button" type="button">
                        <svg>
                            <use xlink:href="#icon-heart"></use>
                        </svg>
                    </button>
                </div>
                <div class="comment__date" title="<?= $comm->comment_date ?>">
                    <?= flcl_get_comment_date($comm) ?>
                </div>
            </div>
        </div>
    </div>
</li>