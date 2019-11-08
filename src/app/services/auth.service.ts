import { Platform, AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'access_token';
const USER_ID = 'user_id';
const helper = new JwtHelperService();
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  url = environment.url;
  user = null;
  authenticationState = new BehaviorSubject(false);

  constructor(private http: HttpClient, public storage: Storage,
    private plt: Platform, private alertController: AlertController) {
    this.plt.ready().then(() => {
      this.checkToken();
    });
   }

   checkToken() {
     this.storage.get(TOKEN_KEY).then(token => {
       if (token) {
         let decoded = helper.decodeToken(token);
         let isExpired = helper.isTokenExpired(token);

         if (!isExpired) {
           this.user = decoded;
           this.authenticationState.next(true);
         } else {
           this.storage.remove(TOKEN_KEY);
         }
       }
     });
   }

   register(credentials) {
     return this.http.post(`${this.url}/auth/register`, credentials).pipe(
       catchError(e => {
         this.showAlert(e.error.msg);
         throw new Error(e);
       })
     );
   }

   registerSocial(credentials) {
     return this.http.post(`${this.url}/auth/registerSocial`, credentials).pipe(
       tap(res => {
         this.storage.set('USER_ID', res['data']['user_id']);
         this.storage.set('TOKEN_KEY', res['data']['access_token']);
         //this.user = this.helper.decodeToken(res['data']['access_token']);
         this.authenticationState.next(true);
       }),
       catchError(e => {
         this.showAlert(e.error.msg);
         throw new Error(e);
        })
     );
   }

   login(credentials) {
     return this.http.post(`${this.url}/auth/login`, credentials)
     .pipe(
       tap(res => {
         this.storage.set('USER_ID', res['data']['user_id']);
         this.storage.set('TOKEN_KEY', res['data']['access_token']);
         //this.user = this.helper.decodeToken(res['data']['access_token']);
         this.authenticationState.next(true);
       }),
       catchError(e => {
         this.showAlert(e.error.msg);
         throw new Error(e);
        })
     );
   }

   logout() {
     this.storage.remove(TOKEN_KEY).then(() => {
       this.storage.remove(USER_ID);
       this.authenticationState.next(false);
     });
   }

   isAuthenticated() {
     return this.authenticationState.value;
   }

   showAlert(msg) {
     let alert = this.alertController.create( {
       message: msg,
       header: 'Error',
       buttons: ['OK']
     });
     alert.then(alert => alert.present());
   }
}
