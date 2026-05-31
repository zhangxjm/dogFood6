# Fix Login.tsx
Write-Host "Fixing Login.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Login.tsx' -Raw
$content = $content -replace 'const \[phone, setPhone\] = createSignal\('\'''\'\)', 'const [username, setUsername] = createSignal('\'''\')'
$content = $content -replace 'await login\(phone\(\), password\(\)\)', 'await login(username(), password())'
$content = $content -replace 'value=\{phone\(\)\}', 'value={username()}'
$content = $content -replace 'onInput=\{e => setPhone\(e\.currentTarget\.value\)\}', 'onInput={e => setUsername(e.currentTarget.value)}'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Login.tsx' -Value $content -Encoding UTF8

# Fix Register.tsx
Write-Host "Fixing Register.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Register.tsx' -Raw
$content = $content -replace 'await register\(phone\(\), username\(\), password\(\), inviteCode\(\) \|\| undefined\)', 'await register(username(), password(), phone(), inviteCode() || undefined)'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Register.tsx' -Value $content -Encoding UTF8

# Fix Home.tsx
Write-Host "Fixing Home.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Home.tsx' -Raw
$content = $content -replace '/products\?recommended=true', '/recommendations/recommend/personal/'
$content = $content -replace '/campaigns\?active=true', '/campaigns/campaigns/'
$content = $content -replace '/products\?sort=newest&limit=4', '/products/products/?ordering=-created_at&page_size=4'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Home.tsx' -Value $content -Encoding UTF8

Write-Host "Login, Register, Home fixed!"
