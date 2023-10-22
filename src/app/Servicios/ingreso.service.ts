import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

  clienteURL='http://localhost:3000/ingresos/';

  constructor(private httpClient:HttpClient) { }

  public CargarReporteExel(reporte:FormData):Observable<any>{
    return this.httpClient.post<any>(this.clienteURL+'cargar-excel', reporte);
  }
  
  public enviarReporte(dataDiaria: any, dataMensual: any, fecha: string): Observable<any> {
    return this.httpClient.post<any>(this.clienteURL + 'cargar-ingreso', { 
      reporteDiario: dataDiaria,
      reporteMensual: dataMensual, 
      fechaReporte: fecha 
    });
  }

}

