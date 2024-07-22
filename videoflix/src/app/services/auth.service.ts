import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { lastValueFrom } from 'rxjs';
import { User } from '../interfaces/user';
import { HttpHeaders } from '@angular/common/http';
import { error } from 'console';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // csrfToken: string = '';

  constructor(private http: HttpClient) { }

  public async  registerUser(email: string, password: string){
    // DEVELOPMENT URL
    const url = environment.baseUrl + '/user/register/';
    const body = {
      "email": email,
      "password": password
    }
    return lastValueFrom(this.http.post<User>(url, body))

  }

 public async resendEmailActivationEmail(email: string){
    await this.fetchCSRFToken()
    const url = environment.baseUrl + '/user/verify/';
    const body = {
      "email": email
    }
    const csrfToken = localStorage.getItem('token');
      // const headers = new HttpHeaders({
      //   'Content-Type': 'application/json',
      //   'X-CSRFToken': csrfToken // Setzen des CSRF-Tokens im Header
      // });
    return lastValueFrom(this.http.post<User>(url, body))
  }

  public async sendPasswordResetEmail(email: string){
    const url = environment.baseUrl + `/send_reset_email/`;
    const body = {
      "email": email
    }
    return lastValueFrom(this.http.post<User[]>(url, body))
    // const csrfToken = localStorage.getItem('csrf-token');
    // if (csrfToken){
    //   const headers = new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'X-CSRFToken': csrfToken
    //   })
      // return lastValueFrom(this.http.post<User>(url, body, { headers: headers}))
    // }
    // return console.log('did not work')
  }

  public getUsers(){
    const url = environment.baseUrl + '/users/';
    const allUsers = this.http.get<User[]>(url).subscribe;
    return allUsers
  }

  public async isUserActive(email: string){
    const url = environment.baseUrl + '/users/';
    try {
      const users = await lastValueFrom(this.http.get<User[]>(url));
      const user = users.find(user => user.email === email);
      return user ? user.is_active : false;
    } catch (error) {
      console.error('Error fetching users', error);
      return false;
    }
  }

  public getVideos(){
    const url = environment.baseUrl + '/videos/';
    this.http.get(url)
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
    let postrequest = this.http.post<User[]>(url, body)
    return lastValueFrom(postrequest)
  }

  async logoutUser(token: string){
    const url = environment.baseUrl + '/logout/';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    try {
      this.http.get<User[]>(url, { headers });
      // this.csrfToken = '';
    } catch (error){
      console.error(error)
    }
  }

  ngOnDestroy(): void {
  }

  public async fetchCSRFToken(){
    const url = environment.baseUrl + '/get-csrf-token/';
    this.http.get<({ csrf_token: string })>(url).subscribe({
        next: (response) => {
          localStorage.setItem('csrf-token', response.csrf_token)},
        error: (error) => {console.error('couldnt fetch csrf token', error)}
      })
  }

}
