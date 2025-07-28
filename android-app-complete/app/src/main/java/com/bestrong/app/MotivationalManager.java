package com.bestrong.app;

import android.content.Context;
import android.content.SharedPreferences;
import java.util.Random;

public class MotivationalManager {
    
    private Context context;
    private SharedPreferences prefs;
    private Random random;
    private String[] motivationalMessages;
    
    public MotivationalManager(Context context) {
        this.context = context;
        this.prefs = context.getSharedPreferences("motivational_prefs", Context.MODE_PRIVATE);
        this.random = new Random();
        this.motivationalMessages = context.getResources().getStringArray(R.array.motivational_messages);
    }
    
    public String getRandomMotivationalMessage() {
        // Sélectionner un message aléatoire
        String message = motivationalMessages[random.nextInt(motivationalMessages.length)];
        
        // Éviter de répéter le dernier message
        String lastMessage = prefs.getString("last_message", "");
        if (message.equals(lastMessage) && motivationalMessages.length > 1) {
            message = motivationalMessages[random.nextInt(motivationalMessages.length)];
        }
        
        // Sauvegarder le message actuel
        prefs.edit().putString("last_message", message).apply();
        
        // Incrémenter le compteur de messages
        incrementMessageCount();
        
        return message;
    }
    
    public String getTitleForUserLevel() {
        int messageCount = getMessageCount();
        
        if (messageCount < 10) {
            return "MOTIVATION DEBUTANT";
        } else if (messageCount < 30) {
            return "MOTIVATION INTERMEDIAIRE";
        } else if (messageCount < 60) {
            return "MOTIVATION AVANCE";
        } else {
            return "MOTIVATION EXPERT";
        }
    }
    
    private int getMessageCount() {
        return prefs.getInt("message_count", 0);
    }
    
    private void incrementMessageCount() {
        int currentCount = getMessageCount();
        prefs.edit().putInt("message_count", currentCount + 1).apply();
    }
    
    public int getUserLevel() {
        int messageCount = getMessageCount();
        
        if (messageCount < 10) {
            return 1; // Débutant
        } else if (messageCount < 30) {
            return 2; // Intermédiaire
        } else if (messageCount < 60) {
            return 3; // Avancé
        } else {
            return 4; // Expert
        }
    }
    
    public String getUserLevelName() {
        switch (getUserLevel()) {
            case 1: return "Debutant";
            case 2: return "Intermediaire";
            case 3: return "Avance";
            case 4: return "Expert";
            default: return "Debutant";
        }
    }
} 