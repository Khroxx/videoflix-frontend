import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID, Renderer2, ViewChild, viewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { VideoService } from '../../services/video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../../interfaces/video';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
// import 'videojs-contrib-hls';      
// import 'videojs-contrib-quality-levels';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videoplayer.component.html',
  styleUrl: './videoplayer.component.scss'
})
export class VideoplayerComponent {
  @ViewChild('headerControls') headerControls!: ElementRef;
  @ViewChild('footerControls') footerControls!: ElementRef;
  @ViewChild('popupControls') popupControls!: ElementRef;
  @ViewChild('videoplayer', { static: true }) videoplayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  @ViewChild('timebar') timebar!: ElementRef;
  @ViewChild('loadingSpinner') loadingSpinner!: ElementRef;

  @Input() options!: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean,
    sources: {
      src: string,
      type: string,
    }[],
  };

  // videoUrl!: string;
  videoData!: any;
  videoId!: any;
  // videoBlob!: Blob;
  currentVideo: Video | undefined;
  formattedTime: string = '00:00 / 00:00';
  playPauseImage: string = 'img/play_arrow.png';
  playPauseOverlayImage: string = '';
  isPlaying: boolean = false;
  isLoading: boolean = false
  private hideControlsTimeout: any;
  private intervalId: any;
  public showPlayPauseAnimation: boolean = false;
  videoElement!: HTMLVideoElement;
  player!: Player

  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.videoId = params.get('id');
      this.videoService.getSingleVideo(this.videoId).then(async (data: Video) => {
        this.currentVideo = data;
        await this.getHLSPlaylist(this.currentVideo.title);
      });
      this.resetHideControlsTimer();
      this.hideControls()
    });
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('fullscreenchange', this.exitFullscreen.bind(this));
      this.checkAndHideLoadedPercentage();
      setInterval(() => this.checkAndHideLoadedPercentage(), 1000);
    }
    this.isLoading = true;
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.addClickAnimationToButtons();
    }
  }

  ngOnDestroy(): void {
    this.stopUpdatingTimebar();
    this.videoplayer.nativeElement.removeEventListener('ended', this.onVideoEnded.bind(this));
    if (this.player) {
      this.player.dispose();
    }
  }

  initializeVideoJsPlayer(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.player = videojs(this.videoplayer.nativeElement, this.options);
      this.player.autoplay(true)
      this.player.src({
        src: url,
        type: 'application/x-mpegURL'
      });
      this.isLoading = false;
      this.player.on('ended', this.onVideoEnded.bind(this));
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.videoContainer && document.fullscreenElement === this.videoContainer.nativeElement) {
      this.showControls();
      this.resetHideControlsTimer();
      this.renderer.removeClass(this.popupControls.nativeElement, 'show');
      this.renderer.addClass(this.popupControls.nativeElement, 'hidden');
    } else {
      this.hideControls();
    }
  }

  triggerPlayPauseAnimation(imageSrc: string): void {
    this.playPauseOverlayImage = imageSrc;
    this.showPlayPauseAnimation = true;
    setTimeout(() => {
      this.showPlayPauseAnimation = false;
    }, 1000);
  }

  private showControls(): void {
    if (isPlatformBrowser(this.platformId)) {
      const vjsElements = document.querySelectorAll('.vjs-current-time, .vjs-time-control, .vjs-duration');
      if (this.headerControls && this.footerControls) {
        this.renderer.removeClass(this.headerControls.nativeElement, 'hidden');
        this.renderer.addClass(this.headerControls.nativeElement, 'show');
        this.renderer.removeClass(this.footerControls.nativeElement, 'hidden');
        this.renderer.addClass(this.footerControls.nativeElement, 'show');
        vjsElements.forEach(element => {
          (element as HTMLElement).style.display = 'block';
        });
      }
    }
  }

  private hideControls(): void {
    if (isPlatformBrowser(this.platformId)) {
      const vjsElements = document.querySelectorAll('.vjs-current-time, .vjs-time-control, .vjs-duration');
      if (this.headerControls && this.footerControls) {
        this.renderer.removeClass(this.headerControls.nativeElement, 'show');
        this.renderer.addClass(this.headerControls.nativeElement, 'hidden');
        this.renderer.removeClass(this.footerControls.nativeElement, 'show');
        this.renderer.addClass(this.footerControls.nativeElement, 'hidden');
        vjsElements.forEach(element => {
          (element as HTMLElement).style.display = 'none';
        });
      }
    }
  }

  private resetHideControlsTimer(): void {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      this.hideControls();
    }, 2000);
  }

  // changeCurrentTime(event: MouseEvent) {
  //   let select = this.timebar.nativeElement.getBoundingClientRect();
  //   let clickPosition = event.clientX - select.left;
  //   let percentage = clickPosition / select.width;
  //   let newTime = this.videoplayer.nativeElement.duration * percentage;
  //   newTime = Math.max(0, Math.min(newTime, this.videoplayer.nativeElement.duration));
  //   this.videoplayer.nativeElement.currentTime = newTime;
  //   console.log(newTime)
  //   this.updateTimebar();
  // }

  async getHLSPlaylist(title: string) {
    const videoUrl = await this.videoService.getHLSPlaylist(title);
    this.initializeVideoJsPlayer(videoUrl);
    this.videoplayer.nativeElement.addEventListener('canplay', () => {
      this.triggerPlayPauseAnimation('img/play_arrow.png');
      this.startUpdatingTimebar();
      this.isPlaying = true;
      this.playPauseImage = 'img/pause.png';
    }, { once: true });
  }

  startUpdatingTimebar() {
    this.intervalId = setInterval(() => {
      this.updateTimebar();
    }, 1000);
  }

  stopUpdatingTimebar() {
    if (this.intervalId) {  
      clearInterval(this.intervalId);
    }
  }

  //eventuell weg und nur loadingspinner
  checkAndHideLoadedPercentage() {
    const percentage = document.querySelectorAll('.vjs-control-text-loaded-percentage');
    const control = document.querySelectorAll('.vjs-progress-control');
    percentage.forEach((element: Element) => {
      const value = element.textContent?.trim();
      if (value === '100.00%') {
        // this.isLoading = false
        control.forEach((element: Element) => {
          let controlElement = element as HTMLElement;
          controlElement.style.transition = 'visibility 0.5s ease-in-out, opacity 0.5s ease-in-out';
          controlElement.style.opacity = '0';
          setTimeout(() => {
            controlElement.style.visibility = 'hidden';
          }, 500);
        })
      }
    });
  }

  updateTimebar(){
    const currentTime = this.videoplayer.nativeElement.currentTime;
    const duration = this.videoplayer.nativeElement.duration;
    const percentage = (currentTime / duration) * 100;
    this.updateTime();
    this.updateTimebarUI(percentage);
  }

  updateTimebarUI(percentage: number){
    const timebar = this.timebar.nativeElement;
    if (timebar) {
      timebar.style.width = `${percentage}%`;
    }
  }

  playVideo() {
    if (this.videoplayer.nativeElement.paused) {
      this.videoplayer.nativeElement.play();
      this.startUpdatingTimebar();
      this.isPlaying = true;
      this.playPauseImage = 'img/pause.png';
      this.triggerPlayPauseAnimation('img/play_arrow.png');
    } else {
      this.videoplayer.nativeElement.pause();
      this.isPlaying = false;
      this.playPauseImage = 'img/play_arrow.png';
      this.triggerPlayPauseAnimation('img/pause.png');
    }
  }

  //für dev, für deployment weg
  onVideoEnded(): void {
    this.videoplayer.nativeElement.currentTime = 0;
    this.videoplayer.nativeElement.pause();
    this.isPlaying = false;
    this.playPauseImage = 'img/play_arrow.png';
    this.updateTimebar();
  }


  back10(): void {
    this.videoplayer.nativeElement.currentTime -= 10;
  }

  forward10(): void {
    this.videoplayer.nativeElement.currentTime += 10;
  }

  showVolume(): void {
    const volumeContainer = document.querySelector('.volume-container') as HTMLElement;
    if (volumeContainer.style.display === 'none' || volumeContainer.style.display === '') {
      volumeContainer.style.display = 'block';
    } else {
      volumeContainer.style.display = 'none';
    }
  }

  changeVolume(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.videoplayer.nativeElement.volume = inputElement.valueAsNumber;
  }

  changeQualityofVideo() {
    const qualityContainer = document.querySelector('#qualityMenu') as HTMLElement;
    if (qualityContainer.style.display === 'none' || qualityContainer.style.display === '') {
      qualityContainer.style.display = 'block';
    } else {
      qualityContainer.style.display = 'none';
    }
  }

  setVideoQuality(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const quality = selectElement.value;
    this.changeQualityTo(quality);
  }

  async changeQualityTo(quality: string, currentTime?: number) {
    let newQuality = await this.videoService.getPlaylistbyQuality(this.currentVideo!.title, quality);
    if (isPlatformBrowser(this.platformId)) {
      this.player.src({
        src: newQuality,
        type: 'application/x-mpegURL'
      });
      if (!currentTime) {
        let currentTime = this.player.currentTime();
        this.player.currentTime(currentTime);
      } else {
        this.player.currentTime(currentTime);
      }
    }
  }

  changePlaybackSpeed(): void {
    const speedContainer = document.querySelector('#speedMenu') as HTMLElement;
    if (speedContainer.style.display === 'none' || speedContainer.style.display === '') {
      speedContainer.style.display = 'block';
    } else {
      speedContainer.style.display = 'none';
    }
  }

  setPlaybackSpeed(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const speed = parseFloat(selectElement.value);
    this.videoplayer.nativeElement.playbackRate = speed;
  }

  toggleFullscreen(): void {
    const currentTime = this.player.currentTime();
    const container = this.videoContainer.nativeElement;
    this.isLoading = true;
    if (container.requestFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          this.exitFullscreen();
          this.changeQualityTo('480p', currentTime);
          this.isLoading = false;
          this.hideControls();
        });
      } else {
        container.requestFullscreen().then(() => {
          this.enterFullscreen();
          this.changeQualityTo('1080p', currentTime)
          this.isLoading = false;
        });
      }
    }
  }

  exitFullscreen() {
    this.videoContainer.nativeElement.style.width = '320px';
    this.videoContainer.nativeElement.style.height = '180px';
    this.renderer.removeClass(this.popupControls.nativeElement, 'hidden');
    this.renderer.addClass(this.popupControls.nativeElement, 'show');
    if (this.loadingSpinner) {
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'width', '20px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'height', '20px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'border', '8px solid #f3f3f3');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'borderTop', '8px solid #3498db');
    }
  }

  enterFullscreen() {
    this.videoContainer.nativeElement.style.width = '100dvw';
    this.videoContainer.nativeElement.style.height = '100dvh';
    // wahrscheinlich durch responsive austauschen
    if (this.loadingSpinner) {
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'width', '120px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'height', '120px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'border', '14px solid #f3f3f3');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'borderTop', '14px solid #3498db');
    }
  }

  closeVideo() {
    this.router.navigate(['../../'], { relativeTo: this.route })
  }

  updateTime(): void {
    const currentTime = this.videoplayer.nativeElement.currentTime;
    const duration = this.videoplayer.nativeElement.duration;
    this.formattedTime = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${this.pad(minutes)}:${this.pad(secs)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : `${value}`;
  }

  private addClickAnimationToButtons(): void {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        button.classList.add('button-click-animation');
        button.addEventListener('animationend', () => {
          button.classList.remove('button-click-animation');
        }, { once: true });
      });
    });
  }
}
