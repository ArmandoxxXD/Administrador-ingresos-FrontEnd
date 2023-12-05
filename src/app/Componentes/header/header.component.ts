import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/Servicios/home.service';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';
import { Socket, io } from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private path = 'home';
  private socket: Socket;
  public home = new BehaviorSubject<boolean>(true); // inicialmente falso
  public ingresos = new BehaviorSubject<boolean>(false); // inicialmente falso
  public gastos = new BehaviorSubject<boolean>(false); // inicialmente falso
  user: string | undefined = '';
  isAuth: boolean = false;
  constructor(public auth: AuthService,
    private router: Router,
    private homeServices: HomeService,
    private toast: ToastrService,
    ) {
    this.socket = io('http://localhost:2000');
   }

  ngOnInit(): void {
    this.router.events.subscribe((date: any) => {
      this.setPath();
    })

    this.auth.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        
        // Escucha el evento 'excel-procesado' para recibir mensajes globales
        this.socket.on('reporte-cargado', (mensagge: any) => {
          this.toast.success(mensagge, 'OK', { timeOut: 3000 });
        });

        this.socket.on('reporte-eliminado', (mensagge: any) => {
          this.toast.success(mensagge, 'OK', { timeOut: 3000 });
        });

      }
    })


    this.auth.isAuthenticated$.subscribe(isAuthenticated =>{
      if(!isAuthenticated){
        this.router.navigate(['/inicio'])
      } else {
        this.isAuth = true;
        this.auth.user$.subscribe(user => {
          if (user) {
            this.user = user.given_name;
            this.socket.emit('login', this.user);
            console.log('Usuario enviado:', this.user);
          }
        });
      }
    })


    
  }


  public getPath(): string {
    return this.path
  }

  private setPath() {
    this.path = this.router.url;
  }

  logout() {
    this.auth.logout();
    // this.socket.emit('disconnect');
  }


}
