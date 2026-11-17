# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
# Windows adapter for this repository's Makefile targets.
# Run: powershell -NoProfile -File make.ps1 <target> [module-directory]
param(
    [Parameter(Position=0)][string]$Target = 'build',
    [Parameter(Position=1)][string]$Module = '.',
    [Parameter(ValueFromRemainingArguments=$true)][string[]]$MakeArgs
)
$ErrorActionPreference = 'Stop'
$modulePath = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot $Module)).Path
$rootPath = (Resolve-Path -LiteralPath $PSScriptRoot).Path
if ($modulePath -ne $rootPath -and -not $modulePath.StartsWith($rootPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'The module directory must be inside this repository.'
}
if (-not (Test-Path -LiteralPath (Join-Path $modulePath 'Makefile') -PathType Leaf)) {
    throw "No owning Makefile in $modulePath"
}
$bash = 'C:/Progra~1/Git/bin/bash.exe'
if (-not (Test-Path -LiteralPath $bash -PathType Leaf)) { throw 'Install Git for Windows to run the Makefile shell recipes.' }
$make = (Get-Command make.exe -ErrorAction Stop).Source
$env:PATH = 'C:/Progra~1/Git/usr/bin;C:/Progra~1/Git/bin;' + $env:PATH
if ($env:WIPPY_BIN) {
    $wippyPath = (Resolve-Path -LiteralPath $env:WIPPY_BIN -ErrorAction Stop).Path
    $env:PATH = (Split-Path -Parent $wippyPath) + ';' + $env:PATH
}
# An explicit shell keeps native Windows make from falling back to cmd.exe.
# Make itself preserves each target's prerequisites, working folder and exit code.
& $make -C $modulePath "SHELL=$bash" $Target @MakeArgs
exit $LASTEXITCODE
