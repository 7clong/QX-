/*
 * QX · AMap AdClean Plus
 * 目的：把高德“易触发前端校验”的接口改成合法的空响应，避免白屏/红字。
 * 用法：配合 QX_AMap_AdClean_Plus.conf，对应规则 requires-body=true。
 * 仅作学习研究，别拿去干违法的事。
 */

function safeJsonParse(body) {
  try { return body ? JSON.parse(body) : {}; } catch (e) { console.log("JSON parse error: " + e); return {}; }
}

// 根据不同接口，返回最小可用的“合法空结构”
function normalize(path, obj) {
  // 通用兜底
  if (typeof obj !== "object" || obj === null) obj = {};

  // 常见包装字段规范化
  // 有的接口需要 code=1 或 0，保险起见优先保留原值，其次置 1/0，不返回负数
  if (obj.code === undefined) obj.code = 1;
  if (obj.status === undefined) obj.status = 1;
  if (obj.message === undefined && obj.msg === undefined) obj.message = "OK";

  // 常见列表字段全部置空数组
  const arrKeys = [
    "data", "list", "cards", "modules", "ads", "banners", "items",
    "result", "resultList", "tips", "hotwords", "sections", "cells"
  ];
  arrKeys.forEach(k => { if (obj[k] === undefined || Array.isArray(obj[k])) obj[k] = []; });

  // 常见对象字段置空对象
  const objKeys = ["config", "map", "extra", "ext", "payload", "content"];
  objKeys.forEach(k => { if (obj[k] === undefined || typeof obj[k] === "object") obj[k] = {}; });

  // 针对具体接口做更细的归零，避免前端按字段名强匹配
  if (/faas\/amap-navigation\/card-service-plan/.test(path)) {
    obj.cards = [];
    obj.modules = [];
    obj.data = [];
  }

  if (/shield\/search\/new_hotword/.test(path)) {
    obj.hotwords = [];
    obj.data = [];
  }

  if (/shield\/search\/common\/coupon/.test(path)) {
    obj.coupons = [];
    obj.data = [];
  }

  if (/shield\/dsp\/profile/.test(path)) {
    obj.profile = {};
    obj.ads = [];
    obj.list = [];
  }

  if (/mps\/project\/(home|cards|recommend)/.test(path)) {
    obj.cards = [];
    obj.recommend = [];
    obj.sections = [];
  }

  return obj;
}

(function () {
  const url = $request.url || "";
  const path = url.replace(/^https?:\/\/[^/]+/i, "");
  const raw = $response.body || "";
  let obj = safeJsonParse(raw);

  const clean = normalize(path, obj);

  // 尽量保持 JSON 干净，不附带多余字段
  const body = JSON.stringify(clean);

  $done({ body });
})();
