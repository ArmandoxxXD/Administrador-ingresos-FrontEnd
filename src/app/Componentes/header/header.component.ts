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

    
}
