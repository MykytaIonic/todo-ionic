import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Todo } from '../pages/models/todo.model';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  url = environment.url;
  public todoList: Subject<any> = new Subject();
  public data;
  constructor(private storage: Storage, private httpClient: HttpClient) {
   }

  getTodo(): Observable<Todo[]> {
    return this.httpClient.get<Todo[]>(`${this.url}/todos`);
  }

  uploadImage(image) {
    return this.httpClient.post(`${this.url}/todos/image`, image);
  }

  updateImage(image, todoId) {
    return this.httpClient.post(`${this.url}/todos/image/${todoId}`, image);
  }
}
