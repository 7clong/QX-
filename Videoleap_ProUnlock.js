\
// Videoleap Pro Unlock
// 根据 /subscription 返回结构改写为有效订阅
// 仅改关键字段，尽量保持原始结构稳定

(function () {
  try {
    let body = $response.body || "{}";
    let obj = {};
    try { obj = JSON.parse(body); } catch (e) { obj = {}; }

    // 兜底：填充必要字段
    obj = obj && typeof obj === "object" ? obj : {};

    const FAR_FUTURE_MS = 4102415999000; // 2099-12-31 23:59:59 UTC
    const productId = obj.latestProductId || "com.lightricks.EnlightVideo_V2.PA.1Y.SA_1Y.SA_TRIAL.1";

    // 常见关键字段改写
    obj.isExpired = false;
    obj.latestExpirationDateMs = FAR_FUTURE_MS;

    // 有些版本会读取这两个字段，兼容处理
    if (!obj.expiration && !obj.expires_at && !obj.expiryTimestampMs) {
      obj.expiryTimestampMs = FAR_FUTURE_MS;
    }

    // 更新续订信息
    obj.pendingRenewalInfo = Object.assign({
      expirationIntent: null,
      isAutoRenewEnabled: true,
      isInBillingRetryPeriod: false,
      nextProductId: productId
    }, obj.pendingRenewalInfo || {});
    obj.pendingRenewalInfo.expirationIntent = null;
    obj.pendingRenewalInfo.isAutoRenewEnabled = true;
    obj.pendingRenewalInfo.isInBillingRetryPeriod = false;
    obj.pendingRenewalInfo.nextProductId = productId;

    // 保持交易字段一致性
    if (!obj.latestTransactionId && obj.originalTransactionId) {
      obj.latestTransactionId = obj.originalTransactionId;
    }
    if (!obj.latestPurchaseDateMs && obj.originalPurchaseDateMs) {
      obj.latestPurchaseDateMs = obj.originalPurchaseDateMs;
    }
    if (obj.fullRefundDateMs !== null) {
      obj.fullRefundDateMs = null;
    }

    // 可选：显式返回产品信息，防止空读崩溃
    if (!obj.latestProductId) {
      obj.latestProductId = productId;
    }

    $done({ body: JSON.stringify(obj) });
  } catch (err) {
    console.log("Videoleap Unlock error:", err);
    $done({});
  }
})();
