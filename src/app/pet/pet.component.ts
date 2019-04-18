import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { LOCAL_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Router } from '@angular/router';
import { print } from 'util';
import { Headers, Http, RequestOptions, Response } from '@angular/http'
import { HttpResponse } from 'selenium-webdriver/http';
import { SlicePipe } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: 'app-service',
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.css']
})
export class PetComponent implements OnInit {

  public petId: string;
  public petInfo: any;
  public petImages: any[];
  public userId: string;
  public isAdmin: boolean;
  public petName: string;
  public petBreed: string;
  public petDesc: string;
  public petUserId: string;
  public petUserName: string;
  public petUserPhone: string;
  public petUserEmail: string;
  public updatableForm: boolean = false;
  public petCategories: any;
  public petCategoryId: number;
  public petIsAvailable: any;
  public petImage:any;
  public petCategory: any;
  public showContactDetails = false;
  public addWishlistItemMessage:string;
  public selectedFile = null;


  constructor(private httpClient: HttpClient, private router: Router) {
    if (sessionStorage.length <= 1) {
      this.router.navigate['/']
    }
    // this.userId = JSON.parse(sessionStorage.getItem('user')).userId;
    this.userId = JSON.parse(sessionStorage.getItem('user')).userId;
    this.isAdmin = JSON.parse(sessionStorage.getItem('user')).isAdmin;
    this.petId = JSON.parse(sessionStorage.getItem('pet')).petId;
    // console.log(this.petId);
    this.getPetDetails(this.petId);
    this.getPetCategories();
  }

  ngOnInit() {
    
  }

  getPetCategories() {
    this.httpClient.get("http://localhost:3000/api/pet/petCategoriesAll")
      .subscribe(
        (data: any[]) => {
          //console.log(data);
          this.petCategories = data;
        });
  }
  getPetDetails(value) {
    this.httpClient.get('http://localhost:3000/api/pet/' + value)
      .subscribe(
        (data: any[]) => {
          console.log(data);
          this.petInfo = data[0];
          this.petName = this.petInfo.petName;
          this.petBreed = this.petInfo.petBreed;
          this.petCategoryId = this.petInfo.petCategoryId;
          this.petDesc = this.petInfo.petDescription;
          this.petUserId = this.petInfo.petUserId;
          this.petIsAvailable = this.petInfo.isAvailable;
          this.petImage = this.petInfo.petImageName;
          this.petCategory = this.petInfo.petCategoryName;
          // console.log(this.petInfo);
          console.log(this.petUserId);
          // console.log(this.petIsAvailable);
        }
      )
  }


  goBack() {
    sessionStorage.removeItem('pet');
    this.router.navigate(['dashboard'])
  }

  toggleUpdate() {
    if (!this.updatableForm) {
      this.updatableForm = true;
    }
  }

  updatePet() {
    this.httpClient.get("http://localhost:3000/api/pet/updatePet/" + this.petName + "/" + this.petBreed + "/" + this.petDesc + "/" + this.petId)
      .subscribe(
        (data: any[]) => {
          // console.log(data);
          if (this.selectedFile) {
            this.onUpload(this.petId);
          }
        }
      )
    this.updatableForm = false;
  }

  getUserDetails(value) {
    this.httpClient.get("http://localhost:3000/api/users/get/" + this.petUserId)
      .subscribe(
        (data: any[]) => {
          console.log(data);
          this.petUserEmail = data[0].emailId;
          this.petUserName = data[0].fullName;
          this.petUserPhone = data[0].phoneNo;
          this.showContactDetails = true;
        }
      )
  }

  addToWishList() {
    return this.httpClient.get('http://localhost:3000/api/wishlist/add/' + this.petId + '/' + this.userId)
      .subscribe(
        (data: any[]) => {
          console.log(data);
          this.addWishlistItemMessage = "Added to Wishlist ! ";
        }
      )
  }

  continuePet(){
    return this.httpClient.get('http://localhost:3000/api/pet/continue/'+this.petId)
    .subscribe(
      (data:any[]) => {
        console.log(data);
        this.getPetDetails(this.petId);
      }
    )
  }

  discontinuePet(){
    return this.httpClient.get('http://localhost:3000/api/pet/discontinue/'+this.petId)
    .subscribe(
      (data:any[]) => {
        console.log(data);
        this.getPetDetails(this.petId);
      }
    )
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
              }
            )
        }
      });
  }

}
