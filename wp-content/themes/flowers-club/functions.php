<?php

function flcl_array_find($array, $callback)
{
    $i = 0;
    foreach ($array as $item) {
        if ($callback($item, $i, $array))
            return $item;
        $i++;
    }
    return null;
}

// атрибуты товаров
class FLCL_Product_Attributes
{
    public static $product_attributes = [
        'freeze_resistance' => [
            'title' => 'Морозостойкость',
            'filter_type' => 'range_double',
            'prefix' => '-',
            'suffix' => '°'
        ],
        'max_height' => [
            'title' => 'Высота до',
            'filter_type' => 'range_double',
            'suffix' => 'см',
            'multiple' => '100'
        ],
        'highlights' => [
            'title' => 'Особенности',
            'filter_type' => 'checkboxes'
        ],
        'combines' => [
            'title' => 'Сочетается с'
        ]
    ];

    public static function translate_product_attribute($attribute)
    {
        if (array_key_exists($attribute, self::$product_attributes))
            return self::$product_attributes[$attribute]['title'];

        return '';
    }

    // приводит $products в такой вид, который обрабатывают методы этого класса и который можно отправить во фронтенд
    public function map_products($products)
    {
        return array_values(array_map(function ($product) {
            ob_start(); ?>

            <li class="products-list__item">
                <?= flcl_get_product_card($product); ?>
            </li>

            <?php $layout = ob_get_clean();

            $attributes = array_map(function ($data) {
                $name = $data->get_name();

                return [
                    'name' => $name,
                    'title' => FLCL_Product_Attributes::translate_product_attribute($name),
                    'options' => $data->get_options()
                ];
            }, $product->get_attributes());

            return [
                'id' => $product->get_id(),
                'price' => (int) $product->get_price(),
                'price_with_symbol' => $product->get_price() . get_woocommerce_currency_symbol(),
                'title' => $product->get_name(),
                'sku' => $product->get_sku(),
                'average_rating' => $GLOBALS['product_user_ratings']->get_average_rating_value($product->get_id()),
                'stock_quantity' => (int) $product->get_stock_quantity(),
                'layout' => $layout,
                'attributes' => $attributes
            ];
        }, $products));
    }

    public function get_only_filtering()
    {
        return array_filter(self::$product_attributes, function ($data) {
            if (!array_key_exists('filter_type', $data))
                return false;

            return (bool) $data['filter_type'];
        });
    }

    public function get_product_attr_options($key, $product)
    {
        if (!array_key_exists('attributes', $product))
            return null;
        if (!array_key_exists($key, $product['attributes']))
            return null;

        $arr = $product['attributes'][$key]['options'];
        if (count($arr) < 1)
            return null;

        return $arr;
    }

    // $products - массив, в котором уже есть 'attributes'
    public function get_max_range_value($key, $products)
    {
        $count = 0;
        foreach ($products as $product) {
            $arr = $this->get_product_attr_options($key, $product);
            if (empty($arr))
                continue;

            $attr_val = $arr[array_key_first($arr)];
            if (empty($attr_val))
                continue;

            $attr_val = (float) preg_replace('/[^.0-9]/', '', $attr_val);
            if (!is_numeric($attr_val))
                continue;

            if ($attr_val > $count)
                $count = $attr_val;
        }
        return $count;
    }

    public function get_input_buttons($key, $products)
    {
        $input_buttons = [];
        foreach ($products as $product) {
            $arr = $this->get_product_attr_options($key, $product);

            foreach ($arr as $value) {
                if (!array_search($value, $input_buttons))
                    $input_buttons[] = $value;
            }
        }
        $input_buttons = array_unique($input_buttons);
        return $input_buttons;
    }
}

$flcl_product_attrs = new FLCL_Product_Attributes();

/* есть элементы меню, которые являются не ссылкой, а кнопкой. Таким элементам указывается тип "Произвольная ссылка", а в ссылку вставляется "#". 
    
    Из-за этого необходимо было изменить логику вывода меню. Все изменения помечены в комментариях "изменение X: <описание изменения>" 
*/

class Flcl_Walker_Nav_Menu extends Walker_Nav_Menu
{
    public $datasets = [];

