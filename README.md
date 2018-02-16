# CloudShell-Browser-Extension

This is a simple chrome extension that let's you see your running sandboxes for a [CloudShell](https://www.quali.com/) install.

Permissions are set to need permissions "for every site" because the extension doesn't know the address of your CloudShell server ahead of time. Once I know how to solve this, I will restrict it further.

[However the source code is open source so feel free to browse it if you are concerned](https://github.com/graboskyc/CloudShell-Browser-Extension).

The info the extension needs is as follows:
* Username - username to CloudShell
* Password - password to CloudShell
* Domain - the domain within CloudShell that you want to show active sandboxes in
* API URI - the CloudShell REST API endpoint (get this from your administrator) - no trailing slash but starts with http:// or https://
* Portal URI - the address of your CloudShell portal you log into - no trailing slash but starts with http:// or https://