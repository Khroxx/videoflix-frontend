import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  logoImg: string = '';

  constructor(
    private router: Router
  ){
    this.isWindowSizeSmall();
  }

  ngonInit(){
    this.isWindowSizeSmall();
  }

  navigateToLogin(){
    this.router.navigate(['welcome/login'])
  }

  get isLoginRoute(){
    return this.router.url.includes('login')
  }

  isWindowSizeSmall(){
    if (typeof window !== 'undefined'){
      if (window.innerWidth < 460 || window.innerWidth > window.innerHeight) {
        this.logoImg = 'img/logo_only.png';
      } else {
      this.logoImg = 'img/logo.png';
      }
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(){
    this.isWindowSizeSmall();
  }
}

