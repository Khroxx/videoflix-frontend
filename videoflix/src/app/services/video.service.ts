import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom, Observable } from 'rxjs';
import { Video } from '../interfaces/video';


@Injectable({
  providedIn: 'root'
})
export class VideoService {

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

  public async getHLSPlaylist(title: string){
    let folderName = title.toLowerCase().replaceAll(' ', '');
    const url = `${environment.baseUrl}/media/hls/${folderName}/master.m3u8`;
    return url
  } 

  public async getPlaylistbyQuality(title: string, quality: string){
    let folderName = title.toLowerCase().replaceAll(' ', '');
    const url = `${environment.baseUrl}/media/hls/${folderName}/${quality}.m3u8`
    return url
  }

}