    // данный метод рендерит только подменю. Поэтому необходимо добавить в дефолтные классы "spoiler__content", чтобы активировался спойлер и применились нужные стили спойлера
    public function start_lvl(&$output, $depth = 0, $args = null)
    {
        if (isset($args->item_spacing) && 'discard' === $args->item_spacing) {
            $t = '';
            $n = '';
        } else {
            $t = "\t";
            $n = "\n";
        }
        $indent = str_repeat($t, $depth);

        // изменение 1: добавить в дефолтные классы "spoiler__content"
        $classes = array('sub-menu', 'spoiler__content');

        $class_names = implode(' ', apply_filters('nav_menu_submenu_css_class', $classes, $args, $depth));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';

        // изменение 2: добавить нужные dataset'ы
        $dataset = '';
        foreach ($this->datasets as $dataset_obj) {
            if (!preg_match($dataset_obj['regexp'], $output))
                continue;

            $dataset .= $dataset_obj['dataset'];
        }

        $output .= "{$n}{$indent}<ul$class_names $dataset>{$n}";
    }

    /*
    Также данный редактированный метод вносит изменения в вывод классов для <li></li>. Такие изменения помечены как "изменение вывода класса X: <описание изменения>"
    */
    public function start_el(&$output, $data_object, $depth = 0, $args = null, $current_object_id = 0)
    {
        // Restores the more descriptive, specific name for use within this method.
        $menu_item = $data_object;

        // изменение 1: проверяем, является ли обычной кнопкой (для этого в ссылке указывается #)
        $is_button = (bool) preg_match('/#$/', $menu_item->url);

        if (isset($args->item_spacing) && 'discard' === $args->item_spacing) {
            $t = '';
            $n = '';
        } else {
            $t = "\t";
            $n = "\n";
        }
        $indent = ($depth) ? str_repeat($t, $depth) : '';

        $classes = empty($menu_item->classes) ? array() : (array) $menu_item->classes;
        $classes[] = 'menu-item-' . $menu_item->ID;

        $args = apply_filters('nav_menu_item_args', $args, $menu_item, $depth);

        $class_names = implode(' ', apply_filters('nav_menu_css_class', array_filter($classes), $menu_item, $args, $depth));
        // изменение вывода класса 1: выводить класс "spoiler", если $is_button === true
        if ($is_button) {
            $class_names .= ' spoiler ';
        }
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';

        $id = apply_filters('nav_menu_item_id', 'menu-item-' . $menu_item->ID, $menu_item, $args, $depth);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';

        $output .= $indent . '<li' . $id . $class_names . '>';

        $atts = array();
        $atts['title'] = !empty($menu_item->attr_title) ? $menu_item->attr_title : '';
        $atts['target'] = !empty($menu_item->target) ? $menu_item->target : '';
        if ('_blank' === $menu_item->target && empty($menu_item->xfn)) {
            $atts['rel'] = 'noopener';
        } else {
            $atts['rel'] = $menu_item->xfn;
        }

        // изменение 2: если кнопка ($is_button), не ставить href
        if (!empty($menu_item->url) && !$is_button) {
            if (get_privacy_policy_url() === $menu_item->url) {
                $atts['rel'] = empty($atts['rel']) ? 'privacy-policy' : $atts['rel'] . ' privacy-policy';
            }

            $atts['href'] = $menu_item->url;
        } else {
            $atts['href'] = '';
        }

        // изменение вывода класса 2: если кнопка, к тегу button добавить класс "spoiler__button"

        // изменение 3: если кнопка, выставить атрибут type="button"
        if ($is_button) {
            $atts['type'] = 'button';
            // изменение вывода класса 2: если кнопка, к тегу button добавить класс "spoiler__button"
            $atts['class'] = 'spoiler__button';
        }

        $atts['aria-current'] = $menu_item->current ? 'page' : '';

        $atts = apply_filters('nav_menu_link_attributes', $atts, $menu_item, $args, $depth);

        $attributes = '';
        foreach ($atts as $attr => $value) {
            if (is_scalar($value) && '' !== $value && false !== $value) {
                $value = ('href' === $attr) ? esc_url($value) : esc_attr($value);
                $attributes .= ' ' . $attr . '="' . $value . '"';
            }
        }

        $title = apply_filters('the_title', $menu_item->title, $menu_item->ID);

        $title = apply_filters('nav_menu_item_title', $title, $menu_item, $args, $depth);

        // изменение 4: если кнопка, тег === "<button></button>", иначе === "<a></a>"
        $tag_name = $is_button ? 'button' : 'a';

        $item_output = $args->before;
        $item_output .= '<' . $tag_name . $attributes . '>';
        $item_output .= $args->link_before . $title . $args->link_after;
        $item_output .= '</' . $tag_name . '>';
        $item_output .= $args->after;

        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $menu_item, $depth, $args);
    }
}
function flcl_nav_menu($args)
{
    $args = array_merge([
        'container' => null,
        'echo' => false,
        'items_wrap' => '<ul id="%1$s" class="%2$s">%3$s</ul>',
        'walker' => new Flcl_Walker_Nav_Menu()
    ], $args);

    echo wp_nav_menu($args);
}

