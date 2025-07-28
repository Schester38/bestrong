@echo off
echo ========================================
echo Certification de l'APK Be Strong
echo ========================================

REM Recherche du JDK
set "JAVA_HOME=%JAVA_HOME%"
if "%JAVA_HOME%"=="" (
    echo Recherche du JDK...
    for /f "tokens=*" %%i in ('where java 2^>nul') do (
        set "JAVA_PATH=%%i"
        goto :found_java
    )
    echo Java non trouve dans le PATH
    goto :end
)

:found_java
echo Java trouve: %JAVA_PATH%

REM Construction du chemin vers jarsigner
set "JARSIGNER_PATH=%JAVA_HOME%\bin\jarsigner.exe"
if not exist "%JARSIGNER_PATH%" (
    echo Jarsigner non trouve dans %JARSIGNER_PATH%
    echo Tentative avec le PATH systeme...
    set "JARSIGNER_PATH=jarsigner"
)

echo.
echo ========================================
echo Signature de l'APK...
echo ========================================

REM Signature de l'APK
"%JARSIGNER_PATH%" -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore app\keystore\release-key.jks app\BeStrong-unsigned.apk bestrong-key -storepass "Ver@ne9124"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo APK signe avec succes!
    echo ========================================
    echo.
    echo Fichier signe: app\BeStrong-unsigned.apk
    echo.
    echo Renommage en BeStrong-signed.apk...
    ren app\BeStrong-unsigned.apk BeStrong-signed.apk
    echo.
    echo APK certifie: app\BeStrong-signed.apk
    echo.
    echo ========================================
    echo Verification de la signature...
    echo ========================================
    "%JARSIGNER_PATH%" -verify -verbose -certs app\BeStrong-signed.apk
) else (
    echo.
    echo ========================================
    echo Erreur lors de la signature!
    echo ========================================
)

:end
echo.
echo Appuyez sur une touche pour continuer...
pause >nul 