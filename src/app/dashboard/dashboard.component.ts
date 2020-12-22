import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
export class DashboardComponent implements OnInit {
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
  fieldsEmpty: boolean = false
  badEmail: boolean = false
  passwordsMatch: boolean = true
  uniqueEmail: boolean = true
  newUserName: string
  newUserEmail: string
  newUserPassword: string
  newUserPasswordConfirm: string

  // Variables related to firebase functions
  fireuser: Object
  isSignedIn: any = false

  constructor(public router: Router, public route: ActivatedRoute, private firebaseConfig: FirebaseConfig) {}


  ngOnInit(): void {
    this.fireuser = firebase.auth().currentUser
    let userID = ""
    let userLevel = ""
    let userCompany = ""

    //Checks if the user is signed in thru firebase authentication
    firebase.auth().onAuthStateChanged(user => {
      if(!this.isSignedIn && user){
        this.fireuser = user
        this.isSignedIn = true
        userID = user.uid
        this.userID = userID
        firebase.database().ref("/users/"+userID).once("value").then(dataSnapshot => {
          userLevel = dataSnapshot.val()['user_level']
          this.userLevel = userLevel
          if(userLevel == "admin"){
            this.isAdministrator = true
          }
          userCompany = dataSnapshot.val()['company']
          this.userCompany = userCompany
          this.getInspectionTypes(userCompany)
          this.loadingDiv.nativeElement.style.display = "none"
        })
      }
    })
  } //end ngOnInit

