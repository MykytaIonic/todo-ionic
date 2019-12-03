import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Todo } from '../pages/models/todo.model';
import { environment } from '../../environments/environment';
import { TodosService } from './todos.service';
import { DatabaseProvider } from '../../providers/database/database';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {

    public url = environment.url;
    public todo: Todo = {
        title: '',
        description: '',
        isDone: false,
        user_id: null,
        position: ''
    };

    constructor(private httpClient: HttpClient, public storage: Storage, public todoService: TodosService, private databaseProvider: DatabaseProvider) {
    }

    addOffline() {
        this.databaseProvider.getTodos().then(res => {
            const todo = [];
            res.forEach(todos => {
                if (todos.mongoId === null) {
                    todos.pid = todos.id;
                    todo.push(todos);
                }
            });
                this.httpClient.post(`${this.url}/todos/create`, { 
                    todo
                 }).subscribe(res => {
                    this.databaseProvider.updateTodo(res);
                });
        })
    }

    deleteOffline() {
        this.databaseProvider.getDeleted().then(res => {
            const deleted = [];
            res.forEach(todo => {
                if (todo) {
                    deleted.push(todo.mongoId);
                }
            });
            if (deleted.length != 0) {
            this.httpClient.post(`${this.url}/todos/delete`, {
                deleted
            }).subscribe(data => {
                this.databaseProvider.deleteDeleted();
            }, error => {
              console.log(error);
            });
        }
            console.log(deleted);
        })
    }

    updateOffline() {
        this.databaseProvider.getUpdated().then(res => {
            const updated = [];
            res.forEach(todo => {
                if (todo) {
                    updated.push(todo);
                }
            });
            console.log(updated);
        })
    }
}