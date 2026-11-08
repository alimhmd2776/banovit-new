<?php
// Read-only export of PLP-relevant WP data (run with: wp eval-file). Prints JSON.
global $wpdb;
$yoast = get_option('wpseo_taxonomy_meta') ?: [];
$terms = function ($tax) use ($yoast) {
    $out = [];
    foreach (get_terms(['taxonomy' => $tax, 'hide_empty' => false]) as $t) {
        $thumb = (int) get_term_meta($t->term_id, 'thumbnail_id', true);
        $y = $yoast[$tax][$t->term_id] ?? [];
        $meta = [];
        foreach (get_term_meta($t->term_id) as $k => $v) {
            if (preg_match('/color|hex|swatch|banner|image|faq|icon|logo/i', $k)) { $meta[$k] = maybe_unserialize($v[0] ?? ''); }
        }
        $out[] = [
            'id' => $t->term_id, 'slug' => $t->slug, 'name' => $t->name, 'parent' => $t->parent,
            'link' => get_term_link($t), 'description' => $t->description,
            'image' => $thumb ? wp_get_attachment_image_src($thumb, 'full') : null,
            'image_alt' => $thumb ? get_post_meta($thumb, '_wp_attachment_image_alt', true) : null,
            'yoast' => array_intersect_key($y, array_flip(['wpseo_title', 'wpseo_desc', 'wpseo_canonical', 'wpseo_noindex', 'wpseo_focuskw', 'wpseo_opengraph-title', 'wpseo_opengraph-description', 'wpseo_opengraph-image'])),
            'meta' => $meta,
            'logo' => ($lid = (int) get_term_meta($t->term_id, 'brand_logo', true)) ? wp_get_attachment_image_src($lid, 'medium') : null,
        ];
    }
    return $out;
};
echo wp_json_encode([
    'exported_at' => gmdate('c'),
    'attrs' => $wpdb->get_results("SELECT attribute_id, attribute_name, attribute_label FROM {$wpdb->prefix}woocommerce_attribute_taxonomies ORDER BY attribute_id"),
    'rules' => get_option('cwa_category_filter_rules'),
    'product_cat' => $terms('product_cat'),
    'pa_brand' => $terms('pa_brand'),
    'pa_color' => $terms('pa_color'),
    // banovit-delivery-installation: products that can get «خدمات نصب» (rules + per-product opt-out).
    'install_product_ids' => class_exists('BDI_Cost_Rules') ? array_values(array_filter(
        get_posts(['post_type' => 'product', 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => -1]),
        fn ($id) => BDI_Cost_Rules::product_can_have_installation($id)
    )) : null,
    // Live default order («جدیدترین» = post_date DESC, ID DESC): {ID: [post_date_gmt, menu_order]}
    'product_dates' => (function () use ($wpdb) {
        $out = [];
        foreach ($wpdb->get_results("SELECT ID, post_date_gmt, menu_order FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status = 'publish'") as $r) {
            $out[$r->ID] = [$r->post_date_gmt, (int) $r->menu_order];
        }
        return $out;
    })(),
    // WooCommerce catalog visibility: published but never listed in shop/category/brand pages.
    'hidden_from_catalog_ids' => array_map('intval', $wpdb->get_col("SELECT tr.object_id FROM {$wpdb->term_relationships} tr JOIN {$wpdb->term_taxonomy} tt ON tt.term_taxonomy_id = tr.term_taxonomy_id JOIN {$wpdb->terms} t ON t.term_id = tt.term_id WHERE tt.taxonomy = 'product_visibility' AND t.slug = 'exclude-from-catalog'")),
    'meta_keys_product_cat' => $wpdb->get_col("SELECT DISTINCT tm.meta_key FROM {$wpdb->termmeta} tm JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = tm.term_id AND tt.taxonomy = 'product_cat'"),
    'wpseo_titles' => array_intersect_key(get_option('wpseo_titles') ?: [], array_flip(['separator', 'title-tax-product_cat', 'metadesc-tax-product_cat', 'title-tax-pa_brand', 'metadesc-tax-pa_brand', 'title-archive-product'])),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
