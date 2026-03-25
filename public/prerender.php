<?php
/**
 * Social Media Crawler Prerender Script for ALFragrance
 * 
 * Place this as index.php in your Hostinger public_html folder.
 * It detects social media crawlers (WhatsApp, Facebook, Pinterest, Twitter, Google)
 * and serves proper OG meta tags with product data fetched from the database.
 * Normal users get the standard SPA index.html.
 * 
 * SETUP:
 * 1. Upload your build files to public_html/
 * 2. Rename this file to index.php
 * 3. Keep index.html as fallback
 * 4. Update .htaccess to route through index.php
 */

// Supabase config
$SUPABASE_URL = "https://hoytbffldsdeywkyuuza.supabase.co";
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhveXRiZmZsZHNkZXl3a3l1dXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3MTAyNDksImV4cCI6MjA0OTI4NjI0OX0.gJwvzpKqdhIWhsIGF1a4BPUXysKXNtB-lg_aNG_VFz4";
$SITE_URL = "https://alfragrance.com";
$SITE_NAME = "ALFragrance";

// Detect if request is from a social media crawler
function isCrawler() {
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $crawlers = [
        'WhatsApp',
        'facebookexternalhit',
        'Facebot',
        'Twitterbot',
        'Pinterest',
        'LinkedInBot',
        'Slackbot',
        'TelegramBot',
        'Googlebot',
        'bingbot',
        'Discordbot',
    ];
    foreach ($crawlers as $crawler) {
        if (stripos($userAgent, $crawler) !== false) {
            return true;
        }
    }
    return false;
}

// Extract product short ID from URL like /products/product-name-abc12345
function getProductShortId($uri) {
    if (preg_match('#^/products/(.+)$#', $uri, $matches)) {
        $slug = $matches[1];
        // Short ID is the last segment after the final hyphen (8 chars)
        $parts = explode('-', $slug);
        $lastPart = end($parts);
        if (strlen($lastPart) >= 8) {
            return substr($lastPart, 0, 8);
        }
    }
    return null;
}

// Fetch product data from Supabase
function fetchProduct($shortId, $supabaseUrl, $supabaseKey) {
    // Product IDs are UUIDs, so PostgREST LIKE filters do not work directly on the id column.
    // Fetch a bounded list and resolve the short ID suffix in PHP instead.
    $url = $supabaseUrl . "/rest/v1/products?select=*&limit=1000";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "apikey: $supabaseKey",
            "Authorization: Bearer $supabaseKey",
            "Content-Type: application/json",
        ],
        CURLOPT_TIMEOUT => 8,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) {
        return null;
    }
    
    $data = json_decode($response, true);
    if (empty($data) || !is_array($data)) {
        return null;
    }

    foreach ($data as $product) {
        $productId = $product['id'] ?? '';
        if (!$productId) {
            continue;
        }

        // App URLs use the FIRST 8 chars of the UUID (see frontend startsWith lookup).
        if (str_starts_with($productId, $shortId) || str_ends_with($productId, $shortId)) {
            return $product;
        }
    }
    
    return null;
}

// Fetch site settings (including tracking_codes)
function fetchSettings($supabaseUrl, $supabaseKey) {
    $url = $supabaseUrl . "/rest/v1/settings?select=website_name,favicon_url,tracking_codes&order=created_at.desc&limit=1";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "apikey: $supabaseKey",
            "Authorization: Bearer $supabaseKey",
            "Content-Type: application/json",
        ],
        CURLOPT_TIMEOUT => 5,
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    return !empty($data) ? $data[0] : null;
}

// Get absolute image URL
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

// Main logic
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Image proxy: serve product images from our domain without the upstream X-Robots-Tag header
if (isset($_GET['img_proxy'])) {
    $imgFile = urldecode((string) $_GET['img_proxy']);
    $imgUrl = $SUPABASE_URL . "/storage/v1/object/public/product-images/" . rawurlencode($imgFile);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $imgUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HTTPHEADER => [
            "apikey: $SUPABASE_KEY",
            "Authorization: Bearer $SUPABASE_KEY",
        ],
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
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Image not found';
    exit;
}

// If not a crawler, serve the normal SPA with tracking codes injected
if (!isCrawler()) {
    $indexFile = __DIR__ . '/index.html';
    if (file_exists($indexFile)) {
        $html = file_get_contents($indexFile);
        // Inject tracking codes from settings into <head>
        $settings = fetchSettings($SUPABASE_URL, $SUPABASE_KEY);
        $trackingCodes = $settings['tracking_codes'] ?? '';
        if ($trackingCodes) {
            $html = str_replace('</head>', $trackingCodes . "\n</head>", $html);
        }
        echo $html;
    }
    exit;
}

// It's a crawler - check if it's a product page
$shortId = getProductShortId($requestUri);

if ($shortId) {
    // Product page - fetch product data and serve rich meta tags
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
        
        // Get product image
        $imageUrl = '';
        if (!empty($product['images']) && is_array($product['images'])) {
            $imageUrl = getAbsoluteImageUrl($product['images'][0], $SUPABASE_URL);
        }
        
        // JSON-LD structured data
        $jsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product['name'],
            'description' => $product['description'] ?? '',
            'url' => $url,
            'offers' => [
                '@type' => 'Offer',
                'price' => $price,
                'priceCurrency' => 'INR',
                'availability' => $stockStatus === 'in stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'url' => $url,
                'itemCondition' => 'https://schema.org/NewCondition',
            ],
        ];
        if ($imageUrl) $jsonLd['image'] = [$imageUrl];
        if ($brand) $jsonLd['brand'] = ['@type' => 'Brand', 'name' => $brand];
        
        header('Content-Type: text/html; charset=UTF-8');
        echo '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>' . $title . '</title>
    <meta name="description" content="' . $description . '" />
    
    <!-- Open Graph / Facebook / WhatsApp / Pinterest -->
    <meta property="og:type" content="product" />
    <meta property="og:url" content="' . htmlspecialchars($url) . '" />
    <meta property="og:title" content="' . $title . '" />
    <meta property="og:description" content="' . $description . '" />
    <meta property="og:site_name" content="' . htmlspecialchars($siteName) . '" />
    ' . ($imageUrl ? '<meta property="og:image" content="' . htmlspecialchars($imageUrl) . '" />
    <meta property="og:image:secure_url" content="' . htmlspecialchars($imageUrl) . '" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />' : '') . '
    
    <!-- Product meta for Pinterest Rich Pins -->
    <meta property="product:price:amount" content="' . $price . '" />
    <meta property="product:price:currency" content="INR" />
    <meta property="og:price:amount" content="' . $price . '" />
    <meta property="og:price:currency" content="INR" />
    ' . ($brand ? '<meta property="product:brand" content="' . $brand . '" />' : '') . '
    <meta property="product:availability" content="' . $stockStatus . '" />
    
    <!-- Twitter Card -->
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
    <p>Price: ₹' . number_format($price) . '</p>
</body>
</html>';
        exit;
    }
}

// For non-product pages or if product not found, serve default meta tags
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