  // START - Functions related to displaying inspection
  // Decides which inspections to show based on user access rights
  showInspections(inspectionType){
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
      if(snap.val() === null){
        return
      }
      let inspectorKeys = Object.keys(snap.val())
      for(let i = 0; i < inspectorKeys.length; i++){
        let inspectionKeys = Object.keys(snap.val()[inspectorKeys[i]])
        let userInspections = snap.val()[inspectorKeys[i]]
        for(let j = 0; j < inspectionKeys.length; j++){
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
        if(snap.val() === null){
          return
        }
        for(let i = 0; i < companyKeys.length; i++){
          let inspectors = snap.val()[companyKeys[i]]
          let inspectorKeys = Object.keys(inspectors)
          for(let j = 0; j < inspectorKeys.length; j++){
            let inspections = snap.val()[companyKeys[i]][inspectorKeys[j]]
            let inspectionKeys = Object.keys(inspections)
            for(let k = 0; k < inspectionKeys.length; k++){
              if(!inspections[inspectionKeys[k]]["inspection_type"]){
                continue
              }
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
    firebase.database().ref("/inspections/"+userCompanyKey+"/"+userID).once("value").then(snapshot => {
      let count = 0
      let inspectionKeys = Object.keys(snapshot.val())
      for(let i =0; i < inspectionKeys.length;i++){
        if(snapshot.val()[inspectionKeys[i]]["inspection_type"].toLowerCase() == inspectionType.toLowerCase()){
          let userobj = snapshot.val()[inspectionKeys[i]]
          userobj["inspector"] = "test"
          this.allUserInspections[count] = userobj
          count = count + 1
        }
      }
    })
    let storef = firebase.storage().ref("/companies/companyA/lBItrGZFOyepbuayxOZCM7JGt4y1/20201029180000/inspection.xml")
  } //end listAllUserInspections()

  // Company Admin users will see all inspections completed by Inspector App Users for their company
  listAllCompanyInspections(userCompanyKey, inspectionType){
    this.allUserInspections = []
    let count = 0
    firebase.database().ref("/inspections/"+userCompanyKey).once("value").then(async (snap) => {
      let inspectorKeys = Object.keys(snap.val())
      for(let i = 0; i < inspectorKeys.length; i++){
        let inspectionKeys = Object.keys(snap.val()[inspectorKeys[i]])
        let userInspections = snap.val()[inspectorKeys[i]]
        for(let j = 0; j < inspectionKeys.length; j++){
          if(userInspections[inspectionKeys[j]]["inspection_type"].toLowerCase() == inspectionType.toLowerCase()){
            await firebase.database().ref("/users/"+inspectorKeys[i]).once("value").then(snapshot =>{
              let userobj = userInspections[inspectionKeys[j]]
              userobj["inspector"] = snapshot.val()["name"]
              this.allUserInspections[count] = userobj
              count = count + 1
            })
            
          }
        }
      }
    })
  } //end listAllCompanyInspections()

  // System Admin users will see inspections completed by all users of every company that uses the portal
  listAllSystemInspections(inspectionType){
    let count = 0 
    this.allUserInspections = []
    firebase.database().ref("/inspections/").once("value").then(async (snap) =>{
      let companyKeys = Object.keys(snap.val())
      for(let i = 0; i < companyKeys.length; i++){
        let inspectors = snap.val()[companyKeys[i]]
        let inspectorKeys = Object.keys(inspectors)
        for(let j = 0; j < inspectorKeys.length; j++){
          let inspections = snap.val()[companyKeys[i]][inspectorKeys[j]]
          let inspectionKeys = Object.keys(inspections)
          for(let k = 0; k < inspectionKeys.length; k++){
            if(!inspections[inspectionKeys[k]]["inspection_type"]) continue
            let inspType = inspections[inspectionKeys[k]]["inspection_type"].toLowerCase()
            if(inspType == inspectionType.toLowerCase()){
              await firebase.database().ref("/users/"+inspectorKeys[j]).once("value").then(snapshot =>{
                if(snapshot.val() === null) return
                let userobj = inspections[inspectionKeys[k]]
                userobj["inspector"] = snapshot.val()["name"]
                userobj["company"] = snapshot.val()["company"]
                this.allUserInspections[count] = userobj
                count = count + 1
              })
              
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
    this.addUserDiv.nativeElement.style.display = "none"
    this.changeHeader("App Users")

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
      for(let i = 0; i < Object.keys(snap.val()).length;i++){
        firebase.database().ref("/users/"+Object.keys(snap.val())[i]).once("value").then(snapshot => {
          this.appUsersList[i] = snapshot.val()
        })
      }
    })
  } //end listCompanyUsers()

  // Get all users for the entire web portal
  // Used for system administrator view
  listSystemUsers(){
    this.appUsersList = []
    let count = 0

    firebase.database().ref("/companies/").once("value").then(snap=>{
      let companyKeys = Object.keys(snap.val())
      for(let i = 0; i < companyKeys.length; i++){
        if(snap.val()[companyKeys[i]].hasOwnProperty("users")){
          let users = snap.val()[companyKeys[i]]["users"]
          let userKeys = Object.keys(users)
          for(let j = 0; j < userKeys.length; j++){
            let currentCount = count
            firebase.database().ref("/users/"+userKeys[j]).once("value").then(snapshot => {
              this.appUsersList[currentCount] = snapshot.val()
            })
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
    await firebase.auth().signOut()
    this.isSignedIn = false
    this.secondApp.delete()
  } //end signUserOut()
  // END - Firebase functions
  

  //Display changing functions
  showAddNewUser(){
    this.addUserDiv.nativeElement.style.display="block"
    this.appUsersDiv.nativeElement.style.display="none"
    this.newUserName = ""
    this.newUserEmail = ""
    this.newUserPassword= ""
    this.newUserPasswordConfirm = ""
    this.fieldsEmpty = false
    this.badEmail = false
    this.passwordsMatch = true
    this.changeHeader("Add New App User")
  }

  goBackToAppUsers(){
    this.addUserDiv.nativeElement.style.display="none"
    this.appUsersDiv.nativeElement.style.display="block"
    this.changeHeader("App Users")
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

  // Gets everything related to a specific inspection (XML file, attachments, filename for hyperlinks)
  getInspectionData(inspection){
    this.inspectionsDiv.nativeElement.style.display = "none"
    this.specificInspection = inspection
    this.inspectionContentsDiv.nativeElement.style.display = "block"
    this.xmlURL = ""
    this.attachmentURLs = []

    let xmlRef = firebase.storage().refFromURL(inspection["inspection_data"])
    xmlRef.listAll().then(res => {
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url =>{
          this.xmlURL = url
          let m = itemRef.fullPath.toString().match(/.*\/(.+?\..+)/)
          if (m && m.length > 1) this.xmlFileName = m[1]
        })
      })
    })

    xmlRef.child("attachments").listAll().then(res => {
      let count = 0
      res.items.forEach(itemRef => {
        itemRef.getDownloadURL().then(url => {
          let userobj = {}
          userobj["url"] = url
          this.attachmentURLs.push(url)
          let m = itemRef.fullPath.toString().match(/.*\/(.+?\..+)/)
          if (m && m.length > 1) userobj["filename"] = m[1]

          this.attachmentURLs[count] = userobj
          count = count + 1
        })
      });
    }).catch(function(error) {})
  }

  addNewAppUser(){
    //A second firebase instance must be used because creating a user signs the current one out
    // let secondApp = firebase.initializeApp(this.firebaseConfig.getFirebaseConfig(), "Secondary")
    this.fieldsEmpty = false
    this.badEmail = false
    this.passwordsMatch = true
    this.uniqueEmail = true

    if(this.newUserEmail === "" || this.newUserPassword === "" || this.newUserPasswordConfirm === "" || this.newUserName === "") this.fieldsEmpty = true
    if(!this.emailIsValid(this.newUserEmail)) this.badEmail = true
    if(this.newUserPassword !== this.newUserPasswordConfirm) this.passwordsMatch = false
    if(this.fieldsEmpty || this.badEmail || !this.passwordsMatch) return

    let userCompany = ""
    firebase.database().ref("/users/"+firebase.auth().currentUser.uid).once("value").then(snap => {
      userCompany = snap.val()["company"]
      this.secondApp.auth().createUserWithEmailAndPassword(this.newUserEmail, this.newUserPassword).then(firebaseUser => {
        this.secondApp.database().ref("/users/"+this.secondApp.auth().currentUser.uid).set({
          name: this.newUserName,
          user_level: "inspector",
          company: userCompany,
          email: this.newUserEmail
        })
        this.secondApp.database().ref("/companies/"+userCompany+"/users/").update({
          [this.secondApp.auth().currentUser.uid]: this.secondApp.auth().currentUser.email
        })
        firebase.auth().sendPasswordResetEmail(this.newUserEmail)
        this.showUsers()
      }).catch(err => {
        this.uniqueEmail = false
        return
      })
    })
  }

  //Utility functions
  //Check if object is empty
  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  // Change the top left header to the current view's focus
  changeHeader(words){
    this.headerText.nativeElement.innerHTML=words;
  }

  //Check if email format is valid
  emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
} //end dashboard component
