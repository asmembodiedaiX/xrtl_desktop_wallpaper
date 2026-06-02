import { BrowserWindow, screen, app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { exec, execSync } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

let wallpaperWindow: BrowserWindow | null = null
let currentWallpaperUrl: string | null = null
let dwmThumbnailId: string | null = null

// ============================================================
// HWND 小端序 → hex
// ============================================================
function hwndBufToHex(buf: Buffer): string {
  if (buf.length >= 8) return '0x' + buf.readBigUInt64LE(0).toString(16)
  return '0x' + buf.readUInt32LE(0).toString(16)
}

// ============================================================
// ★ DWM Thumbnail 策略（Win11 24H2 首选）
//
// 不改变窗口父级，而是用 DwmRegisterThumbnail 将
// Electron 窗口内容"投影"到壁纸 WorkerW 上。
// DWM 合成器自动处理 z-order，图标始终在上层。
// ============================================================
async function embedViaDwmThumbnail(
  hwndHex: string,
  sw: number,
  sh: number
): Promise<boolean> {
  const tmp = app.getPath('temp')
  const psFile = path.join(tmp, 'xrtl-dwm.ps1')

  const script = `
$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
public struct RECT_L { public int L,T,R,B; }

[StructLayout(LayoutKind.Sequential)]
public struct DWM_TNP {
    public int dwFlags;
    public RECT_L rcDest;
    public RECT_L rcSrc;
    public byte opacity;
    public bool fVisible;
    public bool fSourceClientAreaOnly;
}

public class DW {
    [DllImport("dwmapi.dll")]
    public static extern int DwmRegisterThumbnail(IntPtr dest, IntPtr src, out IntPtr id);
    [DllImport("dwmapi.dll")]
    public static extern int DwmUpdateThumbnailProperties(IntPtr id, ref DWM_TNP props);
    [DllImport("dwmapi.dll")]
    public static extern int DwmUnregisterThumbnail(IntPtr id);

    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string c, string w);
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindowEx(IntPtr p, IntPtr a, string c, string w);
    [DllImport("user32.dll")]
    public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr h, int c);
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr h, IntPtr ha, int x, int y, int cx, int cy, uint f);
    [DllImport("user32.dll")]
    public static extern bool GetWindowRect(IntPtr h, out RECT_L r);
}
"@

$ourHwnd = [IntPtr]::new(${hwndHex})
$SW_SHOW = 5

# --- 找到目标 WorkerW ---
$pg = [DW]::FindWindow("Progman", "Program Manager")
if ($pg -eq [IntPtr]::Zero) {
    [Console]::WriteLine("Progman not found")
    exit 2
}

$dest = [IntPtr]::Zero
$ch = [DW]::FindWindowEx($pg, [IntPtr]::Zero, "WorkerW", $null)
while ($ch -ne [IntPtr]::Zero) {
    $dv = [DW]::FindWindowEx($ch, [IntPtr]::Zero, "SHELLDLL_DefView", $null)
    $hasDV = ($dv -ne [IntPtr]::Zero)
    [Console]::WriteLine("WorkerW: $ch hasDefView=$hasDV visible=$([DW]::IsWindowVisible($ch))")
    if (-not $hasDV -and $dest -eq [IntPtr]::Zero) { $dest = $ch }
    $ch = [DW]::FindWindowEx($pg, $ch, "WorkerW", $null)
}

if ($dest -eq [IntPtr]::Zero) {
    [Console]::WriteLine("No WorkerW, using Progman as dest")
    $dest = $pg
}

# 确保目标窗口可见
if (-not [DW]::IsWindowVisible($dest)) {
    [DW]::ShowWindow($dest, $SW_SHOW) | Out-Null
    Start-Sleep -m 200
}

$r = New-Object RECT_L
[DW]::GetWindowRect($dest, [ref]$r)
[Console]::WriteLine("Dest rect: ($($r.L),$($r.T))-($($r.R),$($r.B))")

# --- 注册 DWM Thumbnail ---
$tid = [IntPtr]::Zero
$hr = [DW]::DwmRegisterThumbnail($dest, $ourHwnd, [ref]$tid)
[Console]::WriteLine("DwmRegisterThumbnail hr=0x{0:X8} tid=$tid" -f $hr)
if ($hr -ne 0) { exit 1 }

# --- 第一阶段：先隐藏 thumbnail，等首帧渲染完再显示 ---
# 参考 VSCode ready-to-show 的思路：先隐藏内容，渲染就绪后再展示
$props1 = New-Object DWM_TNP
$props1.dwFlags = 0x1 -bor 0x2 -bor 0x4 -bor 0x10
$props1.rcDest = New-Object RECT_L
$props1.rcDest.L = 0; $props1.rcDest.T = 0
$props1.rcDest.R = ${sw}; $props1.rcDest.B = ${sh}
$props1.rcSrc = New-Object RECT_L
$props1.rcSrc.L = 0; $props1.rcSrc.T = 0
$props1.rcSrc.R = ${sw}; $props1.rcSrc.B = ${sh}
$props1.opacity = 255
$props1.fVisible = $false            # ★ 先隐藏
$props1.fSourceClientAreaOnly = $false

$hr = [DW]::DwmUpdateThumbnailProperties($tid, [ref]$props1)
[Console]::WriteLine("DwmUpdate phase1 (hidden) hr=0x{0:X8}" -f $hr)
if ($hr -ne 0) { [DW]::DwmUnregisterThumbnail($tid) | Out-Null; exit 1 }

# 等待源窗口渲染首帧
Start-Sleep -Milliseconds 500

# --- 第二阶段：显示 thumbnail ---
# 此时源窗口已经渲染至少 500ms，thumbnail 不会出现白屏
$props2 = New-Object DWM_TNP
$props2.dwFlags = 0x10                  # 仅更新 VISIBLE
$props2.fVisible = $true                # ★ 现在显示
$props2.fSourceClientAreaOnly = $false

$hr = [DW]::DwmUpdateThumbnailProperties($tid, [ref]$props2)
[Console]::WriteLine("DwmUpdate phase2 (visible) hr=0x{0:X8}" -f $hr)

# --- 把源窗口挪到屏幕外（保持可见以维持 DWM 渲染） ---
[DW]::SetWindowPos($ourHwnd, [IntPtr]::Zero, -${sw}, -${sh}, ${sw}, ${sh}, 0x0010) | Out-Null
[Console]::WriteLine("Source window moved off-screen")

# 成功：输出 thumbnail ID
[Console]::WriteLine("DWM_OK:$tid")
exit 0
`

  try {
    fs.writeFileSync(psFile, script, 'utf8')
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`,
      { timeout: 15000 }
    )

    console.log(stdout)
    if (stderr) console.log('stderr:', stderr.trim())

    // 提取 thumbnail ID
    const m = stdout.match(/DWM_OK:(\d+)/)
    if (m) {
      dwmThumbnailId = m[1]
      return true
    }
    return false
  } catch (e: any) {
    console.log('FAILED:', e?.stderr?.trim() ?? e?.message ?? '')
    return false
  } finally {
    try { fs.unlinkSync(psFile) } catch { /* */ }
  }
}

// ============================================================
// SetParent 策略（旧版 Windows 兜底）
// ============================================================
async function embedViaSetParent(
  hwndHex: string, sw: number, sh: number
): Promise<boolean> {
  const tmp = app.getPath('temp')
  const psFile = path.join(tmp, 'xrtl-sp.ps1')

  const script = `
$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public class WP {
[DllImport("user32.dll")]public static extern IntPtr FindWindow(string c,string w);
[DllImport("user32.dll")]public static extern IntPtr FindWindowEx(IntPtr p,IntPtr a,string c,string w);
[DllImport("user32.dll")]public static extern IntPtr SetParent(IntPtr c,IntPtr p);
[DllImport("user32.dll")]public static extern bool SetWindowPos(IntPtr h,IntPtr ha,int x,int y,int cx,int cy,uint f);
[DllImport("user32.dll")]public static extern bool MoveWindow(IntPtr h,int x,int y,int w,int h2,bool r);
[DllImport("user32.dll")]public static extern bool ShowWindow(IntPtr h,int c);
[DllImport("user32.dll")]public static extern bool IsWindowVisible(IntPtr h);
}
"@
if (-not ([WP]::FindWindow)) { exit 99 }

$our=[IntPtr]::new(${hwndHex})
$N=0x0010;$SW=0x0040;$S=5;$BB=[IntPtr]::new(1)

$pg=[WP]::FindWindow("Progman","Program Manager")
if ($pg -eq [IntPtr]::Zero) { exit 2 }

# 找壁纸 WorkerW
$ww=[IntPtr]::Zero
$ch=[WP]::FindWindowEx($pg,[IntPtr]::Zero,"WorkerW",$null)
while ($ch -ne [IntPtr]::Zero) {
  $dv=[WP]::FindWindowEx($ch,[IntPtr]::Zero,"SHELLDLL_DefView",$null)
  if ($dv -eq [IntPtr]::Zero -and $ww -eq [IntPtr]::Zero) { $ww=$ch }
  $ch=[WP]::FindWindowEx($pg,$ch,"WorkerW",$null)
}
if ($ww -eq [IntPtr]::Zero) { exit 1 }

if (-not [WP]::IsWindowVisible($ww)) { [WP]::ShowWindow($ww,$S)|Out-Null; Start-Sleep -m 100 }

[WP]::SetParent($our,$ww)|Out-Null
[WP]::MoveWindow($our,0,0,${sw},${sh},$true)|Out-Null
[WP]::SetWindowPos($our,$BB,0,0,${sw},${sh},$N-bor$SW)|Out-Null
[WP]::ShowWindow($our,$S)|Out-Null
exit 0
`

  try {
    fs.writeFileSync(psFile, script, 'utf8')
    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`,
      { timeout: 15000 }
    )
    if (stdout) console.log(stdout.trim())
    if (stderr) console.log('stderr:', stderr.trim())
    return true
  } catch (e: any) {
    console.log('FAILED:', e?.stderr?.trim() ?? e?.message ?? '')
    return false
  } finally {
    try { fs.unlinkSync(psFile) } catch { /* */ }
  }
}

