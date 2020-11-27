/*
  TODO: Use firebase authentication functions to allow a new user to be created
        Possibly change how the registration process goes. Current idea is this registration page
        is only used for new companies. New app users would be directly added by the company admin.
*/

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  @ViewChild("usertype") userTypeSelect: ElementRef
  @ViewChild("AppUserInfo") appUserInfoDiv: ElementRef
  @ViewChild("AdministrationInfo") administrationInfoDiv: ElementRef
  userPassword: string
  userEmail: string

  constructor() { }

  ngOnInit(): void {}

  createUser(){
    
    console.log(this.userEmail)
    console.log(this.userPassword)
    firebase.auth().createUserWithEmailAndPassword(this.userEmail, this.userPassword).catch(function(error) {
      var errorCode = error.code
      var errorMessage = error.message
      console.log(errorCode)
      console.log(errorMessage)
    })
  }
  
  checkUser(){
    if(this.userTypeSelect.nativeElement.value=="App User"){
      this.appUserInfoDiv.nativeElement.style.display = "block"
      this.administrationInfoDiv.nativeElement.style.display = "none"
    } else if(this.userTypeSelect.nativeElement.value=="Administrator"){
      this.appUserInfoDiv.nativeElement.style.display = "none"
      this.administrationInfoDiv.nativeElement.style.display = "block"
    }
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
