import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GastoService } from 'src/app/Servicios/gasto.service';
import { HomeService } from 'src/app/Servicios/home.service';
import { IngresoService } from 'src/app/Servicios/ingreso.service';
import { Observable } from 'rxjs';
import * as echarts from 'echarts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  totalIngreso: number = 0;
  total: number = 0;
  totalGastos: number = 15600;

  // Variable graficas
  chartDom: any
  myChart: any

  constructor
    (
      private ingresoService: IngresoService,
      private gastosService: GastoService,
      private homeService: HomeService
    ) {

  }

  ngOnInit() {
    this.getTotales();
    this.modoOscuro();

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
      gasto: this.gastosService.obtenerGastosTotales()
    }).subscribe(result => {
      this.totalIngreso = result.ingreso.suma_total_mes;
      this.totalGastos = result.gasto.suma_total_mes;

      // Aquí es donde debes realizar el cálculo
      this.total = this.totalIngreso - this.totalGastos;
      this.actualizarGrafica();
    },
      error => {
        console.error('Error obteniendo los reportes:', error);
      });
  }

  modoOscuro() {
    this.homeService.modoOscuro.subscribe((value: boolean) => {

      if (value == false) {
        this.myChart.setOption({
          theme: 'light', // Aplica el tema oscuro
          backgroundColor: '#ffffff', // Cambia el color de fondo a blanco
          textStyle: {
            color: '#000000' // Cambia el color del texto a negro
          },
          legend: {
            textStyle: {
              color: 'black' // Cambia el color del texto de la leyenda a blanco
            }
          },
        })
        console.log(value)
      }


      if (value == true) {
        this.myChart.setOption({
          theme: 'dark', // Aplica el tema oscuro
          backgroundColor: '#212529', // Cambia el color de fondo a negro
          textStyle: {
            color: '#ffffff' // Cambia el color del texto a blanco
          },
          legend: {
            textStyle: {
              color: 'white' // Cambia el color del texto de la leyenda a blanco
            }
          },
        })
        console.log(value)
      }


    })
  }

  actualizarGrafica() {
    this.chartDom = document.getElementById('Grafica-Principal');
    this.myChart = echarts.init(this.chartDom);
    var option;

    option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      color: ['#1781E8', '#FF0DC0'],
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: '92%',
          data: [
            { value: this.total, name: 'Ingresos' },
            { value: this.totalGastos, name: 'Gastos' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };


    option && this.myChart.setOption(option);
  }

}
