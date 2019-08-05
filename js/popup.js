let jiraApi = {
  project: {api: "/rest/api/2/project", type: "GET"},
  issuetype: {api: "/rest/api/2/issuetype", type: "GET"},
  components: {api: "/rest/api/2/component/", type: "GET"},
  issue: {api: "/rest/api/2/issue/", type: "POST"},
  customFieldOption: {api: "/rest/api/2/customFieldOption/", type: "GET"}
}

let jiraHost = "https://jira.cvte.com"

class JiraRequestManager {
  requestData(api, type, data, success, error)  {
    var requestContent = {
           timeout: 1000,
           url: api,
           type: type,
      beforeSend: function(xhr){
        xhr.setRequestHeader("Content-Type", "application/json");
      },
      data: data,
      success: function(data){
        success(data);
      },
      error:function(XMLHttpRequest, textStatus, errorThrown){
        error(XMLHttpRequest);
      }
    };
    $.ajax(requestContent);
  }

}

class FormView {
  constructor() {
    this.observers = new Array()
    $('#createIssue').on('click', (event)=>{
      componentsArray = getComponentsArray();
      let pars = {project: $('#project'), issueType: $('#issueType'),
                  summary: $('#summary'), components: componentsArray,
                  resumeType: $('#resumeType'), resumeSource: $('#resumeSource'),
                  assignee: $('#assignee')}
      this.observers.forEach((item, index, array) =>{
        item.onCreateIssueClick(pars);
      })
    })
  }

  addListener(observer) {
    this.observers.push(observer)
  }

  updateProjectList(projectList) {
    let len = projectList.length
    $('#projectList').empty();
    for(let index = 0; index < len; index++){
      $('#projectList').append('<a class="dropdown-item" href="#">'+projectList[index].name+'</a>');
    }
  }

  updateIssueTypeList(issueTypeList) {
    let len = issueTypeList.length
    $('#issueTypeList').empty();
    for(let index = 0; index < len; index++){
      $('#issueTypeList').append('<a class="dropdown-item" href="#">'+issueTypeList[index].name+'</a>');
    }
  }

  updateComponentsList(componentsList) {
    let len = componentsList.length
    $('#componentsList').empty();
    for(let index = 0; index < len; index++){
      $('#componentsList').append('<a class="dropdown-item" href="#">'+componentsList[index].name+'</a>');
    }
  }

  updateResumeTypeList(resumeTypeList) {
    let len = resumeTypeList.length
    $('#resumeTypeList').empty();
    for(let index = 0; index < len; index++){
      $('#resumeTypeList').append('<a class="dropdown-item" href="#">'+resumeTypeList[index].name+'</a>');
    }
  }

  updateResumeSourceList(resumeSourceList) {
    let len = resumeSourceList.length
    $('#resumeSourceList').empty();
    for(let index = 0; index < len; index++){
      $('#resumeSourceList').append('<a class="dropdown-item" href="#">'+resumeSourceList[index].name+'</a>');
    }
  }
}

class FormController {
  constructor(formModel, formView) {
    this.formModel = formModel
    this.formView = formView
    this.formModel.getProjects()
      .then((data)=>{
        this.projectList = data
        this.formView.updateProjectList(data)
      })
    this.formModel.getIssueType()
      .then((data)=>{
        this.issueTypeList = data
        this.formView.updateIssueTypeList(data)
      })
    this.formModel.getResumeType()
      .then((data)=>{
        this.resumeTypeList = data
        this.formView.updateResumeTypeList(data)
      })
    this.formModel.getResumeSource()
      .then((data)=>{
        this.resumeSourceList = data
        this.formView.updateResumeSourceList(data)
      })
  }

  getProjectKey(projectName) {

  }

  getIssueTypeId(projectName) {

  }

  getComponentsIdArray(componentsArray) {

  }

  getResumeTypeId(resumeType) {

  }

  getResumeSourceId(resumeSource) {

  }

  onCreateIssueClick(pars){
    projectKey = getProjectKey(pars.project)
    issueTypeId = getIssueTypeId(pars.issueType)
    componentsIdArray = getComponentsIdArray(pars.components)
    resumeTypeId = getResumeTypeId(pars.resumeType)
    resumeSourceId = getResumeSourceId(pars.resumeSource)
    let requestData = {
      "fields":{
        "project":
        {
          "key": proejectKey
        },
        "summary": pars.summary,
        "issuetype": {
          "id": issueTypeId
        },
        "assignee": {
          "name": pars.assignee
        },
        "components": componentsIdArray,
        "customfield_13206": {
          "id": resumeTypeId
        },
        "customfield_13207": {
          "id": resumeSourceId
        }
      }
    };
    this.formModel.submitCreateIssue(requestData)
      .then((response)=>{
      })
      .catch((error)=>{
      })
  }

}

class FormModel {
  constructor() {
    this.jiraRequestManager = new JiraRequestManager();
  }

  getProjects() {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.project.api, 
        jiraApi.project.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getIssueType() {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.issuetype.api, 
        jiraApi.issuetype.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getComponent(projectId) {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.components.api+'/'+projectId, 
        jiraApi.components.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getResumeType() {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.customFieldOption.api+'/13206', 
        jiraApi.customFieldOption.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getResumeSource() {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.customFieldOption.api+'/13207', 
        jiraApi.customFieldOption.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  submitCreateIssue(data) {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.issue.api, 
        jiraApi.issue.type, 
        data,
        resolve, 
        reject)
    })
    return pm;
  }
}

let formModel = new FormModel()
let formView = new FormView()
let formController = new FormController(formModel, formView)
formView.addListener(formController)