// ** actions ** //
add_action('wp_enqueue_scripts', 'flcl_load_styles_scripts');
function flcl_load_styles_scripts()
{
    function check_if_load_form()
    {
        $pages = ['login', 'signup', 'account-settings', 'password-change', 'password-recovery', 'product'];
        foreach ($pages as $key => $value) {
            if (is_page($value))
                return true;
        }

        if (is_single())
            return true;

        return false;
    }
    function check_if_load_shop()
    {
        if (flcl_is_shop_page())
            return true;

        return false;
    }

    wp_enqueue_style('styles', get_stylesheet_directory_uri() . '/assets/css/styles.css');
    wp_enqueue_style('swiper-bundle', get_stylesheet_directory_uri() . '/assets/css/swiper-bundle.min.css');

    wp_enqueue_script('swiper-bundle', get_template_directory_uri() . '/assets/js/swiper-bundle.min.js', [], null, true);
    wp_enqueue_script('scripts-helpers', get_template_directory_uri() . '/assets/js/scripts-helpers.js', [], null, true);
    wp_enqueue_script('scripts', get_template_directory_uri() . '/assets/js/scripts.js', ["scripts-helpers"], null, true);

    if (check_if_load_form()) {
        wp_enqueue_script('forms', get_template_directory_uri() . '/assets/js/forms.js', ["scripts-helpers"], null, true);
    }
    if (check_if_load_shop()) {
        wp_enqueue_script('shop', get_template_directory_uri() . '/assets/js/shop.js', ["scripts-helpers"], null, true);
    }
}

add_action('after_setup_theme', 'flcl_add_theme_supports');
function flcl_add_theme_supports()
{
    add_theme_support('post-thumbnails');
}

add_action('after_setup_theme', 'flcl_reg_nav_menu');
function flcl_reg_nav_menu()
{
    register_nav_menu('header-menu', 'Меню в шапке');
}

add_action('wp_head', 'flcl_wp_head_action');
function flcl_wp_head_action()
{
    if (is_page('articles') || is_category()) {
        echo '<style>
        :root {
            --article_topic_color: var(--red);
            --article-card-noimage_color: #fff4f1;
        }
    </style>';
    }
}

$is_user_page = false;
function is_user_page($arg = '')
{
    global $is_user_page;
    if (!empty($is_user_page))
        return true;

    /* попробовать найти пользователя с переданным в url id */
    $slug = get_user_id_from_slug();
    if (!$slug)
        return false;

    $user_query = new WP_User_Query([
        'search' => $slug,
        'search_columns' => ['ID']
    ]);
    if (!empty($user_query->get_results())) {
        $user_data = $user_query->get_results()[0];
        if ($user_data->ID == $slug) {
            $is_user_page = true;
            return true;
        }
        return false;
    }
}

// add_action('template_redirect', 'flcl_template_redirect', 1);
// function flcl_template_redirect()
// {
//     if (is_user_page())
//         remove_action('template_redirect', 'redirect_canonical');
// }

