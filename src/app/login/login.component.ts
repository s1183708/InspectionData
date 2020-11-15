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

  sendUsername(){
    firebase.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage)
    })
  }

}
