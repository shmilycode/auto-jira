let jiraApi = {
  project: {api: "/rest/api/2/project", type: "GET"},
  issuetype: {api: "/rest/api/2/issuetype", type: "GET"},
  components: {api: "/rest/api/2/component/", type: "GET"},
  issue: {api: "/rest/api/2/issue/", type: "POST"},
  customFieldOption: {api: "/rest/api/2/customFieldOption/", type: "GET"},
  getFields: {api: "/rest/api/2/field", type: "GET"}
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
      $('#projectList').append('<a class="dropdown-item project-list">'+projectList[index].name+'</a>');
    }
    $('.project-list').on('click', (event)=>{
      let projectName = event.target.innerText
      $('#project').val(projectName)
      this.observers.forEach((item, index, array)=>{
        item.onProjectChangged(projectName)
      })
    })
  }

  updateIssueTypeList(issueTypeList) {
    let len = issueTypeList.length
    $('#issueTypeList').empty();
    for(let index = 0; index < len; index++){
      $('#issueTypeList').append('<a class="dropdown-item issue-type-list">'+issueTypeList[index].name+'</a>');
    }
  }

  updateComponentsList(componentsList) {
    let len = componentsList.length
    $('#componentsList').empty();
    for(let index = 0; index < len; index++){
      $('#componentsList').append('<a class="dropdown-item components-list">'+componentsList[index].name+'</a>');
    }
  }

  updateResumeTypeList(resumeTypeList) {
    let len = resumeTypeList.length
    $('#resumeTypeList').empty();
    for(let index = 0; index < len; index++){
      $('#resumeTypeList').append('<a class="dropdown-item resume-type-list">'+resumeTypeList[index].name+'</a>');
    }
  }

  updateResumeSourceList(resumeSourceList) {
    let len = resumeSourceList.length
    $('#resumeSourceList').empty();
    for(let index = 0; index < len; index++){
      $('#resumeSourceList').append('<a class="dropdown-item resume-source-list">'+resumeSourceList[index].name+'</a>');
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
    this.formModel.getCustomFields()
      .then((data)=>{
        console.log(data)
      });
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

  getFromListByName(input_list, name) {
    let len = input_list.length
    for(let index = 0; index < len; ++index) {
      if (input_list[index].name == name)
        return input_list[index]
    }
  }

  getComponentsIdArray(componentName) {
    this.componentsList.forEach((item, index, array)=>{
      if (item.name == componentName)
        return item.id
    })
  }

  onProjectChangged(projectName) {
    //update components
    let projectElem = this.getFromListByName(this.projectList, projectName)
    this.formModel.getComponents(projectElem.id)
      .then((data)=>{
        this.componentsList = data
        this.formView.updateComponentsList(data)
      })
  }

  onCreateIssueClick(pars){
    projectKey = getFromListByName(this.projectList, pars.project).key
    issueTypeId = getFromListByName(this.issueTypeList, pars.issueType).id
    componentsIdArray = getComponentsIdArray(pars.components)
    resumeTypeId = getFromListByName(this.resumeTypeList, pars.resumeType).id
    resumeSourceId = getFromListByName(this.resumeSourceList, pars.resumeSource).id
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

  getComponents(projectId) {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.components.api+'id='+projectId, 
        jiraApi.components.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getCustomFields() {
    const pm = new Promise((resolve, reject) => {
      this.jiraRequestManager.requestData(jiraHost+jiraApi.getFields.api+'?search=create',
        jiraApi.getFields.type, 
        null, 
        resolve, 
        reject)
    })
    return pm;
  }

  getResumeType() {
    const pm = new Promise((resolve, reject) => {
      let result = [
        {name: "内推", id: "14695"},
        {name: "主动投递", id: "14696"},
        {name: "简历搜索", id: "14697"},
        {name: "其他", id: "14698"},
      ]
      resolve(result);
    })
    return pm;
  }

  getResumeSource() {
    const pm = new Promise((resolve, reject) => {
      let result = [
        {name: "BOSS 直聘", id: "14704"}
      ]
      resolve(result)
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