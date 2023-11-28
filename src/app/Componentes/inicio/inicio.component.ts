import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Socket, io } from 'socket.io-client';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  constructor(public auth: AuthService, private router:Router) {
    this.socket = io('http://localhost:2000');
  }
  isAuth :boolean = false;
  private socket: Socket;
  user: any
  
  ngOnInit(): void {

    this.auth.isAuthenticated$.subscribe(isAuthenticated =>{
      if(isAuthenticated){
        this.router.navigate(['/inicio'])
        this.isAuth = true;

          this.auth.user$.subscribe(user => {
            if (user) {
              this.user = user.given_name;
              this.socket.emit('login', this.user);
              console.log('Usuario enviado:', this.user);
            }
          });

      } else 
        {
          this.router.navigate(['/inicio'])
          this.isAuth = false;
        }
    })
  }

  login() {
    this.auth.loginWithRedirect();
  }

}
