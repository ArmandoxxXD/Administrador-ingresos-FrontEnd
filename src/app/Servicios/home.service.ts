import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private updateSource = new BehaviorSubject<boolean>(false); // inicialmente falso
  currentUpdate = this.updateSource.asObservable();

  notifyUpdate(status: boolean) {
    this.updateSource.next(status);
  }

  constructor() { }
}
