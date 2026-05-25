function Stop-PortProcess {
    param([int]$Port)

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Where-Object { $_.OwningProcess -ne 0 }

    foreach ($connection in $connections) {
        try {
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction Stop
        } catch {}
    }
}

function Wait-ForWeb {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 90
    )

    $endTime = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $endTime) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3 | Out-Null
            return $true
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    return $false
}

Write-Host "Stopping old HungryDog app processes..."

Stop-PortProcess -Port 8081
Stop-PortProcess -Port 8082
Stop-PortProcess -Port 5083
Stop-PortProcess -Port 7023

Get-Process -Name node -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -eq "C:\Program Files\nodejs\node.exe" } |
    Stop-Process -Force

Get-Process -Name HungryDogApi -ErrorAction SilentlyContinue |
    Stop-Process -Force

Start-Sleep -Seconds 2

Write-Host "Starting API on http://127.0.0.1:5083 ..."
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'C:\Users\boluk\Desktop\Code\h5-msp-hungry-dog\src\HungryDogApi'; dotnet run --launch-profile http"
)

Start-Sleep -Seconds 5

Write-Host "Starting app on http://127.0.0.1:8081 ..."
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'C:\Users\boluk\Desktop\Code\h5-msp-hungry-dog\src\HungryDogFrontend'; npx expo start -c --web --port 8081"
)

Write-Host "Waiting for Expo to be ready..."
$isReady = Wait-ForWeb -Url "http://127.0.0.1:8081" -TimeoutSeconds 90

Write-Host ""
if ($isReady) {
    Write-Host "Opening HungryDog..."
    Start-Process "http://127.0.0.1:8081"
} else {
    Write-Host "Expo did not answer yet. If it says Web Bundled, open this manually:"
}

Write-Host "http://127.0.0.1:8081"
