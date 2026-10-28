package com.generatedapp.shell

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

/**
 * M051 app shell: a single full-screen WebView over the generated app
 * bundled in assets/app/. The generated app is a self-contained
 * HTML/CSS/JS bundle (index.html + styles.css + app.js + data.js) whose
 * state lives in localStorage — DOM storage below is what makes that
 * persistence survive process death inside the shell.
 *
 * Service workers do not run on file:// URLs, so inside this shell the
 * app simply works without its offline worker (the generated index.html
 * only registers sw.js on http/https). Everything is already on-device
 * in the APK, which is the offline story here.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            // The bundle is local files referencing sibling local files
            // (styles, scripts, photos in assets/app/assets/).
            allowFileAccess = true
            loadWithOverviewMode = false
            useWideViewPort = false
        }
        // Keep in-app navigation inside the shell instead of bouncing
        // out to a browser.
        webView.webViewClient = WebViewClient()
        setContentView(webView)
        webView.loadUrl("file:///android_asset/app/index.html")

        // Back walks the WebView history (the app is hash-routed, so its
        // views are history entries) before leaving the app.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    override fun onDestroy() {
        if (::webView.isInitialized) webView.destroy()
        super.onDestroy()
    }
}
