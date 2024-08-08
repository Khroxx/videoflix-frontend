import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { Video } from '../../interfaces/video';
import { environment } from '../../../environments/environment';
import { VideoplayerComponent } from '../videoplayer/videoplayer.component';

@Component({
  selector: 'app-video-offers',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './video-offers.component.html',
  styleUrl: './video-offers.component.scss'
})
export class VideoOffersComponent {
  @ViewChild('newOnVideoflix') newOnVideflixCategory!: ElementRef;
  @ViewChild('documentary') documentaryCategory!: ElementRef;
  @ViewChild('drama') dramaCategory!: ElementRef;
  @ViewChild('romance') romanceCategory!: ElementRef;
  @ViewChild('previewThumbnail') previewThumbnail!: ElementRef;
  @ViewChild('headline') previewHeadline!: ElementRef;
  @ViewChild('description') previewDescription!: ElementRef;
  @ViewChild('previewButton') previewButton!: ElementRef;

  currentPreview:  any = {};
  currentPreviewThumbnail: any = '';


  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2, 

  ){
  }

  async ngOnInit() {
    await this.renderVideos();
    await this.renderPreview()
  }

  async renderPreview(){
    let allVideos = await this.videoService.getVideos();
    this.currentPreview = allVideos[0];
    this.currentPreviewThumbnail = environment.baseUrl + this.currentPreview.thumbnail;    
  }

  async renderVideos(){
    let videos: Video[] = await this.videoService.getVideos();
    // console.log('allVideos', videos)
    this.clearCategories();  
    videos.forEach(video => {
      // console.log(video.category)
      let category = this.getCategory(video.category);
      if (category){
        let thumbnailElement = this.renderer.createElement('img');
        this.renderer.setAttribute(thumbnailElement, 'src', `${environment.baseUrl}${video.thumbnail}`);
        this.renderer.setAttribute(thumbnailElement, 'alt', 'VideoThumbnail');
        this.renderer.addClass(thumbnailElement, 'thumbnailVideo');
        this.renderer.listen(thumbnailElement, 'click', () => { 
          this.openPreview(video.id); 
        });
        this.renderer.appendChild(category.nativeElement, thumbnailElement)
      }
    });
  }

  clearCategories() {
    this.clearCategory(this.newOnVideflixCategory);
    this.clearCategory(this.documentaryCategory);
    this.clearCategory(this.dramaCategory);
    this.clearCategory(this.romanceCategory);
  }
  
  clearCategory(category: ElementRef) {
    if (category && category.nativeElement) {
      while (category.nativeElement.firstChild) {
        category.nativeElement.removeChild(category.nativeElement.firstChild);
      }
    }
  }


  getCategory(category: string): ElementRef | null {
    switch (category) {
      case 'New on Videoflix':
        return this.newOnVideflixCategory;
      case 'Documentary':
        return this.documentaryCategory;
      case 'Drama':
        return this.dramaCategory;
      case 'Romance':
        return this.romanceCategory;
      default:
        return null;
    }
  }


  async openPreview(videoId: any){
    this.currentPreview = await this.videoService.getSingleVideo(videoId);
    this.currentPreviewThumbnail = environment.baseUrl + this.currentPreview.thumbnail
  }


  logout(){
    let token = localStorage.getItem('token')
    if (token){
      this.authService.logoutUser(token)
      this.router.navigate(['welcome/login/'])
      localStorage.removeItem('token')
    }
  }

  async playPreview(id: string){
    this.router.navigate(['videos/watching', id])
  }
}
