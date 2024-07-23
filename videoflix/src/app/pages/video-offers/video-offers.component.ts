import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VideosService } from '../../services/videos.service';

@Component({
  selector: 'app-video-offers',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './video-offers.component.html',
  styleUrl: './video-offers.component.scss'
})
export class VideoOffersComponent {

  

  constructor(
    private videoService: VideosService,
    private authService: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.renderVideos();
  }

  async renderVideos(){
    let resp: any = await this.getVideosFromBackend();
    console.log(resp)
  }

  async getVideosFromBackend(){
    this.videoService.getVideos();
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
