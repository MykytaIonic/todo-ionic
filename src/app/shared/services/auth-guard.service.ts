import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private auth: AuthService) { }

  public canActivate(): boolean {
    return this.auth.isAuthenticated();
  }
}
