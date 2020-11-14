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
    var firebaseConfig = {
      apiKey: "AIzaSyD0w05LIAbaJKVr1HCm1J3Yz-yTxHvdj-o",
      authDomain: "inspectiontest-25620.firebaseapp.com",
      databaseURL: "https://inspectiontest-25620.firebaseio.com",
      projectId: "inspectiontest-25620",
      storageBucket: "inspectiontest-25620.appspot.com",
      messagingSenderId: "721858922207",
      appId: "1:721858922207:web:0eebd7362628bfd62a8b6a"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
  }

  sendUsername(){
    firebase.auth().signInWithEmailAndPassword(this.username, this.password).catch(function(error){
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + ": " + errorMessage)
    })
  }

}
