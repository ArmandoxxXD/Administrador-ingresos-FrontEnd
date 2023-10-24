import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { io,Socket } from 'socket.io-client';
import { HomeService } from 'src/app/Servicios/home.service';
import { GastoService } from 'src/app/Servicios/gasto.service';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent {
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  selectedFile: File | undefined;
  showSpinner = false;
  bsModalRef: BsModalRef | undefined;
  selectedFileName: string | undefined;
  reporteMensual: any;
  fechaMensual: any;
  ocultarDatosMensuales:boolean = false;
  ocultarDatosDiarios:boolean = true;
  miFormulario: FormGroup;
  miFormulario2: FormGroup;
  reportes: any;
  reporte: any;
  switchDiario: boolean =false;
  GastosDiarios: any;
  reporteSeleccionado: any;
  private socket: Socket;
  currentPage = 1;
  itemsPerPage = 10;
  fechavalid: boolean = false;

  constructor(
    private gatosService:GastoService,
    private homeService:HomeService,
    private modalService: BsModalService, 
    private fb: FormBuilder
    ) 
  {
    this.miFormulario = this.fb.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    }, { validators: this.dateRangeValidator });
    this.miFormulario2= this.fb.group({
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
    this.gatosService.validarMesAño(fecha).subscribe(
      response => {
        if (response.disponible === true){
          this.fechavalid = true;
        }else {
          this.fechavalid = false;
          window.alert(response.message)
        }
      },
      error => {
        console.error('Error al enviar la información', error);
      }
    )
  }

  onSubmit(event: Event,template: TemplateRef<any>) {
    event.preventDefault();
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('archivoExcel', this.selectedFile);
      setTimeout(() => {
        this.showSpinner = false;
        this.gatosService.CargarReporteExel(formData).subscribe(
          data => {
            console.log('Archivo cargado con éxito', data.data);
            if (this.isSocketAvailable()) {
              // El servicio Socket.io está disponible, envía el mensaje global
              this.socket.emit('excel-procesado', data.message);
            } else {
              // El servicio Socket.io no está disponible, maneja el mensaje local
              window.alert(data.message);
            }
            this.reporteMensual=data.data
            this.fechaMensual = (document.getElementById('customDate') as HTMLInputElement).value;
            this.closeModal()
            setTimeout(() => { 
              this.openModal(template);
            },500);
          },
          err=> {
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
    this.bsModalRef = this.modalService.show(template,{
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
      salarios_total_mes: this.reporteMensual.DatosMensuales.salarios_total_mes,
      infraestructura_Mantenimiento_total_mes:this. reporteMensual.DatosMensuales.infraestructura_Mantenimiento_total_mes,
      becas_total_mes: this.reporteMensual.DatosMensuales.becas_total_mes,
      tecnologiaRecursosAprendizaje_total_mes: this.reporteMensual.DatosMensuales.tecnologiaRecursosAprendizaje_total_mes,
      serviciosEstudiantiles_total_mes: this.reporteMensual.DatosMensuales.serviciosEstudiantiles_total_mes,
      total_mes: this.reporteMensual.DatosMensuales.total_mes
    };

    console.log(dataMensual, dataDiaria, fecha)
    this.gatosService.enviarReporte(dataDiaria, dataMensual, fecha).subscribe(
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

    if(this.switchDiario==false){
      this.gatosService.obtenerReportesPorMes(fechaInicio, fechaFin).subscribe(
        data => {
          this.reportes = data;
          console.log(this.reportes);
        },
        error => {
          console.error('Error obteniendo los reportes:', error);
        }
      );
    }else { 
      this.gatosService.obtenerReportesPorDias(fechaInicio, fechaFin).subscribe(
        data => {
          this.GastosDiarios = data;
          console.log(this.GastosDiarios);
        },
        error => {
          console.error('Error obteniendo los reportes:', error);
        }
      );
    }
    
  }

  get displayedItems(): any[] {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    return this.GastosDiarios.slice(startIdx, startIdx + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.GastosDiarios.length / this.itemsPerPage);
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

  verDetalleReporteMensual(template: TemplateRef<any>,id: number){ 
    this.openModal(template);
    this.gatosService.obtenerReporteMensualPorID(id).subscribe(
      data => {
        this.reporte = data;
        console.log(this.reporte);
      },
      error => {
        console.error('Error obteniendo los reportes:', error);
      }
    )
  }

  eliminarReporteMensual(id: number){ 
    this.gatosService.eliminarReporteDiarioPorId(id).subscribe(
      async data => {
        if (this.isSocketAvailable()) {
          // El servicio Socket.io está disponible, envía el mensaje global
          this.socket.emit('reporte-eliminado', data);
          this.homeService.notifyUpdate(true); 
        } else {
          // El servicio Socket.io no está disponible, maneja el mensaje local
          window.alert(data);
        }
      await this. filtrarRegistros()
      },
      error => {
        console.error('Error obteniendo los reportes:', error);
      }
    )
  }

  private isSocketAvailable(): boolean {
    return this.socket.connected;
  }
}
