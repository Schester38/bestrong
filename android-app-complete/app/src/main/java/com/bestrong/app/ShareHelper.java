package com.bestrong.app;

import android.app.Activity;
import android.content.Intent;
import android.widget.Toast;
import android.util.Log;

public class ShareHelper {
    private Activity activity;
    private static final String TAG = "ShareHelper";
    
    public ShareHelper(Activity activity) {
        this.activity = activity;
    }
    
    public void shareContent(String title, String text, String url) {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
            shareIntent.putExtra(Intent.EXTRA_TEXT, text + " " + url);
            
            // Créer un chooser pour sélectionner l'app de partage
            Intent chooser = Intent.createChooser(shareIntent, "Partager BE STRONG");
            
            // Vérifier qu'il y a des apps disponibles
            if (shareIntent.resolveActivity(activity.getPackageManager()) != null) {
                activity.startActivity(chooser);
                Log.d(TAG, "Share intent launched successfully");
            } else {
                Toast.makeText(activity, "Aucune application de partage disponible", Toast.LENGTH_SHORT).show();
                Log.w(TAG, "No sharing apps available");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sharing content", e);
            Toast.makeText(activity, "Erreur lors du partage", Toast.LENGTH_SHORT).show();
        }
    }
}