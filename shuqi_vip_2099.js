/**
 * shuqi_vip_2099.js
 * Quantumult X script-response-body
 * 目标：让书旗显示 VIP 有效，过期时间伪装到 2099-12-31；并把 needPay/needVip 置为 false
 * 注意：仅改前端展示所需字段，服务端仍可能在关键购买接口做校验
 */
(function () {
  try {
    if (!$response || !$response.body) return $done({});
    const ct = ($response.headers?.["Content-Type"] || $response.headers?.["content-type"] || "");
    if (ct && !/json/i.test(ct)) return $done({}); // 非 JSON 不处理

    const EXP_SEC = 4102416000;        // 2099-12-31 00:00:00 UTC in seconds (approx)
    const EXP_MS  = EXP_SEC * 1000;    // ms
    const EXP_STR = "2099-12-31 23:59:59";

    function setVipFlags(o) {
      // 通用布尔位
      const boolKeys = [
        "isVip","vip","svip","is_vip","vip_flag","vipStatus","vip_status","vip_enable",
        "vip_open","vipActive","vip_active","has_vip","user_vip","is_member","member","isSvip"
      ];
      for (const k of boolKeys) if (k in o) o[k] = true;

      // 解锁相关
      const unlockKeys = ["needPay","need_pay","needVip","need_vip","limit","limited","locked","is_locked","isPaid","paid"];
      for (const k of unlockKeys) if (k in o) o[k] = false;

      // 过期时间（多字段兼容，字符串/秒/毫秒）
      const expKeys = [
        "vipExpireTime","vip_expire_time","expire_time","expireTime","svip_expire_time",
        "memberExpireTime","member_expire_time","vip_deadline","vipDeadline","vip_end_time"
      ];
      for (const k of expKeys) {
        if (k in o) {
          if (typeof o[k] === "string") o[k] = EXP_STR;
          else if (typeof o[k] === "number") {
            // 猜测单位：小于 10^11 认为是秒，否则是毫秒
            o[k] = Math.abs(o[k]) < 1e11 ? EXP_SEC : EXP_MS;
          } else {
            o[k] = EXP_MS;
          }
        }
      }

      // 等级/类型
      const typKeys = ["vipLevel","vip_level","vipType","vip_type","member_type","memberLevel"];
      for (const k of typKeys) if (k in o) o[k] = 1;

      // 引导/弹窗/角标
      const offKeys = ["showVipGuide","show_vip_guide","vip_guide","vipGuide","vip_banner","vipBanner","vipToast","show_ad","ad_count"];
      for (const k of offKeys) if (k in o) o[k] = 0;

      return o;
    }

    function scrub(obj) {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) {
        return obj.map(scrub);
      }
      // 一级字段
      setVipFlags(obj);

      // 常见容器字段里也改
      const fields = [
        "data","result","user","userInfo","user_info","profile","member","vipInfo","vip_info",
        "benefit","benefits","payload","content","ext","extra","config","configs","summary"
      ];
      for (const f of fields) if (obj[f] && typeof obj[f] === "object") obj[f] = scrub(obj[f]);

      // 列表里逐项改
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (Array.isArray(v)) obj[k] = v.map(it => scrub(it));
        else if (v && typeof v === "object") obj[k] = scrub(v);
      }
      return obj;
    }

    let j = JSON.parse($response.body);
    j = scrub(j);
    $done({ body: JSON.stringify(j) });
  } catch (e) {
    $done({});
  }
})();
