/**
 * Quantumult X script-response-body
 * 书旗小说：只清广告，不动正文；非 JSON 原样放行
 * 重点处理章节间插屏、开屏、预加载、banner/promotion 等
 */
(function () {
  function scrub(obj) {
    if (!obj || typeof obj !== "object") return obj;

    // 广告容器/字段黑名单
    const adKeys = new Set([
      "ad","ads","adList","ad_list","ad_info","adInfo","advert","advertList","advert_info",
      "advertisement","advertisement_info","promotion","promotions","marketing","market",
      "banner","bannerList","popup","popups","interstitial","insert","splash","open_ad",
      "reward","rewardAd","rewarded","preloadAd","preload","adSlot","adslot","ad_slot",
      "track","trackInfo","trace","trace_id","adid","ad_id","adConfig","ad_config"
    ]);

    const seen = new Set([obj]);
    const stack = [obj];

    while (stack.length) {
      const cur = stack.pop();
      for (const k of Object.keys(cur)) {
        const v = cur[k];

        // 命中典型广告容器 → 清空
        if (adKeys.has(k)) {
          if (Array.isArray(v)) cur[k] = [];
          else if (v && typeof v === "object") cur[k] = {};
          else cur[k] = null;
          continue;
        }

        // 列表中混入广告项：根据特征键过滤
        if (Array.isArray(v)) {
          cur[k] = v.filter(it => {
            if (!it || typeof it !== "object") return true;
            for (const kk of Object.keys(it)) {
              if (adKeys.has(kk)) return false;
            }
            // 若项中出现广告特征键名
            if ("ad" in it || "ad_id" in it || "trace_id" in it) return false;
            return true;
          });
          for (const it of cur[k]) if (it && typeof it === "object" && !seen.has(it)) {
            seen.add(it); stack.push(it);
          }
          continue;
        }

        // 深入对象
        if (v && typeof v === "object" && !seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }

    // 常见总开关
    if ("hasAd" in obj) obj.hasAd = false;
    if ("show_ad" in obj) obj.show_ad = 0;
    if ("showAd" in obj) obj.showAd = 0;
    if ("ad_count" in obj) obj.ad_count = 0;

    return obj;
  }

  try {
    if (!$response || !$response.body) return $done({});
    const h = $response.headers || {};
    const ct = h["Content-Type"] || h["content-type"] || "";
    if (ct && !/json/i.test(ct)) return $done({}); // 非 JSON 不处理

    let data = JSON.parse($response.body);
    data = scrub(data);
    $done({ body: JSON.stringify(data) });
  } catch (e) {
    // 出错不阻断
    $done({});
  }
})();
