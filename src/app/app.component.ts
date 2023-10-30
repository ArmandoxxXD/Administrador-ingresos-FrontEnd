import { Component, OnInit } from '@angular/core';
import { io,Socket } from 'socket.io-client';
import { HomeService } from './Servicios/home.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'FrontEnd';
  private socket: Socket;
  public theme: "light" | "dark" = "light";
  
  constructor(private homeServices:HomeService, private toast:ToastrService )
  {
    this.socket = io('http://localhost:2000');
  }

  ngOnInit() {
    this.toast.success("Vale", 'OK', {timeOut:3000});

    // Escucha el evento 'excel-procesado' para recibir mensajes globales
    this.socket.on('excel-procesado', (mensagge: any) => {
        this.toast.success(mensagge,'OK',{timeOut:3000});
    });
    
    this.socket.on('reporte-eliminado', (mensagge: any) => {
      // Formatear la fecha a MM/yyyy
      const fecha = new Date(mensagge.data.fecha);
      const formattedDate = `${fecha.getMonth() + 1}/${fecha.getFullYear()}`; // Los meses van de 0 a 11, así que añadimos +1
      this.toast.success(mensagge.message+' '+formattedDate,'OK',{timeOut:3000});
    });
    
  }

  TemaOscuro() {
    document.querySelector('body')?.setAttribute("data-bs-theme", "dark");
    document.body.classList.add('dark-mode');
    document.querySelector('#icon')?.setAttribute("class", "fa-solid fa-sun");
    this.theme = 'dark';
    this.homeServices.setModoOscuro(true);
  }

  TemaClaro() {
    document.querySelector('body')?.setAttribute("data-bs-theme", "light");
    document.body.classList.remove('dark-mode');
    document.querySelector('#icon')?.setAttribute("class", "fa-solid fa-moon");
    this.theme = 'light';
    this.homeServices.setModoOscuro(false);
  }

  CambiarTema() {
    document.querySelector('body')?.getAttribute("data-bs-theme") === 'light' ? this.TemaOscuro() :this.TemaClaro();
  }
}
