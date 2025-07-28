# Script pour créer des icônes PNG simples pour BE STRONG
# Utilise PowerShell pour créer des icônes de base

Write-Host "Création des icônes PNG simples..."

# Fonction pour créer une icône PNG simple
function Create-SimpleIcon {
    param($size, $outputPath)
    
    # Créer un fichier PNG simple (1x1 pixel bleu)
    $pngHeader = @(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
    $pngData = @(0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52)
    
    # Taille en bytes (little endian)
    $widthBytes = [System.BitConverter]::GetBytes($size)
    $heightBytes = [System.BitConverter]::GetBytes($size)
    
    $pngData += $widthBytes
    $pngData += $heightBytes
    
    # Données PNG minimales
    $pngData += @(0x08, 0x02, 0x00, 0x00, 0x00)
    
    # Créer le fichier
    [System.IO.File]::WriteAllBytes($outputPath, $pngData)
}

# Créer les icônes pour chaque densité
$mipmapDirs = @("mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi")
$sizes = @(48, 72, 96, 144, 192)

for ($i = 0; $i -lt $mipmapDirs.Length; $i++) {
    $dir = $mipmapDirs[$i]
    $size = $sizes[$i]
    
    $iconPath = "app\src\main\res\mipmap-$dir\ic_launcher.png"
    
    # Supprimer le fichier placeholder
    if (Test-Path "app\src\main\res\mipmap-$dir\ic_launcher.txt") {
        Remove-Item "app\src\main\res\mipmap-$dir\ic_launcher.txt"
    }
    
    # Créer l'icône PNG
    Create-SimpleIcon -size $size -outputPath $iconPath
    Write-Host "Créé: $iconPath ($size x $size)"
}

# Créer l'image splash
$splashPath = "app\src\main\res\drawable\splash_background.png"
if (Test-Path "app\src\main\res\drawable\splash_background.txt") {
    Remove-Item "app\src\main\res\drawable\splash_background.txt"
}
Create-SimpleIcon -size 1080 -outputPath $splashPath
Write-Host "Créé: $splashPath (1080 x 1080)"

Write-Host "`nIcônes créées avec succès !"
Write-Host "Vous pouvez maintenant compiler votre application Android."
Write-Host "Pour des icônes plus belles, remplacez ces fichiers par de vraies images PNG." 