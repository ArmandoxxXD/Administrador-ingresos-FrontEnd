import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IngresosComponent } from './Componentes/ingresos/ingresos.component';
import { GastosComponent } from './Componentes/gastos/gastos.component';
import { HomeComponent } from './Componentes/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Ruta predeterminada
  { path: 'home', component: HomeComponent }, 
  { path: 'ingresos', component: IngresosComponent },
  { path: 'gastos', component: GastosComponent },
  { path: '**', redirectTo: 'home' } // Ruta predeterminada si no encuentra una ruta valida
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }