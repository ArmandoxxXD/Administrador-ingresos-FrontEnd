import { Component, OnInit } from '@angular/core';
import { HomeService } from 'src/app/Servicios/home.service';
import { IngresoService } from 'src/app/Servicios/ingreso.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  totalIngreso: number = 0;
  totalGastos: number = 0;
  Diferencias: number = 0;

  constructor(private ingresoService:IngresoService,private homeService:HomeService) {
  }

  ngOnInit() {
    this.getTotales();
    
    this.homeService.currentUpdate.subscribe(updated => {
      if (updated) {
        this.getTotales();
        this.homeService.notifyUpdate(false); // resetear el estado de actualización
      }
    });
  }
  
  getTotales() {
    this.ingresoService.obtenerIngresosTotales().subscribe(
      data => {
        this.totalIngreso = data.suma_total_mes;
      },
      error => {
        console.error('Error obteniendo los reportes:', error);
      }
    );
  }

}
