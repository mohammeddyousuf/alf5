<?php
/**
 * Social Media Crawler Prerender Script for ALFragrance
 */

$SUPABASE_URL = "https://hoytbffldsdeywkyuuza.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveXRiZmZsZHNkZXl3a3l1dXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTAyNDksImV4cCI6MjA0OTI4NjI0OX0.gJwvzpKqdhIWhsIGF1a4BPUXysKXNtB-lg_aNG_VFz4";
$SITE_URL = "https://alfragrance.com";
$SITE_NAME = "ALFragrance";

function isCrawler() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $crawlers = [
        'WhatsApp', 'facebookexternalhit', 'Facebot', 'Twitterbot',
        'Pinterest', 'LinkedInBot', 'Slackbot', 'TelegramBot',
        'Googlebot', 'bingbot', 'Discordbot',
    ];
    foreach ($crawlers as $crawler) {
        if (stripos($userAgent, $crawler) !== false) return true;
    }
    return false;
}

function getProductShortId($uri) {
    if (preg_match('#^/products/(.+)$#', $uri, $matches)) {
        $slug = $matches[1];
        $parts = explode('-', $slug);
        $lastPart = end($parts);
        if (strlen($lastPart) >= 8) return substr($lastPart, 0, 8);
    }
    return null;
}

function getCollectionSlug($uri) {
    if (preg_match('#^/collections/([^/]+)$#', $uri, $matches)) {
        return $matches[1];
    }
    return null;
}

function fetchProduct($shortId, $supabaseUrl, $supabaseKey) {
    $url = $supabaseUrl . "/rest/v1/products?select=*&limit=1000";
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["apikey: $supabaseKey", "Authorization: Bearer $supabaseKey", "Content-Type: application/json"],
        CURLOPT_TIMEOUT => 8,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpCode !== 200 || !$response) return null;
    $data = json_decode($response, true);
    if (empty($data) || !is_array($data)) return null;
    foreach ($data as $product) {
        $productId = $product['id'] ?? '';
        if (!$productId) continue;
        if (str_starts_with($productId, $shortId) || str_ends_with($productId, $shortId)) return $product;
    }
    return null;
}

function fetchCollection($id, $supabaseUrl, $supabaseKey) {
    $url = $supabaseUrl . "/rest/v1/collections?id=eq." . urlencode($id) . "&limit=1";
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["apikey: $supabaseKey", "Authorization: Bearer $supabaseKey", "Content-Type: application/json"],
        CURLOPT_TIMEOUT => 5,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return !empty($data) ? $data[0] : null;
}

function fetchSettings($supabaseUrl, $supabaseKey) {
    $url = $supabaseUrl . "/rest/v1/settings?select=website_name,favicon_url,tracking_codes&order=created_at.desc&limit=1";
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ["apikey: $supabaseKey", "Authorization: Bearer $supabaseKey", "Content-Type: application/json"],
        CURLOPT_TIMEOUT => 5,
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($response, true);
    return !empty($data) ? $data[0] : null;
}

function getAbsoluteImageUrl($img, $supabaseUrl) {
    global $SITE_URL;
    if (!$img) return '';
    if (strpos($img, 'http') === 0) {
        $prefix = $supabaseUrl . "/storage/v1/object/public/product-images/";
        if (strpos($img, $prefix) === 0) {
            $filename = substr($img, strlen($prefix));
            return $SITE_URL . '/img-proxy/' . rawurlencode(urldecode($filename));
        }
        return $img;
    }
    return $SITE_URL . '/img-proxy/' . rawurlencode($img);
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Image proxy
if (isset($_GET['img_proxy'])) {
    $imgFile = urldecode((string) $_GET['img_proxy']);
    $imgUrl = $SUPABASE_URL . "/storage/v1/object/public/product-images/" . rawurlencode($imgFile);
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $imgUrl, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => ["apikey: $SUPABASE_KEY", "Authorization: Bearer $SUPABASE_KEY"],
    ]);
    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/jpeg';
    curl_close($ch);
    if ($httpCode === 200 && $imageData !== false) {
        header('Content-Type: ' . $contentType);
        header('Content-Length: ' . strlen($imageData));
        header('Cache-Control: public, max-age=86400');
        header('Access-Control-Allow-Origin: *');
        echo $imageData;
        exit;
    }
    http_response_code(404);
    echo 'Image not found';
    exit;
}

