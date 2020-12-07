/*
  TODO: Change data being pulled from inspectionapp-d5692-export.json file, which is all test data, to using a firebase database conenction
          This will require some restructuring or rewriting of the code for showing inspections
        Change the addNewUser functionality to allow the admin to create an app user account with email/password, then have that user change
          their password on their first login
        
*/

import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataService } from '../core/data.service';
import { FirebaseConfig } from '../core/firebaseConfig.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/storage'

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
  @ViewChild("loading") loadingDiv: ElementRef
  @ViewChild("inspectionContents") inspectionContentsDiv: ElementRef
  @ViewChild("inspectionsList") inspectionsListDiv: ElementRef

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
  userID: string
  userLevel: string
  userCompany: string
  specificInspection: Object = {"inspection_data" : "none"}
  xmlData: string = ""
  xmlURL: string = ""
  xmlFileName: string = ""
  attachmentURLs: object[]
  attachmentFileNames: string[] = []
  secondApp = firebase.initializeApp(this.firebaseConfig.getFirebaseConfig(), "Secondary")

  // Variables related to firebase functions
  fireuser: Object
  isSignedIn: any = false

  constructor(private dataservice: DataService, public router: Router, public route: ActivatedRoute, private firebaseConfig: FirebaseConfig) {}


  ngOnInit(): void {
    this.fireuser = firebase.auth().currentUser
    let userID = ""
    let userLevel = ""
    let userCompany = ""
    let userInspections = {}

    //Checks if the user is signed in thru firebase authentication
    firebase.auth().onAuthStateChanged(user => {
      if(!this.isSignedIn && user){
        console.log("logged in")
        console.log(user.uid)
        this.fireuser = user
        this.isSignedIn = true
        userID = user.uid
        this.userID = userID
        firebase.database().ref("/users/"+userID).once("value").then(dataSnapshot => {
          userLevel = dataSnapshot.val()['user_level']
          this.userLevel = userLevel
          console.log(userLevel)
          if(userLevel == "admin"){
            this.isAdministrator = true
          }
          userCompany = dataSnapshot.val()['company']
          this.userCompany = userCompany
          console.log(userCompany)
          this.getInspectionTypes(userCompany)
          let inspectionType = "observation"
          //this.listAllUserInspections(userID, userCompany, inspectionType)
          this.loadingDiv.nativeElement.style.display = "none"
        })
        
        //alert("USER HAS LOGGED IN\n"+"email: " + user.email + "\nUser ID: " + user.uid)
      }
    })
  } //end ngOnInit

  ngAfterViewInit(): void {
    
  }



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
    this.inspectionContentsDiv.nativeElement.style.display = "none"
    
    if(this.userLevel == "inspector"){
      this.listAllUserInspections(this.userID, this.userCompany, inspectionType)
    } else if(this.userLevel ==  "admin"){
      this.listAllCompanyInspections(this.userCompany, inspectionType)
    } else if (this.userLevel ==  "system_admin"){
      this.listAllSystemInspections(inspectionType)
    }
    this.changeHeader(inspectionType[0].toUpperCase() + inspectionType.substr(1).toLowerCase())
  } //end showInspections()
  
  getInspectionTypes(userCompanyKey){
    let inspectionTypes = []
    if(userCompanyKey){
    firebase.database().ref("/inspections/"+userCompanyKey).once("value").then(snap => {
      console.log(snap.val())
      let inspectorKeys = Object.keys(snap.val())
      for(let i = 0; i < inspectorKeys.length; i++){
        let inspectionKeys = Object.keys(snap.val()[inspectorKeys[i]])
        let userInspections = snap.val()[inspectorKeys[i]]
        console.log(userInspections)
        console.log(inspectionKeys)
        for(let j = 0; j < inspectionKeys.length; j++){
          console.log(userInspections[inspectionKeys[j]]["inspection_type"])
          let inspType = userInspections[inspectionKeys[j]]["inspection_type"].toLowerCase()
          if(inspectionTypes.indexOf(inspType) === -1){
            inspectionTypes.push(inspType)
          }
        }
      }
      this.allInspectionTypes = inspectionTypes
      })
    } else { //System admin
      firebase.database().ref("/inspections/").once("value").then(snap =>{
        let companyKeys = Object.keys(snap.val())
        for(let i = 0; i < companyKeys.length; i++){
          let inspectors = snap.val()[companyKeys[i]]
          let inspectorKeys = Object.keys(inspectors)
          for(let j = 0; j < inspectorKeys.length; j++){
            let inspections = snap.val()[companyKeys[i]][inspectorKeys[j]]
            let inspectionKeys = Object.keys(inspections)
            for(let k = 0; k < inspectionKeys.length; k++){
              console.log(inspections[inspectionKeys[k]]["inspection_type"])
              let inspType = inspections[inspectionKeys[k]]["inspection_type"].toLowerCase()
              if(inspectionTypes.indexOf(inspType) === -1){
                inspectionTypes.push(inspType)
              }
            }
          }
        }
        this.allInspectionTypes = inspectionTypes
      })
    }
  }


  // Inspector users will only see their own inspections
  listAllUserInspections(userID, userCompanyKey, inspectionType){
    this.allUserInspections = []
    console.log(inspectionType)
    firebase.database().ref("/inspections/"+userCompanyKey+"/"+userID).once("value").then(snapshot => {
      console.log(snapshot.val())
      let count = 0
      let inspectionKeys = Object.keys(snapshot.val())
      for(let i =0; i < inspectionKeys.length;i++){
        if(snapshot.val()[inspectionKeys[i]]["inspection_type"].toLowerCase() == inspectionType.toLowerCase()){
          let userobj = snapshot.val()[inspectionKeys[i]]
          userobj["inspector"] = "test"
          this.allUserInspections[count] = userobj
          count = count + 1
          console.log(userobj["inspection_data"])
        }
      }
    })
    let storef = firebase.storage().ref("/companies/companyA/lBItrGZFOyepbuayxOZCM7JGt4y1/20201029180000/inspection.xml")
    console.log(storef)
  } //end listAllUserInspections()

  // Company Admin users will see all inspections completed by Inspector App Users for their company
  listAllCompanyInspections(userCompanyKey, inspectionType){
    this.allUserInspections = []
    let count = 0
    firebase.database().ref("/inspections/"+userCompanyKey).once("value").then(snap => {
      console.log(snap.val())
      let inspectorKeys = Object.keys(snap.val())
      for(let i = 0; i < inspectorKeys.length; i++){
        let inspectionKeys = Object.keys(snap.val()[inspectorKeys[i]])
        let userInspections = snap.val()[inspectorKeys[i]]
        console.log(userInspections)
        console.log(inspectionKeys)
        for(let j = 0; j < inspectionKeys.length; j++){
          if(userInspections[inspectionKeys[j]]["inspection_type"].toLowerCase() == inspectionType.toLowerCase()){
            console.log(userInspections[inspectionKeys[j]])
            let userobj = userInspections[inspectionKeys[j]]
            userobj["inspector"] = inspectorKeys[i]
            console.log(userobj)
            this.allUserInspections[count] = userobj
            count = count + 1
          }
        }
      }
    })
  } //end listAllCompanyInspections()

  // System Admin users will see inspections completed by all users of every company that uses the portal
  listAllSystemInspections(inspectionType){
    let count = 0 
    this.allUserInspections = []
    firebase.database().ref("/inspections/").once("value").then(snap =>{
      let companyKeys = Object.keys(snap.val())
      for(let i = 0; i < companyKeys.length; i++){
        let inspectors = snap.val()[companyKeys[i]]
        let inspectorKeys = Object.keys(inspectors)
        for(let j = 0; j < inspectorKeys.length; j++){
          let inspections = snap.val()[companyKeys[i]][inspectorKeys[j]]
          let inspectionKeys = Object.keys(inspections)
          for(let k = 0; k < inspectionKeys.length; k++){
            let inspType = inspections[inspectionKeys[k]]["inspection_type"].toLowerCase()
            if(inspType == inspectionType.toLowerCase()){
              let userobj = inspections[inspectionKeys[k]]
              userobj["inspector"] = inspectorKeys[j]
              userobj["company"] = companyKeys[i]
              this.allUserInspections[count] = userobj
              count = count + 1
            }
          }
        }
      }
    })

  } //end listAllSystemInspections()
  // END - Functions related to displaying inspection

  // START - Functions related to showing App Users
  // Decides which child function to call based on user access rights
  showUsers(){
    this.appUsersDiv.nativeElement.style.display = "block"
    this.inspectionsDiv.nativeElement.style.display = "none"
    this.inspectionContentsDiv.nativeElement.style.display = "none"

    if(this.userLevel == "admin"){
      this.listCompanyUsers(this.userCompany)
    } else if(this.userLevel == "system_admin"){
      this.listSystemUsers()
    }
  } //end showUsers()

  // Get all users for a specific company
  // Used for company admin view
  // TODO: Update the cloud function on user creation to store the display name in the user node as well for use here
  listCompanyUsers(company){
    this.appUsersList = []
    firebase.database().ref("/companies/"+company+"/users/").once("value").then(snap => {
      console.log(snap.val())
      for(let i = 0; i < Object.values(snap.val()).length;i++){
        let userobj = {}
        console.log(Object.values(snap.val())[i])
        userobj["email"] = Object.values(snap.val())[i]
        this.appUsersList[i] = userobj
      }
    })
  } //end listCompanyUsers()

  // Get all users for the entire web portal
  // Used for system administrator view
  listSystemUsers(){
    this.appUsersList = []
    let count = 0

    firebase.database().ref("/companies/").once("value").then(snap=>{
      console.log(snap.val())
      let companyKeys = Object.keys(snap.val())
      for(let i = 0; i < companyKeys.length; i++){
        console.log(snap.val()[companyKeys[i]])
        if(snap.val()[companyKeys[i]].hasOwnProperty("users")){
          let users = snap.val()[companyKeys[i]]["users"]
          let userKeys = Object.keys(users)
          for(let j = 0; j < userKeys.length; j++){
            let userobj = {}
            userobj["email"] = users[userKeys[j]]
            this.appUsersList[count] = userobj
            count = count + 1
          }
        }
      }
    })
    
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
    this.secondApp.delete()
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

  getInspectionData(inspection){
    console.log(inspection["inspection_data"])
    this.inspectionsDiv.nativeElement.style.display = "none"
    this.specificInspection = inspection
    this.inspectionContentsDiv.nativeElement.style.display = "block"
    let count = 0
    this.attachmentURLs = []
    // this.xmlData = this.dataservice.getInspectionXML(inspection["inspection_data"])
    let xmlRef = firebase.storage().ref("/companies/companyA/lBItrGZFOyepbuayxOZCM7JGt4y1/20201029180000")
    // xmlRef.child("inspection.xml").getDownloadURL().then(url =>{
    //   //this.dataservice.getInspectionXML(url)
    //   this.xmlURL = url
    // })
    xmlRef.listAll().then(res => {
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url =>{
          this.xmlURL = url
          let m = itemRef.fullPath.toString().match(/.*\/(.+?\..+)/)
          if (m && m.length > 1)
          {
            this.xmlFileName = m[1]
          }
          console.log(this.xmlFileName)
        })
      })
    })

    xmlRef.child("attachments").listAll().then(res => {
      res.prefixes.forEach(function(folderRef) {
        // All the prefixes under listRef.
        // You may call listAll() recursively on them.
      });
      let count = 0
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          let userobj = {}
          userobj["url"] = url
          this.attachmentURLs.push(url)
          console.log(url)
          let m = itemRef.fullPath.toString().match(/.*\/(.+?\..+)/)
          if (m && m.length > 1)
          {
            userobj["filename"] = m[1]
            
          }
          this.attachmentURLs[count] = userobj
          count = count + 1
          console.log(this.attachmentURLs)
        })
      });
    }).catch(function(error) {
      // Uh-oh, an error occurred!
    })
  }

  addNewAppUser(){
    let newAppUser = {}
    //A second firebase instance must be used because creating a user signs the current one out
    // let secondApp = firebase.initializeApp(this.firebaseConfig.getFirebaseConfig(), "Secondary")
    this.secondApp.auth().createUserWithEmailAndPassword("testemail9@gmail.com", "123456").then(firebaseUser => {
      console.log("This is their UID:" + this.secondApp.auth().currentUser.uid)
      console.log("This is their email:" + this.secondApp.auth().currentUser.email)
      firebaseUser.user.updateProfile({
        displayName: "Joseph Joestar"
      })
      this.secondApp.database().ref("/users/"+this.secondApp.auth().currentUser.uid).update({
        name: "Joseph Joestar",
        user_level: "inspector",
        company: firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once("value").then(snap => {
          return snap.val()["company"]
        })
      })
    })
  }
} //end whole thing
