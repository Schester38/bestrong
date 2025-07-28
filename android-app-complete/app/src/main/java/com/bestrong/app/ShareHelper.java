package com.bestrong.app;

import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class ShareHelper {
    
    private Context context;
    
    public ShareHelper(Context context) {
        this.context = context;
    }
    
    public void shareContent(String title, String text, String url) {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, title);
            shareIntent.putExtra(Intent.EXTRA_TEXT, text + " " + url);
            
            // Créer un chooser pour sélectionner l'app
            Intent chooser = Intent.createChooser(shareIntent, "Partager BE STRONG");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            
            context.startActivity(chooser);
        } catch (Exception e) {
            Toast.makeText(context, "Erreur lors du partage", Toast.LENGTH_SHORT).show();
        }
    }
    
    public void shareToWhatsApp(String text, String url) {
        try {
            String message = text + " " + url;
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("text/plain");
            intent.setPackage("com.whatsapp");
            intent.putExtra(Intent.EXTRA_TEXT, message);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            // Si WhatsApp n'est pas installé, ouvrir le chooser
            shareContent("BE STRONG", text, url);
        }
    }
}