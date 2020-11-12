import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataService } from '../core/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("moreinfo") moreInfo: ElementRef
  @ViewChild("appUsers") users: ElementRef
  @ViewChild("observations") obs: ElementRef
  @ViewChild("investigations") inv: ElementRef
  @ViewChild("addUser") addUser: ElementRef
  @ViewChild("observationsInfo") obsInfo: ElementRef
  @ViewChild("headerText") headerText: ElementRef
  @ViewChild("userInfo") userInfo: ElementRef

  allCompanies: any
  allUsers: any = {"test": "teeeeeeeeest"}
  allInspections: any
  allInspectionTypes: any
  currentUser: String
  allUserInspections: Object
  isAdministrator: any = false

  constructor(private dataservice: DataService, public router: Router, public route: ActivatedRoute) {}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentUser= params['username']
      console.log(this.currentUser)
  });
    this.dataservice.getInspections().subscribe((data) => {
      this.allCompanies = data["companies"]
      this.allUsers = data["users"]
      let currentCompany = data["users"][this.currentUser]["company"]
      this.allInspections = data["inspections"]
      if(currentCompany == null){
        this.allInspectionTypes = this.getAllCompanyInspectionTypes()
      } else {
        this.allInspectionTypes = data["companies"][currentCompany]["inspectionTypes"]
        console.log(this.allInspectionTypes)
      }
      if(this.allUsers[this.currentUser]["user_level"] == "admin" || this.allUsers[this.currentUser]["user_level"] == "system_admin"){
        this.isAdministrator = true
      }
      console.log(this.allUsers)
    })
  }

  ngAfterViewInit(): void {
  
  }

  getAllCompanyInspectionTypes(){
    let allCompanyKeys = Object.keys(this.allCompanies)
    let allTypes = []

    for(let i =0; i < allCompanyKeys.length; i++){
      let allCompanyTypes = Object.keys(this.allCompanies[allCompanyKeys[i]]["inspectionTypes"])
      console.log(allCompanyTypes)
      for(let j = 0; j < allCompanyTypes.length; j++){
        allTypes[allCompanyTypes[j]] = this.allCompanies[allCompanyKeys[i]]["inspectionTypes"][allCompanyTypes[j]]
      }
    }
    console.log(allTypes)
    return allTypes
  }

  isVis = false;
  showstuff(){
      if(!this.isVis){
        this.moreInfo.nativeElement.style.display = "block";
      } else {
        this.moreInfo.nativeElement.style.display = "none";
      }
      this.isVis = !this.isVis;
  }

  showUsers(){
      this.users.nativeElement.style.display = "block";
      this.obs.nativeElement.style.display = "none";
      this.inv.nativeElement.style.display = "none";
      this.userInfo.nativeElement.style.display="none";
      this.addUser.nativeElement.style.display="none";
      this.obsInfo.nativeElement.style.display="none";
      this.changeHeader("App Users");
  }
  
  showObs(){
      this.users.nativeElement.style.display = "none";
      this.obs.nativeElement.style.display = "block";
      this.inv.nativeElement.style.display = "none";
      this.userInfo.nativeElement.style.display="none";
      this.addUser.nativeElement.style.display="none";
      this.obsInfo.nativeElement.style.display="none";
      this.changeHeader("Observations");
  }
  
  showInv(){
      this.users.nativeElement.style.display = "none";
      this.obs.nativeElement.style.display = "none";
      this.inv.nativeElement.style.display = "block";
      this.userInfo.nativeElement.style.display="none";
      this.addUser.nativeElement.style.display="none";
      this.obsInfo.nativeElement.style.display="none";
      this.changeHeader("Investigations");
  }

  showUserInfo(){
      this.userInfo.nativeElement.style.display="block";
      this.users.nativeElement.style.display="none";
      this.changeHeader("App User Information");
  }

  showAddUser(){
      this.addUser.nativeElement.style.display="block";
      this.users.nativeElement.style.display="none";
      this.changeHeader("Add New App User");
  }

  showObsInfo(){
      this.obsInfo.nativeElement.style.display="block";
      this.obs.nativeElement.style.display = "none";
      this.changeHeader("Observation Information");
  }

  addUserHelp(){
      alert("Give the user this username. When they register for the web portal they will use this username.");
  }

  changeHeader(words){
      this.headerText.nativeElement.innerHTML=words;
  }

  listAllUserInspections(specificUserKey, specificCompanyKey, inspectionType){
    let allInspectionCompanyKeys = Object.keys(this.allInspections)
    this.allUserInspections = []
    let count = 0
    console.log("before all inspection")
    console.log(allInspectionCompanyKeys.length)
    let userinspections = Object.values(this.allInspections[specificCompanyKey][specificUserKey])
    
    for(let i = 0; i < userinspections.length; i++){
      if(userinspections[i]["inspection_type"].toLowerCase() == inspectionType["key"].toLowerCase()){
        let userobj = userinspections[i]
        console.log("in here")
        userobj["inspector"] = specificUserKey
        this.allUserInspections[count] = userobj
        count = count + 1
      }
    }
    console.log(this.allUserInspections)
  }

  listAllCompanyInspections(specificCompanyKey, inspectionType){
    console.log("tehy are company admin")
    let allCompanyInspections = this.allInspections[specificCompanyKey]
    let allCompanyUserKeys = Object.keys(this.allInspections[specificCompanyKey])
    this.allUserInspections = []
    let count =0

    for(let i =0; i < allCompanyUserKeys.length; i++){
      // console.log(Object.keys(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]]))
      let userinspecvalues = Object.values(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]])
      let userinspeckeys = Object.keys(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]])
      console.log(userinspecvalues)
      for(let j = 0; j < Object.keys(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]]).length; j++){
        //console.log("Key: " + allCompanyUserKeys[i] + ", Value: " + userinspecvalues[j])
        // console.log(allCompanyUserKeys[i])
        // console.log(userinspecvalues[j])
        if(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]][userinspeckeys[j]]["inspection_type"].toLowerCase() == inspectionType["key"].toLowerCase()){
          let userobj = userinspecvalues[j]
          userobj["inspector"] = allCompanyUserKeys[i]
          console.log(userobj)
          this.allUserInspections[count] = userobj
          count = count+1
        }
      }
      
    }
    console.log(this.allUserInspections)
  }

  listAllSystemInspections(inspectionType){
    console.log("tehy are system admin")
    let count = 0
    this.allUserInspections = []
    let allCompanyInspectionsKeys = Object.keys(this.allInspections)
    //console.log(allCompanyInspectionsKeys)
    for(let i = 0; i < allCompanyInspectionsKeys.length; i++){
      let companyuserkeys = Object.keys(this.allInspections[allCompanyInspectionsKeys[i]])
      //console.log(companyuserkeys)
      for(let j = 0; j < companyuserkeys.length; j++){
          let userinspectionkeys = Object.keys(this.allInspections[allCompanyInspectionsKeys[i]][companyuserkeys[j]])
          let userinspectionvalues = Object.values(this.allInspections[allCompanyInspectionsKeys[i]][companyuserkeys[j]])
          console.log(userinspectionkeys)
          for(let k = 0; k < userinspectionkeys.length; k++){
            if(this.allInspections[allCompanyInspectionsKeys[i]][companyuserkeys[j]][userinspectionkeys[k]]["inspection_type"].toLowerCase() == inspectionType["key"].toLowerCase()){
              let userobj = userinspectionvalues[k]
              userobj['inspector'] = companyuserkeys[j]
              console.log(userobj)
              this.allUserInspections[count] = userobj
              count = count + 1
            }
          }
      }
    }
  }

  showInspections(inspectionType){
    console.log(inspectionType)
    let specificUserKey = ""
    let allUserKeys = Object.keys(this.allUsers)
    let specificCompanyKey = ""

    for(let i = 0; i < allUserKeys.length; i++){
      console.log(allUserKeys[i])
      if(allUserKeys[i] == this.currentUser){
        specificUserKey=allUserKeys[i]
        specificCompanyKey=this.allUsers[specificUserKey]["company"]
        break
      }
    }
    
    if(this.allUsers[specificUserKey]["user_level"] == "inspector"){
      this.listAllUserInspections(specificUserKey, specificCompanyKey, inspectionType)
    } else if(this.allUsers[specificUserKey]["user_level"] == "admin"){
      this.listAllCompanyInspections(this.allUsers[specificUserKey]["company"], inspectionType)
    } else if (this.allUsers[specificUserKey]["user_level"] == "system_admin"){
      this.listAllSystemInspections(inspectionType)
    }
    this.changeHeader(inspectionType["key"][0].toUpperCase() + inspectionType["key"].substr(1).toLowerCase())
  }
} //end whole thing
