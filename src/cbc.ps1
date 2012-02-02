Remove-Item -Path .\cbc*.nupkg
Copy-Item -Path .\cbc.assert.js -Destination .\cbc.js
$sourceCode = Get-Content -Path .\cbc.assert.js | Out-String
Add-Type -Path .\packages\AjaxMin.4.44.4396.18853\lib\net20\AjaxMin.dll
$minifier = New-Object -TypeName Microsoft.Ajax.Utilities.Minifier
$minifier.MinifyJavaScript($sourceCode) |
    Out-File -FilePath cbc.min.js
Copy-Item -Path .\cbc.min.js -Destination .\cbc.assert.min.js
NuGet.exe pack .\cbc.nuspec
Remove-Item -Path .\cbc*min.js, .\cbc.js