add_filter('template_include', 'flcl_template_include', 999);
function flcl_template_include($template)
{
    /* проверить, является ли страницей */
    // страницы, к которым доступ у всех пользователей в формате slug => path
    $template_pages = [
        'home' => '/index.php',
        'about' => '/pages/about.php',
        'shop' => '/pages/shop/index.php',
        'user-agreement' => '/pages/user-agreement.php',
        'articles' => '/pages/articles/index.php',
        'article' => '/pages/articles/article.php',
        'password-recovery' => '/pages/auth/password-recovery.php',
        'cart' => '/pages/shop/cart.php'
    ];
    // страницы, у которых доступ только для зарегистрированных пользователей. При запросе таких страниц будет идти перенаправление на страницу входа. Когда будет осуществлен вход, пользователя отправит на изначально запрашиваемую страницу с доступом только для зарегистрированных
    $need_auth_pages = [
        'account-settings' => '/pages/account/account-settings.php',
        'password-change' => '/pages/account/password-change.php'
        // 'finance' => '/pages/account/finance.php',
        // 'consultations' => '/pages/account/consultations/consultations.php',
        // 'consultations-dialogue' => '/pages/account/consultations/consultations-dialogue.php',
    ];
    foreach ($template_pages as $page_title => $page_path) {
        if (is_page($page_title)) {
            if (isset($_COOKIE['unregistered_redirected_from'])) {
                unset($_COOKIE['unregistered_redirected_from']);
                setcookie('unregistered_redirected_from', -1);
            }
            return get_template_directory() . $page_path;
        }
    }
    foreach ($need_auth_pages as $page_title => $page_path) {
        if (!is_page($page_title))
            continue;

        if (is_user_logged_in()) {
            return get_template_directory() . $page_path;
        } else {
            // если пользователь не авторизован, он перенаправляется на страницу входа. При этом страница, с которой он туда направляется, запоминается
            $url = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
            setcookie('unregistered_redirected_from', $url);
            wp_safe_redirect(get_page_link(FLCL_LOGIN_PAGE));
            exit();
        }
    }
    if (is_page('login') || is_page('signup')) {
        // если пользователь уже авторизован, при этом запрашивается страница регистрации/входа
        if (is_user_logged_in()) {
            // перенаправить его обратно на ту страницу, с которой он попал на страницу регистрации/входа, либо на главную
            $unreg_redirected_from = $_COOKIE['unregistered_redirected_from'] ?? get_page_link(FLCL_HOME_PAGE);
            if (isset($_COOKIE['unregistered_redirected_from'])) {
                unset($_COOKIE['unregistered_redirected_from']);
                setcookie('unregistered_redirected_from', -1);
            }
            wp_safe_redirect($unreg_redirected_from);
            exit();
        }
        // если пользователь не авторизован - перенаправить его на запрашиваемую страницу
        else {
            if (is_page('login'))
                return get_template_directory() . '/pages/auth/login.php';
            if (is_page('signup'))
                return get_template_directory() . '/pages/auth/signup.php';
        }
    }

    /* если не является обычной статичной страницей, проверка идет сюда */
    $complex_checks = [
        'is_category' => [
            '' => '/pages/articles/category.php'
        ],
        'is_user_page' => [
            '' => '/pages/account/user.php'
        ],
        'is_product_category' => [
            '' => '/pages/shop/index.php'
        ],
        'is_product' => [
            '' => '/pages/shop/product.php'
        ],
        'is_single' => [
            '' => '/pages/articles/article.php'
        ]
    ];
    foreach ($complex_checks as $func_name => $cmplx_data) {
        foreach ($cmplx_data as $arg => $page_path) {
            if ($func_name($arg)) {
                return get_template_directory() . $page_path;
            }
        }
    }
    return get_template_directory() . '/404.php';
}

if (!current_user_can('edit_others_pages')) {
    add_action('show_admin_bar', '__return_false');
}

// ** filters ** //

add_filter('safe_svg_optimizer_enabled', '__return_true');

// ** shortcodes ** //
class Product_Shortcodes
{
    public function __construct()
    {
        add_shortcode('product_description', [$this, 'product_description']);
        add_shortcode('product_in_particular', [$this, 'product_in_particular']);
        add_shortcode('product_in_particular_item', [$this, 'product_in_particular_item']);
        add_shortcode('product_descr_title', [$this, 'product_descr_title']);
        add_shortcode('product_card', [$this, 'product_card']);
        add_shortcode('products_list', [$this, 'products_list']);
        add_shortcode('product_category', [$this, 'product_category']);
    }

    public function product_description($attrs, $content)
    {
        return do_shortcode($content);
    }

    public function product_in_particular($attrs, $content)
    {
        return do_shortcode($content);
    }

