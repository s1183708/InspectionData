/*
  TODO: Display text that says "Invalid email/password" when a user fails their login
        Change it so that the angular routing to the dashboard takes place after the user login is authenticated
*/

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = ""
  password: string = ""
  constructor(public router: Router, public route: ActivatedRoute) { 
  }
  

  ngOnInit(): void {

  }

  logIn(){
    firebase.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage)
    })
  }

}
