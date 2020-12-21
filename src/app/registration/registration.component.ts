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
  validEmail: boolean = true
  validCompanyEmail: boolean = true
  passwordsMatch: boolean = true
  fieldsEmpty: boolean = false
  validPhoneNumber: boolean = true

  constructor(private router: Router) { }

  ngOnInit(): void {}

  //Create company administrator user
  createCompanyAdmin(){
    this.validEmail = true
    this.validCompanyEmail = true
    this.passwordsMatch = true
    this.fieldsEmpty = false
    this.validPhoneNumber = true
    
    //Handles varies aspects of input field validation
    if(!this.emailIsValid(this.userEmail)) this.validEmail = false
    if(!this.emailIsValid(this.companyEmail)) this.validCompanyEmail = false
    if(this.userPassword !== this.userPasswordConfirmation) this.passwordsMatch = false
    if(!this.userFullName || !this.userEmail || !this.userPassword || !this.userPasswordConfirmation || !this.companyName || !this.companyEmail || !this.companyPhoneNumber) this.fieldsEmpty = true
    if(!this.phoneNumberIsValid(this.companyPhoneNumber)) this.validPhoneNumber = false
    if(!this.validEmail || !this.validCompanyEmail || !this.passwordsMatch || this.fieldsEmpty || !this.validPhoneNumber) return

    //This method automatically logs the user in after creation
    firebase.auth().createUserWithEmailAndPassword(this.userEmail, this.userPassword)
      .then(async (value) => {
        await firebase.database().ref("/users/"+value.user.uid).set({
          email: this.userEmail,
          name: this.userFullName,
          user_level: "admin",
          company: this.companyName
        })
        this.createCompany(value.user.uid)
        this.router.navigateByUrl('/login')
        await firebase.auth().signOut() //Thus the user is forced to sign out to prevent any weirdness with the user auth
      })
      .catch(error => {
        var errorCode = error.code
        var errorMessage = error.message
      })
    
  }

  //Create company database node
  createCompany(userID){
    firebase.database().ref('/companies/'+this.companyName).set({
      contact_email: this.companyEmail,
      contact_phone_number: this.companyPhoneNumber,
      contact_user: userID,
      name: this.companyName,
      users: {[userID] : this.userEmail}
    })
  }

  //Utility functions
  emailIsValid (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  phoneNumberIsValid(phone){
    return /\d{10}/.test(phone)
  }
}