    public function product_in_particular_item($attrs, $content)
    {
        $attrs = shortcode_atts([
            'title' => false,
            'icon' => false,
            0 => false
        ], $attrs);

        ob_start(); ?>

        <div class="product-tab__paragraph <?= $attrs['icon'] ? 'product-tab__paragraph--colored' : 'spoiler __shown' ?>">
            <h5 class="product-tab__paragraph-title  <?= $attrs['icon'] ? '' : 'spoiler__button' ?>">
                <?= $attrs['title'] ?>
                <?php if ($attrs['icon']): ?>

                    <img src="<?= get_template_directory_uri() . '/assets/img/icons/product/' . $attrs['icon'] . '.svg' ?>" alt="">

                <?php else: ?>

                    <span class="spoiler__chevron icon-chevron-down"></span>

                <?php endif ?>
            </h5>
            <p class="product-tab__paragraph-text <?= $attrs['icon'] ? '' : 'spoiler__content' ?>">
                <?= $content ?>
            </p>
        </div>

        <?php return ob_get_clean();
    }

    public function product_descr_title($attrs, $content)
    {
        $attrs = shortcode_atts([
            'icon' => ''
        ], $attrs);

        if ($attrs['icon']) {
            $result_content = '<span style="color: var(--red);">';
            $src = get_template_directory_uri()
                . '/assets/img/icons/product/'
                . $attrs['icon']
                . '.svg';
            $result_content .= '<img class="product-tab__paragraph-title-icon" src="' . $src . '" alt="">';
        } else
            $result_content = '<span>';

        $result_content .= $content . '</span>';
        return $result_content;
    }

    public function product_card($attrs)
    {
        $attrs = shortcode_atts([
            'id' => null
        ], $attrs);
        if (!$attrs['id'])
            return '';

        return flcl_get_product_card($attrs['id']);
    }

    public function products_list($attrs, $content)
    {
        $attrs = shortcode_atts([
            'type' => 'general',
            'id' => ''
        ], $attrs);

        $attrs['id'] = preg_replace('/\s+/', '', $attrs['id']);
        $id_array = explode(',', $attrs['id']);
        $content = '';
        foreach ($id_array as $id) {
            switch ($attrs['type']) {
                case 'general':
                default:
                    $content .= flcl_get_product_card($id);
                    break;
            }
        }

        return '<ul class="product-tab__products-list products-list">' . $content . '</ul>';
    }

    public function product_category($attrs)
    {
        $attrs = shortcode_atts([
            'id' => null
        ], $attrs);
        if (!$attrs['id'])
            return '';

        return flcl_get_product_category_card($attrs['id']);
    }
}
new Product_Shortcodes();


// ** functions ** //
function kama_excerpt($args = '')
{
    global $post;

    if (is_string($args)) {
        parse_str($args, $args);
    }

    $rg = (object) array_merge([
        'maxchar' => 150,
        'text' => '',
        'autop' => false,
        'more_text' => 'Читать дальше...',
        'ignore_more' => false,
        'save_tags' => '<strong><b><a><em><i><var><code><span>',
        'sanitize_callback' => static function (string $text, object $rg) {
            return strip_tags($text, $rg->save_tags);
        },
    ], $args);

    $rg = apply_filters('kama_excerpt_args', $rg);

    if (!$rg->text) {
        $rg->text = $post->post_excerpt ?: $post->post_content;
    }

    $text = $rg->text;
    // strip content shortcodes: [foo]some data[/foo]. Consider markdown
    $text = preg_replace('~\[([a-z0-9_-]+)[^\]]*\](?!\().*?\[/\1\]~is', '', $text);
    // strip others shortcodes: [singlepic id=3]. Consider markdown
    $text = preg_replace('~\[/?[^\]]*\](?!\()~', '', $text);
    // strip direct URLs
    $text = preg_replace('~(?<=\s)https?://.+\s~', '', $text);
    $text = trim($text);

    // <!--more-->
    if (!$rg->ignore_more && strpos($text, '<!--more-->')) {

        preg_match('/(.*)<!--more-->/s', $text, $mm);

        $text = trim($mm[1]);

        $text_append = sprintf(' <a href="%s#more-%d">%s</a>', get_permalink($post), $post->ID, $rg->more_text);
    }
    // text, excerpt, content
    else {
        $text = call_user_func($rg->sanitize_callback, $text, $rg);
        $has_tags = false !== strpos($text, '<');

        // collect html tags
        if ($has_tags) {
            $tags_collection = [];
            $nn = 0;

            $text = preg_replace_callback('/<[^>]+>/', static function ($match) use (&$tags_collection, &$nn) {
                $nn++;
                $holder = "~$nn";
                $tags_collection[$holder] = $match[0];

                return $holder;
            }, $text);
        }

        // cut text
        $cuted_text = mb_substr($text, 0, $rg->maxchar);
        if ($text !== $cuted_text) {

            // del last word, it not complate in 99%
            $text = preg_replace('/(.*)\s\S*$/s', '\\1...', trim($cuted_text));
        }

        // bring html tags back
        if ($has_tags) {
            $text = strtr($text, $tags_collection);
            $text = force_balance_tags($text);
        }
    }

    // add <p> tags. Simple analog of wpautop()
    if ($rg->autop) {

        $text = preg_replace(
            ["/\r/", "/\n{2,}/", "/\n/"],
            ['', '</p><p>', '<br />'],
            "<p>$text</p>"
        );
    }

    $text = apply_filters('kama_excerpt', $text, $rg);

    if (isset($text_append)) {
        $text .= $text_append;
    }

    return $text;
}

