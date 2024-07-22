import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-video-offers',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './video-offers.component.html',
  styleUrl: './video-offers.component.scss'
})
export class VideoOffersComponent {

  

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.renderVideos();
  }

  async renderVideos(){
    await this.getVideosFromBackend();
  }

  async getVideosFromBackend(){
    this.authService.getVideos();
  }

  logout(){
    let token = localStorage.getItem('token')
    if (token){
      this.authService.logoutUser(token)
      this.router.navigate(['welcome/login/'])
      localStorage.removeItem('token')
    }
  }

  playPreview(){
    
  }
}
