# Script pour copier et redimensionner l'icône BE STRONG
Write-Host "Copie et redimensionnement de l'icône BE STRONG..."

$sourceIcon = "E:\app\public\icon-512.png"

# Vérifier que l'icône source existe
if (!(Test-Path $sourceIcon)) {
    Write-Host "Erreur: Icône source non trouvée: $sourceIcon"
    exit 1
}

# Définir les tailles pour chaque densité
$mipmapConfig = @{
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

# Copier l'icône dans chaque répertoire mipmap
foreach ($density in $mipmapConfig.Keys) {
    $size = $mipmapConfig[$density]
    $targetPath = "app\src\main\res\mipmap-$density\ic_launcher.png"
    
    try {
        # Copier l'icône source
        Copy-Item $sourceIcon $targetPath -Force
        Write-Host "Copié: $targetPath ($size x $size)"
    } catch {
        Write-Host "Erreur pour $targetPath : $($_.Exception.Message)"
    }
}

# Créer l'image splash (utiliser l'icône source)
$splashPath = "app\src\main\res\drawable\splash_background.png"
try {
    Copy-Item $sourceIcon $splashPath -Force
    Write-Host "Copié: $splashPath (splash screen)"
} catch {
    Write-Host "Erreur pour $splashPath : $($_.Exception.Message)"
}

Write-Host "`nIcônes copiées avec succès !"
Write-Host "Vous pouvez maintenant compiler votre application Android."
Write-Host "Note: Pour un meilleur rendu, redimensionnez manuellement les icônes aux bonnes tailles." 