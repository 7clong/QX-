/**
 * shuqi_vip_unlock.js
 * Quantumult X: script-response-body
 * 书旗小说 VIP 解锁与广告字段清理（温和修改字段，不破坏正文）
 */
(function () {
  try {
    if (!$response || !$response.body) return $done({});
    const headers = $response.headers || {};
    const ct = headers["Content-Type"] || headers["content-type"] || "";
    if (ct && !/json/i.test(ct)) return $done({}); // 非 JSON 不处理

    let data = JSON.parse($response.body);
    const now = Math.floor(Date.now()/1000);
    const far = 4102329600; // 2099-12-31 00:00:00

    function setVip(obj) {
      if (!obj || typeof obj !== "object") return;
      const vipFlags = ["vip","isVip","is_vip","vipFlag","vip_flag","vipStatus","vip_status","member","is_member","isMember","isSvip","svip"];
      const expireKeys = ["vipExpire","vip_expire","vipExpireTime","vip_expire_time","expire","expireTime","expire_time"];
      const levelKeys = ["vipLevel","vip_level","level"];
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (vipFlags.includes(k)) obj[k] = 1;
        if (expireKeys.includes(k)) obj[k] = far;
        if (levelKeys.includes(k) && typeof obj[k] === "number") obj[k] = 5;
        if (k === "privilege" || k === "privileges") obj[k] = Array.isArray(v) ? v.map(()=>true) : (v && typeof v === "object" ? {} : v);
        if (v && typeof v === "object") setVip(v);
      }
    }

    function cleanAds(obj) {
      if (!obj || typeof obj !== "object") return obj;
      const adKeys = new Set([
        "ad","ads","adList","ad_list","ad_info","advert","advertisement","promotion","promotions",
        "banner","bannerList","popup","popups","interstitial","insert","splash","open_ad",
        "reward","rewardAd","rewarded","preloadAd","preload","adSlot","adslot","ad_slot",
        "track","trackInfo","trace","trace_id","adid","ad_id","adConfig","ad_config",
        "toast_ad","vip_popup","vip_toast","vipGuide","vip_guide"
      ]);
      if (Array.isArray(obj)) {
        return obj.filter(it => {
          if (!it || typeof it !== "object") return true;
          for (const k of Object.keys(it)) if (adKeys.has(k)) return false;
          return true;
        }).map(cleanAds);
      }
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (adKeys.has(k)) {
          if (Array.isArray(v)) obj[k] = [];
          else if (v && typeof v === "object") obj[k] = {};
          else obj[k] = null;
          continue;
        }
        if (v && typeof v === "object") obj[k] = cleanAds(v);
      }
      // 常见开关
      if ("hasAd" in obj) obj.hasAd = false;
      if ("show_ad" in obj) obj.show_ad = 0;
      if ("ad_count" in obj) obj.ad_count = 0;
      return obj;
    }

    function unlockChapter(obj) {
      if (!obj || typeof obj !== "object") return;
      const payFlags = ["isPaid","paid","is_paid","needPay","need_pay","pay","payStatus","pay_status",
                        "chapterFree","isFree","is_free","limitedFree","limited_free"];
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (payFlags.includes(k)) obj[k] = 0;
        if (k === "price" || k === "price_num" || k === "coin" || k === "needCoin") obj[k] = 0;
        if (k === "auth" || k === "authStatus" || k === "vipRead" || k === "vip_read") obj[k] = 1;
        if (v && typeof v === "object") unlockChapter(v);
      }
    }

    setVip(data);
    unlockChapter(data);
    data = cleanAds(data);

    // 补充：服务端时间校正字段
    if (data && typeof data === "object") {
      data.server_time = now;
      if ("now" in data) data.now = now;
    }

    $done({ body: JSON.stringify(data) });
  } catch (e) {
    $done({});
  }
})();