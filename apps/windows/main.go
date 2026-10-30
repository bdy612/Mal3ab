//go:build windows

// Mal3ab for Windows: the Mal3ab website in its own window (Microsoft Edge WebView2),
// with logins and saves kept in %APPDATA%\Mal3ab. One file, nothing to install.
// The page can ask for an update: the new Mal3ab.exe is downloaded, swapped in and started by itself.
package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"

	webview2 "github.com/jchv/go-webview2"
	"golang.org/x/sys/windows"
)

const home = "https://bdy612.github.io/Mal3ab/play.html"

// the version of this app; the website compares it with the latest release in the database
const version = "1.0"

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

var updating sync.Mutex

// download the new exe next to this one, swap the files and start the new version
func update(w webview2.WebView, url string) {
	if !updating.TryLock() {
		return
	}
	defer updating.Unlock()
	say := func(js string) { w.Dispatch(func() { w.Eval(js) }) }
	fail := func(err error) {
		say(fmt.Sprintf("window.Mal3abVersion && Mal3abVersion.updateFailed(%q)", err.Error()))
	}
	exe, err := os.Executable()
	if err != nil {
		fail(err)
		return
	}
	resp, err := (&http.Client{Timeout: 10 * time.Minute}).Get(url)
	if err != nil {
		fail(err)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		fail(fmt.Errorf("download failed (%d)", resp.StatusCode))
		return
	}
	total := resp.ContentLength
	var buf bytes.Buffer
	chunk := make([]byte, 64*1024)
	last := time.Now()
	for {
		n, rerr := resp.Body.Read(chunk)
		buf.Write(chunk[:n])
		if total > 0 && time.Since(last) > 250*time.Millisecond {
			last = time.Now()
			say(fmt.Sprintf("window.Mal3abVersion && Mal3abVersion.progress(%d)", int64(buf.Len())*100/total))
		}
		if rerr == io.EOF {
			break
		}
		if rerr != nil {
			fail(rerr)
			return
		}
	}
	data := buf.Bytes()
	if len(data) < 1<<20 || !bytes.HasPrefix(data, []byte("MZ")) {
		fail(fmt.Errorf("the downloaded file is not a Windows program"))
		return
	}
	say("window.Mal3abVersion && Mal3abVersion.progress(100)")
	next, old := exe+".new", exe+".old"
	if err := os.WriteFile(next, data, 0o755); err != nil {
		fail(err)
		return
	}
	_ = os.Remove(old)
	if err := os.Rename(exe, old); err != nil { // a running exe can be renamed, not overwritten
		_ = os.Remove(next)
		fail(err)
		return
	}
	if err := os.Rename(next, exe); err != nil {
		_ = os.Rename(old, exe)
		fail(err)
		return
	}
	if err := exec.Command(exe).Start(); err != nil {
		fail(err)
		return
	}
	w.Dispatch(func() { w.Terminate() })
}

// leftovers of the previous version (it may still be closing for a moment)
func cleanOld() {
	exe, err := os.Executable()
	if err != nil {
		return
	}
	for i := 0; i < 20; i++ {
		_ = os.Remove(exe + ".new")
		if err := os.Remove(exe + ".old"); err == nil || os.IsNotExist(err) {
			return
		}
		time.Sleep(time.Second)
	}
}

func main() {
	dir := filepath.Join(os.Getenv("APPDATA"), "Mal3ab")
	_ = os.MkdirAll(dir, 0o755)
	go cleanOld()

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

	// tell the website which app this is, and let it start an update
	w.Init("window.MAL3AB_APP={platform:'windows',version:'" + version + "'};")
	_ = w.Bind("mal3abUpdate", func(url string) string {
		if !strings.HasPrefix(url, "https://asycvzvkvukjamwrekwi.supabase.co/storage/") && !strings.HasPrefix(url, "https://bdy612.github.io/") {
			return "bad url"
		}
		go update(w, url)
		return "started"
	})

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
