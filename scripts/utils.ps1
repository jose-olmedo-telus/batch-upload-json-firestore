function SetDevEnvironment() {

  $env:DB_SYNC            = "true"
  $env:NODE_ENV           = "dv"
  $env:PROJECT_ID         = "datafusion-test-ds-np"
  $env:SERVICE_ACCOUNT    = "./datafusion-test-ds-np-e72ddc502f83.json"
  Write-Output("Environment Variables Required for development set.")
  Menu
}

function SetProxy() {
  $telusProxy = "http://pac.tsl.telus.com:8080"
  $env:http_proxy = $telusProxy
  $env:https_proxy = $telusProxy
  $env:no_proxy = "localhost,.tsl.telus.com"
  Write-Output("Proxy set to: " + $telusProxy);
  Menu
}

function SelectOperation {
  param (
    $selectedOption
  )
  switch ($selectedOption) {
    1 { SetDevEnvironment }
    2 { SetProxy }
    Default {
      Write-Output("Bye. ")
    }
  }
}
function Menu() {
  $option = -1
  while ($option -lt 0) {
    Write-Output("=================================================")
    Write-Output("| Off-Net Access Procurement TMF 645 - Utils    |")
    Write-Output("=================================================")
    Write-Output("| Menu                                          |")
    Write-Output("=================================================")
    Write-Output("| 1 - Setup Development Environment Variables   |")
    Write-Output("| 2 - Enable proxy for terminal                 |")
    Write-Output("| 0 - Exit                                      |")
    Write-Output("=================================================")
    $option = Read-Host "Please enter one option "
    SelectOperation($option)
  }
}

Menu
  
  