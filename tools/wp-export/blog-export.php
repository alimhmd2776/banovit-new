<?php
/**
 * Read-only export of the WordPress blog for banovit-cms `blog:import-wp`.
 *
 *   wp eval-file tools/wp-export/blog-export.php > blog-export.json
 *   (on stage2: sudo -u www-data wp --path=/var/www/... eval-file ...)
 *
 * Nothing is written to WordPress. Post bodies are exported RENDERED (Elementor
 * layout + shortcodes expanded), because 215 of 237 posts are Elementor pages
 * with shortcodes; the importer turns that HTML into clean editor HTML.
 */

global $wpdb;

$site = home_url('/');
$yoastTax = get_option('wpseo_taxonomy_meta') ?: [];
$titles = get_option('wpseo_titles') ?: [];

$elementor = class_exists('\Elementor\Plugin') ? \Elementor\Plugin::instance() : null;

$render = function (WP_Post $post) use ($elementor) {
    $GLOBALS['post'] = $post;
    setup_postdata($post);
    $html = '';
    if ($elementor) {
        $doc = $elementor->documents->get($post->ID);
        if ($doc && $doc->is_built_with_elementor()) {
            $html = (string) $elementor->frontend->get_builder_content($post->ID, false);
        }
    }
    if (trim($html) === '') {
        $html = apply_filters('the_content', $post->post_content);
    } else {
        $html = do_shortcode($html);
    }
    wp_reset_postdata();

    return $html;
};

$image = function ($attachmentId) {
    $attachmentId = (int) $attachmentId;
    if (! $attachmentId) {
        return null;
    }
    $src = wp_get_attachment_image_src($attachmentId, 'full');
    if (! $src) {
        return null;
    }

    return [
        'id' => $attachmentId,
        'url' => $src[0],
        'width' => (int) $src[1],
        'height' => (int) $src[2],
        'alt' => (string) get_post_meta($attachmentId, '_wp_attachment_image_alt', true),
        'title' => get_the_title($attachmentId),
        'mime' => get_post_mime_type($attachmentId),
    ];
};

$terms = function ($taxonomy) use ($yoastTax) {
    $out = [];
    foreach (get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]) as $t) {
        $y = $yoastTax[$taxonomy][$t->term_id] ?? [];
        $out[] = [
            'id' => $t->term_id, 'slug' => $t->slug, 'name' => $t->name, 'parent' => $t->parent,
            'description' => $t->description, 'link' => get_term_link($t), 'count' => $t->count,
            'yoast' => array_intersect_key($y, array_flip(['wpseo_title', 'wpseo_desc', 'wpseo_canonical', 'wpseo_noindex', 'wpseo_focuskw', 'wpseo_opengraph-title', 'wpseo_opengraph-description', 'wpseo_opengraph-image'])),
        ];
    }

    return $out;
};

$authors = [];
foreach (get_users(['has_published_posts' => ['post'], 'fields' => 'all']) as $u) {
    $avatarId = (int) get_user_meta($u->ID, 'wp_user_avatar', true) ?: (int) get_user_meta($u->ID, $wpdb->get_blog_prefix().'user_avatar', true);
    $authors[] = [
        'id' => $u->ID,
        'slug' => $u->user_nicename,
        'name' => $u->display_name,
        'description' => get_user_meta($u->ID, 'description', true),
        'link' => get_author_posts_url($u->ID),
        'avatar' => $avatarId ? wp_get_attachment_image_src($avatarId, 'full') : null,
        'avatar_url' => get_avatar_url($u->ID, ['size' => 256]),
        'social' => array_filter([
            'instagram' => get_user_meta($u->ID, 'instagram', true),
            'telegram' => get_user_meta($u->ID, 'telegram', true),
            'linkedin' => get_user_meta($u->ID, 'linkedin', true),
            'twitter' => get_user_meta($u->ID, 'twitter', true),
            'website' => $u->user_url,
        ]),
        'yoast' => [
            'wpseo_title' => get_user_meta($u->ID, 'wpseo_title', true),
            'wpseo_metadesc' => get_user_meta($u->ID, 'wpseo_metadesc', true),
            'wpseo_noindex_author' => get_user_meta($u->ID, 'wpseo_noindex_author', true),
        ],
    ];
}

