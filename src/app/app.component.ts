import { Component, OnInit } from '@angular/core';
import { io,Socket } from 'socket.io-client';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'FrontEnd';
  private socket: Socket;
  
  constructor( )
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
}
