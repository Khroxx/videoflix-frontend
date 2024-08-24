import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { Video } from '../interfaces/video';
import { Csrftoken } from '../interfaces/csrftoken';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(
    private http: HttpClient
  ) { }

  public async getVideos() {
    const csrf: any = await this.getCSRFToken();
    const url = environment.baseUrl + '/videos/';
    const headers = new HttpHeaders({
      'X-CSRF-Token': csrf.csrf_token
    })
    return await lastValueFrom(this.http.get<Video[]>(url, { headers }));
  }

  public async getSingleVideo(videoId: string) {
    const csrf: any = await this.getCSRFToken();
    const url = `${environment.baseUrl}/videos/${videoId}`;
    const headers = new HttpHeaders({
      'X-CSRF-Token': csrf.csrf_token
    })
    return await lastValueFrom(this.http.get<Video>(url, { headers }))
  }

  public async getHLSPlaylist(title: string) {
    let folderName = title.toLowerCase().replaceAll(' ', '');
    const url = `${environment.baseUrl}/media/hls/${folderName}/master.m3u8`;
    return url
  }

  public async getPlaylistbyQuality(title: string, quality: string) {
    let folderName = title.toLowerCase().replaceAll(' ', '');
    const url = `${environment.baseUrl}/media/hls/${folderName}/${quality}.m3u8`
    return url
  }

  private async getCSRFToken(): Promise<Csrftoken> {
    const url = environment.baseUrl + '/get-csrf-token/';
    const response = await lastValueFrom(this.http.get<Csrftoken>(url));
    return response;
  }

}