$posts = [];
$mediaIds = [];
$query = new WP_Query(['post_type' => 'post', 'post_status' => ['publish', 'future', 'draft', 'private', 'pending'], 'posts_per_page' => -1, 'orderby' => 'ID', 'order' => 'ASC', 'no_found_rows' => true]);
foreach ($query->posts as $post) {
    $meta = get_post_meta($post->ID);
    $m = fn ($k) => isset($meta[$k][0]) ? maybe_unserialize($meta[$k][0]) : null;

    $html = $render($post);
    preg_match_all('/wp-image-(\d+)/', $html, $mm);
    $thumb = (int) get_post_thumbnail_id($post->ID);
    foreach (array_merge($mm[1], [$thumb]) as $id) {
        if ((int) $id) {
            $mediaIds[(int) $id] = true;
        }
    }
    preg_match_all('/\[([a-zA-Z0-9_-]+)[\s\]]/', $post->post_content, $sc);

    $faqMeta = [];
    foreach ($meta as $k => $v) {
        if (preg_match('/faq/i', $k)) {
            $faqMeta[$k] = maybe_unserialize($v[0] ?? '');
        }
    }

    $posts[] = [
        'id' => $post->ID,
        'slug' => $post->post_name,
        'status' => $post->post_status,
        'title' => html_entity_decode(get_the_title($post), ENT_QUOTES, 'UTF-8'),
        'excerpt' => $post->post_excerpt,
        'date_gmt' => $post->post_date_gmt,
        'modified_gmt' => $post->post_modified_gmt,
        'author' => (int) $post->post_author,
        'link' => get_permalink($post),
        'categories' => wp_get_post_categories($post->ID),
        'tags' => wp_get_post_tags($post->ID, ['fields' => 'ids']),
        'primary_category' => (int) $m('_yoast_wpseo_primary_category'),
        'featured' => $image($thumb),
        'content_html' => $html,
        'shortcodes' => array_values(array_unique($sc[1])),
        'yoast' => array_filter([
            'title' => $m('_yoast_wpseo_title'),
            'metadesc' => $m('_yoast_wpseo_metadesc'),
            'canonical' => $m('_yoast_wpseo_canonical'),
            'noindex' => $m('_yoast_wpseo_meta-robots-noindex'),
            'nofollow' => $m('_yoast_wpseo_meta-robots-nofollow'),
            'og_title' => $m('_yoast_wpseo_opengraph-title'),
            'og_description' => $m('_yoast_wpseo_opengraph-description'),
            'og_image' => $m('_yoast_wpseo_opengraph-image'),
            'focuskw' => $m('_yoast_wpseo_focuskw'),
            'focuskeywords' => $m('_yoast_wpseo_focuskeywords'),
            'schema_article_type' => $m('_yoast_wpseo_schema_article_type'),
        ], fn ($v) => $v !== null && $v !== ''),
        'faq_meta' => $faqMeta,
        'views' => function_exists('pvc_get_post_views') ? (int) pvc_get_post_views($post->ID) : (int) $m('views'),
        'old_slugs' => array_values(array_filter((array) get_post_meta($post->ID, '_wp_old_slug'))),
        'sidebar_banners' => array_values(array_filter((array) maybe_unserialize(get_post_meta($post->ID, '_sb_custom_banners', true)), fn ($b) => is_array($b) && !empty($b['image']))), // [sidebar_banner]
        'comments' => array_map(fn ($c) => [
            'id' => (int) $c->comment_ID, 'parent' => (int) $c->comment_parent, 'author' => $c->comment_author,
            'content' => $c->comment_content, 'date_gmt' => $c->comment_date_gmt,
            'approved' => $c->comment_approved,
        ], get_comments(['post_id' => $post->ID, 'status' => 'all', 'type' => 'comment'])),
    ];
}

$media = [];
foreach (array_keys($mediaIds) as $id) {
    if ($img = $image($id)) {
        $media[] = $img;
    }
}

echo wp_json_encode([
    'exported_at' => gmdate('c'),
    'site_url' => $site,
    'permalink_structure' => get_option('permalink_structure'),
    'category_base' => get_option('category_base'),
    'tag_base' => get_option('tag_base'),
    'wpseo_titles' => array_filter($titles, fn ($k) => (bool) preg_match('/^(separator|title-(post|category|post_tag|author-wpseo|home-wpseo|archive-wpseo)|metadesc-(post|category|post_tag|author-wpseo|home-wpseo)|noindex-(post|category|post_tag|author-wpseo)|disable-author)$/', $k), ARRAY_FILTER_USE_KEY),
    'blog_page' => ($pid = (int) get_option('page_for_posts')) ? [
        'id' => $pid, 'link' => get_permalink($pid),
        'title' => get_post_meta($pid, '_yoast_wpseo_title', true), 'description' => get_post_meta($pid, '_yoast_wpseo_metadesc', true),
    ] : null,
    // /blog/ itself is the Elementor page «blog» (2293); its Yoast title/description win.
    'blog_landing' => ($bp = get_page_by_path('blog')) ? [
        'id' => $bp->ID, 'link' => get_permalink($bp),
        'title' => get_post_meta($bp->ID, '_yoast_wpseo_title', true), 'description' => get_post_meta($bp->ID, '_yoast_wpseo_metadesc', true),
    ] : null,
    'categories' => $terms('category'),
    'tags' => $terms('post_tag'),
    'authors' => $authors,
    'posts' => $posts,
    'media' => $media,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
