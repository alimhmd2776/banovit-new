<?php
// Read-only export of product-page (PDP) data that the CMS does not sync from WooCommerce.
// Run on the LIVE WP host (read-only; SEO data must come from live, never test2):
//   wp eval-file pdp-export.php > pdp-export.json
// Import in banovit-cms: php artisan storefront:import-wp-products pdp-export.json
//
// Prints one JSON document, streamed product by product so memory stays flat.
// Raw meta for add-ons (Rico-wc-addons), FAQs and features is exported as-is;
// the importer knows the shapes and reports what it could not map.
global $wpdb;

$img = function ($id) {
    $id = (int) $id;
    if (!$id) { return null; }
    $src = wp_get_attachment_image_src($id, 'full');
    if (!$src) { return null; }
    return ['id' => $id, 'url' => $src[0], 'width' => (int) $src[1], 'height' => (int) $src[2], 'alt' => (string) get_post_meta($id, '_wp_attachment_image_alt', true)];
};
$raw_meta = function ($post_id, $pattern) {
    $out = [];
    foreach (get_post_meta($post_id) as $k => $v) {
        if (preg_match($pattern, $k)) { $out[$k] = maybe_unserialize($v[0] ?? ''); }
    }
    return $out;
};
$terms = function ($pid, $tax) {
    if (!taxonomy_exists($tax)) { return []; }
    $out = [];
    foreach ((array) wp_get_post_terms($pid, $tax) as $t) {
        if ($t && !is_wp_error($t)) {
            $row = ['id' => $t->term_id, 'slug' => urldecode($t->slug), 'name' => $t->name];
            if (is_taxonomy_hierarchical($tax)) { $row['ancestors'] = array_map('intval', get_ancestors($t->term_id, $tax, 'taxonomy')); }
            $out[] = $row;
        }
    }
    return $out;
};
$acf_keys = ['kase_gheymat', 'omomi', 'product_label', 'text_mojodi', 'product_details', 'feachers_one'];
$yoast_keys = ['title', 'metadesc', 'canonical', 'meta-robots-noindex', 'meta-robots-nofollow', 'meta-robots-adv', 'opengraph-title', 'opengraph-description', 'opengraph-image', 'focuskw', 'focuskeywords', 'primary_product_cat'];

$addon_groups = [];
foreach (get_posts(['post_type' => ['cwa_addon_group', 'cwa_addon', 'rico_addon_group'], 'post_status' => 'any', 'numberposts' => -1]) as $g) {
    $addon_groups[] = ['id' => $g->ID, 'type' => $g->post_type, 'title' => $g->post_title, 'status' => $g->post_status, 'content' => $g->post_content, 'menu_order' => $g->menu_order, 'meta' => $raw_meta($g->ID, '/./')];
}

$titles = get_option('wpseo_titles') ?: [];
echo '{"exported_at":' . wp_json_encode(gmdate('c'));
echo ',"site_url":' . wp_json_encode(home_url('/'));
echo ',"wpseo_titles":' . wp_json_encode(array_intersect_key($titles, array_flip(['separator', 'title-product', 'metadesc-product', 'noindex-product'])), JSON_UNESCAPED_UNICODE);
echo ',"addon_options":' . wp_json_encode(array_filter(wp_load_alloptions(), fn ($k) => preg_match('/^(cwa|rico)_/i', $k), ARRAY_FILTER_USE_KEY), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
echo ',"bdi_cost_rules":' . wp_json_encode(array_values((array) (maybe_unserialize(get_option('bdi_cost_rules')) ?: [])), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
echo ',"addon_groups":' . wp_json_encode($addon_groups, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
echo ',"products":[';

$ids = $wpdb->get_col("SELECT ID FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status = 'publish' ORDER BY ID");
$first = true;
foreach ($ids as $pid) {
    $p = wc_get_product($pid);
    if (!$p) { continue; }
    $post = get_post($pid);

    $gallery = [];
    if ($f = $img($p->get_image_id())) { $gallery[] = $f; }
    foreach ($p->get_gallery_image_ids() as $gid) { if ($g = $img($gid)) { $gallery[] = $g; } }

    $variations = [];
    if ($p->is_type('variable')) {
        foreach ($p->get_children() as $vid) {
            $v = wc_get_product($vid);
            if ($v) { $variations[] = ['id' => $vid, 'image' => $img($v->get_image_id()), 'attributes' => $v->get_attributes()]; }
        }
    }

    $yoast = [];
    foreach ($yoast_keys as $k) {
        $val = get_post_meta($pid, '_yoast_wpseo_' . $k, true);
        if ($val !== '' && $val !== null) { $yoast[$k] = $val; }
    }
    if (!empty($yoast['primary_product_cat'])) {
        $t = get_term((int) $yoast['primary_product_cat'], 'product_cat');
        $yoast['primary_product_cat_slug'] = ($t && !is_wp_error($t)) ? urldecode($t->slug) : null;
    }

    $reviews = [];
    foreach (get_comments(['post_id' => $pid, 'type' => 'review', 'status' => 'all']) as $c) {
        $reviews[] = [
            'id' => (int) $c->comment_ID, 'author' => $c->comment_author, 'email' => $c->comment_author_email,
            'date_gmt' => $c->comment_date_gmt, 'content' => $c->comment_content, 'approved' => $c->comment_approved,
            'rating' => (int) get_comment_meta($c->comment_ID, 'rating', true),
            'verified' => (int) get_comment_meta($c->comment_ID, 'verified', true),
            'parent' => (int) $c->comment_parent, 'user_id' => (int) $c->user_id,
            'meta' => array_map(fn ($v) => maybe_unserialize($v[0] ?? ''), get_comment_meta($c->comment_ID)),
        ];
    }

    $sale_to = $p->get_date_on_sale_to();
    $row = [
        'id' => $pid,
        'slug' => urldecode($post->post_name),
        'link' => get_permalink($pid),
        'type' => $p->get_type(),
        'description' => $post->post_content,
        'short_description' => $post->post_excerpt,
        'gallery' => $gallery,
        'variations' => $variations,
        'yoast' => $yoast,
        'sale_to' => $sale_to ? $sale_to->date('Y-m-d') : null,
        'upsell_ids' => array_map('intval', $p->get_upsell_ids()),
        'cross_sell_ids' => array_map('intval', $p->get_cross_sell_ids()),
        'reviews' => $reviews,
        'addon_meta' => $raw_meta($pid, '/cwa|addon|rico/i'),
        'faq_meta' => $raw_meta($pid, '/faq/i'),
        'feature_meta' => $raw_meta($pid, '/feature|highlight|ویژگی/i'),
        'views' => (int) get_post_meta($pid, 'post_views_count', true),
        // BDI installation rules match on these (category / tag / brand name).
        'terms' => ['cats' => $terms($pid, 'product_cat'), 'tags' => $terms($pid, 'product_tag'), 'brands' => array_merge($terms($pid, 'pa_brand'), $terms($pid, 'product_brand'))],
        'install_disabled' => (string) get_post_meta($pid, '_bdi_install_disabled', true),
        'sink_product' => (string) get_post_meta($pid, '_sink_products', true),
        'acf' => array_filter(array_combine($acf_keys, array_map(fn ($k) => get_post_meta($pid, $k, true), $acf_keys)), fn ($v) => $v !== '' && $v !== null && $v !== false),
    ];
    echo ($first ? '' : ',') . wp_json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $first = false;
    if (function_exists('wp_cache_flush_runtime')) { wp_cache_flush_runtime(); }
}
echo ']}';
