// Textastic Pro 解锁脚本
// 原理：伪造 verifyReceipt / subscription 接口返回“已购”信息
// QuantumultX [rewrite_remote] 调用

let obj = JSON.parse($response.body || "{}");

// 伪造订阅有效信息
obj = {
  "status": 0,
  "receipt": {
    "bundle_id": "com.textasticapp.editor",
    "in_app": [{
      "product_id": "com.textasticapp.pro",
      "expires_date": "2099-12-31 23:59:59 Etc/GMT",
      "purchase_date": "2025-01-01 00:00:00 Etc/GMT"
    }]
  },
  "latest_receipt_info": [{
    "product_id": "com.textasticapp.pro",
    "expires_date": "2099-12-31 23:59:59 Etc/GMT",
    "purchase_date": "2025-01-01 00:00:00 Etc/GMT"
  }],
  "environment": "Production"
};

$done({ body: JSON.stringify(obj) });
