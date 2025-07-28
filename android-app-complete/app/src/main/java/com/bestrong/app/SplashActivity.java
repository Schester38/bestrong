package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.ProgressBar;
import android.view.View;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.view.animation.AccelerateDecelerateInterpolator;

public class SplashActivity extends Activity {
    private static final int SPLASH_DURATION = 4000; // 4 secondes
    
    private ImageView logoMain;
    private TextView titleMain;
    private TextView subtitleMain;
    private ProgressBar loadingIndicator;
    private View particle1, particle2, particle3;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        
        // Initialiser les vues
        initializeViews();
        
        // Démarrer les animations
        startAnimations();
        
        // Délai avant de passer à MainActivity
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent = new Intent(SplashActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
                // Animation de transition
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            }
        }, SPLASH_DURATION);
    }
    
    private void initializeViews() {
        logoMain = findViewById(R.id.logo_main);
        titleMain = findViewById(R.id.title_main);
        subtitleMain = findViewById(R.id.subtitle_main);
        loadingIndicator = findViewById(R.id.loading_indicator);
        particle1 = findViewById(R.id.particle_1);
        particle2 = findViewById(R.id.particle_2);
        particle3 = findViewById(R.id.particle_3);
    }
    
    private void startAnimations() {
        // Animation du logo avec pulsation
        Animation pulseAnimation = AnimationUtils.loadAnimation(this, R.anim.pulse);
        logoMain.startAnimation(pulseAnimation);
        
        // Animation du titre avec fade-in
        ObjectAnimator titleFadeIn = ObjectAnimator.ofFloat(titleMain, "alpha", 0f, 1f);
        titleFadeIn.setDuration(1500);
        titleFadeIn.setStartDelay(500);
        titleFadeIn.start();
        
        // Animation du sous-titre avec slide-up
        Animation slideUpAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_up);
        subtitleMain.startAnimation(slideUpAnimation);
        subtitleMain.setVisibility(View.VISIBLE);
        
        // Animation de l'indicateur de chargement
        ObjectAnimator loadingFadeIn = ObjectAnimator.ofFloat(loadingIndicator, "alpha", 0f, 1f);
        loadingFadeIn.setDuration(1000);
        loadingFadeIn.setStartDelay(1000);
        loadingFadeIn.start();
        
        // Animations des particules
        startParticleAnimations();
    }
    
    private void startParticleAnimations() {
        // Animation de la particule 1
        Animation particle1Anim = AnimationUtils.loadAnimation(this, R.anim.particle_float);
        particle1Anim.setStartOffset(200);
        particle1.startAnimation(particle1Anim);
        
        // Animation de la particule 2
        Animation particle2Anim = AnimationUtils.loadAnimation(this, R.anim.particle_float);
        particle2Anim.setStartOffset(400);
        particle2.startAnimation(particle2Anim);
        
        // Animation de la particule 3
        Animation particle3Anim = AnimationUtils.loadAnimation(this, R.anim.particle_float);
        particle3Anim.setStartOffset(600);
        particle3.startAnimation(particle3Anim);
        
        // Fade-in des particules
        ObjectAnimator particle1Fade = ObjectAnimator.ofFloat(particle1, "alpha", 0f, 1f);
        particle1Fade.setDuration(1000);
        particle1Fade.setStartDelay(200);
        particle1Fade.start();
        
        ObjectAnimator particle2Fade = ObjectAnimator.ofFloat(particle2, "alpha", 0f, 1f);
        particle2Fade.setDuration(1000);
        particle2Fade.setStartDelay(400);
        particle2Fade.start();
        
        ObjectAnimator particle3Fade = ObjectAnimator.ofFloat(particle3, "alpha", 0f, 1f);
        particle3Fade.setDuration(1000);
        particle3Fade.setStartDelay(600);
        particle3Fade.start();
    }
}