import { Component, ElementRef, HostListener, Inject, Input, PLATFORM_ID, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { VideoService } from '../../services/video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../../interfaces/video';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Component({
  selector: 'app-videoplayer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videoplayer.component.html',
  styleUrl: './videoplayer.component.scss'
})
export class VideoplayerComponent {
  @ViewChild('videoplayer', { static: true }) videoplayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('headerControls') headerControls!: ElementRef;
  @ViewChild('footerControls') footerControls!: ElementRef;
  @ViewChild('popupControls') popupControls!: ElementRef;
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  @ViewChild('loadingSpinner') loadingSpinner!: ElementRef;
  @ViewChild('mobileControls') mobileControls!: ElementRef;
  @ViewChild('volumeContainer') volumeContainer!: ElementRef;
  @ViewChildren('timebar') timebars!: QueryList<ElementRef>;
  @ViewChildren('speedMenu') speedMenu!: QueryList<ElementRef>;
  @ViewChildren('qualityMenu') qualityMenu!: QueryList<ElementRef>;

  @Input() options!: {
    fluid: boolean,
    aspectRatio: string,
    autoplay: boolean,
    sources: {
      src: string,
      type: string,
    }[],
  };

  videoId!: any;
  currentVideo: Video | undefined;
  formattedTime: string = '00:00 / 00:00';
  playPauseImage: string = 'img/play_arrow.png';
  playPauseOverlayImage: string = '';
  isPlaying: boolean = false;
  isLoading: boolean = false
  private hideControlsTimeout: any;
  private hideMobileControlsTimeout: any;
  private intervalId: any;
  public showPlayPauseAnimation: boolean = false;
  player!: Player

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(async params => {
      this.videoId = params.get('id');
      this.videoService.getSingleVideo(this.videoId).then(async (data: Video) => {
        this.currentVideo = data;
        await this.getHLSPlaylist(this.currentVideo.title);
      });
      this.resetHideControlsTimer();
      this.hideControls();
    });
    if (isPlatformBrowser(this.platformId)) {
      this.checkAndHideLoadedPercentage();
      setInterval(() => this.checkAndHideLoadedPercentage(), 1000);
    }
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.landscapeFullscreen();
    }
  }

  ngOnDestroy(): void {
    this.stopUpdatingTimebar();
    if (this.player) {
      this.player.dispose();
    }
  }

  async getHLSPlaylist(title: string) {
    const videoUrl = await this.videoService.getHLSPlaylist(title);
    this.initializeVideoJsPlayer(videoUrl);
    if (this.player) {
      this.player.ready(() => {
        this.triggerPlayPauseAnimation('img/play_arrow.png');
        this.startUpdatingTimebar();
        this.isPlaying = true;
        this.playPauseImage = 'img/pause.png';
      })
    }
  }

  initializeVideoJsPlayer(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.player = videojs(this.videoplayer.nativeElement, this.options);
      this.player.autoplay(true)
      this.player.src({src: url, type: 'application/x-mpegURL'});
      this.isLoading = false;
    }
  }

  triggerPlayPauseAnimation(imageSrc: string): void {
    this.playPauseOverlayImage = imageSrc;
    this.showPlayPauseAnimation = true;
    setTimeout(() => {
      this.showPlayPauseAnimation = false;
    }, 1000);
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

  updateTimebar() {
    const currentTime: any = this.player.currentTime();
    const duration: any = this.player.duration()
    const percentage = Math.floor((currentTime / duration) * 100);
    this.updateTime();
    this.updateTimebarUI(percentage);
  }

  updateTimebarUI(percentage: number) {
    this.timebars.forEach((timebar) => {
      const nativeElement = timebar.nativeElement;
      if (nativeElement) {
        this.renderer.setStyle(nativeElement, 'width', `${percentage}%`);
        if (nativeElement.style.width == '100%') {
          this.stopUpdatingTimebar();
        }
      }
    });
  }

  playVideo() {
    if (this.player.paused()) {
      this.player.play()
      this.startUpdatingTimebar();
      this.isPlaying = true;
      this.playPauseImage = 'img/pause.png';
      this.triggerPlayPauseAnimation('img/play_arrow.png');
    } else {
      this.player.pause()
      this.isPlaying = false;
      this.playPauseImage = 'img/play_arrow.png';
      this.triggerPlayPauseAnimation('img/pause.png');
    }
  }

  back10() {
    const currentTime = this.player.currentTime();
    if (currentTime !== undefined) {
      this.player.currentTime(currentTime - 10);
    }
  }

  forward10() {
    const currentTime = this.player.currentTime();
    if (currentTime !== undefined) {
      this.player.currentTime(currentTime + 10);
    }
  }

  showVolume() {
    const volume = this.volumeContainer.nativeElement as HTMLElement;
    if (volume.style.display === 'none' || volume.style.display === ''){
      this.renderer.setStyle(volume, 'display', 'block');
    } else {
      this.renderer.setStyle(volume, 'display', 'none');
    }
  }

  changeVolume(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const volume = parseFloat(inputElement.value)
    this.player.volume(volume)
  }

  changeQualityofVideo() {
    this.qualityMenu.forEach((menu) => {
      const qualityContainer = menu.nativeElement as HTMLElement;
      if (qualityContainer.style.display === 'none' || qualityContainer.style.display === ''){
        this.renderer.setStyle(qualityContainer, 'display', 'block');
      } else {
        this.renderer.setStyle(qualityContainer, 'display', 'none')
      }
    })
  }

  setVideoQuality(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const quality = selectElement.value;
    this.changeQualityTo(quality);
  }

  async changeQualityTo(quality: string, currentTime?: number) {
    let newQuality = await this.videoService.getPlaylistbyQuality(this.currentVideo!.title, quality);
    if (isPlatformBrowser(this.platformId)) {
      this.player.src({src: newQuality, type: 'application/x-mpegURL'});
      if (!currentTime) {
        currentTime = this.player.currentTime();
      } 
      this.player.currentTime(currentTime);
      this.changeQualityofVideo();
    }
  }

  changePlaybackSpeed(): void {
    this.speedMenu.forEach((menu) => {
      const speedContainer = menu.nativeElement as HTMLElement;
      if (speedContainer.style.display === 'none' || speedContainer.style.display === '') {
        this.renderer.setStyle(speedContainer, 'display', 'block');
      } else {
        this.renderer.setStyle(speedContainer, 'display', 'none');
      }
    });
  }

  setPlaybackSpeed(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const speed = parseFloat(selectElement.value);
    this.player.playbackRate(speed);
    this.changePlaybackSpeed();
  }

  closeVideo() {
    this.router.navigate(['../../'], { relativeTo: this.route })
  }

  updateTime(): void {
    const currentTime: any = this.player.currentTime()
    const duration: any = this.player.duration()
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

  private showControls(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth > 1024) {
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

  private resetHideMobileControlsTimer(): void {
    clearTimeout(this.hideMobileControlsTimeout);
    this.hideMobileControlsTimeout = setTimeout(() => {
      this.showMobileControls('none')
    }, 2000);
  }

  showMobileControls(displayStyle: string) {
    this.renderer.setStyle(this.mobileControls.nativeElement, 'display', displayStyle);
    if (displayStyle == 'flex') {
      this.resetHideMobileControlsTimer();
    }
  }

  checkAndHideLoadedPercentage() {
    const percentage = document.querySelectorAll('.vjs-control-text-loaded-percentage');
    const control = document.querySelectorAll('.vjs-progress-control');
    percentage.forEach((element: Element) => {
      const value = element.textContent?.trim();
      if (value === '100.00%') {
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

  toggleFullscreen(): void {
    if (!this.player) return;
    if (window.innerWidth <= 1024 && window.innerHeight <= window.innerWidth) return;
    const container = this.videoContainer.nativeElement;
    this.isLoading = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        this.exitFullscreen();
        this.isLoading = false;
        this.hideControls();
      });
    } else if (container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        this.enterFullscreen();
        this.isLoading = false;
      });
    }
  }

  exitFullscreen() {
    this.renderer.setStyle(this.videoContainer.nativeElement, 'width', '320px');
    this.renderer.setStyle(this.videoContainer.nativeElement, 'height', '180px');
    this.renderer.removeClass(this.popupControls.nativeElement, 'hidden');
    this.renderer.addClass(this.popupControls.nativeElement, 'show');
    if (this.loadingSpinner) {
      this.renderer.removeClass(this.loadingSpinner.nativeElement, 'spinner-fullscreen')
    }
  }

  enterFullscreen() {
    this.renderer.setStyle(this.videoContainer.nativeElement, 'width', '100dvw');
    this.renderer.setStyle(this.videoContainer.nativeElement, 'height', '100dvh');
    if (this.loadingSpinner) {
      this.renderer.addClass(this.loadingSpinner.nativeElement, 'spinner-fullscreen');
    }
  }

  landscapeFullscreen() {
    if (window.innerWidth < 1024 && window.innerHeight < window.innerWidth) {
      this.videoContainer.nativeElement.requestFullscreen();
      this.showMobileControls('flex');
    }
    else if (document.fullscreenElement) {
      document.exitFullscreen();
      this.showMobileControls('none');
      this.renderer.removeClass(this.popupControls.nativeElement, 'show');
      this.renderer.addClass(this.popupControls.nativeElement, 'hidden');
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onUserInteraction(event: Event): void {
    if (this.videoContainer && document.fullscreenElement === this.videoContainer.nativeElement) {
      this.showControls();
      this.resetHideControlsTimer();
      this.renderer.removeClass(this.popupControls.nativeElement, 'show');
      this.renderer.addClass(this.popupControls.nativeElement, 'hidden');
    } else {
      this.hideControls();
    }
  }

  @HostListener('document:touchstart', ['$event'])
  onMobileInteraction(event: Event): void {
    if (this.videoContainer && document.fullscreenElement === this.videoContainer.nativeElement) {
      this.showMobileControls('flex');
      this.renderer.removeClass(this.popupControls.nativeElement, 'show');
      this.renderer.addClass(this.popupControls.nativeElement, 'hidden');
    } if (window.innerWidth > window.innerHeight && window.innerWidth < 1024) {
      this.showMobileControls('flex')
    } else {
      this.showMobileControls('none')
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > window.innerHeight && window.innerWidth < 1024) {
      this.landscapeFullscreen();
    } 
    else if (window.innerWidth < window.innerHeight && window.innerWidth < 1024){
      document.exitFullscreen();
    }
  }
} 