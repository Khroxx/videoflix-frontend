import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom, Observable } from 'rxjs';
import { Video } from '../interfaces/video';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  // currentVideo = 

  constructor(
    private http: HttpClient 
  ) { }

  public async getVideos(){
    const url = environment.baseUrl + '/videos/';
    return await lastValueFrom(this.http.get<Video[]>(url));
  }

  public async getSingleVideo(videoId: string){
    const url = `${environment.baseUrl}/videos/${videoId}`;
    return await lastValueFrom(this.http.get<Video>(url))
  }

  public async getVideoFile(videoId: string){
    let video = await this.getSingleVideo(videoId);     
    const url = environment.baseUrl + video.video_480p;
    const headers = new HttpHeaders({
      'Accept': 'video/mp4',
      'Content-Type': 'video/mp4'
    });
    return await lastValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
  
  }

  public async getVideo720File(videoId: string){
    let video = await this.getSingleVideo(videoId);
    const url = environment.baseUrl + video.video_720p;
    const headers = new HttpHeaders({
      'Accept': 'video/mp4',
      'Content-Type': 'video/mp4'
    });
    return await lastValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
  
  }

  public async getVideo1080File(videoId: string){
    let video = await this.getSingleVideo(videoId);
    const url = environment.baseUrl + video.video_1080p;
    // const url = `${environment.baseUrl}/videos/${videoId}/file/`
    const headers = new HttpHeaders({
      'Accept': 'video/mp4',
      'Content-Type': 'video/mp4'
    });
    return await lastValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
  
  }

    public async getVideoFileByQuality(videoId: string, quality: string): Promise<Blob>{
      const url = `${environment.baseUrl}/videos/${videoId}/file/${quality}/`;
      const headers = new HttpHeaders({
        'Accept': '*/*',
        'Content-Type': 'video/mp4'
      });
      try {
        return await lastValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
      } catch (error) {
        console.error('Error fetching video file:', error);
        throw error;
      }
    }
}
