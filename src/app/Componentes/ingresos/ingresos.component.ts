import { Component, ElementRef, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { IngresoService } from 'src/app/Servicios/ingreso.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { io,Socket } from 'socket.io-client';
@Component({
  selector: 'app-ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})
export class IngresosComponent implements OnInit{
  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  selectedFile: File | undefined;
  showSpinner = false;
  bsModalRef: BsModalRef | undefined;
  selectedFileName: string | undefined;
  reporteMensual: any;
  fechaMensual: any;
  ocultarDatosMensuales = false;
  ocultarDatosDiarios = true;
  miFormulario: FormGroup;
  private socket: Socket;

  constructor(private ingresoService:IngresoService,private modalService: BsModalService, private fb: FormBuilder) {
    this.miFormulario = this.fb.group({
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
    }, { validators: this.dateRangeValidator });
    this.socket = io('http://localhost:2000');
  }

  ngOnInit() {
    // Escucha el evento 'excel-procesado' para recibir mensajes globales
    this.socket.on('excel-procesado', (mensagge: any) => {
        window.alert(mensagge);
    });
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    // Actualizar el label del archivo seleccionado
    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name;
    } else {
      this.selectedFileName = undefined; 
    }
  }

  onSubmit(event: Event,template2: TemplateRef<any>) {
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
            this.reporteMensual=data.data
            this.fechaMensual = (document.getElementById('customDate') as HTMLInputElement).value;
            this.closeModal()
            setTimeout(() => { 
              this.openModal2(template2);
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

  openModal1(template: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template,{
      backdrop: 'static',
      keyboard: false
    });
  }

  openModal2(template2: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template2, {
      backdrop: 'static',
      keyboard: false
    }); // Abre el segundo modal
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
      inscripciones_total_mes:this. reporteMensual.DatosMensuales.inscripciones_total_mes,
      subvenciones_total_mes: this.reporteMensual.DatosMensuales.subvenciones_total_mes,
      titulos_total_mes: this.reporteMensual.DatosMensuales.titulos_total_mes,
      ventaProductos_total_mes: this.reporteMensual.DatosMensuales.ventaProductos_total_mes
    };

    console.log(dataMensual, dataDiaria, fecha)
    this.ingresoService.enviarReporte(dataDiaria, dataMensual, fecha).subscribe(
      response => {
        console.log('Información enviada con éxito', response);
        this.closeModal(); 
      },
      error => {
        console.error('Error al enviar la información', error);
        this.closeModal(); 
      }
    );
  } 

  private isSocketAvailable(): boolean {
    return this.socket.connected;
  }
  
}