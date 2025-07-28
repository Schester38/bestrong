# Script PowerShell pour générer le keystore
# Création du dossier keystore s'il n'existe pas
if (!(Test-Path "app\keystore")) {
    New-Item -ItemType Directory -Path "app\keystore" -Force
}

# Génération du keystore avec toutes les informations
$keystorePath = "app\keystore\release-key.jks"
$storePass = "Ver@ne9124"
$keyPass = "Ver@ne9124"
$alias = "bestrong-key"

# Création du fichier de réponse pour automatiser la génération
$responseFile = @"
Gadar
Perets
Développement
Be Strong
Paris
Île-de-France
FR
Oui
"@

# Sauvegarde du fichier de réponse
$responseFile | Out-File -FilePath "keystore-response.txt" -Encoding ASCII

# Génération du keystore
echo "Génération du keystore..."
keytool -genkey -v -keystore $keystorePath -keyalg RSA -keysize 2048 -validity 10000 -alias $alias -storetype JKS -storepass $storePass -keypass $keyPass -dname "CN=Gadar Perets, OU=Développement, O=Be Strong, L=Paris, ST=Île-de-France, C=FR"

# Vérification
if (Test-Path $keystorePath) {
    echo "✅ Keystore généré avec succès!"
    echo "📁 Emplacement: $keystorePath"
    echo "🔑 Alias: $alias"
    echo "🔒 Mot de passe: $storePass"
} else {
    echo "❌ Erreur lors de la génération du keystore"
}

# Nettoyage
if (Test-Path "keystore-response.txt") {
    Remove-Item "keystore-response.txt"
} 