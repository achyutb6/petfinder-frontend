import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Router } from '@angular/router';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { HttpResponse } from 'selenium-webdriver/http';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  
  public loginEmailId: string ;
  public loginPassword: string ;
  public registerFullName: string;
  public registerEmailId: string ;
  public registerPassword: string ;
  public registerError: string;
  public loginMessage: string;
  public registerSuccess: string;
  public hashedPassword: any;
  public isAdmin: boolean;
  panelOpenState: boolean = false;
  // constructor(private httpClient: HttpClient, private router: Router) { 
    
  registrationForm: FormGroup;
  loginForm: FormGroup;

  constructor(private httpClient: HttpClient, private router: Router, private fb: FormBuilder) { 
    sessionStorage.clear();
    this.registrationForm = this.fb.group({
      'registerFullName': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      'registerEmailId': ['', Validators.compose([Validators.required, Validators.email])],
      'registerPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
    this.loginForm = this.fb.group({
      'loginEmailId': ['', Validators.compose([Validators.required, Validators.email])],
      'loginPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  ngOnInit() {
    
    this.loginEmailId = "";
    this.loginPassword = "";
    this.registerEmailId = "";
    this.registerFullName = "";
    this.registerPassword = "";
  }

  userLogin(value){
    this.loginEmailId = value.loginEmailId;
    this.loginPassword = value.loginPassword;
      // check in db for the emailid and password
      this.hashedPassword = Md5.hashStr(this.loginPassword);
      // console.log("User Login with creds -> ", this.loginEmailId, this.hashedPassword);
      return this.httpClient.get("http://localhost:3000/api/users/login/"+this.loginEmailId+"/"+this.hashedPassword)
      .subscribe(
        (data:any)=>{
          if(data.length!=0){
            // console.log("there is some data");
            console.log(data);
            sessionStorage.setItem('user', JSON.stringify({userId: data[0].userId, isAdmin:data[0].isAdmin}));
            // console.log(JSON.parse(sessionStorage.getItem('userId')));
            this.router.navigate(['dashboard']);
          }
          else{
            this.loginMessage = "Email-id or Password is Wrong !";
            console.log("there is no data");
            this.loginMessage = "Email-Id/Password Incorrect";
          }
          
        }
      )
  }

  userRegister(value){
    // console.log(JSON.stringify(value));
    // console.log(value.registerPassword);
    this.registerEmailId = value.registerEmailId;
    this.registerFullName = value.registerFullName;
    this.registerPassword = value.registerPassword;
    // console.log("Register User creds -> ", this.registerEmailId, this.registerFullName, this.registerPassword);
    return this.httpClient.get("http://localhost:3000/api/users/findUser/"+this.registerEmailId)
      .subscribe(
        (data:any[]) => {
          console.log(data.length);
          if(data.length==0){
            // Register the User
            this.hashedPassword = Md5.hashStr(this.registerPassword);
            return this.httpClient.get("http://localhost:3000/api/users/register/"+this.registerFullName+"/"+this.hashedPassword+"/"+this.registerEmailId)
            .subscribe(
              (data:any[])=>{
                console.log(data);
                this.registerSuccess = "Succesfully Registered ! Please Login !";
              }
            )
          }
          else{
            // Show the error message that the user is already registered
            this.registerError = "User already Exists !";
            this.registerSuccess = "";
          }
        }
      )
  }

  
}
