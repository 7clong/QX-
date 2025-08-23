/*
 * Name: dy-feed-clean.js
 * Desc: Douyin 信息流广告清洗（只改响应体，不碰正常内容）
 * Author: QuantumultX 规则工程师
 * Version: 2025.08.23
 */

function isAdLike(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (obj.is_ads === true) return true;
  if (obj.ad_info || obj.ad || obj.ad_data || obj.raw_ad_data) return true;
  if (obj.poi_ad || obj.card_type === "ad" || obj.card_name === "ad") return true;
  if (obj.label === "广告" || obj.label_type === "ad") return true;
  const adTypeHints = new Set([66, 101, 102, 103]);
  if (typeof obj.aweme_type === "number" && adTypeHints.has(obj.aweme_type)) {
    if (obj.ad_info || obj.is_ads === true || obj.raw_ad_data) return true;
  }
  if (obj.extra && (obj.extra.is_ads === 1 || obj.extra.ad_label === 1)) return true;
  return false;
}

function cleanArray(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr
    .map(item => {
      if (Array.isArray(item)) return cleanArray(item);
      if (item && typeof item === "object") return cleanObject(item);
      return item;
    })
    .filter(item => !(item && typeof item === "object" && isAdLike(item)));
}

function cleanObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj.aweme_list)) obj.aweme_list = cleanArray(obj.aweme_list);
  if (Array.isArray(obj.cell_list)) obj.cell_list = cleanArray(obj.cell_list);
  if (Array.isArray(obj.items)) obj.items = cleanArray(obj.items);
  if (Array.isArray(obj.data)) obj.data = cleanArray(obj.data);
  if (Array.isArray(obj.banner_list)) obj.banner_list = cleanArray(obj.banner_list);
  if (Array.isArray(obj.preload_ads)) obj.preload_ads = [];
  if (Array.isArray(obj.ads)) obj.ads = [];
  if (Array.isArray(obj.ad_list)) obj.ad_list = [];
  if (obj.ad_info) delete obj.ad_info;
  if (obj.raw_ad_data) delete obj.raw_ad_data;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (Array.isArray(v)) obj[k] = cleanArray(v);
    else if (v && typeof v === "object") obj[k] = cleanObject(v);
  }
  return obj;
}

(function main() {
  try {
    let body = $response.body;
    if (!body) return $done({});
    let data;
    try { data = JSON.parse(body); } catch (e) { return $done({ body }); }
    const cleaned = cleanObject(data);
    return $done({ body: JSON.stringify(cleaned) });
  } catch (err) {
    console.log("dy-feed-clean error: " + String(err));
    return $done({});
  }
})();
