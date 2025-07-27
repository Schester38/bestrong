package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;
import android.graphics.Color;
import android.view.View;
import android.widget.RelativeLayout;

public class SplashActivity extends Activity {
    private static final int SPLASH_DURATION = 3000; // 3 secondes
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Créer le layout du splash screen
        RelativeLayout splashLayout = new RelativeLayout(this);
        splashLayout.setBackgroundColor(Color.parseColor("#1F2937")); // Gris foncé
        
        // Logo animé
        ImageView logoView = new ImageView(this);
        logoView.setImageResource(R.drawable.ic_launcher_foreground);
        logoView.setScaleType(android.widget.ImageView.ScaleType.CENTER_INSIDE);
        
        RelativeLayout.LayoutParams logoParams = new RelativeLayout.LayoutParams(
            200, 200
        );
        logoParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        logoParams.addRule(RelativeLayout.ABOVE, android.R.id.text1);
        
        // Texte animé
        TextView titleText = new TextView(this);
        titleText.setText("BE STRONG");
        titleText.setTextSize(32);
        titleText.setTextColor(Color.parseColor("#EC4899")); // Rose
        titleText.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        
        RelativeLayout.LayoutParams titleParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.WRAP_CONTENT,
            RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        titleParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
        titleParams.addRule(RelativeLayout.CENTER_IN_PARENT);
        titleParams.topMargin = 50;
        
        // Sous-titre
        TextView subtitleText = new TextView(this);
        subtitleText.setText("Augmentez votre visibilité TikTok");
        subtitleText.setTextSize(16);
        subtitleText.setTextColor(Color.parseColor("#9CA3AF")); // Gris clair
        subtitleText.setTypeface(android.graphics.Typeface.DEFAULT);
        
        RelativeLayout.LayoutParams subtitleParams = new RelativeLayout.LayoutParams(
            RelativeLayout.LayoutParams.WRAP_CONTENT,
            RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        subtitleParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
        subtitleParams.addRule(RelativeLayout.BELOW, android.R.id.text1);
        subtitleParams.topMargin = 20;
        
        // Ajouter les vues
        splashLayout.addView(logoView, logoParams);
        splashLayout.addView(titleText, titleParams);
        splashLayout.addView(subtitleText, subtitleParams);
        
        setContentView(splashLayout);
        
        // Animations
        Animation fadeIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
        Animation scaleIn = AnimationUtils.loadAnimation(this, android.R.anim.fade_in);
        
        logoView.startAnimation(fadeIn);
        titleText.startAnimation(scaleIn);
        subtitleText.startAnimation(fadeIn);
        
        // Délai avant de passer à MainActivity
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(SplashActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        }, SPLASH_DURATION);
    }
}