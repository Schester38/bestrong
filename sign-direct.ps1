# Script simple pour signer l'APK
Write-Host "========================================" -ForegroundColor Green
Write-Host "Certification de l'APK Be Strong" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Chemin direct vers jarsigner
$jarsignerPath = "C:\Program Files\Java\jre1.8.0_461\bin\jarsigner.exe"

if (Test-Path $jarsignerPath) {
    Write-Host "Jarsigner trouve: $jarsignerPath" -ForegroundColor Green
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Signature de l'APK..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    # Signature de l'APK
    $arguments = @(
        "-verbose",
        "-sigalg", "SHA256withRSA",
        "-digestalg", "SHA-256",
        "-keystore", "app\keystore\release-key.jks",
        "app\BeStrong-unsigned.apk",
        "bestrong-key",
        "-storepass", "Ver@ne9124"
    )
    
    try {
        & $jarsignerPath @arguments
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "APK signe avec succes!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            
            # Renommage
            if (Test-Path "app\BeStrong-unsigned.apk") {
                Rename-Item "app\BeStrong-unsigned.apk" "app\BeStrong-signed.apk"
                Write-Host "`nAPK certifie: app\BeStrong-signed.apk" -ForegroundColor Green
            }
        } else {
            Write-Host "`nErreur lors de la signature!" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erreur: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Jarsigner non trouve dans: $jarsignerPath" -ForegroundColor Red
    Write-Host "Tentative avec le JRE..." -ForegroundColor Yellow
    
    # Essai avec le JRE
    $jrePath = "C:\Program Files\Java\jre1.8.0_461\bin\jarsigner.exe"
    if (Test-Path $jrePath) {
        Write-Host "Jarsigner JRE trouve: $jrePath" -ForegroundColor Green
        
        $arguments = @(
            "-verbose",
            "-sigalg", "SHA256withRSA",
            "-digestalg", "SHA-256",
            "-keystore", "app\keystore\release-key.jks",
            "app\BeStrong-unsigned.apk",
            "bestrong-key",
            "-storepass", "Ver@ne9124"
        )
        
        try {
            & $jrePath @arguments
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n========================================" -ForegroundColor Green
                Write-Host "APK signe avec succes!" -ForegroundColor Green
                Write-Host "========================================" -ForegroundColor Green
                
                if (Test-Path "app\BeStrong-unsigned.apk") {
                    Rename-Item "app\BeStrong-unsigned.apk" "app\BeStrong-signed.apk"
                    Write-Host "`nAPK certifie: app\BeStrong-signed.apk" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "Erreur: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Aucun jarsigner trouve" -ForegroundColor Red
    }
}

Write-Host "`nAppuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 