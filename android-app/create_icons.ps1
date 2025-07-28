# Script pour créer les icônes Android BE STRONG
# Ce script utilise ImageMagick pour redimensionner les icônes

# Vérifier si ImageMagick est installé
try {
    $magick = Get-Command magick -ErrorAction Stop
    Write-Host "ImageMagick trouvé: $($magick.Source)"
} catch {
    Write-Host "ImageMagick non trouvé. Installation nécessaire pour créer les icônes."
    Write-Host "Téléchargez depuis: https://imagemagick.org/script/download.php#windows"
    exit 1
}

# Créer une icône de base avec les couleurs BE STRONG
$iconBase = "app\src\main\res\mipmap-mdpi\ic_launcher.png"

# Créer une icône circulaire avec dégradé bleu-violet et texte "BE STRONG"
magick convert -size 48x48 xc:none ^
    -fill "radial-gradient:blue-purple" ^
    -draw "circle 24,24 24,2" ^
    -fill white -font Arial-Bold -pointsize 8 ^
    -gravity center -annotate +0+0 "BE\nSTRONG" ^
    $iconBase

# Copier et redimensionner pour les autres densités
Copy-Item $iconBase "app\src\main\res\mipmap-hdpi\ic_launcher.png"
magick convert "app\src\main\res\mipmap-hdpi\ic_launcher.png" -resize 72x72 "app\src\main\res\mipmap-hdpi\ic_launcher.png"

Copy-Item $iconBase "app\src\main\res\mipmap-xhdpi\ic_launcher.png"
magick convert "app\src\main\res\mipmap-xhdpi\ic_launcher.png" -resize 96x96 "app\src\main\res\mipmap-xhdpi\ic_launcher.png"

Copy-Item $iconBase "app\src\main\res\mipmap-xxhdpi\ic_launcher.png"
magick convert "app\src\main\res\mipmap-xxhdpi\ic_launcher.png" -resize 144x144 "app\src\main\res\mipmap-xxhdpi\ic_launcher.png"

Copy-Item $iconBase "app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
magick convert "app\src\main\res\mipmap-xxxhdpi\ic_launcher.png" -resize 192x192 "app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"

Write-Host "Icônes créées avec succès !" 