import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
// import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { User } from '../interfaces/user';
import { HttpHeaders } from '@angular/common/http';
import { Csrftoken } from '../interfaces/csrftoken';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
  ) { }

  public async registerUser(email: string, password: string) {
    const url = environment.baseUrl + '/user/register/';
    const body = {
      "email": email,
      "password": password
    }
    return lastValueFrom(this.http.post<User>(url, body))
  }

  public async sendEmailActivationOnly(email: string) {
    const url = `${environment.baseUrl}/verify-again/`;
    const body = {
      "email": email
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return await lastValueFrom(this.http.post(url, body, { headers: headers }));

  }

  public async sendPasswordResetEmail(email: string) {
    const url = environment.baseUrl + `/send_reset_email/`;
    const body = {
      "email": email
    }
    return lastValueFrom(this.http.post<User[]>(url, body))
  }

  public async changePassword(userId: string, newPassword: string) {
    const url = environment.baseUrl + `/users/${userId}/`;
    const body = {
      "password": newPassword
    }
    const headers = { 'Content-Type': 'application/json' };
    return lastValueFrom(this.http.put<User>(url, body, { headers }));
  }

  public getUsers() {
    const url = environment.baseUrl + '/users/';
    const allUsers = this.http.get<User[]>(url).subscribe;
    return allUsers
  }

  public async isUserActive(email: string) {
    const url = environment.baseUrl + '/users/';
    const users = await lastValueFrom(this.http.get<User[]>(url));
    const user = users.find(user => user.email === email);
    return user ? user.is_active : false;

  }

  public emailExists(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>(environment.baseUrl + '/users/').subscribe({
        next: (users) => {
          let exists = users.some(user => user.email === email);
          resolve(exists);
        },
        error: (error) => reject(error)
      });
    });
  }

  async loginUser(email: string, password: string) {
    const url = environment.baseUrl + '/login/';
    const body = {
      "email": email,
      "password": password
    }
    let postrequest = this.http.post<User[]>(url, body)
    return lastValueFrom(postrequest)
  }

  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  getToken():string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  async logoutUser(token: string) {
    const url = environment.baseUrl + '/logout/';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    try {
      this.http.get<User[]>(url, { headers });
    } catch (error) {
      console.error(error)
    }

  }

  public async getCSRFToken(): Promise<Csrftoken> {
    const url = environment.baseUrl + '/get-csrf-token/';
    const response = await lastValueFrom(this.http.get<Csrftoken>(url));
    return response;
  }
}
