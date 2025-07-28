# Script pour créer les icônes Android BE STRONG et image splash
# Ce script utilise des commandes PowerShell pour créer des icônes de base

Write-Host "Création des icônes BE STRONG..."

# Créer des fichiers placeholder pour les icônes (à remplacer par de vraies images PNG)
$mipmapDirs = @("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")
$sizes = @(48, 72, 96, 144, 192)

for ($i = 0; $i -lt $mipmapDirs.Length; $i++) {
    $dir = $mipmapDirs[$i]
    $size = $sizes[$i]
    
    $iconPath = "app\src\main\res\mipmap-$dir\ic_launcher.png"
    $placeholderPath = "app\src\main\res\mipmap-$dir\ic_launcher.txt"
    
    # Créer un fichier placeholder avec les informations
    $content = @"
# Icône BE STRONG - $size x $size pixels
# À remplacer par une vraie image PNG
# Design: Cercle avec dégradé bleu-violet, texte "BE STRONG" en blanc
"@
    
    Set-Content -Path $placeholderPath -Value $content
    Write-Host "Créé: $placeholderPath"
}

# Créer l'image splash
$splashDir = "app\src\main\res\drawable"
if (!(Test-Path $splashDir)) {
    New-Item -ItemType Directory -Path $splashDir -Force
}

$splashContent = @"
# Image Splash BE STRONG
# À remplacer par une vraie image PNG
# Design: Fond dégradé bleu-violet avec logo BE STRONG centré
# Taille recommandée: 1080x1920 pixels (portrait)
"@

Set-Content -Path "$splashDir\splash_background.txt" -Value $splashContent
Write-Host "Créé: $splashDir\splash_background.txt"

Write-Host "`nInstructions pour finaliser:"
Write-Host "1. Remplacez les fichiers .txt par de vraies images PNG"
Write-Host "2. Pour les icônes: utilisez les tailles 48x48, 72x72, 96x96, 144x144, 192x192"
Write-Host "3. Pour le splash: utilisez une image 1080x1920 pixels"
Write-Host "4. Design suggéré: cercle avec dégradé bleu-violet, texte 'BE STRONG' en blanc" 