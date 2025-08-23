/*
 QX_TextasticPro.js
 解锁 Textastic Pro 内购功能
 QuantumultX 脚本：拦截 IAP 验证接口并返回已购买信息
*/

let obj = {
  status: 0,
  environment: "Production",
  receipt: {
    receipt_type: "Production",
    bundle_id: "com.textasticapp.textastic",
    application_version: "123",
    in_app: [
      {
        quantity: "1",
        product_id: "com.textasticapp.textastic.pro",
        transaction_id: "100000000000000",
        original_transaction_id: "100000000000000",
        purchase_date: "2025-08-24 00:00:00 Etc/GMT",
        original_purchase_date: "2025-08-24 00:00:00 Etc/GMT",
        expires_date: "2099-12-31 23:59:59 Etc/GMT"
      }
    ]
  },
  latest_receipt_info: [
    {
      product_id: "com.textasticapp.textastic.pro",
      expires_date: "2099-12-31 23:59:59 Etc/GMT",
      purchase_date: "2025-08-24 00:00:00 Etc/GMT"
    }
  ]
};

$done({ body: JSON.stringify(obj) });
