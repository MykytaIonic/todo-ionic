import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Todo } from '../models/todo.model';
import { Photo } from '../models/photo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  private url = environment.url;
  public todoList: Subject<Todo> = new Subject();
  public data;
  constructor(private httpClient: HttpClient) {
   }

  public getTodo(): Observable<Todo[]> {
    return this.httpClient.get<Todo[]>(`${this.url}/todos`);
  }

  public createTodo(todo: Todo, photos): Observable<Object> {
    return this.httpClient.post(`${this.url}/todos/create`, {
      todo: todo, 
      photos: photos
    })
  }

  public uploadImage(image: FormData): Observable<Object> {
    return this.httpClient.post(`${this.url}/todos/image`, image);
  }

  public updateImage(image: FormData, todoId: number): Observable<Object> {
    return this.httpClient.post(`${this.url}/todos/image/${todoId}`, image);
  }

  public deleteTodo(todoId: number) {
    this.httpClient.delete(`${this.url}/todos/delete/${todoId}`)
        .subscribe(data => {
        }, error => {
          console.log(error);
        });
    }
}
