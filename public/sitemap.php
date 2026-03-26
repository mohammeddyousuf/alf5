<?php
/**
 * Dynamic Sitemap Generator for ALFragrance
 * Generates XML sitemap from Supabase data
 */

$SUPABASE_URL = "https://hoytbffldsdeywkyuuza.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveXRiZmZsZHNkZXl3a3l1dXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTAyNDksImV4cCI6MjA0OTI4NjI0OX0.gJwvzpKqdhIWhsIGF1a4BPUXysKXNtB-lg_aNG_VFz4";
$SITE_URL = "https://alfragrance.com";

function supabaseGet($url, $key, $endpoint) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => "$url/rest/v1/$endpoint",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "apikey: $key",
            "Authorization: Bearer $key",
        ],
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true) ?: [];
}

header('Content-Type: application/xml; charset=utf-8');

$products = supabaseGet($SUPABASE_URL, $SUPABASE_KEY, "products?select=id,name,updated_at&status=eq.published&order=updated_at.desc");
$collections = supabaseGet($SUPABASE_URL, $SUPABASE_KEY, "collections?select=id,slug,name,updated_at&order=updated_at.desc");
$pages = supabaseGet($SUPABASE_URL, $SUPABASE_KEY, "pages?select=id,slug,updated_at&status=eq.published&order=updated_at.desc");

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc><?= htmlspecialchars($SITE_URL) ?>/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($SITE_URL) ?>/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
<?php
foreach ($products as $product) {
    $slug = strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $product['name']), '-'));
    $id = $product['id'];
    $shortId = substr($id, -8);
    $lastmod = date('Y-m-d', strtotime($product['updated_at'] ?? 'now'));
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars("$SITE_URL/product/$slug-$shortId") . "</loc>\n";
    echo "    <lastmod>$lastmod</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.8</priority>\n";
    echo "  </url>\n";
}

foreach ($collections as $collection) {
    $slug = $collection['slug'] ?: strtolower(trim(preg_replace('/[^a-zA-Z0-9]+/', '-', $collection['name']), '-'));
    $lastmod = date('Y-m-d', strtotime($collection['updated_at'] ?? 'now'));
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars("$SITE_URL/collections/$slug") . "</loc>\n";
    echo "    <lastmod>$lastmod</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.7</priority>\n";
    echo "  </url>\n";
}

foreach ($pages as $page) {
    $slug = $page['slug'];
    $lastmod = date('Y-m-d', strtotime($page['updated_at'] ?? 'now'));
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars("$SITE_URL/page/$slug") . "</loc>\n";
    echo "    <lastmod>$lastmod</lastmod>\n";
    echo "    <changefreq>monthly</changefreq>\n";
    echo "    <priority>0.6</priority>\n";
    echo "  </url>\n";
}
?>
</urlset>
