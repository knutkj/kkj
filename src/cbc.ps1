#
# Cleaning...
#
Remove-Item -Path .\cbc*.nupkg
Remove-Item -Path .\cbc*min.js, .\cbc.js

#
# Init...
#
Add-Type -Path .\packages\AjaxMin.4.44.4396.18853\lib\net20\AjaxMin.dll
$minifier = New-Object -TypeName Microsoft.Ajax.Utilities.Minifier

#
# Creating combined files...
#
"" | Out-File -FilePath cbc.js
"" | Out-File -FilePath cbc.min.js

"cbc.ns", "cbc.assert", "cbc.parse", "cbc.contract" |
    ForEach-Object {

        #
        # Minifying...
        #
        $sourceCode = Get-Content -Path ($_ + ".js") |
            Out-String
        $minifier.MinifyJavaScript($sourceCode) |
            Out-File -FilePath ($_ + ".min.js")
       
        #
        # Combining...
        #
        Get-Content -Path ($_ + ".js") |
            Where-Object { $_ -notmatch '^\s*///\s*<reference' } |
            Out-File -Append cbc.js
    }

#
# Minifying combined...
#
$sourceCode = Get-Content -Path cbc.js | Out-String
$minifier.MinifyJavaScript($sourceCode) |
    Out-File -FilePath cbc.min.js

#
# Creating NuGet package
#
.\packages\NuGet.CommandLine.1.6.0\tools\NuGet.exe pack .\cbc.nuspec

#
# Cleaning...
#
#Remove-Item -Path .\cbc*min.js, .\cbc.js