import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  constructor(private http: HttpClient,
    
  ) { }

  public getVideos(){
    const url = environment.baseUrl + '/videos/';
    
    return lastValueFrom(this.http.get(url))
  }
}
