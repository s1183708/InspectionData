/*
  TODO: Change data being pulled from inspectionapp-d5692-export.json file, which is all test data, to using a firebase database conenction
          This will require some restructuring or rewriting of the code for showing inspections
        Change the addNewUser functionality to allow the admin to create an app user account with email/password, then have that user change
          their password on their first login
        
*/

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataService } from '../core/data.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // Creating reference to HTML elements
  @ViewChild("moreinfo") typesList: ElementRef
  @ViewChild("appUsers") appUsersDiv: ElementRef
  @ViewChild("addUser") addUserDiv: ElementRef
  @ViewChild("headerText") headerText: ElementRef
  @ViewChild("userInfo") appUserInfoDiv: ElementRef
  @ViewChild("inspections") inspectionsDiv: ElementRef

  // Creating global variables
  allCompanies: any
  allUsers: any
  allInspections: any
  allInspectionTypes: any
  currentUser: String
  allUserInspections: Object
  appUsersList: Object
  isAdministrator: any = false
  isInspectionTypesVisible = false;

  // Variables related to firebase functions
  fireuser: Object
  isSignedIn: any = false

  constructor(private dataservice: DataService, public router: Router, public route: ActivatedRoute) {}


  ngOnInit(): void {
    this.fireuser = firebase.auth().currentUser

    //Checks if the user is signed in thru firebase authentication
    firebase.auth().onAuthStateChanged(function(user){
      if(!this.isSignedIn && user){
        console.log("logged in")
        console.log(user.uid)
        this.fireuser = user
        this.isSignedIn = true
        alert("USER HAS LOGGED IN\n"+"email: " + user.email + "\nUser ID: " + user.uid)
      }
    })

    // CURRENT USER HARDCODED FOR TESTING PURPOSES FOR NOW //
    this.currentUser = "YCUMJTN8T9SfNfSW6iKqpYZ6GR53" //TESTING, CHANGE BACK LATER

    // Used to get data from the test json file, will need to be repurposed for the firebase database
    this.dataservice.getInspections().subscribe((data) => {
      //Global variables set equal to the test json nodes
      this.allCompanies = data["companies"]
      this.allUsers = data["users"]
      this.allInspections = data["inspections"]

      //Getting the types of inspections for a company/companies
      let currentCompany = data["users"][this.currentUser]["company"]
      if(currentCompany == null){
        this.allInspectionTypes = this.getAllCompanyInspectionTypes()
      } else {
        this.allInspectionTypes = data["companies"][currentCompany]["inspectionTypes"]
      }
      //Getting current user's key from the users node
      let userKey = ""
      for(let i = 0; i < Object.keys(this.allUsers).length; i++){
        if(this.currentUser == Object.keys(this.allUsers)[i]){
          userKey = Object.keys(this.allUsers)[i]
        }
      }
      //Checking user's access rights
      if(this.allUsers[userKey]["user_level"] == "admin" || this.allUsers[userKey]["user_level"] == "system_admin"){
        this.isAdministrator = true
      }
    })
  } //end ngOnInit

  ngAfterViewInit(): void {
  
  }

  // Returns a list of inspection types for every company that uses this portal
  // Used for the system administrator view
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
  } //end getAllCompanyInspectionTypes()

  // Used when the user clicks on the "Inspections" part of the left nav bar
  // Expands and retracts depending on its current visibility
  toggleInspectionTypes(){
      if(!this.isInspectionTypesVisible){
        this.typesList.nativeElement.style.display = "block";
      } else {
        this.typesList.nativeElement.style.display = "none";
      }
      this.isInspectionTypesVisible = !this.isInspectionTypesVisible;
  }

  // START - Functions related to displaying inspection
  // Decides which inspections to show based on user access rights
  showInspections(inspectionType){
    console.log(inspectionType)
    this.inspectionsDiv.nativeElement.style.display = "block"
    this.appUsersDiv.nativeElement.style.display = "none"
    this.addUserDiv.nativeElement.style.display = "none"
    let specificUserKey = ""
    let allUserKeys = Object.keys(this.allUsers)
    let specificCompanyKey = ""
    console.log(this.fireuser)

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
  } //end showInspections()
  
  // Inspector users will only see their own inspections
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
  } //end listAllUserInspections()

  // Company Admin users will see all inspections completed by Inspector App Users for their company
  listAllCompanyInspections(specificCompanyKey, inspectionType){
    console.log("tehy are company admin")
    let allCompanyInspections = this.allInspections[specificCompanyKey]
    let allCompanyUserKeys = Object.keys(this.allInspections[specificCompanyKey])
    this.allUserInspections = []
    let count = 0

    for(let i =0; i < allCompanyUserKeys.length; i++){
      let userinspecvalues = Object.values(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]])
      let userinspeckeys = Object.keys(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]])
      console.log(userinspecvalues)
      for(let j = 0; j < Object.keys(this.allInspections[specificCompanyKey][allCompanyUserKeys[i]]).length; j++){
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
  } //end listAllCompanyInspections()

  // System Admin users will see inspections completed by all users of every company that uses the portal
  listAllSystemInspections(inspectionType){
    console.log("tehy are system admin")
    let count = 0
    this.allUserInspections = []
    let allCompanyInspectionsKeys = Object.keys(this.allInspections)
    for(let i = 0; i < allCompanyInspectionsKeys.length; i++){
      let companyuserkeys = Object.keys(this.allInspections[allCompanyInspectionsKeys[i]])
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
  } //end listAllSystemInspections()
  // END - Functions related to displaying inspection

  // START - Functions related to showing App Users
  // Decides which child function to call based on user access rights
  showUsers(){
    this.appUsersDiv.nativeElement.style.display = "block"
    this.inspectionsDiv.nativeElement.style.display = "none"
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

    if(this.allUsers[specificUserKey]["user_level"] == "admin"){
      this.listCompanyUsers(this.allCompanies[specificCompanyKey])
    } else if(this.allUsers[specificUserKey]["user_level"] == "system_admin"){
      this.listSystemUsers()
    }
  } //end showUsers()

  // Get all users for a specific company
  // Used for company admin view
  listCompanyUsers(company){
    this.appUsersList = []
    console.log(company)

    for(let i = 0; i < Object.values(company["users"]).length; i++){
      console.log(Object.values(company["users"])[i])
      let userobj: Object = {}
      userobj["email"] = Object.values(company["users"])[i]
      this.appUsersList[i] = userobj
    }
  } //end listCompanyUsers()

  // Get all users for the entire web portal
  // Used for system administrator view
  listSystemUsers(){
    let companyKeys = Object.keys(this.allCompanies)
    this.appUsersList = []
    let count = 0

    for(let i = 0; i<companyKeys.length; i++){
      for(let j=0; j< Object.values(this.allCompanies[companyKeys[i]]["users"]).length; j++){
        let userobj: Object = {}
        userobj["email"] = Object.values(this.allCompanies[companyKeys[i]]["users"])[j]
        this.appUsersList[count] = userobj
        count = count + 1
      }
    }
  } //end listSystemUsers()
  // END - Functions related to showing App Users

  // START - Firebase functions
  // Signs user out via firebase authentication
  async signUserOut(){
    let oldUser = firebase.auth().currentUser.email
    await firebase.auth().signOut().then(function(){
      console.log(oldUser+" has signed out")
    })
    this.isSignedIn = false
  } //end signUserOut()
  // END - Firebase functions

  //MISC Functions
  //Check if object is empty
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  // Alert giving more info about adding users to the system
  addUserHelp(){
    alert("Give the user this username. When they register for the web portal they will use this username.");
  }

  // Change the top left header to the current view's focus
  changeHeader(words){
    this.headerText.nativeElement.innerHTML=words;
  }

  //Display changing functions
  showAddNewUser(){
    this.addUserDiv.nativeElement.style.display="block"
    this.appUsersDiv.nativeElement.style.display="none"
  }
  goBackToAppUsers(){
    this.addUserDiv.nativeElement.style.display="none"
    this.appUsersDiv.nativeElement.style.display="block"
  }
} //end whole thing
