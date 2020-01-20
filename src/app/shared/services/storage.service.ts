import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  constructor(
    public storage: Storage
  ) {}

  public getUser() {
    return this.storage.get('USER_ID');
  }

  public getConnect() {
    return this.storage.get('isConnect');
  }
}