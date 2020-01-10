import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { catchError, mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class InterceptorProvider implements HttpInterceptor {

  constructor(
    private route: Router, 
    private storage: Storage
    ) 
    { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let promise = this.storage.get('TOKEN_KEY');
    return from(promise).pipe(mergeMap((token) => {
      const req = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(req);
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.error.statusCode === 401) {
        this.route.navigate(['/login']);
      }
      return throwError(error);
    })
    );
  }
}
