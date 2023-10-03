<?php
class FLCL_Page_Breadcrumbs
{
    public $post = null;

    public function __construct()
    {
        global $post;
        $this->post = $post;
    }

    public function get_categories($category = null)
    {
        if (empty($category))
            $category = get_queried_object();

        $categories = [];
        while ($category && !is_wp_error($category)) {
            $categories[] = $category;
            $category = get_term($category->parent, $category->taxonomy);
        }
        $categories = array_reverse($categories);
        ob_start(); ?>

        <?php foreach ($categories as $cat):
            $url = '';
            if (is_product_category() || is_product())
                $url = flcl_get_product_category_url($cat);
            if (is_category() || is_single())
                $url = get_category_link($cat); ?>

            <li class="breadcrumbs__item">
                <a class="breadcrumbs__link link" href="<?= $url ?>">
                    <?= $cat->name ?>
                </a>
            </li>

        <?php endforeach; ?>

        <?php return ob_get_clean();
    }

    public function post_page()
    {
        global $post;
        $curr_post = null;
        $categories = null;
        $taxonomy = '';

        if (is_product() || is_product_category()) {
            $curr_post = wc_get_product($this->post->ID);
            $categories = $curr_post->get_category_ids();
            $taxonomy = 'product_cat';
        } elseif (is_single()) {
            $curr_post = $post;
            $categories = get_the_category($post->ID);
            $taxonomy = $categories[0]->taxonomy;
            $categories = array_map(fn($data) => $data->term_id, $categories);
        }

        $category_youngest_id = flcl_array_find($categories, function ($category_id) use ($taxonomy) {
            $children = get_term_children($category_id, $taxonomy);
            if (count($children) < 1)
                return true;
            return false;
        });
        $category_youngest = get_term($category_youngest_id, $taxonomy);
        ob_start();
        echo $this->get_categories($category_youngest);
        ?>

        <li class="breadcrumbs__item">
            <a class="breadcrumbs__link link" href="<?= get_permalink($this->post->ID) ?>">
                <?= $this->post->post_title ?>
            </a>
        </li>

        <?php echo ob_get_clean();
    }

    public function category_page()
    {
        echo $this->get_categories();
    }
}
$flcl_page_breadcrumbs = new FLCL_Page_Breadcrumbs();
?>

<ul class="breadcrumbs">

    <?php
    $page_num = get_query_var('paged');
    global $post;

    if (is_category() || is_product_category())
        $flcl_page_breadcrumbs->category_page();
    elseif ($post->post_type === 'product' || is_single())
        $flcl_page_breadcrumbs->post_page();
    ?>
</ul>