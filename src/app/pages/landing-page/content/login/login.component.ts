import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
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
  email: string = '';
  wrongMsg: string = '';
  password: string = '';
  activated: boolean = false;
  rememberMe: boolean = false;

  @ViewChild('resendEmail') resendEmailPopup!: ElementRef;
  @ViewChild('errorMsg') errorMsg!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedFunctionsService,
    private route: ActivatedRoute,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.sharedService.updateBackgroundImage('img/login.jpeg');
    this.route.queryParams.subscribe(params => {
      if (params['activated']) {
        this.activated = params['activated'] === 'true';
        this.showWrongMessage('Your account has been activated, please log in')
      }
    });
    this.getRememberedUser();
    this.checkRememberMe()
  }

  checkRememberMe(){
    if (this.rememberMe){
      localStorage.setItem('email', this.email)
    } else {
      localStorage.removeItem('email')
    }
  }

  getRememberedUser(){
    let savedEmail = localStorage.getItem('email');
    if (savedEmail){
      this.email = savedEmail;
      this.rememberMe = true
    }
  }

  login() {
    this.authService.emailExists(this.email).then(async exists => {
      if (exists) {
        let is_active = await this.authService.isUserActive(this.email)
        if (is_active) {
          this.checkUserCredentials();
          this.checkRememberMe()
        } else {
          this.closeErrorPopup();
          this.showEmailNotActivatedPopup();
        }
      } else {
        this.showWrongMessage('This email is not registered in our database')
      }
    })
  }

  async checkUserCredentials() {
    try {
      let userData: any = await this.authService.loginUser(this.email, this.password);
      if (this.rememberMe){
        localStorage.setItem('token', userData.token);
      } else {
        sessionStorage.setItem('token', userData.token);
      }
      this.router.navigate(['videos/']);
    } catch {
      this.showWrongMessage('The password does not match the username')
    }
  }

  showEmailNotActivatedPopup() {
    this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'display', 'flex')
    if (window.innerWidth <= 768) {
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'bottom', '0')
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'left', '0')
    } else {
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'left', '50px')
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'bottom', '100px')
    }
  }

  showWrongMessage(message: string) {
    this.wrongMsg = message;
    this.renderer.setStyle(this.errorMsg.nativeElement, 'display', 'flex')
    setTimeout(() => {
      if (window.innerWidth <= 768) {
        this.renderer.setStyle(this.errorMsg.nativeElement, 'bottom', '0')
        this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '0')
      } else {
        this.renderer.setStyle(this.errorMsg.nativeElement, 'bottom', '100px')
        this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '50px')
      }
    }, 100);

    setTimeout(() => {
      this.closeErrorPopup()
    }, 6000);
  }

  closePopup() {
    if (window.innerWidth <= 768) {
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'bottom', '-200%')
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'left', '0')
    } else {
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'bottom', '0')
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'left', '-200%')

    }
    setTimeout(() => {
      this.renderer.setStyle(this.resendEmailPopup.nativeElement, 'display', 'none')
    }, 500);
  }

  closeErrorPopup() {
    if (window.innerWidth <= 768) {
      this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '0')
      this.renderer.setStyle(this.errorMsg.nativeElement, 'bottom', '-200%')
    } else {
      this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '-200%')
      this.renderer.setStyle(this.errorMsg.nativeElement, 'bottom', '0')
    }
    setTimeout(() => {
      this.renderer.setStyle(this.errorMsg.nativeElement, 'display', 'none')
    }, 500);
  }

  resendEmailActivationLink() {
    this.authService.sendEmailActivationOnly(this.email);
  }

  showPassword() {
    let input = this.passwordInput.nativeElement;
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }
}
