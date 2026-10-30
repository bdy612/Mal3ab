//go:build windows

// Mal3ab for Windows: the Mal3ab website in its own window (Microsoft Edge WebView2),
// with logins and saves kept in %APPDATA%\Mal3ab. One file, nothing to install.
package main

import (
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	webview2 "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

const home = "https://bdy612.github.io/Mal3ab/play.html"

const offline = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#0f1220;color:#eef0ff;font-family:'Segoe UI',Tahoma,sans-serif;text-align:center}
b{color:#ffb703;font-size:56px}button{background:#ffb703;border:0;border-radius:12px;padding:12px 24px;font-size:18px;font-weight:700;cursor:pointer}</style></head>
<body><b>ملعب</b><div>مفيش إنترنت — ملعب محتاج نت عشان الحسابات واللعب مع أصحابك.</div><div>No internet connection — Mal3ab needs the internet for accounts and online play.</div>
<button onclick="location.href='` + home + `'">↻ حاول تاني / Try again</button></body></html>`

func online() bool {
	c := http.Client{Timeout: 7 * time.Second}
	r, err := c.Head(home)
	if err != nil {
		return false
	}
	r.Body.Close()
	return r.StatusCode < 500
}

func main() {
	dir := filepath.Join(os.Getenv("APPDATA"), "Mal3ab")
	_ = os.MkdirAll(dir, 0o755)

	w := webview2.NewWithOptions(webview2.WebViewOptions{
		AutoFocus: true,
		DataPath:  dir,
		WindowOptions: webview2.WindowOptions{
			Title:  "Mal3ab — ملعب",
			Width:  1280,
			Height: 820,
			IconId: 1,
			Center: true,
		},
	})
	if w == nil {
		// very old Windows without the WebView2 runtime: open the site in the browser instead
		_, _ = windows.MessageBox(0,
			windows.StringToUTF16Ptr("Mal3ab needs Microsoft Edge WebView2, which is missing on this PC.\nThe games will open in your browser now.\n\nملعب محتاج Microsoft Edge WebView2 ومش موجود على الجهاز ده، فهيفتح في المتصفح."),
			windows.StringToUTF16Ptr("Mal3ab"), windows.MB_ICONINFORMATION)
		_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", home).Start()
		return
	}
	defer w.Destroy()

	// start maximised: the games like a big window
	user32 := windows.NewLazySystemDLL("user32.dll")
	user32.NewProc("ShowWindow").Call(uintptr(w.Window()), 3)

	if online() {
		w.Navigate(home)
	} else {
		w.SetHtml(offline)
	}
	w.Run()
}
