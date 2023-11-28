import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/Servicios/home.service';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private path = 'home';
  public home = new BehaviorSubject<boolean>(true); // inicialmente falso
  public ingresos = new BehaviorSubject<boolean>(false); // inicialmente falso
  public gastos = new BehaviorSubject<boolean>(false); // inicialmente falso

  constructor(public auth: AuthService,private router: Router, private homeServices: HomeService) { }

  ngOnInit(): void {
    this.router.events.subscribe((date: any) => {
      this.setPath();
    })
    
    console.log("observar path")
  }


  public getPath(): string {
    return this.path
  }

  private setPath() {
    this.path = this.router.url;
  }

  logout() {
    console.log('lasa')
    this.auth.logout();
  }


}
