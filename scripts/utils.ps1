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

function EnablePortForwarding() {
  Write-Output("Use CTRL + C to exit ")
  Write-Output("Use kubectl get pods -n oe-tps-product-order to update your pod name ")
  gcloud container clusters get-credentials private-yul-np-001 --region northamerica-northeast1 --project cio-gke-private-yul-001-9ed5d0
  kubectl port-forward -n oe-tps-product-order $(kubectl get pod --namespace oe-tps-product-order --selector="app=cdo-tps-offnet-tmf620-np" --output jsonpath='{.items[0].metadata.name}') 8081:3000
}

<#function MySQLPortForwarding() {
  Write-Output("Use CTRL + C to exit ")
  Write-Output("Make sure port 3306 is not begin used by other application ")
  gcloud container clusters get-credentials private-yul-np-001 --region northamerica-northeast1 --project cio-gke-private-yul-001-9ed5d0
  kubectl port-forward -n ordermgmt-svc-qualification $(kubectl get pod --namespace ordermgmt-svc-qualification --selector="app=cio-svc-qualification-api-dv" --output jsonpath='{.items[0].metadata.name}') 3306:3306
}#>

function EnablePortForwardingPartner() {
  Write-Output("Use CTRL + C to exit ")
  Write-Output("Use kubectl get pods -n oe-tps-product-order to update your pod name ")
  gcloud container clusters get-credentials private-yul-np-001 --region northamerica-northeast1 --project cio-gke-private-yul-001-9ed5d0
  kubectl port-forward -n oe-tps-product-order $(kubectl get pod --namespace oe-tps-product-order --selector="app=cdo-tps-offnet-tmf632-np" --output jsonpath='{.items[0].metadata.name}') 3002:3000
}

function SelectOperation {
  param (
    $selectedOption
  )
  switch ($selectedOption) {
    1 { SetDevEnvironment }
    2 { SetProxy }
    3 { EnablePortForwarding }
    4 { EnablePortForwardingPartner }
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
    Write-Output("| 3 - Enable Port Forwarding for TMF-620        |")
    Write-Output("| 4 - Enable  Port-Forwarding TMF-632           |")
    Write-Output("| 0 - Exit                                      |")
    Write-Output("=================================================")
    $option = Read-Host "Please enter one option "
    SelectOperation($option)
  }
}

Menu
  
  