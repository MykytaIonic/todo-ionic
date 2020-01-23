import { AlertController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../../environments/environment';
import { tap, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'TOKEN_KEY';
const USER_ID = 'user_id';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url: string = environment.url;
  public authenticationState = new BehaviorSubject(false);

  constructor(
    private http: HttpClient, 
    public storage: Storage,
    private alertController: AlertController
    ) 
    {
    this.checkToken();
  }

  private checkToken() {
    this.storage.get(TOKEN_KEY).then(token => {
      if (token) {
        this.authenticationState.next(true);
      } else {
        this.storage.remove(TOKEN_KEY);
      }
    });
  }

  public register(credentials: string) {
    return this.http.post(`${this.url}/auth/register`, credentials).pipe(
      tap(res => {
        this.storage.set('USER_ID', res['data']['user_id']);
        this.storage.set('TOKEN_KEY', res['data']['access_token']);
        this.authenticationState.next(true);
      }),
      catchError(e => {
        this.showAlert(e.error.msg);
        throw new Error(e);
      })
    );
  }

  public registerSocial(credentials: object) {
    return this.http.post(`${this.url}/auth/registerSocial`, credentials).pipe(
      tap(res => {
        this.storage.set('USER_ID', res['data']['user_id']);
        this.storage.set('TOKEN_KEY', res['data']['access_token']);
        this.authenticationState.next(true);
      }),
      catchError(e => {
        this.showAlert(e.error.msg);
        throw new Error(e);
      })
    );
  }

  public login(credentials: string) {
    return this.http.post(`${this.url}/auth/login`, credentials)
      .pipe(
        tap(res => {
          this.storage.set('USER_ID', res['data']['user_id']);
          this.storage.set('TOKEN_KEY', res['data']['access_token']);
          this.authenticationState.next(true);
        }),
        catchError(e => {
          this.showAlert(e.error.msg);
          throw new Error(e);
        })
      )
  }

  public logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.storage.remove(USER_ID);
      this.authenticationState.next(false);
    });
  }

  public isAuthenticated() {
    return this.authenticationState.value;
  }

  private showAlert(msg: string) {
    let alert = this.alertController.create({
      message: msg,
      header: 'Error',
      buttons: ['OK']
    });
    alert.then(alert => alert.present());
  }
}
