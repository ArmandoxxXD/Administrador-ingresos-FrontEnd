import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  private path = 'home';

  constructor(private router: Router) {}

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
  }

  TemaClaro = () => {
    document.querySelector('body')?.setAttribute("data-bs-theme", "light");
    document.querySelector('#btnCambiarTema')?.setAttribute("data-bs-theme", "light");
  }

  CambiarTema = () => {
    document.querySelector('body')?.getAttribute("data-bs-theme") === 'light' ? this.TemaOscuro() :this.TemaClaro();
  }
    
}