// Non-crawler: serve SPA with tracking codes
if (!isCrawler()) {
    $indexFile = __DIR__ . '/index.html';
    if (file_exists($indexFile)) {
        $html = file_get_contents($indexFile);
        $settings = fetchSettings($SUPABASE_URL, $SUPABASE_KEY);
        $trackingCodes = $settings['tracking_codes'] ?? '';
        if ($trackingCodes) {
            $html = str_replace('</head>', $trackingCodes . "\n</head>", $html);
        }
        echo $html;
    }
    exit;
}

// Crawler handling
$shortId = getProductShortId($requestUri);
$collectionId = getCollectionId($requestUri);

if ($shortId) {
    $product = fetchProduct($shortId, $SUPABASE_URL, $SUPABASE_KEY);
    $settings = fetchSettings($SUPABASE_URL, $SUPABASE_KEY);
    $siteName = $settings['website_name'] ?? $SITE_NAME;
    
    if ($product) {
        $title = htmlspecialchars($product['name'] . ' | ' . $siteName);
        $description = htmlspecialchars($product['description'] ?? $product['name'] . ' - Available at ' . $siteName);
        $price = $product['sale_price'] ?? $product['price'];
        $brand = htmlspecialchars($product['brand'] ?? '');
        $url = $SITE_URL . $_SERVER['REQUEST_URI'];
        $stockStatus = ($product['stock_status'] ?? 'in_stock') === 'in_stock' ? 'in stock' : 'out of stock';
        
        $imageUrl = '';
        if (!empty($product['images']) && is_array($product['images'])) {
            $imageUrl = getAbsoluteImageUrl($product['images'][0], $SUPABASE_URL);
        }
        
        $jsonLd = [
            '@context' => 'https://schema.org', '@type' => 'Product',
            'name' => $product['name'], 'description' => $product['description'] ?? '',
            'url' => $url,
            'offers' => [
                '@type' => 'Offer', 'price' => $price, 'priceCurrency' => 'INR',
                'availability' => $stockStatus === 'in stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'url' => $url, 'itemCondition' => 'https://schema.org/NewCondition',
            ],
        ];
        if ($imageUrl) $jsonLd['image'] = [$imageUrl];
        if ($brand) $jsonLd['brand'] = ['@type' => 'Brand', 'name' => $brand];
        
        $additionalProperty = [];
        if (!empty($product['gender_profile'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Gender Profile', 'value' => $product['gender_profile']];
        if (!empty($product['occasion'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Occasion', 'value' => $product['occasion']];
        if (!empty($product['scent_family'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Scent Family', 'value' => $product['scent_family']];
        if (!empty($product['top_notes'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Top Notes', 'value' => $product['top_notes']];
        if (!empty($product['heart_notes'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Heart Notes', 'value' => $product['heart_notes']];
        if (!empty($product['base_notes'])) $additionalProperty[] = ['@type' => 'PropertyValue', 'name' => 'Base Notes', 'value' => $product['base_notes']];
        if (!empty($additionalProperty)) $jsonLd['additionalProperty'] = $additionalProperty;
        
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' . $title . '</title>
    <meta name="description" content="' . $description . '" />
    <meta property="og:type" content="product" />
    <meta property="og:url" content="' . htmlspecialchars($url) . '" />
    <meta property="og:title" content="' . $title . '" />
    <meta property="og:description" content="' . $description . '" />
    <meta property="og:site_name" content="' . htmlspecialchars($siteName) . '" />
    ' . ($imageUrl ? '<meta property="og:image" content="' . htmlspecialchars($imageUrl) . '" />
    <meta property="og:image:secure_url" content="' . htmlspecialchars($imageUrl) . '" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />' : '') . '
    <meta property="product:price:amount" content="' . $price . '" />
    <meta property="product:price:currency" content="INR" />
    <meta property="og:price:amount" content="' . $price . '" />
    <meta property="og:price:currency" content="INR" />
    ' . ($brand ? '<meta property="product:brand" content="' . $brand . '" />' : '') . '
    <meta property="product:availability" content="' . $stockStatus . '" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="' . $title . '" />
    <meta name="twitter:description" content="' . $description . '" />
    ' . ($imageUrl ? '<meta name="twitter:image" content="' . htmlspecialchars($imageUrl) . '" />' : '') . '
    <link rel="canonical" href="' . htmlspecialchars($url) . '" />
    <script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES) . '</script>
    ' . ($settings['tracking_codes'] ?? '') . '
</head>
<body>
    <h1>' . $title . '</h1>
    ' . ($imageUrl ? '<img src="' . htmlspecialchars($imageUrl) . '" alt="' . htmlspecialchars($product['name']) . '" />' : '') . '
    <p>' . $description . '</p>
    ' . ($brand ? '<p>Brand: ' . $brand . '</p>' : '') . '
    ' . (!empty($product['gender_profile']) ? '<p>Gender Profile: ' . htmlspecialchars($product['gender_profile']) . '</p>' : '') . '
    ' . (!empty($product['occasion']) ? '<p>Occasion: ' . htmlspecialchars($product['occasion']) . '</p>' : '') . '
    ' . (!empty($product['scent_family']) ? '<p>Scent Family: ' . htmlspecialchars($product['scent_family']) . '</p>' : '') . '
    <p>Price: ₹' . number_format($price) . '</p>
</body>
</html>';
        exit;
    }
} elseif ($collectionId) {
    $collection = fetchCollection($collectionId, $SUPABASE_URL, $SUPABASE_KEY);
    $settings = fetchSettings($SUPABASE_URL, $SUPABASE_KEY);
    $siteName = $settings['website_name'] ?? $SITE_NAME;

    if ($collection) {
        $seoTitle = htmlspecialchars($collection['seo_title'] ?? $collection['name']);
        $title = $seoTitle . ' | ' . htmlspecialchars($siteName);
        $description = htmlspecialchars($collection['description'] ?? $seoTitle . ' - Browse our curated collection at ' . $siteName);
        $url = $SITE_URL . $_SERVER['REQUEST_URI'];
        $imageUrl = $collection['image_url'] ?? '';

        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' . $title . '</title>
    <meta name="description" content="' . $description . '" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="' . htmlspecialchars($url) . '" />
    <meta property="og:title" content="' . $title . '" />
    <meta property="og:description" content="' . $description . '" />
    <meta property="og:site_name" content="' . htmlspecialchars($siteName) . '" />
    ' . ($imageUrl ? '<meta property="og:image" content="' . htmlspecialchars($imageUrl) . '" />' : '') . '
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="' . $title . '" />
    <meta name="twitter:description" content="' . $description . '" />
    ' . ($imageUrl ? '<meta name="twitter:image" content="' . htmlspecialchars($imageUrl) . '" />' : '') . '
    <link rel="canonical" href="' . htmlspecialchars($url) . '" />
    ' . ($settings['tracking_codes'] ?? '') . '
</head>
<body>
    <h1>' . $seoTitle . '</h1>
    <p>' . $description . '</p>
</body>
</html>';
        exit;
    }
}

// Default page for crawlers
$settings = $settings ?? fetchSettings($SUPABASE_URL, $SUPABASE_KEY);
$siteName = htmlspecialchars($settings['website_name'] ?? $SITE_NAME);
$trackingCodes = $settings['tracking_codes'] ?? '';

header('Content-Type: text/html; charset=UTF-8');
echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' . $siteName . '</title>
    <meta name="description" content="Premium fragrances and perfumes. Discover your signature scent at ' . $siteName . '." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="' . htmlspecialchars($SITE_URL) . '" />
    <meta property="og:title" content="' . $siteName . ' - Premium Fragrances" />
    <meta property="og:description" content="Premium fragrances and perfumes. Discover your signature scent at ' . $siteName . '." />
    <meta property="og:site_name" content="' . $siteName . '" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="' . $siteName . ' - Premium Fragrances" />
    <meta name="twitter:description" content="Premium fragrances and perfumes. Discover your signature scent at ' . $siteName . '." />
    ' . $trackingCodes . '
</head>
<body>
    <h1>' . $siteName . '</h1>
    <p>Premium fragrances and perfumes.</p>
</body>
</html>';
