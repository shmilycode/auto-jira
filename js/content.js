let backgroundPort = chrome.runtime.connect({name: "content"});

function getDownloadUrl() {
  let downloadElem = $('a.link-attachment span:first')
  let len = downloadElem.length
  let result = null
  for (let index = 0; index < len; ++index) {
    let subElem = downloadElem[index]
    if (subElem.innerText == "下载") {
      result = subElem.parentNode.href
      console.log("找到你了")
      break;
    }
  }
  console.log(result)
  return result
}

function onBackgroundMessage(message) {
  switch(message) {
    case "download":
      let downloadUrl = getDownloadUrl();
      backgroundPort.postMessage(downloadUrl);
  }
}
backgroundPort.onMessage.addListener(onBackgroundMessage);