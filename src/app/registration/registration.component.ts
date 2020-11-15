import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    //firebase.auth().createUserWithEmailAndPassword(userEmail, userPassword")
  }

}