function flcl_title($post_id, $args = [])
{
    $title_raw = get_the_title($post_id);
    $args = array_merge([
        'maxchars' => 40
    ], $args);
    if (mb_strlen($title_raw) <= $args['maxchars'])
        return $title_raw;

    $title = mb_substr($title_raw, 0, $args['maxchars']);
    preg_match('/^.+\S(?=\s.*$)/', $title, $matches);
    $title = (isset($matches) && isset($matches[0])) ? $matches[0] : $title;

    $after = mb_strlen($title_raw) > mb_strlen($title) ? '...' : '';
    return $title . $after;
}

function set_article_data($post = null)
{
    if (!$post)
        global $post;
    $cur_user = get_userdata(get_current_user_id());
    $fva_key = FAVORITE_ARTICLES_KEY;
    $favorites = explode(',', $cur_user->$fva_key ?? '');

    $id = 'id="post_' . $post->ID . '"';
    $is_favorite = in_array($post->ID, $favorites) ? 'data-article-favorite' : '';

    return "{$id} {$is_favorite}";
}

function get_static_menu($name)
{
    error_log(print_r($name, true));
    include get_stylesheet_directory() . '/' . 'static-menu/' . $name . '.php';
}

function suffix_to_years($years = '')
{
    $suffix = 'год';
    if (!$years)
        return $years;

    $years_string = strval($years);
    $years_substrs = str_split($years_string);
    $years_last_symbol = end($years_substrs);
    $years_penultimate_symbol = $years_substrs[count($years_substrs) - 2] ?? '0';

    if ($years_last_symbol === '1') {
        if ($years_penultimate_symbol === '1')
            $suffix = 'лет';
    } elseif (preg_match('/2|3|4/', $years_last_symbol)) {
        if ($years_penultimate_symbol === '1')
            $suffix = 'лет';
        else
            $suffix = 'года';
    } else
        $suffix = 'лет';

    return $suffix;
}

function flcl_get_comment_date($comm)
{
    $comment_timestamp = $comm->comment_date;
    $current_timestamp = current_time('mysql');
    return flcl_get_dates_diff_string($current_timestamp, $comment_timestamp);
}

// передать сюда либо timestamp'ы, либо дату в виде строки
function flcl_get_dates_diff_string($date_after, $date_before)
{
    if (is_string($date_after)) {
        $date_after = strtotime($date_after);
    }
    if (is_string($date_before)) {
        $date_before = strtotime($date_before);
    }

    $days_ago = floor(($date_after - $date_before) / 3600 / 24);
    if ($days_ago < 1)
        return 'Сегодня';
    if ($days_ago < 2)
        return 'Вчера';
    if ($days_ago < 5)
        return floor($days_ago) . ' дня назад';
    if ($days_ago < 7)
        return floor($days_ago) . ' дней назад';

    $weeks_ago = floor($days_ago / 7);
    if ($weeks_ago < 2)
        return 'Неделю назад';
    if ($weeks_ago <= 4)
        return $weeks_ago . ' недели назад';

    $months_ago = floor($weeks_ago / 4);
    if ($months_ago < 2)
        return 'Месяц назад';
    if ($months_ago < 5)
        return $months_ago . ' месяца назад';
    if ($months_ago <= 12)
        return $months_ago . ' месяцев назад';

    $years_ago = floor($months_ago / 12);
    $suffix_to_years = suffix_to_years($years_ago);
    return "{$years_ago} {$suffix_to_years} назад";
}

