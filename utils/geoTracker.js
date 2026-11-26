const geoip = require('geoip-lite');

/**
 * Helper to parse client User-Agent into clean device, browser, and OS
 */
function parseUserAgent(ua = '') {
  ua = ua || '';
  let deviceType = 'Desktop';
  let browser = 'Chrome';
  let os = 'Windows';

  // Device
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
    deviceType = 'Tablet';
  }

  // OS
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  return { deviceType, browser, os };
}

/**
 * Resolve client IP and lookup Geolocation info
 */
function getClientGeo(req) {
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  // Strip IPv6 prefix if present (e.g., ::ffff:127.0.0.1)
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  let city = 'Unknown City';
  let region = 'Unknown State';
  let country = 'India';
  let countryCode = 'IN';

  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.');

  if (isLocal) {
    city = 'Varanasi (Local)';
    region = 'Uttar Pradesh';
    country = 'India';
    countryCode = 'IN';
  } else {
    try {
      const geo = geoip.lookup(ip);
      if (geo) {
        city = geo.city || 'Unknown City';
        region = geo.region || 'Unknown State';
        country = geo.country || 'India';
        countryCode = geo.country || 'IN';
      }
    } catch (e) {
      // Fallback
    }
  }

  const { deviceType, browser, os } = parseUserAgent(req.headers['user-agent']);
  const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct Visit';
  const pageUrl = req.originalUrl || req.url || '/';

  return {
    ip,
    city,
    region,
    country,
    countryCode,
    deviceType,
    browser,
    os,
    referrer,
    pageUrl
  };
}

module.exports = {
  getClientGeo,
  parseUserAgent
};
