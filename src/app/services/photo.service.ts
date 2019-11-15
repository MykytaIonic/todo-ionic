import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Photo } from '../pages/models/photo.model';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  url = environment.url;
  public photoList: Subject<any> = new Subject();
  public data;
  constructor(private storage: Storage, private httpClient: HttpClient) {
   }

  getPhoto(todoId): Observable<any> {
    return this.httpClient.get<Photo[]>(`${this.url}/todos/photo/${todoId}`);
  }
}