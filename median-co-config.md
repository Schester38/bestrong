# 📱 Configuration median.co pour le Partage Android

## 🔧 **Paramètres à Configurer dans median.co :**

### **1. Permissions Android**
```json
{
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.ACCESS_NETWORK_STATE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_EXTERNAL_STORAGE"
  ]
}
```

### **2. Configuration WebView**
```json
{
  "webView": {
    "javaScriptEnabled": true,
    "domStorageEnabled": true,
    "allowFileAccess": true,
    "allowContentAccess": true,
    "allowUniversalAccessFromFileURLs": true,
    "allowFileAccessFromFileURLs": true,
    "mixedContentMode": "MIXED_CONTENT_ALWAYS_ALLOW"
  }
}
```

### **3. APIs Natives à Activer**
```json
{
  "nativeAPIs": {
    "share": true,
    "clipboard": true,
    "notifications": true,
    "geolocation": true
  }
}
```

### **4. Headers de Sécurité**
```json
{
  "headers": {
    "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;"
  }
}
```

## 🎯 **Étapes de Configuration :**

1. **Aller sur median.co**
2. **Créer un nouveau projet** ou modifier l'existant
3. **URL** : `https://mybestrong.netlify.app`
4. **Nom** : `BE STRONG`
5. **Icône** : Uploader `/icon-512.png`

### **Paramètres Avancés :**
- ✅ **Enable JavaScript** : Oui
- ✅ **Enable Native APIs** : Oui
- ✅ **Enable Share API** : Oui
- ✅ **Enable Notifications** : Oui
- ✅ **Full Screen** : Oui
- ✅ **Hide Navigation Bar** : Oui

### **Permissions Android :**
- ✅ **Internet**
- ✅ **Network State**
- ✅ **External Storage** (pour le partage)
- ✅ **Vibrate** (pour les notifications)

## 🔄 **Alternative : Bridge JavaScript-Natif**

Si l'API de partage ne fonctionne toujours pas, nous pouvons implémenter un bridge personnalisé :

```javascript
// Dans l'app
if (window.GoNative) {
  // Utiliser l'API native de GoNative
  window.GoNative.share({
    title: "BE STRONG",
    text: "Découvre BE STRONG...",
    url: "https://mybestrong.netlify.app"
  });
} else {
  // Fallback vers navigator.share
  navigator.share(shareData);
}
```

## 📋 **Checklist de Vérification :**

- [ ] Permissions Android configurées
- [ ] JavaScript activé dans WebView
- [ ] APIs natives activées
- [ ] Headers de sécurité appropriés
- [ ] Test sur appareil Android réel
- [ ] Vérification des logs d'erreur

## 🚀 **Génération de l'APK :**

1. **Configurer** tous les paramètres ci-dessus
2. **Tester** avec l'APK de développement
3. **Générer** l'APK final
4. **Installer** et tester le partage

---

**Note :** Si le problème persiste, nous pouvons implémenter une solution de partage personnalisée qui ouvre directement les applications de partage populaires (WhatsApp, Facebook, etc.). 