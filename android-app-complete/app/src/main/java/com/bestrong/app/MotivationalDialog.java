package com.bestrong.app;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class MotivationalDialog extends Dialog {
    
    private Context context;
    private MotivationalManager motivationalManager;
    
    public MotivationalDialog(Context context) {
        super(context);
        this.context = context;
        this.motivationalManager = new MotivationalManager(context);
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.motivational_dialog);
        
        // Empêcher la fermeture en cliquant à l'extérieur
        setCanceledOnTouchOutside(false);
        setCancelable(false);
        
        // Initialiser les vues
        initializeViews();
        
        // Appliquer les animations
        applyAnimations();
    }
    
    private void initializeViews() {
        TextView titleView = findViewById(R.id.motivation_title);
        TextView messageView = findViewById(R.id.motivation_message);
        Button okButton = findViewById(R.id.btn_ok);
        
        // Obtenir un message de motivation
        String message = motivationalManager.getRandomMotivationalMessage();
        String title = motivationalManager.getTitleForUserLevel();
        
        // Afficher le message
        titleView.setText(title);
        messageView.setText(message);
        
        // Configuration du bouton
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Animation de fermeture
                Animation fadeOut = AnimationUtils.loadAnimation(context, android.R.anim.fade_out);
                findViewById(android.R.id.content).startAnimation(fadeOut);
                
                // Fermer le dialog après l'animation
                fadeOut.setAnimationListener(new Animation.AnimationListener() {
                    @Override
                    public void onAnimationStart(Animation animation) {}
                    
                    @Override
                    public void onAnimationEnd(Animation animation) {
                        dismiss();
                    }
                    
                    @Override
                    public void onAnimationRepeat(Animation animation) {}
                });
            }
        });
    }
    
    private void applyAnimations() {
        // Animation d'entrée pour le dialog
        Animation fadeIn = AnimationUtils.loadAnimation(context, android.R.anim.fade_in);
        findViewById(android.R.id.content).startAnimation(fadeIn);
        
        // Animation pour le titre
        Animation slideUp = AnimationUtils.loadAnimation(context, android.R.anim.slide_in_left);
        findViewById(R.id.motivation_title).startAnimation(slideUp);
        
        // Animation pour le message
        Animation slideUpDelayed = AnimationUtils.loadAnimation(context, android.R.anim.slide_in_left);
        slideUpDelayed.setStartOffset(300);
        findViewById(R.id.motivation_message).startAnimation(slideUpDelayed);
        
        // Animation pour le bouton
        Animation scaleIn = AnimationUtils.loadAnimation(context, android.R.anim.fade_in);
        scaleIn.setStartOffset(600);
        findViewById(R.id.btn_ok).startAnimation(scaleIn);
    }
} 