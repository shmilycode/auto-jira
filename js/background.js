class PortManager {
  constructor() {
    this.autoRunPortList = {}
  }

  addPort(tab_id, new_port) {
    if(new_port)
    {
      this.autoRunPortList[tab_id] = new_port;
      console.log("Add port: "+tab_id+"  --> "+new_port);
    }
  }

  getPort(tab_id){
    return this.autoRunPortList[tab_id];
  }

  deletePort (tabid){
    delete this.autoRunPortList[tabid];
  }

  notifyCurrentTabPort(message){
    const pm = new Promise((resolve, reject) => {
      chrome.tabs.query({active: true}, (tabs)=>{
        if (tabs.length && (tabs[0].id in this.autoRunPortList)) {
          let currentTabId = tabs[0].id
          this.autoRunPortList[currentTabId].postMessage(message)
          resolve(currentTabId)
        } else {
          reject("can't find active tab");
        }
      })
    })
    return pm
  }
}

let portManager = new PortManager()
let popupPort = null
chrome.runtime.onConnect.addListener((port)=>{
  if(port.name == "content") {
    console.log("Content port is connected!");
    portManager.addPort(port.sender.tab.id, port)
    port.onMessage.addListener((message)=>{
      if (message) {
        chrome.runtime.sendMessage({status: true, data: message}, (response)=>{
          console.log("Popup response  "+message)
        })
      } else {
        chrome.runtime.sendMessage({status: false}, (response)=>{
          console.log("Popup response  "+message)
        })
      }
    });
    port.onDisconnect.addListener((port)=>{
      portManager.deletePort(port.sender.tab.id)
    })
  }
  else if(port.name == "popup") {
    console.log("PopupRun port is connected!")
    popupPort = port
    popupPort.onMessage.addListener((message)=>{
    });
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
	if(message == 'download')
	{
    portManager.notifyCurrentTabPort(message)
      .then((tabid)=>{
        console.log("notify "+tabid)
      })
      .catch((error)=>{
        chrome.runtime.sendMessage({status: false}, (response)=>{
          console.log("Popup response  "+message)
        })
      })
    sendResponse("OK")
	}
});