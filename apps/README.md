# Mal3ab apps

Both apps open the live site (https://bdy612.github.io/Mal3ab/play.html), so every website update reaches them without a new download. The built files live in `../downloads/`.

## Android (`android/`, → `downloads/Mal3ab.apk`)
Plain Java WebView app (no Gradle): full screen, keeps logins (localStorage / cookies), picture upload for the account page, back button = browser back, links to bdy612.github.io/Mal3ab open in the app, a friendly offline page.
Build with Android SDK build-tools 34 + platform 34 and JDK:
```
aapt2 compile --dir res -o res.zip
aapt2 link -o base.apk -I android.jar --manifest AndroidManifest.xml --java gen --min-sdk-version 24 --target-sdk-version 34 res.zip
javac -source 8 -target 8 -classpath android.jar -d obj src/**/*.java gen/**/*.java
d8 --lib android.jar --min-api 24 --release --output dex obj/**/*.class
zip base.apk dex/classes.dex && zipalign -p -f 4 base.apk aligned.apk && apksigner sign --ks mal3ab-release.jks --out Mal3ab.apk aligned.apk
```
Keep using the same signing key (kept outside the repo, in `Made Games\Mal3ab-keys` on the PC) so new versions install over old ones. Bump `versionCode` in the manifest for each release.
Note: avoid anonymous inner classes — the d8 in build-tools 34 crashes on JDK 21 class files that have them.

## Windows (`windows/`, → `downloads/Mal3ab.exe`)
Go + github.com/jchv/go-webview2 (uses the Edge WebView2 runtime built into Windows 10/11). Data in `%APPDATA%\Mal3ab`. Icon, version info and a per-monitor-DPI manifest come from `winres/winres.json`.
```
go install github.com/tc-hib/go-winres@v0.3.3 && go-winres make --arch amd64
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-H windowsgui -s -w" -o Mal3ab.exe .
```
