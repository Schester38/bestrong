# Script PowerShell final pour signer l'APK
Write-Host "========================================" -ForegroundColor Green
Write-Host "Certification de l'APK Be Strong" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Recherche de Java et construction du chemin vers jarsigner
$javaPath = Get-Command java -ErrorAction SilentlyContinue
if ($javaPath) {
    Write-Host "Java trouve: $($javaPath.Source)" -ForegroundColor Yellow
    
    # Le chemin Java pointe vers java8path, nous devons remonter vers le JDK
    $javaDir = Split-Path $javaPath.Source -Parent
    $jdkDir = Split-Path $javaDir -Parent | Split-Path -Parent
    $jarsignerPath = Join-Path $jdkDir "bin\jarsigner.exe"
    
    Write-Host "Recherche de jarsigner dans: $jarsignerPath" -ForegroundColor Yellow
    
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
                    
                    # Vérification
                    Write-Host "`n========================================" -ForegroundColor Green
                    Write-Host "Verification de la signature..." -ForegroundColor Green
                    Write-Host "========================================" -ForegroundColor Green
                    
                    $verifyArgs = @("-verify", "-verbose", "-certs", "app\BeStrong-signed.apk")
                    & $jarsignerPath @verifyArgs
                }
            } else {
                Write-Host "`nErreur lors de la signature!" -ForegroundColor Red
            }
        } catch {
            Write-Host "Erreur: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Jarsigner non trouve dans: $jarsignerPath" -ForegroundColor Red
        Write-Host "Tentative de recherche alternative..." -ForegroundColor Yellow
        
        # Recherche alternative dans les dossiers JDK courants
        $possiblePaths = @(
            "C:\Program Files\Java\jdk*\bin\jarsigner.exe",
            "C:\Program Files (x86)\Java\jdk*\bin\jarsigner.exe",
            "C:\Program Files\Eclipse Adoptium\jdk*\bin\jarsigner.exe"
        )
        
        foreach ($path in $possiblePaths) {
            $found = Get-ChildItem -Path $path -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                Write-Host "Jarsigner trouve: $($found.FullName)" -ForegroundColor Green
                $jarsignerPath = $found.FullName
                break
            }
        }
        
        if (Test-Path $jarsignerPath) {
            # Relancer la signature avec le jarsigner trouvé
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "Signature de l'APK..." -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            
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
                    
                    if (Test-Path "app\BeStrong-unsigned.apk") {
                        Rename-Item "app\BeStrong-unsigned.apk" "app\BeStrong-signed.apk"
                        Write-Host "`nAPK certifie: app\BeStrong-signed.apk" -ForegroundColor Green
                    }
                }
            } catch {
                Write-Host "Erreur: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "Aucun jarsigner trouve sur le systeme" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Java non trouve dans le PATH" -ForegroundColor Red
}

Write-Host "`nAppuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 