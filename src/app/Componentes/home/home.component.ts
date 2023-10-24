import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GastoService } from 'src/app/Servicios/gasto.service';
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

  constructor
  (
    private ingresoService:IngresoService,
    private gastosService:GastoService,
    private homeService:HomeService
  ) 
  {

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
    forkJoin({
      ingreso: this.ingresoService.obtenerIngresosTotales(),
      gasto: this.gastosService.obtenerIngresosTotales()
    }).subscribe(result => {
      this.totalIngreso = result.ingreso.suma_total_mes;
      this.totalGastos = result.gasto.suma_total_mes;
      
      // Aquí es donde debes realizar el cálculo
      this.Diferencias = this.totalIngreso - this.totalGastos;
    },
    error => {
      console.error('Error obteniendo los reportes:', error);
    });
  }

}
