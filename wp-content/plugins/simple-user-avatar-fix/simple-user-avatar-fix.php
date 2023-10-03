<?php
/**
 * Plugin Name:       Simple User Avatar fix
 */

add_filter('get_avatar_url', 'sua_get_avatar_url_fix', 5, 2);
function sua_get_avatar_url_fix($url, $id_or_email)
{
    $user_id = null;
    if (is_numeric($id_or_email))
        $user_id = $id_or_email;
    elseif (is_object($id_or_email))
        $user_id = $id_or_email->ID;
    elseif (is_string($id_or_email)) {
        $user = get_user_by('email', $id_or_email);
        if ($user && !is_wp_error($user))
            $user_id = $user->ID;
    }

    $attachment_id = get_user_meta($user_id, SUA_USER_META_KEY, true);
    if ($attachment_id) {
        $attachment_url = wp_get_attachment_url($attachment_id);
        if ($attachment_url)
            return $attachment_url;
    }
    return $url;
}