import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IngresosComponent } from './Componentes/ingresos/ingresos.component';
import { GastosComponent } from './Componentes/gastos/gastos.component';
import { HomeComponent } from './Componentes/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { HeaderComponent } from './Componentes/header/header.component';
import { NgxEchartsModule } from 'ngx-echarts';

@NgModule({
  declarations: [
    AppComponent,
    IngresosComponent,
    GastosComponent,
    HomeComponent,
    HeaderComponent
  ],
  imports: [
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    ModalModule.forRoot(),
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
