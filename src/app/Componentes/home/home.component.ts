import { Component, OnInit } from '@angular/core';
import { HomeService } from 'src/app/Servicios/home.service';
import { IngresoService } from 'src/app/Servicios/ingreso.service';
import * as echarts from 'echarts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  totalIngreso: number = 0;
  totalGastos: number = 15600;
  Diferencias: number = 0;

  constructor(private ingresoService: IngresoService, private homeService: HomeService) {
  }

  ngOnInit() {
    this.getTotales().then(totalIngreso => {
      var chartDom = document.getElementById('grafica-Principal');
      var myChart = echarts.init(chartDom);
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
              { value: totalIngreso, name: 'Ingresos' },
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

      option && myChart.setOption(option);
    });

    this.homeService.currentUpdate.subscribe(updated => {
      if (updated) {
        this.getTotales().then(() => {
          this.homeService.notifyUpdate(false); // resetear el estado de actualización
        });
      }
    });

  }

  getTotales() {
    return new Promise((resolve, reject) => {
      this.ingresoService.obtenerIngresosTotales().subscribe(
        data => {
          this.totalIngreso = data.suma_total_mes;
          this.Diferencias = Math.abs(this.totalGastos - this.totalIngreso);
          resolve(this.totalIngreso);
        },
        error => {
          console.error('Error obteniendo los reportes:', error);
          reject(error);
        }
      );
    });
  }

}
