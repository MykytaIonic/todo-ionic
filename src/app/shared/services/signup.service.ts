import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SignupService {
  private url = environment.url;
  constructor(private httpClient: HttpClient) {}

  public checkEmailNotTaken(email: string): Observable<String> {
    return this.httpClient.post<any>(`${this.url}/users/find`, {
      email
    });
  }
}