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

# Fix Products.tsx
Write-Host "Fixing Products.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Products.tsx' -Raw
$content = $content -replace "const data = await apiFetch<Product\[\]>('/products')", "const data = await apiFetch<Product[]>('/products/products/')"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Products.tsx' -Value $content -Encoding UTF8

# Fix ProductDetail.tsx
Write-Host "Fixing ProductDetail.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\ProductDetail.tsx' -Raw
$content = $content -replace "`/products/`${params.id}", "`/products/products/`${params.id}/"
$content = $content -replace "/cart/items", "/orders/cart/"
$content = $content -replace 'body: JSON.stringify\(\{ product_id: product\(\)\?\.id, quantity: 1 \}\)', 'body: JSON.stringify({ product: product()?.id, quantity: 1 })'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\ProductDetail.tsx' -Value $content -Encoding UTF8

# Fix Cart.tsx
Write-Host "Fixing Cart.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Cart.tsx' -Raw
$content = $content -replace "const data = await apiFetch<CartItem\[\]>('/cart')", "const data = await apiFetch<CartItem[]>('/orders/cart/')"
$content = $content -replace "await apiFetch\('/orders', \{ method: 'POST', body: JSON.stringify\(\{\}) \}\)", "await apiFetch('/orders/orders/', { method: 'POST', body: JSON.stringify({ address: '', cart_item_ids: items().map(i => i.id) }) })"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Cart.tsx' -Value $content -Encoding UTF8

# Fix Customize.tsx
Write-Host "Fixing Customize.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Customize.tsx' -Raw
$content = $content -replace "const data = await apiFetch<Product>\(`/products/`${params.id}`\)", "const data = await apiFetch<Product>(`/customize/templates/?product=${params.id}`)"
$content = $content -replace "/cart/items", "/customize/orders/"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Customize.tsx' -Value $content -Encoding UTF8

# Fix Member.tsx
Write-Host "Fixing Member.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Member.tsx' -Raw
$content = $content -replace "import { isAuthenticated, user, fetchProfile } from '../stores/auth';", "import { isAuthenticated, user, fetchProfile } from '../stores/auth';`nimport { apiFetch } from '../api/client';"
$content = $content -replace 'onMount\(\(\) => \{ if \(isAuthenticated\(\)\) fetchProfile\(\); \}\)', "onMount(async () => { if (isAuthenticated()) fetchProfile(); try { const t = await apiFetch<any[]>('/members/tasks/'); setTasks(t); } catch {} })"
$content = $content -replace '<button onClick=\(\) => setSignedIn\(true\) disabled=\{signedIn\(\)\}', "<button onClick={async () => { try { await apiFetch('/members/profiles/checkin/', { method: 'POST' }); setSignedIn(true); } catch { alert('签到失败'); } }} disabled={signedIn()}"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Member.tsx' -Value $content -Encoding UTF8

# Fix Campaigns.tsx
Write-Host "Fixing Campaigns.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Campaigns.tsx' -Raw
$content = $content -replace 'onMount\(\(\) => \{', "onMount(async () => { try { const c = await apiFetch<any[]>('/campaigns/campaigns/'); setCampaigns(c); } catch {} try { const g = await apiFetch<any[]>('/campaigns/group-buys/'); setGroupBuys(g); } catch {} "
$content = $content -replace 'const handleClaimCoupon = \(id: number\) => \{ setCoupons\(prev => prev\.map\(c => c\.id === id \? \{ \.\.\.c, claimed: true \} : c\)\); \}', "const handleClaimCoupon = async (id: number) => { try { await apiFetch(`/campaigns/coupons/${id}/claim/`, { method: 'POST' }); setCoupons(prev => prev.map(c => c.id === id ? { ...c, claimed: true } : c)); } catch { alert('领取失败'); } }"
$content = $content -replace '<button class="px-4 py-1\.5 rounded-lg text-sm text-white" style=\{\{ background: '"'"'var\(--color-primary\)'"'"' \}\}>{'"'"'参与拼团'"'"'}</button>', '<button onClick={async () => { try { await apiFetch(`/campaigns/group-buys/${g.id}/join/`, { method: '"'"'POST'"'"' }); alert('"'"'拼团成功'"'"'); } catch { alert('"'"'拼团失败'"'"'); } }} class="px-4 py-1.5 rounded-lg text-sm text-white" style={{ background: '"'"'var(--color-primary)'"'"' }}>{'"'"'参与拼团'"'"'}</button>'
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Campaigns.tsx' -Value $content -Encoding UTF8

# Fix Orders.tsx
Write-Host "Fixing Orders.tsx..."
$content = Get-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Orders.tsx' -Raw
$content = $content -replace "const data = await apiFetch<Order\[\]>('/orders')", "const data = await apiFetch<Order[]>('/orders/orders/')"
Set-Content 'f:\TraeProject\dogFood6\Project56\frontend\src\pages\Orders.tsx' -Value $content -Encoding UTF8

Write-Host "All files fixed successfully!"