function get_user_page_url($user_id = null)
{
    if (empty($user_id))
        $user_id = get_current_user_id();
    if (empty($user_id))
        return get_permalink('FLCL_HOME_PAGE');

    $base = get_option('_ba_eas_author_base');

    return get_site_url() . '/' . $base . '/' . $user_id;
}

function get_user_id_from_slug()
{
    $base = get_option('_ba_eas_author_base');
    if (!preg_match('/\/' . $base . '\//', $_SERVER['REQUEST_URI']))
        return false;

    $split_uri = explode('/', $_SERVER['REQUEST_URI']);
    $slug = $split_uri[count($split_uri) - 1];
    return $slug;
}

function flcl_get_product_category_url($category)
{
    return get_site_url()
        . '/'
        . get_option('woocommerce_permalinks')['category_base']
        . '/'
        . $category->slug;
}

function flcl_get_product_category_thumb($category)
{
    $thumb_id = get_term_meta($category->term_id, 'thumbnail_id', true);
    return wp_get_attachment_url($thumb_id);
}

function flcl_get_product_object($id_or_object)
{
    $product = null;
    if (is_string($id_or_object))
        $product = wc_get_product($id_or_object);
    if (is_object($id_or_object))
        $product = $id_or_object;

    return $product;
}

function flcl_get_category_object($slug_or_object)
{
    $category = null;
    if (is_string($slug_or_object)) {
        $category = get_terms([
            'taxonomy' => 'product_cat',
            'slug' => $slug_or_object
        ]);
        if (array_key_exists(0, $category))
            $category = $category[0];
        else
            $category = false;
    }
    if (is_object($slug_or_object))
        $category = $slug_or_object;

    return $category;
}

function flcl_get_product_thumb($id_or_object)
{
    $product = flcl_get_product_object($id_or_object);

    if (empty($product))
        return false;

    $image_id = $product->get_image_id();
    return wp_get_attachment_url($image_id);
}

function flcl_get_product_card($id_or_object)
{
    $product = flcl_get_product_object($id_or_object);

    ob_start();
    include get_template_directory() . '/html-components/shop/product-card.php';
    return ob_get_clean();
}

function flcl_set_product_data($product, $classNames)
{
    $is_favorite = false;
    $product_id = $product->get_id();
    $user_favorites = get_user_meta(get_current_user_id(), FAVORITE_PRODUCTS_KEY, true);
    if (!empty($user_favorites)) {
        $user_favorites = explode(',', $user_favorites);
    }
    if (is_user_logged_in() && is_array($user_favorites)) {
        $is_favorite = array_search($product_id, $user_favorites);
        if (is_numeric($is_favorite))
            $classNames .= ' product--favorite';
    }
    return 'class="' . $classNames . '" id="product_' . $product_id . '"';
}

function flcl_is_in_favorites($favorites_meta_key, $id)
{
    if (!is_user_logged_in())
        return false;

    $userdata = get_userdata(get_current_user_id());
    if ($userdata->$favorites_meta_key) {
        $array = array_values(explode(',', $userdata->$favorites_meta_key));
        if (is_numeric(array_search($id, $array)))
            return true;
    }

    return false;
}

function flcl_get_product_category_card($slug_or_object)
{
    $category = flcl_get_category_object($slug_or_object);
    if (empty($category))
        return '';

    ob_start();
    include get_template_directory() . '/html-components/shop/product-category-card.php';
    return ob_get_clean();
}

function find_in_cart($product_id)
{
    $cart_array = wc()->cart->get_cart();
    $cart_item = flcl_array_find($cart_array, function ($item) use ($product_id) {
        if ((int) $item['product_id'] === (int) $product_id)
            return true;
        return false;
    });
    return $cart_item;
}

// определит, находится ли пользователь на странице, связанной с магазином
function flcl_is_shop_page()
{
    return is_page('shop')
        || is_page('cart')
        || is_product_category()
        || is_product();
}

// вывести хлебные крошки
function flcl_breadcrumbs()
{
    get_static_menu('breadcrumbs');
}

// вывести фильтр
function flcl_filter()
{
    ob_start();
    include get_template_directory() . '/html-components/shop/filter.php';
    echo ob_get_clean();
}

// ** массивы ** //
$usda_zones = [
    'Нулевая',
    'Первая',
    'Вторая',
    'Третья',
    'Четвертая',
    'Пятая',
    'Шестая',
    'Седьмая',
    'Восьмая',
    'Девятая',
    'Десятая',
    'Одиннадцатая',
    'Двенадцатая',
];