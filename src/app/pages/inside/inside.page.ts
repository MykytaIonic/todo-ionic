import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { TodosService } from '../../services/todos.service';
import { HttpClient } from '@angular/common/http';
import { Todo } from '../models/todo.model';
import { environment } from '../../../environments/environment';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../../../providers/database/database';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-inside',
  templateUrl: './inside.page.html',
  styleUrls: ['./inside.page.scss'],
})
export class InsidePage implements OnInit {

  public todos: Todo[] = [];
  public url = environment.url;
  public isConnect = true;

  constructor(public network: Network, private databaseProvider: DatabaseProvider, public storage: Storage, private httpClient: HttpClient, private todosService: TodosService, public activatedRoute: ActivatedRoute, private authService: AuthService, private toastController: ToastController, private route: Router) {
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

    this.network.onDisconnect().subscribe(() => {
      this.isConnect = false;
      this.storage.set('isConnect', false);
      this.getFromSqlite();
      console.log("Disconnect!");
    });

    this.network.onConnect().subscribe(() => {
      this.isConnect = true;
      this.storage.set('isConnect', true);
      this.getFromMongo();
      console.log("Connect!");
    });
  }

  ngOnInit() {
    if (this.isConnect === false) {
    this.getFromSqlite();
    }
    else if (this.isConnect === true) {
    this.getFromMongo();
    }
  }

  test() {
    this.databaseProvider.onUpgrade();
  }

  getFromMongo() {
    this.todosService.getTodo().subscribe((todos: Todo[]) => {
      this.todos = todos;
    });
  }

  getFromSqlite() {
    this.databaseProvider.getTodos().then((todos: Todo[]) => {
      this.todos = todos;
    });
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
    if (this.isConnect === true) {
      this.getFromMongo();
    }
    else if (this.isConnect === false) {
      this.getFromSqlite();
    }
  }

  addItem() {
    this.route.navigate(['/add-item']);
  }

  logout() {
    this.authService.logout();
  }

  removeTodo(todo) {
    debugger;
    this.storage.get('isConnect').then(async (isConnect) => {
      let todoId = 0;
      for (let i = 0; i < this.todos.length; i++) {
        if (this.todos[i] == todo) {
          todoId = this.todos[i].id;
          this.todos.splice(i, 1);
        }
      }
      if (isConnect === true) {
        this.databaseProvider.deleteRow(todoId).then(data => {
        }, error => {
          console.log(error);
        });

        this.httpClient.delete(`${this.url}/todos/delete/${todoId}`)
          .subscribe(data => {
          }, error => {
            console.log(error);
          });
      }
      else if (isConnect === false) {
        this.databaseProvider.deleteOffline(todo).then(data => {
        }, error => {
          console.log(error);
        });
      }
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
