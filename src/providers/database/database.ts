import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ResolvedStaticSymbol } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class DatabaseProvider {

  databaseObj: SQLiteObject;
  name_model: string = "";
  row_data: any = [];
  deleted: any;
  readonly database_name: string = "todos.db";
  readonly todos: string = "todos";
  readonly deletedTable: string = "deletedTable";
  readonly updatedTable: string = "updatedTable";
  public todo;

  constructor(
    private platform: Platform,
    private sqlite: SQLite,
    public storage: Storage
  ) {
    this.platform.ready().then(() => {
      this.createDB();
    }).catch(error => {
      console.log(error);
    })
  }


  createDB() {
    this.sqlite.create({
      name: this.database_name,
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        this.databaseObj = db;
        this.createTableTodos();
        this.createDeletedTable();
        this.createUpdatedTable();
        console.log('todos Database Created!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  createTableTodos() {
    this.databaseObj.executeSql('CREATE TABLE IF NOT EXISTS ' + this.todos + ' (id INTEGER PRIMARY KEY, pid , mongoId, title, description, isDone, user_id, position)', [])
      .then(() => {
        console.log('Table Todos Created!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  createDeletedTable() {
    this.databaseObj.executeSql('CREATE TABLE IF NOT EXISTS ' + this.deletedTable + ' (id INTEGER PRIMARY KEY, pid, mongoId, title, description, isDone, user_id, position)', [])
      .then(() => {
        console.log('Table Deleted Created!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  createUpdatedTable() {
    this.databaseObj.executeSql('CREATE TABLE IF NOT EXISTS ' + this.updatedTable + ' (id INTEGER PRIMARY KEY, pid, mongoId, title, description, isDone, user_id, position)', [])
      .then(() => {
        console.log('Table Updated Created!');
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
  }

  onUpgrade() {
    this.databaseObj.executeSql("DROP TABLE " + this.todos, []);
    this.databaseObj.executeSql("DROP TABLE " + this.deletedTable, []);
    console.log("Success!");
  }

  async addTodo(todo) {
    let id;
    let position = JSON.stringify(todo.position);
    let data = [todo.id, todo.title, todo.description, todo.isDone, todo.user_id, position];
    await this.databaseObj.executeSql("INSERT INTO todos (mongoId, title, description, isDone, user_id, position) VALUES (?,?, ?, ?, ?, ?)", data)
      .then(res => {
        id = res.insertId;
        console.log(res);
        this.getTodos();
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });
    return id;
  }

  async getTodos() {
    let user_id;
    await this.storage.get('USER_ID').then(data => {
      user_id = data;
    });
    await this.databaseObj.executeSql("SELECT * FROM " + this.todos + " WHERE user_id = " + "'" + user_id + "'", [])
      .then(async (res) => {
        this.row_data = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.row_data.push(res.rows.item(i));
          }
        }
        await this.row_data;
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
    console.log(this.row_data);
    return this.row_data;
  }

  async deleteRow(todoId) {
    await this.databaseObj.executeSql("DELETE FROM " + this.todos + " WHERE mongoId = " + "'" + todoId + "'", [])
      .then(async (res) => {
        console.log(res);
        alert("Row Deleted!");
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
  }

  async deleteOffline(todo) {
    let id;
    let data = [todo.mongoId, todo.title, todo.description, todo.isDone, todo.user_id, todo.position];
    await this.databaseObj.executeSql("INSERT INTO deletedTable (mongoId, title, description, isDone, user_id, position) VALUES (?, ?, ?, ?, ?, ?)", data)
      .then(res => {
        id = res.insertId;
      })
      .catch(e => {
        console.log("error " + JSON.stringify(e))
      });

    await this.databaseObj.executeSql("DELETE FROM " + this.todos + " WHERE id = " + "'" + todo.id + "'", [])
      .then(async (res) => {
        console.log(res);
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
  }

  async getDeleted() {
    let user_id;
    await this.storage.get('USER_ID').then(data => {
      user_id = data;
    });
    await this.databaseObj.executeSql("SELECT * FROM " + this.deletedTable + " WHERE user_id = " + "'" + user_id + "'", [])
      .then(async (res) => {
        this.row_data = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.row_data.push(res.rows.item(i));
          }
        }
        await this.row_data;
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
    return this.row_data;
  }

  updateTodo(todosElements) {
    todosElements.forEach((todo) => {
      this.databaseObj.executeSql(`UPDATE ${this.todos} SET mongoId = ? WHERE id = ${todo.pid}`, [todo.id])
        .then(res => {
          alert("Updated!");
        });
    })
  }

  updateAllTodo(todo) {
    return new Promise((resolve, reject) => {
      let position = JSON.stringify(todo.position);
      let data = [todo.title, todo.description, todo.isDone, todo.user_id, position];
      const sqlQuery = "UPDATE " + this.todos + " SET title=?, description=?, isDone=?, user_id=?, position=? WHERE mongoId='" + todo.id.toString()+"'";
      this.databaseObj.executeSql(sqlQuery, data)
        .then(res => {
          resolve(res);
          alert("Updated!");
        }, err => {
        });
  });
}

  updateTodoOffline(todo) {
    return new Promise((resolve, reject) => {
      if(todo.mongoId != null) {
        let data = [todo.title, todo.description, todo.isDone, todo.user_id];
        let todoToUpdate = [todo.mongoId, todo.title, todo.description, todo.isDone, todo.user_id, todo.position];
        this.databaseObj.executeSql("INSERT INTO updatedTable (mongoId, title, description, isDone, user_id, position) VALUES (?, ?, ?, ?, ?, ?)", todoToUpdate)
        .then(res => {
        })
        .catch(e => {
        console.log("error " + JSON.stringify(e))
        });

        const sqlQuery = "UPDATE " + this.todos + " SET title=?, description=?, isDone=?, user_id=? WHERE id=" + todo.id;
        this.databaseObj.executeSql(sqlQuery, data)
          .then(res => {
            resolve(res);
            alert("Updated!");
          }, err => {
          });
      }

      else if(todo.mongoId === null) {
        let data = [todo.title, todo.description, todo.isDone, todo.user_id];
        const sqlQuery = "UPDATE " + this.todos + " SET title=?, description=?, isDone=?, user_id=? WHERE id=" + todo.id;
        this.databaseObj.executeSql(sqlQuery, data)
          .then(res => {
            resolve(res);
            alert("Updated!");
          }, err => {
          });
      }

    });
  }

  async getUpdated() {
    let user_id;
    await this.storage.get('USER_ID').then(data => {
      user_id = data;
    });
    await this.databaseObj.executeSql("SELECT * FROM " + this.updatedTable + " WHERE user_id = " + "'" + user_id + "'", [])
      .then(async (res) => {
        this.row_data = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.row_data.push(res.rows.item(i));
          }
        }
        await this.row_data;
      })
      .catch(e => {
        alert("error " + JSON.stringify(e))
      });
    return this.row_data;
  }

async deleteDeleted() {
  await this.databaseObj.executeSql("DELETE  FROM " + this.deletedTable, [])
    .then(async (res) => {
      console.log(res);
    })
    .catch(e => {
      alert("error " + JSON.stringify(e))
    });
}

async deleteUpdated() {
  await this.databaseObj.executeSql("DELETE  FROM " + this.updatedTable, [])
    .then(async (res) => {
      console.log(res);
    })
    .catch(e => {
      alert("error " + JSON.stringify(e))
    });
}

}