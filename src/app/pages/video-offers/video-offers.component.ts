import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VideoService } from '../../services/video.service';
import { Video } from '../../interfaces/video';
import { environment } from '../../../environments/environment';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-video-offers',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './video-offers.component.html',
  styleUrl: './video-offers.component.scss'
})
export class VideoOffersComponent {
  @ViewChild('allVideos') allVideos!: ElementRef;
  @ViewChild('newOnVideoflix') newOnVideflixCategory!: ElementRef;
  @ViewChild('documentary') documentaryCategory!: ElementRef;
  @ViewChild('drama') dramaCategory!: ElementRef;
  @ViewChild('romance') romanceCategory!: ElementRef;
  @ViewChild('previewThumbnail') previewThumbnail!: ElementRef;
  @ViewChild('infoContainer') infoContainer!: ElementRef;
  @ViewChild('headline') previewHeadline!: ElementRef;
  @ViewChild('description') previewDescription!: ElementRef;
  @ViewChild('previewButton') previewButton!: ElementRef;
  @ViewChild('videotrailer') videotrailer!: ElementRef;

  @Input() options!: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean,
    sources: {
      src: string,
      type: string,
    }[],
  };

  currentPreview: any = {};
  currentPreviewThumbnail: any = '';

  player!: Player


  constructor(
    private videoService: VideoService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object

  ) {
  }

  async ngOnInit() {
    await this.renderVideos();
    await this.renderPreview()
  }

  async renderPreview() {
    let allVideos = await this.videoService.getVideos();
    if (isPlatformBrowser(this.platformId)) {
      let storedPreview = localStorage.getItem('currentPreview');
      if (storedPreview) {
        this.currentPreview = JSON.parse(storedPreview);
      } else {
        this.currentPreview = allVideos[0];
      }
      this.currentPreviewThumbnail = environment.baseUrl + this.currentPreview.thumbnail;
      setTimeout(() => {
        this.startTrailer(this.currentPreview.title)
      }, 1000);
    }
  }

  async renderVideos() {
    let videos: Video[] = await this.videoService.getVideos();
    this.clearCategories();
    videos.forEach(video => {
      let category = this.getCategory(video.category);
      if (category) {
        let thumbnailElement = this.renderer.createElement('img');
        this.renderer.setAttribute(thumbnailElement, 'src', `${environment.baseUrl}${video.thumbnail}`);
        this.renderer.setAttribute(thumbnailElement, 'alt', 'VideoThumbnail');
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


  async openPreview(videoId: any) {
    this.currentPreview = await this.videoService.getSingleVideo(videoId);
    this.currentPreviewThumbnail = environment.baseUrl + this.currentPreview.thumbnail;
    localStorage.setItem('currentPreview', JSON.stringify(this.currentPreview));
    if (window.innerWidth < 768) {
      this.showMobilePreview();
    }
    if (window.innerWidth < 1000 && window.innerHeight < window.innerWidth){
      this.showMobilePreview();
      this.renderer.setStyle(this.allVideos.nativeElement, 'display', 'none')
    }
    setTimeout(() => {
      this.startTrailer(this.currentPreview.title);
    }, 500);
  }

  showMobilePreview(){
    this.renderer.addClass(this.previewThumbnail.nativeElement, 'show-mobile-preview');
    this.renderer.addClass(this.infoContainer.nativeElement, 'show-mobile-info');
  }

  closeMobilePreview(){
    if (window.innerWidth < 1000 && window.innerHeight < window.innerWidth){
      this.renderer.setStyle(this.allVideos.nativeElement, 'display', 'flex')
    }
    this.renderer.removeClass(this.previewThumbnail.nativeElement, 'show-mobile-preview');
    this.renderer.removeClass(this.infoContainer.nativeElement, 'show-mobile-info');
  }

  async startTrailer(title: string) {
    let url = await this.videoService.getHLSPlaylist(title)
    if (isPlatformBrowser(this.platformId)) {
      if (this.player) {
        this.player.load();
      }
      this.player = videojs(this.videotrailer.nativeElement, this.options);
      this.resetTrailerAnimation();
      this.player.src({
        src: url,
        type: 'application/x-mpegURL'
      });
      this.player.autoplay(true)
    }
  }

  resetTrailerAnimation() {
    const trailer = this.videotrailer.nativeElement;
    this.renderer.removeClass(trailer, 'show-trailer');
    setTimeout(() => {
      this.renderer.addClass(trailer, 'show-trailer');
    }, 100);
  }

  logout() {
    let token = localStorage.getItem('token')
    if (token) {
      this.authService.logoutUser(token)
      this.router.navigate(['welcome/login/'])
      localStorage.removeItem('token')
    }
  }

  async playPreview(id: string) {
    this.renderer.removeClass(this.videotrailer.nativeElement, 'show-trailer');
    this.router.navigate(['videos/watching', id])
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth < 1000 && window.innerHeight < window.innerWidth){
      if (this.previewThumbnail.nativeElement.classList.contains('show-mobile-preview')){
        this.renderer.setStyle(this.allVideos.nativeElement, 'display', 'none')
      } else {
        this.renderer.removeClass(this.previewThumbnail.nativeElement, 'show-mobile-preview');
        this.renderer.removeClass(this.infoContainer.nativeElement, 'show-mobile-info');
        this.renderer.setStyle(this.allVideos.nativeElement, 'display', 'flex')
      }
    } else {
      this.renderer.removeClass(this.previewThumbnail.nativeElement, 'show-mobile-preview');
      this.renderer.removeClass(this.infoContainer.nativeElement, 'show-mobile-info');
      this.renderer.setStyle(this.allVideos.nativeElement, 'display', 'flex')
    }
  }
}
