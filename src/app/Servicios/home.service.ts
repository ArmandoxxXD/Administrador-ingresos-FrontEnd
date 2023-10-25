import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  esModoOscuro:boolean=false;
  private updateSource = new BehaviorSubject<boolean>(false); // inicialmente falso
  currentUpdate = this.updateSource.asObservable();

  notifyUpdate(status: boolean) {
    this.updateSource.next(status);
  }

  isModoOscuro():boolean{
    return this.esModoOscuro=true;
  }

  isModoClaro(){
    return this.esModoOscuro=false;
  }

  getModo():boolean{
    return this.esModoOscuro
  }

  constructor() { }
}
