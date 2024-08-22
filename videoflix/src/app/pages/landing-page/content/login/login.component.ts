import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  wrongMsg: string = '';
  activated: boolean = false;

  email: string = '';
  password: string = '';

  @ViewChild('resendEmail') resendEmailPopup!: ElementRef;
  @ViewChild('errorMsg') errorMsg!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

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
              this.showWrongMessage('The password does not match the username')
            }
          } else {
            this.closeErrorPopup();
            this.showEmailNotActivatedPopup();
          }
      } else {
        this.showWrongMessage('This email is not registered in our database')
      }})
  }     

  showEmailNotActivatedPopup(){
    this.resendEmailPopup.nativeElement.style.display = 'flex'
    if(window.innerWidth <= 768) {
      this.resendEmailPopup.nativeElement.style.bottom = '0';
      this.resendEmailPopup.nativeElement.style.left = '0';
    } else {
      this.resendEmailPopup.nativeElement.style.left = '50px';
      this.resendEmailPopup.nativeElement.style.bottom = '100px';
    }
  }

  showWrongMessage(message: string){
    this.wrongMsg = message;
    this.errorMsg.nativeElement.style.display = 'flex'
    if (window.innerWidth <= 768){
      this.errorMsg.nativeElement.style.bottom = '0';
      this.errorMsg.nativeElement.style.left = '0';
    } else {
      this.errorMsg.nativeElement.style.left = '50px';
      this.errorMsg.nativeElement.style.bottom = '100px';
    }
    setTimeout(() => {
      this.closeErrorPopup()
    }, 3000);
  }

  closePopup(){
    if(window.innerWidth <= 768){
      this.resendEmailPopup.nativeElement.style.bottom = '-200%';
      this.resendEmailPopup.nativeElement.style.left = '0';
    } else {
      this.resendEmailPopup.nativeElement.style.left = '-200%';
      this.resendEmailPopup.nativeElement.style.bottom = '0';

    }
    setTimeout(() => {
      this.resendEmailPopup.nativeElement.style.display = 'none'
    }, 500);
  }

  closeErrorPopup(){
    if(window.innerWidth <= 768){
      this.errorMsg.nativeElement.style.left = '0';
      this.errorMsg.nativeElement.style.bottom = '-200%';
    } else {
      this.errorMsg.nativeElement.style.bottom = '0';
      this.errorMsg.nativeElement.style.left = '-200%';
    }
    setTimeout(() => {
      this.errorMsg.nativeElement.style.display = 'none'
    }, 500);
  }

  resendEmailActivationLink(){
    this.authService.sendEmailActivationOnly(this.email);
  }

  showPassword(){
    let input = this.passwordInput.nativeElement;
    if (input.type === 'password'){
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }
}
