$ErrorActionPreference = 'Stop'

# Fix auth.ts
Write-Host "Fixing auth.ts..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\stores\auth.ts' -Raw
$content = $content -replace 'export async function login\(phone: string, password: string\) \{', 'export async function login(username: string, password: string) {'
$content = $content -replace 'body: JSON.stringify\(\{ phone, password \}\)', 'body: JSON.stringify({ username, password })'
$content = $content -replace 'export async function register\(phone: string, username: string, password: string, invite_code\?: string\) \{', 'export async function register(username: string, password: string, phone: string, invite_code?: string) {'
$content = $content -replace 'const body: Record<string, string> = \{ phone, username, password \}', 'const body: Record<string, string> = { username, password, phone }'
$content = $content -replace "/users/me", "/auth/profile"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\stores\auth.ts' -Value $content -Encoding UTF8

# Fix client.ts
Write-Host "Fixing client.ts..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\api\client.ts' -Raw
$content = $content -replace '请求失败', 'Request failed'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\api\client.ts' -Value $content -Encoding UTF8

Write-Host "auth.ts and client.ts fixed!"
