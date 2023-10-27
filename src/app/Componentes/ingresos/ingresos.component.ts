import { Component, ElementRef, ViewChild, NgZone, TemplateRef, OnInit } from '@angular/core';
import { IngresoService } from 'src/app/Servicios/ingreso.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { HomeService } from 'src/app/Servicios/home.service';

import { createChart, LineStyle, CrosshairMode } from 'lightweight-charts';

@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})

export class IngresosComponent {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  selectedFile: File | undefined;
  showSpinner = false;
  bsModalRef: BsModalRef | undefined;
  selectedFileName: string | undefined;
  reporteMensual: any;
  fechaMensual: any;
  ocultarDatosMensuales: boolean = false;
  ocultarDatosDiarios: boolean = true;
  miFormulario: FormGroup;
  miFormulario2: FormGroup;
  reportes: any;
  reporte: any;
  switchDiario: boolean = false;
  IngresosDiarios: any;
  reporteSeleccionado: any;
  private socket: Socket;
  currentPage = 1;
  itemsPerPage = 10;
  fechavalid: boolean = false;

  // Variables Grafica
  private chart: any; // Declarar la variable para el gráfico
  private lineSeries: any;
  private areaSeries: any;

  constructor(
    private ingresoService: IngresoService,
    private homeService: HomeService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private zone: NgZone
  ) {
    this.miFormulario = this.fb.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    }, { validators: this.dateRangeValidator });
    this.miFormulario2 = this.fb.group({
      archivo: [null, Validators.required],
      fechaRegistro: [null, Validators.required],
    });
    this.socket = io('http://localhost:2000');




  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    // Actualizar el label del archivo seleccionado
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
    } else {
      this.selectedFileName = undefined;
    }
  }

  validarFecha(fecha: string) {
    this.ingresoService.validarMesAño(fecha).subscribe(
      response => {
        if (response.disponible === true) {
          this.fechavalid = true;
        } else {
          this.fechavalid = false;
          window.alert(response.message)
        }
      },
      error => {
        console.error('Error al enviar la información', error);
      }
    )
  }

  onSubmit(event: Event, template: TemplateRef<any>) {
    event.preventDefault();
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('archivoExcel', this.selectedFile);
      setTimeout(() => {
        this.showSpinner = false;
        this.ingresoService.CargarReporteExel(formData).subscribe(
          data => {
            console.log('Archivo cargado con éxito', data.data);
            if (this.isSocketAvailable()) {
              // El servicio Socket.io está disponible, envía el mensaje global
              this.socket.emit('excel-procesado', data.message);
            } else {
              // El servicio Socket.io no está disponible, maneja el mensaje local
              window.alert(data.message);
            }
            this.reporteMensual = data.data
            this.fechaMensual = (document.getElementById('customDate') as HTMLInputElement).value;
            this.closeModal()
            setTimeout(() => {
              this.openModal(template);
            }, 500);
          },
          err => {
            this.closeModal();
            console.error('Error al cargar el archivo', err);
          }
        );
      }, 2000);
    } else {
      console.error('Debes seleccionar un archivo');
    }
  }

  openModal(template: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template, {
      backdrop: 'static',
      keyboard: false
    });
  }


  closeModal() {
    this.clearFileInput();
    this.bsModalRef?.hide();
  }


  clearFileInput() {
    this.selectedFile = undefined; // Limpia la variable selectedFile
    this.selectedFileName = undefined; // Limpia el nombre del archivo seleccionado
  }

  insertarReporteMensual() {
    const fecha = this.fechaMensual
    // Extrae la información diaria y mensual desde el objeto de reporte
    const dataDiaria = {
      fechas: this.reporteMensual.Diario.datosDelRangoDias,
      totales: this.reporteMensual.Diario.datosDelRangoTotalDia
    };
    const dataMensual = {
      auxiliares_total_mes: this.reporteMensual.DatosMensuales.auxiliares_total_mes,
      inscripciones_total_mes: this.reporteMensual.DatosMensuales.inscripciones_total_mes,
      subvenciones_total_mes: this.reporteMensual.DatosMensuales.subvenciones_total_mes,
      titulos_total_mes: this.reporteMensual.DatosMensuales.titulos_total_mes,
      ventaProductos_total_mes: this.reporteMensual.DatosMensuales.ventaProductos_total_mes,
      total_mes: this.reporteMensual.DatosMensuales.total_mes
    };

    console.log(dataMensual, dataDiaria, fecha)
    this.ingresoService.enviarReporte(dataDiaria, dataMensual, fecha).subscribe(
      response => {
        console.log('Información enviada con éxito', response);
        this.closeModal();
        this.homeService.notifyUpdate(true);
      },
      error => {
        console.error('Error al enviar la información', error);
        this.closeModal();
      }
    );
  }

  filtrarRegistros() {
    const fechaInicio = this.miFormulario?.get('fechaInicio')?.value;
    const fechaFin = this.miFormulario.get('fechaFin')?.value;

    if (this.switchDiario == false) {
      this.ingresoService.obtenerReportesPorMes(fechaInicio, fechaFin).subscribe(
        data => {
          this.reportes = data;
          let object = {};

          // Se genera un array para generar la grafica
          let array: object[] = [];

          // Se genera la grafica con un forEach
          this.reportes.forEach((dato: any) => {
            object = { time: this.filtrarFecha(dato.fecha), value: dato.data.total_mes }
            array.push(object);
          });

          // Se agrega la información para generar la grafica
          this.lineSeries.setData(array);
          this.areaSeries.setData(array);

        },
        error => {
          console.error('Error obteniendo los reportes:', error);
        }
      );
    } else {
      this.ingresoService.obtenerReportesPorDias(fechaInicio, fechaFin).subscribe(
        data => {
          this.IngresosDiarios = data;

          let object = {}

          // Se genera un array para generar la grafica
          let array: object[] = [];

          // Se genera la grafica con un forEach
          this.IngresosDiarios.forEach((dato: any) => {
            object = { time: this.filtrarFecha(dato.fecha), value: parseInt(dato.total) }
            array.push(object);
          });

          console.log(array)
          // Se agrega la información para generar la grafica
          this.lineSeries.setData(array);
          this.areaSeries.setData(array);

          this.chart.timeScale().fitContent();

        },
        error => {
          console.error('Error obteniendo los reportes:', error);
        }
      );
    }

    // Acomoda la grafica a los contenidos mostrados
    this.chart.timeScale().fitContent();

  }

  get displayedItems(): any[] {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    return this.IngresosDiarios.slice(startIdx, startIdx + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.IngresosDiarios.length / this.itemsPerPage);
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
    }
  }

  onSwitchChange() {
    this.switchDiario = !this.switchDiario;
  }

  dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
    const fechaInicioControl = group.get('fechaInicio');
    const fechaFinControl = group.get('fechaFin');

    if (fechaInicioControl && fechaFinControl) {
      const fechaInicio = fechaInicioControl.value;
      const fechaFin = fechaFinControl.value;

      if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
        return { dateRangeInvalid: true };
      }
    }

    return null;
  }

  verDetalleReporteMensual(template: TemplateRef<any>, id: number) {
    this.openModal(template);
    this.ingresoService.obtenerReporteMensualPorID(id).subscribe(
      data => {
        this.reporte = data;
        console.log(this.reporte);
      },
      error => {
        console.error('Error obteniendo los reportes:', error);
      }
    )
  }

  eliminarReporteMensual(id: number) {
    this.ingresoService.eliminarReporteDiarioPorId(id).subscribe(
      async data => {
        if (this.isSocketAvailable()) {
          // El servicio Socket.io está disponible, envía el mensaje global
          this.socket.emit('reporte-eliminado', data);
          this.homeService.notifyUpdate(true);
        } else {
          // El servicio Socket.io no está disponible, maneja el mensaje local
          window.alert(data);
        }
        await this.filtrarRegistros()
      },
      error => {
        console.error('Error obteniendo los reportes:', error);
      }
    )
  }

  private isSocketAvailable(): boolean {
    return this.socket.connected;
  }

  modoOscuro() {
    this.homeService.modoOscuro.subscribe((value: boolean) => {
      if (value == false) {
        this.chart.applyOptions({
          layout: {
            background: {
              color: '#212529',
            },
            textColor: '#fff',
          },
        })
      }
      
      if (value == true) { 
        this.chart.applyOptions({
          layout: {
            background: {
              color: '#000000',
            },
            textColor: '#fff',
          },
        })
      }

    })
  }

  ngOnInit(): void {

    // Get the current users primary locale
    const currentLocale = window.navigator.languages[0];

    // Create a number format using Intl.NumberFormat
    const myPriceFormatter = Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency: 'MXN', // Currency for data points
    }).format;

    this.chart = createChart('chart-container', {
      localization: {
        priceFormatter: myPriceFormatter,
      },
      layout: {
        background: {
          color: '#000000',
        },
        textColor: '#d1d4dc',
        fontFamily: "'Roboto', sans-serif"
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: 'rgba(42, 46, 57, 0.5)',
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },

    });

    this.chart.applyOptions({
      crosshair: {
        style: LineStyle.Solid,
        // Change mode from default 'magnet' to 'normal'.
        // Allows the crosshair to move freely without snapping to datapoints
        mode: CrosshairMode.Normal,

        // Vertical crosshair line (showing Date in Label)
        vertLine: {
          width: 8,
          color: "#C3BCDB44",

          labelBackgroundColor: "#9B7DFF",
        },

        // Horizontal crosshair line (showing Price in Label)
        horzLine: {
          color: "#9B7DFF",
          labelBackgroundColor: "#9B7DFF",
        },
      },
    });

    this.areaSeries = this.chart.addAreaSeries({
      topColor: 'rgba(76, 175, 80, 0.56)',
      bottomColor: 'rgba(76, 175, 80, 0.04)',
      lineColor: 'transparent', // hide the line
      lineWidth: 2,
      lastValueVisible: false, // hide the last value marker for this series
      crosshairMarkerVisible: false, // hide the crosshair marker for this series

    });
    // Set the data for the Area Series


    this.lineSeries = this.chart.addLineSeries({ color: '#47CA47' });

    const datos = [
      { time: '2023-01-01', value: 0 },

    ];

    datos.forEach((dato: any) => {
      this.lineSeries.update(
        dato
      );
      this.areaSeries.update(dato);
    });

    this.modoOscuro();

  }

  filtrarFecha(fechaOriginal: any): String {
    const fecha = new Date(fechaOriginal); // Convierte la fecha original en un objeto Date
    const year = fecha.getFullYear(); // Obtiene el año
    const month = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Obtiene el mes y lo formatea
    const day = fecha.getDate().toString().padStart(2, '0'); // Obtiene el día y lo formatea

    const fechaFormateada = `${year}-${month}-${day}`; // Crea la fecha formateada

    return fechaFormateada;
  }

}