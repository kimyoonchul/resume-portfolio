Add-Type -AssemblyName System.Drawing

function Apply-Blur {
    param(
        [string]$InputPath,
        [int]$BlurStrength = 20
    )
    
    $img = [System.Drawing.Image]::FromFile($InputPath)
    $origWidth = $img.Width
    $origHeight = $img.Height
    
    # Multi-pass blur: shrink very small and expand back, repeat 3 times
    $current = New-Object System.Drawing.Bitmap($img)
    $img.Dispose()
    
    for ($pass = 0; $pass -lt 3; $pass++) {
        $smallWidth = [Math]::Max(1, [Math]::Floor($current.Width / $BlurStrength))
        $smallHeight = [Math]::Max(1, [Math]::Floor($current.Height / $BlurStrength))
        
        $small = New-Object System.Drawing.Bitmap($smallWidth, $smallHeight)
        $gSmall = [System.Drawing.Graphics]::FromImage($small)
        $gSmall.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::Bilinear
        $gSmall.DrawImage($current, 0, 0, $smallWidth, $smallHeight)
        $gSmall.Dispose()
        $current.Dispose()
        
        $current = New-Object System.Drawing.Bitmap($origWidth, $origHeight)
        $gCurrent = [System.Drawing.Graphics]::FromImage($current)
        $gCurrent.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::Bilinear
        $gCurrent.DrawImage($small, 0, 0, $origWidth, $origHeight)
        $gCurrent.Dispose()
        $small.Dispose()
    }
    
    # Save over the original
    $current.Save($InputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $current.Dispose()
    
    Write-Host "Blurred: $InputPath"
}

# List of images to blur (exclude profile photo and GWS training photos)
$imagesToBlur = @(
    "images\airflow.png",
    "images\olive-report.png",
    "images\olive-mis.png",
    "images\tiktok-mis.png",
    "images\tiktok-report.png",
    "images\employee-bot.png",
    "images\ml-bot-1.png",
    "images\ml-bot-2.png",
    "images\club-clio.png",
    "images\mis-dashboard.png",
    "images\plm-dashboard.png"
)

foreach ($imgPath in $imagesToBlur) {
    $fullPath = Join-Path $PSScriptRoot $imgPath
    if (Test-Path $fullPath) {
        Apply-Blur -InputPath $fullPath -BlurStrength 8
    } else {
        Write-Host "Not found: $fullPath"
    }
}

Write-Host "`nDone! All images blurred."
