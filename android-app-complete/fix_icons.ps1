# Script simple pour créer des icônes PNG de base
Write-Host "Création des icônes PNG de base..."

# Créer des icônes PNG minimales (1x1 pixel)
$mipmapDirs = @("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")

foreach ($dir in $mipmapDirs) {
    $iconPath = "app\src\main\res\mipmap-$dir\ic_launcher.png"
    
    # Créer un fichier PNG minimal (1x1 pixel bleu)
    $pngBytes = @(
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 pixels
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # Color type, compression, etc.
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
        0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0x00, 0x00,  # Image data
        0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0,  # End of IDAT
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
        0xAE, 0x42, 0x60, 0x82                           # IEND signature
    )
    
    try {
        [System.IO.File]::WriteAllBytes($iconPath, $pngBytes)
        Write-Host "Créé: $iconPath"
    } catch {
        Write-Host "Erreur pour $iconPath : $($_.Exception.Message)"
    }
}

# Créer l'image splash
$splashPath = "app\src\main\res\drawable\splash_background.png"
try {
    [System.IO.File]::WriteAllBytes($splashPath, $pngBytes)
    Write-Host "Créé: $splashPath"
} catch {
    Write-Host "Erreur pour $splashPath : $($_.Exception.Message)"
}

Write-Host "`nIcônes créées ! Vous pouvez maintenant compiler votre app." 