import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Photo } from '../models/photo.model';
import { Storage } from '@ionic/storage';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private url = environment.url;
  public photoList: Subject<any> = new Subject();
  public data;
  constructor(
    private storage: Storage, 
    private httpClient: HttpClient) 
    {}

  public getPhoto(todoId): Observable<any> {
    return this.httpClient.get<Photo[]>(`${this.url}/todos/photo/${todoId}`);
  }

  public b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  }
}