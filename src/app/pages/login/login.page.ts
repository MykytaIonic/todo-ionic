import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Facebook } from '@ionic-native/facebook/ngx';
declare var gapi: any;
import { Storage } from '@ionic/storage';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public credentialsForm: FormGroup;
  public isLoggedIn = false;
  public users: any;
  public result: any;
  public loadingController: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private fb: Facebook,
    private googlePlus: GooglePlus,
    public storage: Storage,
    private route: Router
  ) {
    fb.getLoginStatus()
      .then(res => {
        if (res.status === "connect") {
          this.isLoggedIn = true;
        } else {
          this.isLoggedIn = false;
        }
      })
      .catch(e => console.log(e));
  }

  ngOnInit() {
    this.credentialsForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  public onSubmit() {
    this.authService.login(this.credentialsForm.value).subscribe();
  }

  public register() {
    this.route.navigate(['/register']);
  }

  public googleSignIn() {
    this.googlePlus.login({
      'webClientId': '510101324382-mkdatuj82tjsd7eolnju0uptbh2ntr99.apps.googleusercontent.com',
      'offline': true,
      'clientSecret': 'O0kb7werOzxs_124K-J0vCUN',
      'scope': 'profile'
    })
      .then(user => {
        const userData = {
          email: user.email
        }
        this.authService.registerSocial(userData).subscribe(res => {
        })
      }).catch(err => console.error(err));
  }

  public login() {
    debugger;
    this.fb.login(['email', 'public_profile'])
      .then(res => {
        console.log("Success!");
        debugger;
        if (res.status === "connected") {
          this.isLoggedIn = true;
          this.getUserDetail(res.authResponse.userID);
        } else {
          this.isLoggedIn = false;
        }
      })
      .catch(e => console.log('Error logging into Facebook', e));
  }

  private getUserDetail(userid) {
    this.fb.api("/" + userid + "/?fields=id,email,name,picture,gender", ["public_profile"])
      .then(res => {
        console.log(res);
        this.users = res;
      })
      .catch(e => {
        console.log(e);
      });
  }

}
