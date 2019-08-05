$.WQLog = {
  LogHead: "****Log from Extension-> ",
  PError: function(log)
  {
    console.log(this.LogHead + "Error: " + log);
  },
  PWarn: function(log)
  {
    console.log(this.LogHead + "Warn: " + log);
  },
  PMention: function(log)
  {
    console.log(this.LogHead + "Mention: " + log);
  },
};

$.port = chrome.runtime.connect({name: "autorun"});

$.autorun = {
testItemId: "action_id_61",
editIssueId: "edit-issue",
dateItemId: "duedate",
moreItemId: "opsbar-operations_more",

setDuedate:function(options){
  var requestContent = {
        timeout: 1000,
        url: options.url,
        type: "POST",
    beforeSend: function(xhr){
      for(opt in options.requestHeader)
      {
        xhr.setRequestHeader(opt, options.requestHeader[opt]);
      }
    },
        data:{
      "duedate": options.duedate,
      "issueId": options.issueId,
      "atl_token": options.atl_token,
      "singleFieldEdit": options.singleField,
      "fieldsToForcePresent": options.filedsToForcePresent,
    },
        success: function(data){
      $.WQLog.PMention("duedate request success!");
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
      $.WQLog.PError(XMLHttpRequest.status);
      $.WQLog.PError(XMLHttpRequest.readyState);
      $.WQLog.PError(textStatus);
        }
  };
  $.ajax(requestContent);
},

setCompleteDate:function(options){
  var requestContent = {
        timeout: 1000,
        url: options.url,
        type: "POST",
    beforeSend: function(xhr){
      for(opt in options.requestHeader)
      {
        xhr.setRequestHeader(opt, options.requestHeader[opt]);
      }
    },
        data:{
      "customfield_11321": options.duedate,
      "issueId": options.issueId,
      "atl_token": options.atl_token,
      "singleFieldEdit": options.singleField,
      "fieldsToForcePresent": options.filedsToForcePresent,
    },
        success: function(data){
      $.WQLog.PMention("complete date request success!");
        },
        error:function(XMLHttpRequest, textStatus, errorThrown){
      $.WQLog.PError(XMLHttpRequest.status);
      $.WQLog.PError(XMLHttpRequest.readyState);
      $.WQLog.PError(textStatus);
        }
  };
  $.ajax(requestContent);
},

listenTurnText:function(){
  var moreIssue = $("#"+ this.moreItemId);
  moreIssue.click(function(){
    $.port.postMessage({option: "set_duedate"});
  });
},

turnTextCB: function()
{
},

buildConnect: function()
{
  if($.port)
  {
    $.port.onMessage.addListener($.autorun.responseHandle);
  }
  else
  {
    $.WQLog.PError("Can't connect with background!");
  }
},

responseHandle: function(rep)
{
  //$.autorun.setCurrentDate();
  switch(rep.option)
  {
  case "set_duedate":
    $.autorun.setDuedate(rep.value);
    break;
  case "set_complete_date":
    $.autorun.setCompleteDate(rep.value);
    break;
  case "reload":
    document.location.reload();
    break;
  case "hello":
    var data = {
        "fields":{
          "project":
          {
            "key": "SWZP"
          },
          "summary": "[walle] test again",
          "issuetype": {
            "id": "3"
          },
          "assignee": {
            "name": "chenweiqi"
          },
          "components": [
            {
              "id":"25702"
            }
          ],
          "customfield_13206": {
            "id": "14697"
          },
          "customfield_13207": {
            "id": "14704"
          }
        }
      };

    var requestContent = {
           timeout: 1000,
           url: "https://jira.cvte.com/rest/api/2/issue/",
           type: "POST",
      beforeSend: function(xhr){
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: JSON.stringify(data),
      success: function(data){
        $.WQLog.PMention("complete date request success!");
      },
      error:function(XMLHttpRequest, textStatus, errorThrown){
        $.WQLog.PError(XMLHttpRequest.status);
        $.WQLog.PError(XMLHttpRequest.readyState);
        $.WQLog.PError(XMLHttpRequest.responseText);
      }
    };
    $.ajax(requestContent);
    console.log("2342");
  default:
    break;
  }
},

getMetaUserName: function()
{
  var metaItem = $("meta[name=ajs-remote-user]");
  return metaItem.attr("content");
},

initialize: function()
{
  /*
  $.ajax({
  url: "test.php",
  success: function(data)
  {
    this.data.test_item = testId;
    this.data.date_item = dateId;
  },
  error: function()
  {
    $.WQLog.PError("Can't post data from server!!!");
  },
  complete: function()
  {
    $.WQLog.PMention("Post data complete!!!");
  }
  });
  */
  this.buildConnect();
  var userName = {username: this.getMetaUserName()};
  $.WQLog.PMention(userName.username);
  $.port.postMessage({option: "set_username", value: userName});
}
};
$.autorun.initialize();

/*
document.getElementById("status-val").onmousedown = function(e){
  message = {
    option: "set_duedate",
    value: {
      url: "https://jira.cvte.com/secure/AjaxIssueAction.jspa?decorator=none",
      requestHeader: {"X-AUSERNAME": "chenweiqi",
              "X-SITEMESH-OFF": true},
              duedate: "27/八月/17",
              issueId: 190264,
              atl_token: "B454-MW68-DZCN-LCWB|24dbdab35a11ea7e08d52faa04f8e6c551fea128|lin",
              singleField: true,
              filedsToForcePresent: "duedate",
        },
  };
  $.autorun.setDuedate(message.value);
  alert("weiqi");
  return false;
};
*/

//$.autorun.listenTurnText();
