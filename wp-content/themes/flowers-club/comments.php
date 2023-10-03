<?php
/* ВАЖНО:
Чтобы работало корректно, нужно, чтобы comments_template подключался внутрь блока <div class="comments"></div>
*/
?>

<ul class="comments__list">

    <?php
    if ($comments):
        ?>

        <?php
        $comms_count = count($comments);
        for ($i = $comms_count - 10; $i < $comms_count; $i++):
            if ($i < 0)
                $i = 0;
            if (empty($comments[$i]))
                break;

            $comm = $comments[$i];

            // <li>
            include get_stylesheet_directory() . '/html-components/comment.php';
            // </li>
            ?>
        <?php endfor ?>

    <?php else: ?>
        <li class="comments__empty">
            <?php if (is_product()): ?>
                Текстовых отзывов пока нет. Станьте первым, кто оставит отзыв о товаре
            <?php elseif (is_single()): ?>
                Комментариев пока нет. Станьте первым, кто прокомментирует статью
            <?php endif ?>
        </li>
    <?php endif; ?>

</ul>

<?php if (is_user_logged_in()):
    $user_id = get_current_user_id();
    $user_data = get_userdata($user_id); ?>
    <form class="comments__write">
        <a href="<?= $user_data->user_url ?>">
            <img src="<?= get_avatar_url($user_id) ?>" alt="Аватар" class="comments__write-avatar">
        </a>
        <div class="comments__write-input-wrapper">
            <textarea class="comments__write-input" name="comment_text" placeholder="Написать комментарий"></textarea>
            <div class="comments__write-upload">
                <label class="comments__write-icon icon-camera">
                    <input type="file" accept="image/*" multiple>
                </label>
            </div>
        </div>
        <div class="comments__write-button-container">
            <button class="button" type="submit">
                Отправить
            </button>
        </div>
    </form>
<?php else: ?>
    <div class="comments__write">
        <div class="comments__no-auth">
            <button class="link" type="button"
                data-modal-call="name:auth; refresh:true; iframeSrc:''<?= get_permalink(FLCL_LOGIN_PAGE) ?>''">
                Войдите
            </button>
            или
            <button class="link" type="button"
                data-modal-call="name:auth; refresh:true; iframeSrc:''<?= get_permalink(FLCL_SIGNUP_PAGE) ?>''">
                зарегистрируйтесь
            </button>
            , чтобы написать комментарий
        </div>
    </div>
<?php endif;