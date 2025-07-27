package com.bestrong.app;

import android.webkit.WebView;
import android.webkit.WebSettings;
import android.content.Context;
import android.util.Log;

public class WebViewHelper {
    private static final String TAG = "WebViewHelper";
    
    public static void configureWebView(WebView webView, Context context) {
        WebSettings settings = webView.getSettings();
        
        // Configuration de base
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Configuration d'affichage
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        
        // Configuration de cache
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Configuration de sécurité
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Configuration média
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // Configuration réseau
        settings.setAppCacheEnabled(true);
        settings.setAppCachePath(context.getCacheDir().getAbsolutePath());
        
        Log.d(TAG, "WebView configured successfully");
    }
}