package com.mal3ab.app;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Environment;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.content.pm.PackageManager;
import java.util.ArrayList;
import android.widget.Toast;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// Mal3ab for Android: the website, full screen, with saved logins and picture uploads.
// The page can ask for an update: the new APK is downloaded and the installer opens by itself.
public class MainActivity extends Activity {
    static final String VERSION = "1.1";
    static final String HOME = "https://bdy612.github.io/Mal3ab/play.html";
    static final String OFFLINE = "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
        + "<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0f1220;color:#eef0ff;font-family:sans-serif;text-align:center;padding:20px}"
        + "b{color:#ffb703;font-size:44px}button{background:#ffb703;border:0;border-radius:12px;padding:12px 22px;font-size:17px;font-weight:700}</style></head>"
        + "<body><b>ملعب</b><div>مفيش إنترنت — ملعب محتاج نت عشان الحسابات واللعب مع أصحابك.</div><div>No internet connection — Mal3ab needs the internet for accounts and online play.</div>"
        + "<button onclick=\"location.href='" + HOME + "'\">↻ حاول تاني / Try again</button></body></html>";
    static final int PICK_FILE = 7, MEDIA_PERMS = 8;
    PermissionRequest pendingMedia;   // a page asked for the camera/mic while we ask Android for them
    WebView web;
    ValueCallback<Uri[]> fileCallback;
    long downloadId = -1;
    DoneReceiver done;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0f1220"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " Mal3abApp/" + VERSION);
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome(this));
        web.addJavascriptInterface(new Bridge(this), "Mal3abNative");

        done = new DoneReceiver(this);
        IntentFilter f = new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);
        if (Build.VERSION.SDK_INT >= 33) registerReceiver(done, f, Context.RECEIVER_EXPORTED); else registerReceiver(done, f);

        if (saved != null) web.restoreState(saved);
        else web.loadUrl(urlFrom(getIntent()));
        immersive();
    }

    String urlFrom(Intent i) {
        Uri d = i == null ? null : i.getData();
        if (d != null && d.getHost() != null && d.getHost().endsWith("bdy612.github.io")) return d.toString();
        return HOME;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if (i != null && i.getData() != null) web.loadUrl(urlFrom(i));
    }

    void immersive() {
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
    }

    @Override
    public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if (focus) immersive(); }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == PICK_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCallback = null;
        } else super.onActivityResult(req, res, data);
    }

    // calls: the page asks for the camera / microphone -> make sure Android allowed them, then let the page have them
    void mediaRequest(PermissionRequest req) {
        Uri o = req.getOrigin();
        if (o == null || o.getHost() == null || !o.getHost().endsWith("bdy612.github.io")) { req.deny(); return; }
        ArrayList<String> need = new ArrayList<>();
        for (String r : req.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r) && !has(android.Manifest.permission.CAMERA)) need.add(android.Manifest.permission.CAMERA);
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r) && !has(android.Manifest.permission.RECORD_AUDIO)) need.add(android.Manifest.permission.RECORD_AUDIO);
        }
        if (need.isEmpty() || Build.VERSION.SDK_INT < 23) { grantAllowed(req); return; }
        if (pendingMedia != null) pendingMedia.deny();
        pendingMedia = req;
        requestPermissions(need.toArray(new String[0]), MEDIA_PERMS);
    }
    boolean has(String perm) { return Build.VERSION.SDK_INT < 23 || checkSelfPermission(perm) == PackageManager.PERMISSION_GRANTED; }
    void grantAllowed(PermissionRequest req) {
        ArrayList<String> ok = new ArrayList<>();
        for (String r : req.getResources()) {
            if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(r) && has(android.Manifest.permission.CAMERA)) ok.add(r);
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r) && has(android.Manifest.permission.RECORD_AUDIO)) ok.add(r);
        }
        if (ok.isEmpty()) req.deny(); else req.grant(ok.toArray(new String[0]));
    }
    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code == MEDIA_PERMS && pendingMedia != null) { PermissionRequest r = pendingMedia; pendingMedia = null; grantAllowed(r); }
    }

    @Override
    protected void onDestroy() { try { unregisterReceiver(done); } catch (Exception e) { } super.onDestroy(); }

    // download the new APK with the system download manager (progress shows in the notifications)
    void startUpdate(String url) {
        try {
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
            r.setTitle("Mal3ab");
            r.setDescription("Update / تحديث");
            r.setMimeType("application/vnd.android.package-archive");
            r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            r.setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "Mal3ab-update-" + System.currentTimeMillis() + ".apk");
            downloadId = dm.enqueue(r);
            Toast.makeText(this, "⬇ Mal3ab…", Toast.LENGTH_SHORT).show();
        } catch (Exception e) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e2) { }
        }
    }

    // the download finished: open the installer on it
    void downloaded(long id) {
        if (id != downloadId) return;
        try {
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            Uri apk = dm.getUriForDownloadedFile(id);
            if (apk == null) { Toast.makeText(this, "Update failed / التحديث ما نجحش", Toast.LENGTH_LONG).show(); return; }
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(apk, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) { Toast.makeText(this, "Update failed / التحديث ما نجحش", Toast.LENGTH_LONG).show(); }
    }

    static class DoneReceiver extends BroadcastReceiver {
        final MainActivity a;
        DoneReceiver(MainActivity activity) { a = activity; }
        @Override
        public void onReceive(Context c, Intent i) { a.downloaded(i.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)); }
    }

    static class MediaTask implements Runnable {
        final MainActivity a; final PermissionRequest req;
        MediaTask(MainActivity activity, PermissionRequest r) { a = activity; req = r; }
        public void run() { a.mediaRequest(req); }
    }

    static class UpdateTask implements Runnable {
        final MainActivity a; final String url;
        UpdateTask(MainActivity activity, String u) { a = activity; url = u; }
        public void run() { a.startUpdate(url); }
    }

    // what the page can call: Mal3abNative.version() and Mal3abNative.update(url)
    static class Bridge {
        final MainActivity a;
        Bridge(MainActivity activity) { a = activity; }
        @JavascriptInterface
        public String version() { return VERSION; }
        @JavascriptInterface
        public void update(String url) {
            if (url == null || !(url.startsWith("https://asycvzvkvukjamwrekwi.supabase.co/storage/") || url.startsWith("https://bdy612.github.io/"))) return;   // only our own downloads
            a.runOnUiThread(new UpdateTask(a, url));
        }
    }

    @Override
    public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }

    @Override
    protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); CookieManager.getInstance().flush(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    // links to the Mal3ab site stay inside the app; anything else opens in the browser
    static class Client extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            Uri u = r.getUrl();
            String host = u.getHost();
            if (host != null && host.endsWith("bdy612.github.io")) return false;
            String scheme = u.getScheme();
            if ("http".equals(scheme) || "https".equals(scheme) || "mailto".equals(scheme) || "intent".equals(scheme)) {
                try { v.getContext().startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
            return false;
        }
        @Override
        public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
            if (r.isForMainFrame()) v.loadDataWithBaseURL(null, OFFLINE, "text/html", "utf-8", null);
        }
    }

    // the "change picture" button on the account page opens the phone's picker
    static class Chrome extends WebChromeClient {
        final MainActivity a;
        Chrome(MainActivity activity) { a = activity; }
        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
            if (a.fileCallback != null) a.fileCallback.onReceiveValue(null);
            a.fileCallback = cb;
            try { a.startActivityForResult(params.createIntent(), PICK_FILE); }
            catch (Exception e) { a.fileCallback = null; return false; }
            return true;
        }
        @Override
        public void onPermissionRequest(PermissionRequest req) { a.runOnUiThread(new MediaTask(a, req)); }
        @Override
        public void onPermissionRequestCanceled(PermissionRequest req) { if (a.pendingMedia == req) a.pendingMedia = null; }
    }
}
