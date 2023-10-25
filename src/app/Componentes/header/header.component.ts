import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/Servicios/home.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  private path = 'home';

  constructor(private router: Router, private homeServices: HomeService ) {}

  ngOnInit(): void {
    this.router.events.subscribe((date: any) => {
      this.setPath();
    })
  }

  public getPath(): string {
    return this.path
  }

  private setPath() {
    this.path = this.router.url;
  }

  TemaOscuro = () => {
    document.querySelector('body')?.setAttribute("data-bs-theme", "dark");
    document.querySelector('#btnCambiarTema')?.setAttribute("data-bs-theme", "dark"); 
    
    this.homeServices.modoOscuro = true;
  }

  TemaClaro = () => {
    document.querySelector('body')?.setAttribute("data-bs-theme", "light");
    document.querySelector('#btnCambiarTema')?.setAttribute("data-bs-theme", "light");
    this.homeServices.modoOscuro = false;
  }

  CambiarTema = () => {
    document.querySelector('body')?.getAttribute("data-bs-theme") === 'light' ? this.TemaOscuro() :this.TemaClaro();
  }
    
}
