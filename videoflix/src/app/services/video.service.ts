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

  public async getVideos() {
    const url = environment.baseUrl + '/videos/';
    return await lastValueFrom(this.http.get<Video[]>(url));
  }

  public async getSingleVideo(videoId: string) {
    const url = `${environment.baseUrl}/videos/${videoId}`;
    return await lastValueFrom(this.http.get<Video>(url))
  }

  // public async getVideoFileByQuality(videoId: string, quality: string): Promise<Blob>{
  //   const url = `${environment.baseUrl}/videos/${videoId}/file/${quality}/`;
  //   const headers = new HttpHeaders({
  //     'Accept': '*/*',
  //     'Content-Type': 'video/mp4'
  //   });
  //   try {
  //     return await lastValueFrom(this.http.get(url, { headers, responseType: 'blob' }));
  //   } catch (error) {
  //     console.error('Error fetching video file:', error);
  //     throw error;
  //   }
  // }
  public async getVideoFileByQuality(videoId: string, quality: string) {
    const url = `${environment.baseUrl}/videos/${videoId}/file/${quality}/`;
    return url
  }
}
