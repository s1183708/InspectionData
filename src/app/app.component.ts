import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import firebase from 'firebase/app'
import { FirebaseConfig } from './core/firebaseConfig.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit{
  title = 'InspectionDataWebPortal';
  constructor(private firebaseConfig: FirebaseConfig){}

  ngOnInit(){
    // Initialize Firebase
    firebase.initializeApp(this.firebaseConfig.getFirebaseConfig());
  }
}
