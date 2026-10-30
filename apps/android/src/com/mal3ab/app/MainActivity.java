package com.mal3ab.app;

import android.app.Activity;
import android.content.Intent;
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
public class MainActivity extends Activity {
    static final String HOME = "https://bdy612.github.io/Mal3ab/play.html";
    static final String OFFLINE = "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
        + "<style>body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0f1220;color:#eef0ff;font-family:sans-serif;text-align:center;padding:20px}"
        + "b{color:#ffb703;font-size:44px}button{background:#ffb703;border:0;border-radius:12px;padding:12px 22px;font-size:17px;font-weight:700}</style></head>"
        + "<body><b>ملعب</b><div>مفيش إنترنت — ملعب محتاج نت عشان الحسابات واللعب مع أصحابك.</div><div>No internet connection — Mal3ab needs the internet for accounts and online play.</div>"
        + "<button onclick=\"location.href='" + HOME + "'\">↻ حاول تاني / Try again</button></body></html>";
    static final int PICK_FILE = 7;
    WebView web;
    ValueCallback<Uri[]> fileCallback;

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
        s.setUserAgentString(s.getUserAgentString() + " Mal3abApp/1.0");
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome(this));

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
    }
}
