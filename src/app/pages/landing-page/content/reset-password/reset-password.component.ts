import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  passwordDontMatch: boolean = false;
  passwordChanged: boolean = false;
  wrong: boolean = false;
  userId: string | null = '';
  password1: string = '';
  password2: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sharedService: SharedFunctionsService,
    private authService: AuthService
  ){}

  ngOnInit() {
    this.sharedService.updateBackgroundImage('img/login.jpeg')
    this.route.queryParams.subscribe(params => {
      this.userId = params['user'];
    });
  }

  async changeUserPassword(){
    if(this.password1 === this.password2 && this.userId){
      this.passwordDontMatch = false; 
      await this.authService.changePassword(this.userId, this.password1)
        .then((response) => {
          this.passwordChanged = true;
          setTimeout(() => {
            this.router.navigate(['welcome/login/'])
          }, 1000);
        })
        .catch((error) => {
          console.error('could not change password', error);
        });
    } else {
      this.wrong = true; 
      return
    }
  }
}