// ============================================================
// 导出
// ============================================================

export async function setDynamicWallpaper(htmlPath: string) {
  try {
    await closeDynamicWallpaper()

    const { width, height } = screen.getPrimaryDisplay().bounds

    let resolvedPath = ''
    if (htmlPath.startsWith('dynamic_pages/')) {
      const appPath = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.dirname(path.dirname(__dirname))
      resolvedPath = path.join(appPath, 'public', htmlPath)
    } else if (htmlPath.startsWith('builtin_pictures/')) {
      const appPath = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.dirname(path.dirname(__dirname))
      resolvedPath = path.join(appPath, 'public', htmlPath)
    } else if (htmlPath.startsWith('file:///')) {
      resolvedPath = htmlPath.replace(/^file:\/\/\//, '')
    } else {
      const d = path.join(app.getPath('userData'), 'wallpapers')
      resolvedPath = path.join(d, htmlPath)
      if (!fs.existsSync(resolvedPath)) resolvedPath = htmlPath
    }

    console.log('[DW] Path:', resolvedPath)

    // 判断是否为视频文件
    const videoExts = ['.mp4', '.webm', '.mkv', '.avi', '.mov']
    const isVideo = videoExts.includes(path.extname(resolvedPath).toLowerCase())

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`)
    }

    // 获取主显示器边界，计算安全的屏幕外位置
    const display = screen.getPrimaryDisplay()
    const offX = display.bounds.x - width   // 显示器左侧之外
    const offY = display.bounds.y - height  // 显示器上方之外

    // 创建源窗口 — 直接放在屏幕外，用户看不到
    // show:true 保证 Chromium 持续渲染 → DWM Thumbnail 实时更新
    wallpaperWindow = new BrowserWindow({
      width, height,
      x: offX,
      y: offY,
      frame: false,
      transparent: false,
      backgroundColor: '#000000',
      alwaysOnTop: false,
      skipTaskbar: true,
      resizable: false,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        backgroundThrottling: false,
      },
    })

    wallpaperWindow.setFocusable(false)      // 永不获取焦点，不会被 Alt+Tab 唤起
    wallpaperWindow.setIgnoreMouseEvents(true)

    if (isVideo) {
      // === 视频文件：加载 video player 页面，注入视频源 ===
      const appPath = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.dirname(path.dirname(__dirname))
      const playerPath = path.join(appPath, 'public', 'dynamic_pages', 'video_player.html')

      console.log('[DW] Video player path:', playerPath)
      await wallpaperWindow.loadFile(playerPath)

      // 使用 local-file 协议加载视频
      const videoUrl = `local-file:///${resolvedPath.replace(/\\/g, '/')}`
      console.log('[DW] Video URL:', videoUrl)
      await wallpaperWindow.webContents.executeJavaScript(`
        (function() {
          var v = document.getElementById('v');
          v.src = '${videoUrl}';
        })()
      `)
      console.log('[DW] Video source injected')
    } else {
      await wallpaperWindow.loadFile(resolvedPath)
    }
    console.log('[DW] Content loaded')

    // 短暂等待首帧渲染
    await new Promise(r => setTimeout(r, 300))

    const buf = wallpaperWindow.getNativeWindowHandle()
    const hwndHex = hwndBufToHex(buf)
    console.log('[DW] HWND:', hwndHex)

    // ★ DWM Thumbnail（Win11 24H2 首选）
    console.log('[DW] Trying DWM Thumbnail...')
    let ok = await embedViaDwmThumbnail(hwndHex, width, height)

    if (!ok) {
      // 兜底：SetParent
      console.log('[DW] Trying SetParent fallback...')
      ok = await embedViaSetParent(hwndHex, width, height)
    }

    if (ok) {
      console.log('[DW] ✅ Done')
    } else {
      wallpaperWindow.close()
      wallpaperWindow = null
      return { success: false, error: 'Embedding failed. See console.' }
    }

    currentWallpaperUrl = htmlPath
    return { success: true }
  } catch (error) {
    console.error('[DW] Error:', error)
    if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
      wallpaperWindow.close(); wallpaperWindow = null
    }
    return { success: false, error: (error as Error).message }
  }
}

export async function closeDynamicWallpaper() {
  // 清理 DWM Thumbnail
  if (dwmThumbnailId) {
    try {
      execSync(
        `powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -TypeDefinition 'using System;using System.Runtime.InteropServices;public class D{[DllImport(\"dwmapi.dll\")]public static extern int DwmUnregisterThumbnail(IntPtr id);}';[D]::DwmUnregisterThumbnail([IntPtr]::new(${dwmThumbnailId}))|Out-Null"`,
        { timeout: 5000 }
      )
    } catch { /* */ }
    dwmThumbnailId = null
  }

  if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
    wallpaperWindow.close()
    wallpaperWindow = null
  }
  currentWallpaperUrl = null
  return { success: true }
}

export async function getCurrentWallpaper() {
  return { currentUrl: currentWallpaperUrl }
}
