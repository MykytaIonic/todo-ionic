import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Todo } from '../pages/models/todo.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  private url = environment.url;
  public todoList: Subject<any> = new Subject();
  public data;
  constructor(private httpClient: HttpClient) {
   }

  public getTodo(): Observable<Todo[]> {
    return this.httpClient.get<Todo[]>(`${this.url}/todos`);
  }

  public uploadImage(image) {
    return this.httpClient.post(`${this.url}/todos/image`, image);
  }

  public updateImage(image, todoId) {
    return this.httpClient.post(`${this.url}/todos/image/${todoId}`, image);
  }
}
