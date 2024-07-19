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
    const allUsers = this.http.get<User[]>(url).subscribe;
    return allUsers
  }

  public emailExists(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>('http://127.0.0.1:8000/users/').subscribe({
        next: (users) => {
          let exists = users.some(user => user.email === email);
          resolve(exists);
        },
        error: (error) => reject(error)
      });
    });
  }

  async loginUser(email: string, password: string){
    const url = environment.baseUrl + '/login/';
    const body = {
      "email": email,
      "password": password
    }
    this.http.post<User[]>(url, body)
  }

  ngOnDestroy(): void {
  }
}
