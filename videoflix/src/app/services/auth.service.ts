import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { lastValueFrom } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public registerUser(email: string, password: string){
    // DEVELOPMENT URL
    const url = environment.baseUrl + '/user/register/';
    const body = {
      "email": email,
      "password": password
    }
    return lastValueFrom(this.http.post<User>(url, body))

  }

  public getUsers(){
    const url = environment.baseUrl + '/users/';
    const allUsers = this.http.get(url).subscribe;
    return allUsers
  }

  ngOnDestroy(): void {
  }
}
