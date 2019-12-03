import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { catchError, mergeMap } from 'rxjs/operators';
import { AuthService } from '../.././app/services/auth.service';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

  constructor(private storage: Storage, private alertCtrl: AlertController, private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let promise = this.storage.get('TOKEN_KEY');
    return from(promise).pipe(mergeMap((token) => {
      const req = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(req);
    }));
  }
}
