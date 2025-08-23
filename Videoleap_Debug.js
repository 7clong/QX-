// Videoleap Debug Script
// 仅打印请求/响应内容，便于抓包分析

if ($request) {
  console.log("=== [Videoleap Debug] Request ===");
  console.log("URL:", $request.url);
  if ($request.headers) {
    try { console.log("Headers:", JSON.stringify($request.headers)); } catch (e) {}
  }
  if ($request.body) {
    console.log("Body:", $request.body);
  }
  $done({});
} else if ($response) {
  console.log("=== [Videoleap Debug] Response ===");
  console.log("URL:", $request && $request.url ? $request.url : "");
  if ($response.headers) {
    try { console.log("Headers:", JSON.stringify($response.headers)); } catch (e) {}
  }
  console.log("Body:", $response.body);
  $done({});
}
