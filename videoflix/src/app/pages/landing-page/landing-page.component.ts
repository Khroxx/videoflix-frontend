import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  backgroundImg = 'img/greet.jpeg';

  constructor(private router: Router){}

  ngOnInit(): void {
    this.updateBackgroundImage();

  }

  updateBackgroundImage() {
    if (this.router.url.includes('/login') || this.router.url.includes('/forgot-password')) {
      this.backgroundImg = 'img/login.jpeg';
    } else if (this.router.url.includes('/signup')) {
      this.backgroundImg = 'img/signup.jpeg';
    } else {
      this.backgroundImg = 'img/greet.jpeg';
    }
  }
}
