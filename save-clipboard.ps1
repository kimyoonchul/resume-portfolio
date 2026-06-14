Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save($args[0], [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "OK saved: $($args[0])"
} else {
    Write-Host "NO image in clipboard"
}
