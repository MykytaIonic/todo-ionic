import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AddItemPage } from '../add-item/add-item.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { Observable } from 'rxjs';
import { TodosService } from '../../services/todos.service';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../models/todo.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {

  public todos: Todo[] = [];
  url = environment.url;

  constructor(private httpClient: HttpClient, private todosService: TodosService, public activatedRoute: ActivatedRoute, private authService: AuthService, private toastController: ToastController, private route: Router) {
    this.todosService.todoList.subscribe((res) => {
      const itemToUpdate = this.todos.find(x => x.id === res.id);

      if (itemToUpdate) {
        this.todos.forEach((x, i) => {
          if (x.id === res.id) {
            this.todos[i] = Object.assign({}, res);
          }
        });
      } else {
        this.todos.push(res);
      }
    });

    this.todosService.getTodo().subscribe((todos: Todo[]) => {
      this.todos = todos;
    });
  }

  ngOnInit() {
  }

  addItem() {
    this.route.navigate(['/add-item']);
  }

  logout() {
    this.authService.logout();
  }

  removeTodo(todo) {
    let todoId = 0;
    for (let i = 0; i < this.todos.length; i++) {
      if (this.todos[i] == todo) {
        todoId = this.todos[i].id;
        this.todos.splice(i, 1);
      }
    }
    this.httpClient.delete(`${this.url}/todos/delete/${todoId}`)
      .subscribe(data => {
      }, error => {
        console.log(error);
      });
  }

  editTodo(todo) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(todo)
      }
    };
    this.route.navigate(['item-details'], navigationExtras);
  }

}
