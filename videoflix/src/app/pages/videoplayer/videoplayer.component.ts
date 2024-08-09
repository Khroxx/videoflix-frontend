import { Component, ElementRef, HostListener, Inject, PLATFORM_ID, Renderer2, ViewChild, viewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { VideoService } from '../../services/video.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../../interfaces/video';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

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
  @ViewChild('videoplayer', { static: false }) videoplayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  @ViewChild('timebar') timebar!: ElementRef;
  @ViewChild('loadingSpinner') loadingSpinner!: ElementRef;

  videoUrl!: SafeUrl | any;
  videoData!: any;
  videoId!: any;
  videoBlob!: Blob;
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



  constructor(
    private videoService: VideoService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      this.videoId = params.get('id');
      // Promise.
      await this.loadVideo(this.videoId);
      this.videoService.getSingleVideo(this.videoId).then((data: Video) => {
        this.currentVideo = data;
      });
      this.resetHideControlsTimer();
      this.videoplayer.nativeElement.addEventListener('ended', this.onVideoEnded.bind(this));
    });
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('fullscreenchange', this.exitFullscreen.bind(this));
    }

  }



  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.addClickAnimationToButtons();
    }
    if (this.videoId) {
      this.loadVideo(this.videoId)
    }
  }

  ngOnDestroy(): void {
    this.stopUpdatingTimebar();
    this.videoplayer.nativeElement.removeEventListener('ended', this.onVideoEnded.bind(this));

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
    this.renderer.removeClass(this.headerControls.nativeElement, 'hidden');
    this.renderer.addClass(this.headerControls.nativeElement, 'show');
    this.renderer.removeClass(this.footerControls.nativeElement, 'hidden');
    this.renderer.addClass(this.footerControls.nativeElement, 'show');
  }

  private hideControls(): void {
    this.renderer.removeClass(this.headerControls.nativeElement, 'show');
    this.renderer.addClass(this.headerControls.nativeElement, 'hidden');
    this.renderer.removeClass(this.footerControls.nativeElement, 'show');
    this.renderer.addClass(this.footerControls.nativeElement, 'hidden');
  }

  private resetHideControlsTimer(): void {
    clearTimeout(this.hideControlsTimeout);
    this.hideControlsTimeout = setTimeout(() => {
      this.hideControls();
    }, 2000);
  }

  async loadVideo(videoId: string) {
    this.isLoading = true
    try {
      if (this.videoplayer && this.videoplayer.nativeElement) {
        await this.changeQualityOfVideo(videoId, '480p')
        this.isLoading = false
        this.videoplayer.nativeElement.addEventListener('canplay', () => {
          this.videoplayer.nativeElement.load();
          this.videoplayer.nativeElement.play();
          this.triggerPlayPauseAnimation('img/play_arrow.png');
          this.startUpdatingTimebar();
          this.isPlaying = true;
          this.playPauseImage = 'img/pause.png';
        }, { once: true });
      }

    } catch (error) {
      console.error('Error loading video:', error)
    }
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

  updateTimebar(): void {
    const currentTime = this.videoplayer.nativeElement.currentTime;
    const duration = this.videoplayer.nativeElement.duration;
    const percentage = (currentTime / duration) * 100;
    this.updateTime();
    this.updateTimebarUI(percentage);
  }

  updateTimebarUI(percentage: number): void {
    const timebar = this.timebar.nativeElement;
    if (timebar) {
      timebar.style.width = `${percentage}%`;
    }
  }

  playVideo(): void {
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

  onVideoEnded(): void {
    this.videoplayer.nativeElement.currentTime = 0;
    this.videoplayer.nativeElement.pause();
    this.isPlaying = false;
    this.playPauseImage = 'img/play_arrow.png';
    this.updateTimebar();
  }

  async changeQualityOfVideo(videoId: string, quality: string) {
    try {
      let currentTime = this.videoplayer.nativeElement.currentTime
      const videoUrl = await this.videoService.getVideoFileByQuality(videoId, quality);
      this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(videoUrl);
      if (this.videoplayer) {
        this.videoplayer.nativeElement.src = this.videoUrl;
        this.videoplayer.nativeElement.currentTime = currentTime;
      }

    } catch (error) {
      console.log('error quality', error)
    }


  }

  back10(): void {
    this.videoplayer.nativeElement.currentTime -= 10;
  }

  forward10(): void {
    this.videoplayer.nativeElement.currentTime += 10;
  }

  showVolume(): void {
    // edit to open volume bar
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

  toggleSubtitles(): void {
    const track = this.videoplayer.nativeElement.textTracks[0];
    if (track) {
      track.mode = track.mode === 'showing' ? 'hidden' : 'showing';
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
    const container = this.videoContainer.nativeElement;
    if (container.requestFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          this.isLoading = true
          this.exitFullscreen();
          this.hideControls();
          
        });
      } else {
        container.requestFullscreen().then(() => {
          this.isLoading = true
          this.enterFullscreen();

        });
      }
    }
  }

  async exitFullscreen() {
    this.videoContainer.nativeElement.style.width = '320px';
    this.videoContainer.nativeElement.style.height = '180px';

    this.renderer.removeClass(this.popupControls.nativeElement, 'hidden');
    this.renderer.addClass(this.popupControls.nativeElement, 'show');
    await this.changeQualityOfVideo(this.videoId, '480p');
    this.isLoading = false;

    if (this.loadingSpinner) {
      // wahrscheinlich durch responsive austauschen
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'width', '20px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'height', '20px');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'border', '8px solid #f3f3f3');
      this.renderer.setStyle(this.loadingSpinner.nativeElement, 'borderTop', '8px solid #3498db');

    }
  }

  async enterFullscreen() {
    this.videoContainer.nativeElement.style.width = '100dvw';
    this.videoContainer.nativeElement.style.height = '100dvh';


    await this.changeQualityOfVideo(this.videoId, '720p');
    this.isLoading = false;
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
