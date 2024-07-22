import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';

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
  activatedMsg: boolean = false

  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedFunctionsService

  ){}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.sharedService.updateBackgroundImage('img/login.jpeg')
  }

  login(){
    this.authService.emailExists(this.email).then(async exists => {
      if (exists) {
        // loginUser
        let is_active = await this.authService.isUserActive(this.email)
          if (is_active) {
            this.activatedMsg = false
            let userData: any = await this.authService.loginUser(this.email, this.password);
            localStorage.setItem('token', userData.token);
            this.router.navigate(['videos/']);
          } else {
            this.activatedMsg = true;
            // popup error user not active, please activate via email
            // no email? -> enter email to resend email
          }
      } else {
        this.wrongEmail = true;
      }})
  }
}
