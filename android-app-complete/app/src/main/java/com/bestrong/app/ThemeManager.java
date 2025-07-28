package com.bestrong.app;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Build;
import androidx.appcompat.app.AppCompatDelegate;

public class ThemeManager {
    
    private static final String PREF_NAME = "theme_prefs";
    private static final String KEY_THEME_MODE = "theme_mode";
    
    public static final int THEME_SYSTEM = 0;
    public static final int THEME_LIGHT = 1;
    public static final int THEME_DARK = 2;
    
    private SharedPreferences prefs;
    
    public ThemeManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }
    
    public void setThemeMode(int themeMode) {
        prefs.edit().putInt(KEY_THEME_MODE, themeMode).apply();
        applyTheme(themeMode);
    }
    
    public int getThemeMode() {
        return prefs.getInt(KEY_THEME_MODE, THEME_SYSTEM);
    }
    
    public void applyTheme(int themeMode) {
        switch (themeMode) {
            case THEME_LIGHT:
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
                break;
            case THEME_DARK:
                AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
                break;
            case THEME_SYSTEM:
            default:
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM);
                } else {
                    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_AUTO_BATTERY);
                }
                break;
        }
    }
    
    public void applyCurrentTheme() {
        applyTheme(getThemeMode());
    }
    
    public boolean isDarkMode(Context context) {
        int currentNightMode = context.getResources().getConfiguration().uiMode 
                & Configuration.UI_MODE_NIGHT_MASK;
        return currentNightMode == Configuration.UI_MODE_NIGHT_YES;
    }
    
    public String getThemeName(int themeMode) {
        switch (themeMode) {
            case THEME_LIGHT:
                return "Clair";
            case THEME_DARK:
                return "Sombre";
            case THEME_SYSTEM:
            default:
                return "Système";
        }
    }
} 