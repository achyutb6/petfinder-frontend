import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { PagerService } from "../_services/index";
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Headers, Http, RequestOptions, Response } from '@angular/http'
import { HttpResponse } from 'selenium-webdriver/http';
import { SlicePipe } from '@angular/common';

import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public userData: any[];
  public fullName: string;
  public address: string;
  public city: string;
  public state: string;
  public country: string;
  public phoneNo: string;
  public emailId: string;
  public petInfo: any[];
  public userId: string;
  public zipcode: string;
  public isActive: any;
  public searchString: string;
  public myPosts: any[];
  public userPets: any[];
  public emailIdChangedMessage: string;
  public phoneNoChangedMessage: string;
  public addressChangedMessage: string;
  pager: any = {};
  pagedItems: any[];
  public petCategories: any[];
  public wishlist: any[];
  public wishlistitems: any[];
  public isAdmin: boolean;
  public usersAll: any[];
  userPager: any = {};
  userPagedItems: any[];
  public searchInput: string;
  public selectedCategories: any;
  panelOpenState: boolean = false;
  public selectedFile = null;
  public postHeaders;
  public addPetData: any;
  public addPetName: string;
  public addPetBreed: string;
  public addPetCategory: any;
  public addPetDesc: string;
  addPetForm: FormGroup;
  public addPetMessage:string ;
  public addWishlistItemMessage:string;

  constructor(private httpClient: HttpClient, private pagerService: PagerService, private router: Router, private location: Location, private fb: FormBuilder) {

    // console.log(sessionStorage);
    this.searchString = "";
    this.emailIdChangedMessage = "";
    this.phoneNoChangedMessage = "";
    this.addressChangedMessage = "";
    if (sessionStorage.length == 0) {
      sessionStorage.clear();
      this.router.navigate(['']);
    }
    this.userId = JSON.parse(sessionStorage.getItem('user')).userId;
      // add PetForm
      this.addPetForm = this.fb.group({
        'addPetName': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        'addPetBreed': ['', Validators.required],
        'addPetCategory': ['', Validators.required],
        'addPetDesc': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        "userId": this.userId
      });

      this.getUserDetails(this.userId);
      // get All Pets
      this.getAllPets();
      // make a call to the api that gives you list of all Pet categories
      this.getAllPetCategories();
      // make a call to the api that gives you list of all wishlist
      this.getWishlistItems(this.userId);
      this.getPetsByUser();
  }


  ngOnInit() {
    this.postHeaders = new HttpHeaders()
      .set('Authorization', 'my-auth-token')
      .set('Content-Type', 'application/json');
  }

  getUserDetails(value) {
    return this.httpClient.get("http://localhost:3000/api/users/get/" + value)
      .subscribe(
        (data: any[]) => {
          // console.log(data[0]);
          this.userData = data[0];
          this.fullName = this.userData["fullName"];
          this.address = this.userData["address"];
          this.city = this.userData["city"];
          this.state = this.userData["state"];
          this.country = this.userData["country"];
          this.phoneNo = this.userData["phoneNo"];
          this.emailId = this.userData["emailId"];
          this.zipcode = this.userData["zipcode"];
          this.isActive = this.userData["isActive"];
          this.isAdmin = this.userData["isAdmin"];
          // console.log(this.userData['isActive']);
        });
  }

  getAllPetCategories() {
    return this.httpClient.get("http://localhost:3000/api/pet/petCategoriesAll")
      .subscribe(
        (data: any[]) => {
          //console.log(data);
          this.petCategories = data;
        }
      )
  }

  getAllUsers() {
    return this.httpClient.get("http://localhost:3000/api/users/usersListAll")
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.usersAll = data;
          // console.log(this.usersAll);
        });
  }

  setPage(page: number) {
    console.log('in set page');
    if (page < 1 || page > this.pager.totalPages) {
      console.log('returning ');
      return;
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.petInfo.length, page);

    // get current page of items
    this.pagedItems = this.petInfo.slice(this.pager.startIndex, this.pager.endIndex + 1);
    console.log(this.pagedItems);
  }

  setUserPage(page: number) {
    if (page < 1 || page > this.userPager.totalPages) {
      return
    }
    this.userPager = this.pagerService.getPager(this.usersAll.length, page);

    this.userPagedItems = this.usersAll.slice(this.userPager.startIndex, this.userPager.endIndex + 1);
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    console.log(this.selectedFile);
  }

  onUpload(value) {
    var fd = new FormData();
    fd.append('productImage', this.selectedFile, this.selectedFile.name);
    this.httpClient.post('http://localhost:3000/uploadImage', fd, {
      reportProgress: true,
      observe: 'events'
    })
      .subscribe(res => {
        if (res.type === HttpEventType.UploadProgress) {
          console.log('Upload Progress: ' + Math.round(res.loaded / res.total * 100))
        }
        else if (res.type === HttpEventType.Response) {
          console.log(value);
          console.log("res.body",res.body);
          var imgPath = res.body["destination"] + res.body["filename"];
          return this.httpClient.post('http://localhost:3000/api/setImage', { imgPath, value })
            .subscribe(
              (data: any[]) => {
                console.log(data);
                this.getAllPets();
              }
            )
        }
      });
  }


  searchPet(data, data2) {
    if (data && data2) {
      // console.log('Both data is present');
      return this.httpClient.get('http://localhost:3000/api/pet/get/'+data+'/'+data2.petCategoryId)
      .subscribe(
        (data:any[]) => {
          // console.log(data);
          this.petInfo = data;
          this.pager = {};
          this.setPage(1);
        }
      )
    }
    else if (data) {
      // console.log('search is given');
      // console.log("http://localhost:3000/api/services/searchInput/" + data + "/"+this.userId);
      return this.httpClient.get("http://localhost:3000/api/pets/searchInput/" + data + "/"+ this.userId)
        .subscribe(
          (data: any[]) => {
            this.petInfo = data;
            this.pager = {};
            this.setPage(1);
          }
        )
    }
    else if (data2) {
      // console.log('category is given');
      // console.log(data2.serviceCategoryId);
      return this.httpClient.get('http://localhost:3000/api/pet/petCategory/'+ data2.petCategoryId + "/"+this.userId)
      .subscribe(
        (data:any[]) => {
          this.petInfo = data;
          this.pager = {};
          this.setPage(1);
        }
      )
    }
    else {  
      // console.log('none is given');
      this.getAllPets();
    }

  }

  // searchServiceByCategory(data) {
  //   console.log(data);
  // }

  getAllPets() {
    // get All Pets
    this.httpClient.get("http://localhost:3000/api/pet/all/" + this.userId)
      .subscribe(
        (data: any[]) => {
          this.petInfo = data;
          this.setPage(1);
        })
  }


  getPetsByUser() {
    // console.log("here");
    return this.httpClient.get('http://localhost:3000/api/pet/getByUser/' + this.userId)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.userPets = data;
        }
      )
  }

  getWishlistItems(value) {
   return this.httpClient.get("http://localhost:3000/api/wishlist/get/" + value)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.wishlistitems = data;
        }
      )
  }

  removeFromWishlist(value1, value2){
    return this.httpClient.get('http://localhost:3000/api/wishlist/remove/'+value1+'/'+value2)
    .subscribe(
      (data:any[]) => {
        // console.log(data);
        this.getWishlistItems(this.userId);
      }
    )
  }

  openPet(data) {
    // console.log(data);
    sessionStorage.setItem('pet', JSON.stringify({ petId: data }));
    // console.log(JSON.parse(sessionStorage.getItem('userId')));
    this.router.navigate(['pet']);
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['']);
  }

  addPet(value) {
    // console.log(value);
    return this.httpClient.post("http://localhost:3000/api/pet/addPet", value)
      .subscribe(
        (data: any[]) => {
          // console.log('from the nodejs', data["insertId"]);
          this.getAllPets();
          this.getPetsByUser();
          if (this.selectedFile) {
            this.onUpload(data["insertId"]);
          }
          this.addPetMessage = "Pet Added !";
          this.addPetForm.reset();
          this.addPetForm.clearValidators();
        }
      )
  }

  changeEmail() {
    return this.httpClient.get("http://localhost:3000/api/users/changeEmail/" + this.userId + "/" + this.emailId)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.emailIdChangedMessage = "Email-Id Changed !";
        }
      )
  }

  changePhoneNo() {
    return this.httpClient.get("http://localhost:3000/api/users/changePhoneNo/" + this.userId + "/" + this.phoneNo)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.phoneNoChangedMessage = "Phone Number Changed !";
        }
      )
  }

  changeAddress() {
    return this.httpClient.get("http://localhost:3000/api/users/changeAddress/" + this.userId + "/" + this.address + "/" + this.city + "/" + this.state + "/" + this.country + "/" + this.zipcode)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          this.addressChangedMessage = "Address Changed !";
        }
      )
  }

  searchByCategory() {
    //console.log(this.selectedCategories);
  }

  deactivateUser(value) {
    // console.log(value);
    return this.httpClient.get("http://localhost:3000/api/users/deactivateUser/" + value)
      .subscribe(
        (data: any[]) => {
          this.getAllUsers();
        });
  }

  activateUser(value) {
    // console.log(value);
    return this.httpClient.get("http://localhost:3000/api/users/activateUser/" + value)
      .subscribe(
        (data: any[]) => {
          this.getAllUsers();
        });
  }

}
