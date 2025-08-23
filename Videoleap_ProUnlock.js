// Videoleap Pro Unlock · Lightricks
// 核心思路：仅改关键订阅字段，保持原结构最大兼容

(function () {
  try {
    const raw = $response.body || "{}";
    let obj;
    try { obj = JSON.parse(raw); } catch { obj = {}; }

    // 兜底空对象
    if (!obj || typeof obj !== "object") obj = {};

    // 未来很久的时间戳（毫秒）
    const FAR_FUTURE_MS = 4102415999000; // 2099-12-31 23:59:59 UTC
    const fallbackPid = "com.lightricks.EnlightVideo_V2.PA.1Y.SA_1Y.SA_TRIAL.1";
    const pid = obj.latestProductId || fallbackPid;

    // 关键状态位
    obj.isExpired = false;
    obj.latestExpirationDateMs = FAR_FUTURE_MS;

    // 兼容不同版本字段
    if (!obj.expiration && !obj.expires_at && !obj.expiryTimestampMs) {
      obj.expiryTimestampMs = FAR_FUTURE_MS;
    }

    // pendingRenewalInfo 常见读点
    obj.pendingRenewalInfo = Object.assign({
      expirationIntent: null,
      isAutoRenewEnabled: true,
      isInBillingRetryPeriod: false,
      nextProductId: pid
    }, obj.pendingRenewalInfo || {});
    obj.pendingRenewalInfo.expirationIntent = null;
    obj.pendingRenewalInfo.isAutoRenewEnabled = true;
    obj.pendingRenewalInfo.isInBillingRetryPeriod = false;
    obj.pendingRenewalInfo.nextProductId = pid;

    // 交易字段兜底
    if (!obj.latestTransactionId && obj.originalTransactionId) {
      obj.latestTransactionId = obj.originalTransactionId;
    }
    if (!obj.latestPurchaseDateMs && obj.originalPurchaseDateMs) {
      obj.latestPurchaseDateMs = obj.originalPurchaseDateMs;
    }
    if (obj.fullRefundDateMs !== null) {
      obj.fullRefundDateMs = null;
    }
    if (!obj.latestProductId) obj.latestProductId = pid;

    $done({ body: JSON.stringify(obj) });
  } catch (e) {
    console.log("Videoleap Unlock error:", String(e));
    // 失败时仍把原始响应透传，避免功能受影响
    $done({});
  }
})();
