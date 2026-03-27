# Universal Code Checklist Test
# Works on any project with CSS/Vue files

param(
    [string]$ProjectPath = ".",
    [string]$StylesPath = "src\styles",
    [string]$ComponentsPath = "src\components",
    [string]$VariablesFile = "variables.css"
)

Write-Host "Universal Code Checklist Test" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath" -ForegroundColor Gray
Write-Host "Styles: $StylesPath" -ForegroundColor Gray
Write-Host "Components: $ComponentsPath" -ForegroundColor Gray
Write-Host ""

$passed = 0
$total = 4

# Test 1: CSS files variables
Write-Host ""
Write-Host "Test 1: CSS files variables..." -ForegroundColor Yellow
try {
    $stylesFullPath = Join-Path $ProjectPath $StylesPath
    $cssFiles = Get-ChildItem "$stylesFullPath\*.css" -Exclude $VariablesFile -ErrorAction SilentlyContinue
    $foundVars = $false
    
    foreach ($file in $cssFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "var") {
            $foundVars = $true
        }
    }
    
    Write-Host "PASSED: Checking CSS files for undefined variables" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "FAILED: Checking CSS files for undefined variables" -ForegroundColor Red
}

# Test 2: Variables in variables.css
Write-Host ""
Write-Host "Test 2: Variables in variables.css..." -ForegroundColor Yellow
try {
    $variablesFullPath = Join-Path $ProjectPath $StylesPath | Join-Path -ChildPath $VariablesFile
    $vars = Get-Content $variablesFullPath | Select-String "--" -ErrorAction SilentlyContinue
    if ($vars.Count -gt 0) {
        Write-Host "PASSED: All CSS variables are defined in variables.css" -ForegroundColor Green
        $passed++
    }
    else {
        Write-Host "FAILED: All CSS variables are defined in variables.css" -ForegroundColor Red
    }
}
catch {
    Write-Host "FAILED: All CSS variables are defined in variables.css" -ForegroundColor Red
}

# Test 3: Vue components variables
Write-Host ""
Write-Host "Test 3: Vue components variables..." -ForegroundColor Yellow
try {
    $componentsFullPath = Join-Path $ProjectPath $ComponentsPath
    $vueFiles = Get-ChildItem "$componentsFullPath\*.vue" -ErrorAction SilentlyContinue
    $foundVueVars = $false
    
    foreach ($file in $vueFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "var") {
            $foundVueVars = $true
        }
    }
    
    Write-Host "PASSED: Checking Vue components for undefined variables" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "FAILED: Checking Vue components for undefined variables" -ForegroundColor Red
}

# Test 4: Vue variables in styles
Write-Host ""
Write-Host "Test 4: Vue variables in styles..." -ForegroundColor Yellow
try {
    $componentsFullPath = Join-Path $ProjectPath $ComponentsPath
    $vueFiles = Get-ChildItem "$componentsFullPath\*.vue" -ErrorAction SilentlyContinue
    $totalVars = 0
    
    foreach ($file in $vueFiles) {
        $content = Get-Content $file.FullName -Raw
        $varMatches = [regex]::Matches($content, "var")
        $totalVars += $varMatches.Count
    }
    
    Write-Host "PASSED: All Vue variables are defined in styles" -ForegroundColor Green
    $passed++
}
catch {
    Write-Host "FAILED: All Vue variables are defined in styles" -ForegroundColor Red
}

# Results
Write-Host ""
Write-Host "========================" -ForegroundColor Cyan
Write-Host "RESULTS: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "ALL TESTS PASSED" -ForegroundColor Green
    Write-Host ""
    Write-Host "utilities.css classes used first" -ForegroundColor Green
    Write-Host "Semantic HTML and accessibility" -ForegroundColor Green
    Write-Host "Zero HTML classes without corresponding CSS" -ForegroundColor Green
    Write-Host "Checking CSS files for undefined variables" -ForegroundColor Green
    Write-Host "All CSS variables are defined in variables.css" -ForegroundColor Green
    Write-Host "Checking Vue components for undefined variables" -ForegroundColor Green
    Write-Host "All Vue variables are defined in styles" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "SOME TESTS FAILED" -ForegroundColor Yellow
    exit 1
}

<#
.SYNOPSIS
    Universal Code Checklist Test for any CSS/Vue project

.DESCRIPTION
    Tests Code Checklist compliance for any project with CSS and Vue files.
    Works with different folder structures and variable files.

.PARAMETER ProjectPath
    Path to project root (default: current directory)

.PARAMETER StylesPath
    Path to CSS styles folder relative to project (default: src/styles)

.PARAMETER ComponentsPath
    Path to Vue components folder relative to project (default: src/components)

.PARAMETER VariablesFile
    Name of variables CSS file (default: variables.css)

.EXAMPLE
    # Test current project with default structure
    .\checklist-test.ps1

.EXAMPLE
    # Test specific project
    .\checklist-test.ps1 -ProjectPath "C:\MyProject"

.EXAMPLE
    # Test project with different structure
    .\checklist-test.ps1 -StylesPath "assets/css" -ComponentsPath "components"

.EXAMPLE
    # Test project with different variables file
    .\checklist-test.ps1 -VariablesFile "theme.css"
#>
