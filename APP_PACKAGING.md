# APP_PACKAGING.md — shipping a generated app as a real app (M051)

A generated app is not "a website you open in a tab". Since M051 every
app the engine generates carries the full packaging contract:

- `manifest.webmanifest` — name, short_name, `display: standalone`,
  theme/background colours, 192px + 512px icons;
- `sw.js` — a service worker (cache-first app shell, versioned cache,
  navigation fallback to the cached `index.html`), registered from
  `index.html` when served over http(s);
- an Android WebView shell in `pinterest-ui-engine/app-shell/` that
  wraps the same bundle into an installable APK.

There are two shipping routes. Both start the same way.

## 1. Generate the app

```bash
node pinterest-ui-engine/engine/run.mjs cases/my-app
# → cases/my-app/app/  (index.html, styles.css, app.js, data.js,
#   sw.js, manifest.webmanifest, icon-192.png, icon-512.png, assets/)
```

## 2. Check it is app-ready

```bash
node pinterest-ui-engine/engine/tools/app_readiness.mjs cases/my-app/app
```

One PASS/GAP line per item (manifest fields, icon files *and* their
real pixel sizes, sw.js present/registered/precaching the shell,
navigation fallback). Exit code 1 if anything is a GAP — fix the gap
before shipping; do not ship on a GAP.

## 3. Route A — installable web app (PWA)

1. Host the `app/` folder on any static host **over HTTPS** (service
   workers and install prompts require a secure context; `localhost`
   also counts).
2. Open the URL on the phone → the browser offers **Install / Add to
   Home screen** → the app launches standalone, full-screen, with its
   own icon, and works offline from the service-worker cache.
3. Notes:
   - On `file://` the app still runs, but there is no service worker
     and no install prompt — that route is for previewing only.
   - The cache name is versioned from the app's content; regenerating
     the app and redeploying invalidates the old shell automatically.

## 4. Route B — Android APK (WebView shell)

The shell is `pinterest-ui-engine/app-shell/`: a minimal Kotlin
project (AndroidX only, no other third-party dependencies) whose
`MainActivity` loads `file:///android_asset/app/index.html` in a
full-screen WebView with JavaScript and DOM storage enabled (DOM
storage is what lets the app's localStorage state persist).

```bash
# 1. Bundle the generated app into the shell
rm -rf pinterest-ui-engine/app-shell/app/src/main/assets/app
mkdir -p pinterest-ui-engine/app-shell/app/src/main/assets/app
cp -r cases/my-app/app/* pinterest-ui-engine/app-shell/app/src/main/assets/app/

# 2. Make it YOUR app (do this once per app, before shipping)
#    - app/build.gradle.kts: applicationId "com.generatedapp.shell"
#      → your own id (two shells with the same id cannot coexist)
#    - app/src/main/res/values/strings.xml: app_name → your brand
#    - launcher icon: the shell ships without a custom icon, so the
#      APK shows the platform default. To brand it, drop a 512x512 PNG
#      at app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (and the
#      other densities) or point android:icon in AndroidManifest.xml
#      at your own drawable — the generated icon-512.png is a valid
#      starting image.

# 3. Point Gradle at an Android SDK
cp pinterest-ui-engine/app-shell/local.properties.example \
   pinterest-ui-engine/app-shell/local.properties
#    edit sdk.dir to your SDK location

# 4. Build (Gradle 8.7+, JDK 17, SDK 34)
cd pinterest-ui-engine/app-shell
gradle assembleDebug        # or: gradle assembleRelease with your keystore
# → app/build/outputs/apk/debug/app-debug.apk
```

Install with `adb install app-debug.apk`, or copy the APK to the
phone and open it (debug APKs are signed with the debug key; a release
for distribution needs your own signing keystore — standard Android
practice, not engine-specific).

**Verified toolchain in this sandbox** (used for the M051 smoke build):
JDK 17 at `~/workspace/android-tools/jdk17`, SDK 34 at
`~/workspace/android-tools/sdk`, Gradle 8.7 at
`~/workspace/android-tools/gradle-8.7`. Two environment quirks, both
inherited from the VibeVote APK build:

- the Gradle daemon needs IPv4 loopback:
  `GRADLE_OPTS="-Djava.net.preferIPv4Stack=true"`;
- the sandbox egress proxy breaks Java HTTP clients, so Gradle must
  run `--offline` against the mirrored dependency repo at
  `~/workspace/vibevote-android/local-repo/` (point the repositories
  in `settings.gradle.kts` at it, as the M051 smoke build did). On a
  normal machine with network access the shipped
  `settings.gradle.kts` (google()/mavenCentral()) works as-is.

Verify any built APK with:
`~/workspace/android-tools/sdk/build-tools/34.0.0/aapt dump badging app-debug.apk`

**Smoke-build result (M051, this sandbox):** the shell + the Fern &
Co example app built successfully — `BUILD SUCCESSFUL`, debug APK
3,000,717 bytes, package `com.generatedapp.shell`, minSdk 26 /
targetSdk 34, apksigner-verified, with the complete generated bundle
under `assets/app/`. One gotcha the build exposed: activity-ktx's POM
floats lifecycle versions, so `app/build.gradle.kts` pins lifecycle
to 2.8.4 with constraints — keep them. The APK was not run on a
device/emulator (none available in the sandbox).

## 5. Honest notes

- Inside the APK, the service worker does **not** run (WebView loads
  `file://` URLs, and the generated `index.html` only registers
  `sw.js` on http/https). That is fine: the whole app is inside the
  APK, so it is offline by construction. The worker is for Route A.
- The shell has no native screens: accounts, payments, push and sync
  remain services an integrator supplies, exactly as INTEGRATION.md §6
  states for the web route. The shell changes the *packaging*, not the
  app's capabilities.
- Handover language: say "your app", not "your website". The output
  of this engine is a mobile app; the web route is one way to install
  it, the APK is the other.
