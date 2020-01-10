import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class SignupService {
  private url = environment.url;
  constructor(private httpClient: HttpClient) {}

  public checkEmailNotTaken(email: string) {
    return this.httpClient.post<any>(`${this.url}/users`, email);
  }
}