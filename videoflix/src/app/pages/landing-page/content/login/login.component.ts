import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { error } from 'node:console';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // wrongEmail: boolean = false;
  // wrongPw: boolean = false;
  wrongMsg: string = '';
  activated: boolean = false;

  email: string = '';
  password: string = '';

  @ViewChild('resendEmail') resendEmailPopup!: ElementRef;
  @ViewChild('errorMsg') errorMsg!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedFunctionsService,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.sharedService.updateBackgroundImage('img/login.jpeg');
    this.route.queryParams.subscribe(params => {
      if (params['activated']) {
        this.activated = params['activated'] === 'true';
        this.showWrongMessage('Your account has been activated, please log in')
      }
    });
  }

  login(){
    this.authService.emailExists(this.email).then(async exists => {
      if (exists) {
        let is_active = await this.authService.isUserActive(this.email)
          if (is_active) {
            try {
              let userData: any = await this.authService.loginUser(this.email, this.password);
              localStorage.setItem('token', userData.token);
              this.router.navigate(['videos/']);
            } catch {
              // this.wrongPw = true;
              this.showWrongMessage('The password does not match the username')
            }
          } else {
            this.closeErrorPopup();
            this.showEmailNotActivatedPopup();
          }
      } else {
        // this.wrongEmail = true;
        this.showWrongMessage('This email is not registered in our database')
      }})
  }     
  showEmailNotActivatedPopup(){
    this.resendEmailPopup.nativeElement.style.left = '50px';
  }
  showWrongMessage(message: string){
    this.wrongMsg = message;
    this.errorMsg.nativeElement.style.left = '50px';
    setTimeout(() => {
      this.closeErrorPopup()
    }, 3000);
  }

  closePopup(){
      this.resendEmailPopup.nativeElement.style.left = '-100%';
  }

  closeErrorPopup(){
      this.errorMsg.nativeElement.style.left = '-100%';
  }

  resendEmailActivationLink(){
    this.authService.sendEmailActivationOnly(this.email);
  }
}
