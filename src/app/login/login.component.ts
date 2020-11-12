import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String = ""
  constructor(public router: Router, public route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  sendUsername(){
    this.router.navigate(["/dashboard", {'username': this.username}])
  }

}
