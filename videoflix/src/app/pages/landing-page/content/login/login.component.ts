import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  wrongEmail: boolean = false;
  wrongPw: boolean = false;

  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService

  ){}

  login(){
    this.authService.emailExists(this.email).then(exists => {
      if (exists) {
        // loginUser
        this.authService.loginUser(this.email, this.password);
        this.router.navigate(['videos/'])
      } else {
        this.wrongEmail = true;
      }})
  }
}
