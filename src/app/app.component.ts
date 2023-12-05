import { Component, OnInit } from '@angular/core';
import { HomeService } from './Servicios/home.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'FrontEnd';
  public theme: 'light' | 'dark' = 'light';


  constructor(
    private homeServices: HomeService,
  ) {}

  ngOnInit() {
  }

  TemaOscuro() {
    document.querySelector('body')?.setAttribute('data-bs-theme', 'dark');
    document.body.classList.add('dark-mode');
    document.querySelector('#icon')?.setAttribute('class', 'fa-solid fa-sun');
    this.theme = 'dark';
    this.homeServices.setModoOscuro(true);
  }

  TemaClaro() {
    document.querySelector('body')?.setAttribute('data-bs-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.querySelector('#icon')?.setAttribute('class', 'fa-solid fa-moon');
    this.theme = 'light';
    this.homeServices.setModoOscuro(false);
  }

  CambiarTema() {
    document.querySelector('body')?.getAttribute('data-bs-theme') === 'light'
      ? this.TemaOscuro()
      : this.TemaClaro();
  }
}
