import { Component, OnInit } from '@angular/core';
import { io,Socket } from 'socket.io-client';
import { HomeService } from './Servicios/home.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'FrontEnd';
  private socket: Socket;
  
  constructor(private homeServices:HomeService )
  {
    this.socket = io('http://localhost:2000');
  }

  ngOnInit() {
    // Escucha el evento 'excel-procesado' para recibir mensajes globales
    this.socket.on('excel-procesado', (mensagge: any) => {
        window.alert(mensagge);
    });
    
    this.socket.on('reporte-eliminado', (mensagge: any) => {
      // Formatear la fecha a MM/yyyy
      const fecha = new Date(mensagge.data.fecha);
      const formattedDate = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`; // Los meses van de 0 a 11, así que añadimos +1
      window.alert(mensagge.message+' '+formattedDate);
    });
    
  }

  TemaOscuro() {
    document.querySelector('body')?.setAttribute("data-bs-theme", "dark");
    document.querySelector('#icon')?.setAttribute("class", "fa-solid fa-sun");
    this.homeServices.isModoOscuro();
    console.log(this.homeServices.isModoOscuro())
  }

  TemaClaro() {
    document.querySelector('body')?.setAttribute("data-bs-theme", "light");
    document.querySelector('#icon')?.setAttribute("class", "fa-solid fa-moon");
    this.homeServices.isModoClaro();
  }

  CambiarTema() {
    document.querySelector('body')?.getAttribute("data-bs-theme") === 'light' ? this.TemaOscuro() :this.TemaClaro();
  }
}
