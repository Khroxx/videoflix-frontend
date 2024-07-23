import { Component } from '@angular/core';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { AuthService } from '../../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  wrongEmail: boolean = false;
  passwordChanged: boolean = false;
  email: string = '';

  constructor(
    private sharedService: SharedFunctionsService,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.sharedService.updateBackgroundImage('img/login.jpeg')
  }



  async sendPasswordResetEmail(){
    this.authService.emailExists(this.email).then(async exists => {
      if (exists) {
        await this.authService.fetchCSRFToken();
        let userData: any = await this.authService.sendPasswordResetEmail(this.email);
        this.passwordChanged = true;
      } else {
        this.passwordChanged = false;
        this.wrongEmail = true;
      }
    })
  }
}
