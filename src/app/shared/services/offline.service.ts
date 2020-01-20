import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Todo } from '../models/todo.model';
import { environment } from '../../../environments/environment';
import { TodosService } from './todos.service';
import { DatabaseProvider } from '../../../providers/database/database';

@Injectable({
    providedIn: 'root'
})
export class OfflineService {

    private url = environment.url;
    public todo: Todo = {
        title: '',
        description: '',
        isDone: false,
        user_id: null,
        position: ''
    };

    constructor(
        private httpClient: HttpClient, 
        public storage: Storage, 
        public todoService: TodosService, 
        private databaseProvider: DatabaseProvider) 
        {
    }

    public addOffline() {
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

    public deleteOffline() {
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

    public updateOffline() {
        this.databaseProvider.getUpdated().then(res => {
            const updated = [];
            res.forEach(todo => {
                if (todo) {
                    updated.push(todo);
                    todo.position = JSON.parse(todo.position);
                }
            });
            if (updated.length != 0) {
                this.httpClient.put(`${this.url}/todos/update`, {
                    updated
                }).subscribe(data => {
                    this.databaseProvider.deleteUpdated();
                }, error => {
                    console.log(error);
                })
            }
            console.log(updated);
        })
    }
}