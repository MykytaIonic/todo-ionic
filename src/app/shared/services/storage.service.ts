import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  constructor(
    public storage: Storage
  ) {}

  public getUser(): Promise<number> {
    return this.storage.get('USER_ID');
  }

  public getConnect(): Promise<Boolean> {
    return this.storage.get('isConnect');
  }
}