<?php get_header(); ?>

<div class="content not-found">
    <div class="not-found__container content__container">
        <div class="not-found__text-container">
            <div class="not-found__title">
                Упс, эта страница еще не выросла
            </div>
            <p class="not-found__text text">
                Возможно она была удалена или даже никогда
                не существовала. Чтобы найти нужную информацию перейдите на главную страницу
            </p>
            <a class="not-found__button button" href="<?= get_permalink(FLCL_HOME_PAGE) ?>">
                ПЕРЕЙТИ НА ГЛАВНУЮ СТРАНИЦУ
            </a>
        </div>
        <div class="not-found__image"></div>
    </div>
</div>

<?php get_footer(); ?>