/*
  TODO: Use firebase authentication functions to allow a new user to be created
        Possibly change how the registration process goes. Current idea is this registration page
        is only used for new companies. New app users would be directly added by the company admin.
*/

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import {Router} from '@angular/router'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  userPassword: string
  userPasswordConfirmation: string
  userEmail: string
  userFullName: string
  companyName: string
  companyEmail: string
  companyPhoneNumber: string

  constructor(private router: Router) { }

  ngOnInit(): void {}

  createCompanyAdmin(){
    console.log(this.userEmail)
    console.log(this.userPassword)
    //Include checking for correct email and phone number forgot
    //Check to make sure no fields are left blank before invoking firebase

    if(this.userPassword == this.userPasswordConfirmation){
      //This method automatically logs the user in after creation
      firebase.auth().createUserWithEmailAndPassword(this.userEmail, this.userPassword)
        .then(value => {
          firebase.database().ref("/users/"+value.user.uid).set({
            email: this.userEmail,
            name: this.userFullName,
            user_level: "admin",
            company: this.companyName
          })
          this.createCompany(value.user.uid)
          this.router.navigateByUrl('/login')
          firebase.auth().signOut()
        })
        .catch(error => {
          var errorCode = error.code
          var errorMessage = error.message
          console.log(errorCode)
          console.log(errorMessage)
        })
    } else {
      alert("Passwords didnt match")
    }
  }

  createCompany(userID){
    firebase.database().ref('/companies/'+this.companyName).set({
      contact_email: this.companyEmail,
      contact_phone_number: this.companyPhoneNumber,
      contact_user: userID,
      name: this.companyName,
      users: {[userID] : this.userEmail}
    })
  }
  
  adminHelp(){
    alert("Only fill this out if you are representing a company")
  }
  appUserHelp(){
    alert("A username should have been provided to you already by an administrator. Use that username when registering.")
  }
  userChoiceHelp(){
    alert("App User: You complete inspection data surveys.\nAdministrator: You are setting up an account for a company.")
  }

}
