<?php
/**
 * Plugin Name: Custom Table
 */

require_once ABSPATH . 'wp-admin/includes/upgrade.php';


global $wpdb;
/* префикс таблиц и кодировка */
$ct_table_prefix = $wpdb->prefix;
$charset_collate = $wpdb->get_charset_collate();

/* создание новой таблицы, если ее нет */
class Custom_Table
{
    public $table_name = '';
    public $conn = null;
    public $prefixed_table_name = '';

    public function __construct()
    {
        global $wpdb, $ct_table_prefix;
        $this->prefixed_table_name = $ct_table_prefix . $this->table_name;

        $query = $wpdb->prepare("SHOW TABLES LIKE %s", $wpdb->esc_like($this->prefixed_table_name));

        // если таблица не существует, создать ее
        if (!$wpdb->get_var($query) == $this->prefixed_table_name) {
            $this->create_table();
        }
    }

    public function get_sql()
    {
        return '';
    }
    public function create_table()
    {
        $sql = $this->get_sql();
        dbDelta($sql);
    }
}

class Posts_Likes extends Custom_Table
{
    public $table_name = 'posts_likes';

    public function __construct()
    {
        parent::__construct();
    }
    public function get_sql()
    {
        global $ct_table_prefix, $charset_collate;
        return "CREATE TABLE {$ct_table_prefix}{$this->table_name} (
            ID bigint(20) unsigned NOT NULL auto_increment,
            post_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            PRIMARY KEY (ID)
            )
            {$charset_collate}";
    }

    public function post_and_user_exist($post_id, $user_id)
    {
        $p_query = new WP_Query(['p' => $post_id]);
        $u_query = get_user_by('ID', $user_id);

        if (!$p_query->have_posts() || !$u_query)
            return false;

        return true;
    }

    public function has_like($post_id, $user_id)
    {
        $sql = "SELECT * FROM {$this->prefixed_table_name} 
        WHERE post_id = {$post_id} AND user_id = {$user_id}
        ";
        global $wpdb;
        $res = $wpdb->get_results($sql);
        if (!$res)
            return false;
        if (count($res) < 1)
            return false;
        return true;
    }

    public function get_likes_amount($post_id)
    {
        $sql = "SELECT user_id FROM {$this->prefixed_table_name} 
        WHERE post_id = {$post_id}";
        global $wpdb;
        $array = $wpdb->get_results($sql);

        return count($array);
    }

    public function add_like($post_id, $user_id)
    {
        if (!$this->post_and_user_exist($post_id, $user_id))
            return false;

        $sql = "INSERT INTO `{$this->prefixed_table_name}` (post_id, user_id) 
        VALUES (%d, %d)";
        global $wpdb;
        $result = $wpdb->query(
            $wpdb->prepare($sql, [(int) $post_id, (int) $user_id])
        );
        return $result;
    }

    public function remove_like($post_id, $user_id)
    {
        if (!$this->post_and_user_exist($post_id, $user_id))
            return false;

        $sql = "DELETE FROM {$this->prefixed_table_name} 
        WHERE post_id = %d AND user_id = %d";

        global $wpdb;
        $result = $wpdb->query(
            $wpdb->prepare($sql, [(int) $post_id, (int) $user_id])
        );
        return $result;
    }
}
$posts_likes = new Posts_Likes();

class FLCL_WC_Product_User_Ratings extends Custom_Table
{
    public $table_name = 'flcl_product_user_ratings';

    public function __construct()
    {
        parent::__construct();
    }

    public function get_sql()
    {
        global $ct_table_prefix, $charset_collate;
        return "CREATE TABLE {$ct_table_prefix}{$this->table_name} (
            ID bigint(20) unsigned NOT NULL auto_increment,
            product_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            rating_value int unsigned NOT NULL,
            PRIMARY KEY (ID)
            )
            {$charset_collate}";
    }

    public function update_rating($product_id, $user_id, $rating_value)
    {
        $product = wc_get_product($product_id);
        $user = get_userdata($user_id);

        if (!$product || !$user || $rating_value < 1 || $rating_value > 5)
            return false;

        global $wpdb;
        $existing_user_rating = $wpdb->get_var("SELECT product_id FROM `{$this->prefixed_table_name}` WHERE product_id = {$product_id} AND user_id = {$user_id}");

        // если оценка этого продукта этим пользователем существует - поменять (обновить)
        if ($existing_user_rating) {
            $sql = "UPDATE `{$this->prefixed_table_name}` 
            SET rating_value = %d 
            WHERE product_id = %d AND user_id = %d";

            $wpdb->query(
                $wpdb->prepare($sql, [$rating_value, $product_id, $user_id])
            );
        }
        // если оценки этого продукта этим пользователем еще нет, выставить
        else {
            $sql = "INSERT INTO `{$this->prefixed_table_name}` (product_id, user_id, rating_value) 
            VALUES (%d, %d, %d)";

            $wpdb->query(
                $wpdb->prepare($sql, [$product_id, $user_id, $rating_value])
            );
        }

        return true;
    }

    public function remove_rating($product_id, $user_id)
    {
        $product = wc_get_product($product_id);
        $user = get_userdata($user_id);

        if (!$product || !$user)
            return false;

        global $wpdb;
        $existing_user_rating = $wpdb->get_var("SELECT product_id FROM `{$this->prefixed_table_name}` WHERE product_id = {$product_id} AND user_id = {$user_id}");
        if (!$existing_user_rating)
            return true;

        $sql = "DELETE FROM `{$this->prefixed_table_name}` WHERE product_id = %d AND user_id = %d";
        return $wpdb->query(
            $wpdb->prepare($sql, [$product_id, $user_id])
        );
    }

    // вернет оценки, выставленные пользователем
    public function get_user_ratings()
    {

    }

    // вернет оценку, если пользователь ее поставил, либо false
    public function rated_by_user($product_id, $user_id = null)
    {
        if (empty($user_id))
            $user_id = get_current_user_id();

        $product = wc_get_product($product_id);
        $user = get_userdata($user_id);

        if (!$product || !$user)
            return false;

        global $wpdb;
        return $wpdb->get_var("SELECT rating_value FROM `{$this->prefixed_table_name}` WHERE product_id = {$product_id} AND user_id = {$user_id}");
    }

    // получит среднюю оценку товара, выставленную пользователями
    public function get_average_rating_value($product_id)
    {
        $sql = "SELECT rating_value FROM `{$this->prefixed_table_name}`
        WHERE product_id = {$product_id}";

        global $wpdb;
        $ratings = $wpdb->get_results($sql, ARRAY_A);

        if (empty($ratings))
            return false;
        if (count($ratings) < 1)
            return 0;

        $sum = 0;
        foreach ($ratings as $data) {
            $sum += (int) $data['rating_value'];
        }
        
        return $sum / count($ratings);
    }
}

$product_user_ratings = new FLCL_WC_Product_User_Ratings();