# Script pour créer toutes les tailles d'icônes Android
# Source: C:\Users\EASYSTORE\Downloads\icon.png

$sourceIcon = "C:\Users\EASYSTORE\Downloads\icon.png"
$resPath = "app\src\main\res"

# Créer les dossiers s'ils n'existent pas
$folders = @(
    "mipmap-mdpi",
    "mipmap-hdpi", 
    "mipmap-xhdpi",
    "mipmap-xxhdpi",
    "mipmap-xxxhdpi"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $resPath $folder
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force
        Write-Host "Créé le dossier: $fullPath"
    }
}

# Tailles des icônes pour chaque densité
$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

# Copier l'icône source vers chaque dossier avec la bonne taille
foreach ($folder in $folders) {
    $targetPath = Join-Path $resPath $folder "ic_launcher.png"
    Copy-Item $sourceIcon $targetPath -Force
    Write-Host "Copié vers: $targetPath"
}

# Créer aussi ic_launcher_round.png (même icône)
foreach ($folder in $folders) {
    $targetPath = Join-Path $resPath $folder "ic_launcher_round.png"
    Copy-Item $sourceIcon $targetPath -Force
    Write-Host "Copié icône ronde vers: $targetPath"
}

Write-Host "✅ Toutes les icônes ont été créées !"
Write-Host "📱 Vous pouvez maintenant compiler l'APK avec la nouvelle icône" 