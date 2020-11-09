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

  constructor(private dataservice: DataService, public router: Router, public route: ActivatedRoute) {}


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentUser= params['username']
      console.log(this.currentUser)
  });
    this.dataservice.getInspections().subscribe((data) => {
      this.allCompanies = data["companies"]
      this.allUsers = data["users"]
      this.allInspections = data["inspections"]
      this.allInspectionTypes = data["inspectionTypes"]
      console.log(this.allUsers)
      this.search()
    })
  }

  ngAfterViewInit(): void {
  
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

  search(){
    let specificUserKey = ""
    let allUserKeys = Object.keys(this.allUsers)

    for(let i = 0; i < allUserKeys.length; i++){
      console.log(allUserKeys[i])
      if(allUserKeys[i] == this.currentUser){
        alert("found user")
        specificUserKey=allUserKeys[i]
        break
      }
    }
    
    if(this.allUsers[specificUserKey]["user_level"] == "inspector"){
      this.listAllUserInspections(specificUserKey)
    } else if(this.allUsers[specificUserKey]["user_level"] == "admin"){
      this.listAllCompanyInspections(this.allUsers[specificUserKey]["company"])
    } else if (this.allUsers[specificUserKey]["user_level"] == "system_admin"){
      this.listAllSystemInspections()
    }
  }

  listAllUserInspections(specificUserKey){
    let allInspectionCompanyKeys = Object.keys(this.allInspections)
    let specificCompanyKey = ""
    this.allUserInspections = []
    let count = 0
    console.log("before all inspection")
    console.log(allInspectionCompanyKeys.length)
    for(let i =0; allInspectionCompanyKeys.length; i++){
      if(allInspectionCompanyKeys[i] == this.allUsers[specificUserKey]["company"]){
        specificCompanyKey = allInspectionCompanyKeys[i]
        console.log(specificCompanyKey)
        let userinspecsvalues = Object.values(this.allInspections[specificCompanyKey][specificUserKey])
        console.log(userinspecsvalues)
        for(let j = 0; j < userinspecsvalues.length; j++){
          let userobj = userinspecsvalues[j]
          console.log(userobj)
          userobj["inspector"] = specificUserKey
          this.allInspections[count] = userobj
          count = count + 1
        }
        break;
      }
    } //End fors
    console.log("after all inspection and before specific company inspections")
    let allCompanyInspectionsKeys = Object.keys(this.allInspections[specificCompanyKey])
    let allCompanyInspections = this.allInspections[specificCompanyKey]
      for(let i =0; i < allCompanyInspectionsKeys.length; i++){
        if(allCompanyInspectionsKeys[i] == specificUserKey){
          this.allUserInspections = allCompanyInspections[specificUserKey]
          console.log(this.allUserInspections)
          break;
        }
      }
    console.log(this.allUserInspections)
  }

  listAllCompanyInspections(specificCompanyKey){
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
        let userobj = userinspecvalues[j]
        userobj["inspector"] = allCompanyUserKeys[i]
        console.log(userobj)
        this.allUserInspections[count] = userobj
        count = count+1
      }
      
    }
    console.log(this.allUserInspections)
  }

  listAllSystemInspections(){
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
            // console.log(userinspectionvalues[k])
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
