<?php
/*  чтобы код работал корректно, нужно, чтобы выполнялось одно из условий:
1. в $comm находится объект комментария, откуда можно получить ID,
2. в $comm_meta находятся метаданные комментария
*/

if (empty($comm_meta))
    $comm_meta = get_comment_meta($comm->comment_ID);

if (array_key_exists('attached_images', $comm_meta) && !empty($comm_meta['attached_images'])) {
    $attached_images = $comm_meta['attached_images'][0];
    $attached_images = explode(',', $attached_images);
    $attached_images_urls = [];
    foreach ($attached_images as $key => $image_id) {
        $attached_images_urls[] = [
            'url' => wp_get_attachment_image_url($image_id),
            'id' => $image_id
        ];
    }
    if (count($attached_images_urls) > 0): ?>


        <?php foreach ($attached_images_urls as $key => $value): ?>

            <div class="comment__attached-image-container">
                <div class="comment__attached-image-background"></div>
                <button class="close" type="button"></button>
                <img src="<?= $value['url'] ?>" alt="" data-attachment-id="<?= $value['id'] ?>">
            </div>

        <?php endforeach; ?>


    <?php endif;
}