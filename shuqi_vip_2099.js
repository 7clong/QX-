/**
 * shuqi_vip_2099.js
 * 说明：只做“去广告字段清理”和“上报开关关闭”，不改动任何会员/付费/鉴权相关字段。
 * 兼容 Quantumult X script-response-body。
 */

(function () {
  try {
    if (!$response || !$response.body) return $done({});
    const ct = ($response.headers?.["Content-Type"] || $response.headers?.["content-type"] || "");
    if (ct && !/json|javascript/i.test(ct)) return $done({}); // 只处理 JSON

    let data = JSON.parse($response.body);

    // 需要清理或置空的键名模式（大小写不敏感）
    const KEY_PATTERNS = [
      /^(ad|ads|advert|adverts?|ad_list|adConfig|ad_config|adInfo|ad_info)$/i,
      /^(banner|banners|splash|startup_?ad|launch_?ad|open_?screen)$/i,
      /^(exposure|click(_?ad)?|report(_?ad)?|track(ing)?|bi(_?log)?|log_server)$/i,
      /^(commercials?|operations?|operation_list)$/i
    ];

    // 值为数组时，常见广告位字段名
    const ARRAY_KEYS = [
      "ads","ad","adList","ad_list","adItems","ad_items",
      "banner","banners","modules","operations","operation_list",
      "splash","startup_ad","launch_ad","open_screen"
    ];

    // 某些布尔/开关类配置，统一关闭上报或广告开关
    const BOOL_KEYS_TO_FALSE = [
      "enableAd","enable_ad","adEnabled","ad_enabled",
      "enableTrack","enable_track","enableReport","enable_report",
      "enableExposure","enable_exposure"
    ];

    // 递归清理器：删除或置空广告相关字段，同时不触碰会员/付费/鉴权
    function clean(obj) {
      if (!obj || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        // 数组：过滤掉疑似广告的元素
        // 常见结构：[{type:"ad"},{ad:...},{module:"banner"}]
        const filtered = obj
          .map(item => clean(item))
          .filter(item => !looksLikeAdItem(item));
        return filtered;
      }

      for (const k of Object.keys(obj)) {
        const v = obj[k];

        // 如果键名本身像广告字段，直接删除或置空
        if (KEY_PATTERNS.some(p => p.test(k))) {
          // 保守处理：统一清成“空容器”，避免客户端解析异常
          obj[k] = Array.isArray(v) ? [] : (typeof v === "object" ? {} : null);
          continue;
        }

        // 一些数组键里混有广告条目，做细粒度过滤
        if (ARRAY_KEYS.includes(k) && Array.isArray(v)) {
          obj[k] = v.map(it => clean(it)).filter(it => !looksLikeAdItem(it));
          continue;
        }

        // 关闭一切与上报/曝光/广告相关的布尔开关
        if (BOOL_KEYS_TO_FALSE.includes(k) && typeof v === "boolean") {
          obj[k] = false;
          continue;
        }

        // 继续向下清理
        if (v && typeof v === "object") {
          obj[k] = clean(v);
        }
      }
      return obj;
    }

    // 粗略判断一个对象是否“像广告项”
    function looksLikeAdItem(x) {
      if (!x || typeof x !== "object") return false;
      const s = JSON.stringify(x).toLowerCase();

      // 命中关键词过多时，基本可以断定是广告
      const hits = [
        "ad", "advert", "banner", "splash", "track", "exposure",
        "report", "click", "deeplink", "landing", "monitor", "impression"
      ].reduce((n, w) => n + (s.includes(w) ? 1 : 0), 0);

      // 避免误杀：如果包含“vip/pay/purchase/subscription”等词，不动
      if (/\b(vip|svip|pay|purchase|order|subscribe|subscription|rights?)\b/i.test(s)) {
        return false;
      }
      return hits >= 2;
    }

    data = clean(data);
    $done({ body: JSON.stringify(data) });
  } catch (e) {
    // 静默失败，不干扰正常业务
    $done({});
  }
})();
