import { AuthService } from '../../shared/services/auth.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { TodosService } from '../../shared/services/todos.service';
import { Todo } from '../../shared/models/todo.model';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../../../providers/database/database';
import { Network } from '@ionic-native/network/ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  public subscriptions: Subscription[] = [];
  public todos: Todo[] = [];
  public isConnect = true;

  constructor(
    public network: Network,
    private databaseProvider: DatabaseProvider, 
    public storage: Storage, 
    private todosService: TodosService, 
    public activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private route: Router) 
    {
    const sub = this.todosService.todoList.subscribe((res: Todo) => {
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

    this.subscriptions.push(sub);

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

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => {
      x.unsubscribe()
    })
  }

  ngOnInit(): void {
    if (this.isConnect === false) {
      this.getFromSqlite();
    }
    else {
      this.getFromMongo();
    }
  }

  private getFromMongo(): void {
    this.todosService.getTodo().subscribe((todos: Todo[]) => {
      this.todos = todos;
    });
  }

  private getFromSqlite(): void {
    this.databaseProvider.getTodos().then((todos: Todo[]) => {
      this.todos = todos;
    });
  }

  public doRefresh(event): void {
    if (this.isConnect) {
     this.todosService.getTodo().subscribe((todos: Todo[]) => {
      this.todos = todos;
      event.target.complete();
    });
    }
    else {
     this.databaseProvider.getTodos().then((todos: Todo[]) => {
      this.todos = todos;
      event.target.complete();
    });
    }
  }

  public addItem(): void {
    this.route.navigate(['/add-item']);
  }

  public logout(): void {
    this.authService.logout();
  }

  public removeTodo(todo: Todo): void {
    this.storage.get('isConnect').then(async (isConnect) => {
      let todoId = 0;
      for (let i = 0; i < this.todos.length; i++) {
        if (this.todos[i] == todo) {
          todoId = this.todos[i].id;
          this.todos.splice(i, 1);
        }
      }
      if (isConnect) {
        this.databaseProvider.deleteRow(todoId).then(data => {
        }, error => {
          console.log(error);
        });
         this.todosService.deleteTodo(todoId); 
      }
      else {
        this.databaseProvider.deleteOffline(todo).then(data => {
        }, error => {
          console.log(error);
        });
      }
    });
  }

  public editTodo(todo: Todo): void {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        special: JSON.stringify(todo)
      }
    };
    this.route.navigate(['item-details'], navigationExtras);
  }

}
