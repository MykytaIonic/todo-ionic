import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Photo } from '../models/photo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private url = environment.url;
  public photoList: Subject<number> = new Subject();
  public data;
  constructor(
    private httpClient: HttpClient) 
    {}

  public getPhoto(todoId): Observable<Photo[]> {
    return this.httpClient.get<Photo[]>(`${this.url}/todos/photo/${todoId}`);
  }

  public deletePhoto(imageId, photoName): Observable<Object> {
    return this.httpClient.post(`${this.url}/todos/photo/delete/${imageId}`, {
      name: photoName,
    })
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