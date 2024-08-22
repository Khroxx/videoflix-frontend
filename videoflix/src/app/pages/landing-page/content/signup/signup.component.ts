import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  emailError: boolean = false;
  againError: boolean = false;
  emailSent: boolean = false;

  @ViewChild('errorMsg') errorMsg!: ElementRef;
  @ViewChildren('passwordInput') passwordInput!: QueryList<ElementRef>;

  wrongMsg: string = '';
  email: string = '';
  password1: string = '';
  password2: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedFunctionsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
    this.sharedService.updateBackgroundImage('img/signup.jpeg')
  }

  async createUser() {
    if (this.password1 !== '' && this.password1 === this.password2) {
      this.authService.emailExists(this.email).then(exists => {
        if (!exists) {
          this.sendVerificationEmail();
        } else {
          this.showWrongMessage('This Email is already registered. Please login.')
        }
      })
    } if (this.password1 !== this.password2) {
      this.againError = true;
    }
  }



  async sendVerificationEmail() {
    this.againError = false;
    this.showWrongMessage('A verification email has been sent to you. Please check your inbox or Junk folder')
    let resp: any = await this.authService.registerUser(this.email, this.password1);
    setTimeout(() => {
      this.router.navigate(['welcome/login'])
    }, 2000);
  }

  showWrongMessage(message: string) {
    this.wrongMsg = message;
    this.errorMsg.nativeElement.style.left = '50px';
    setTimeout(() => {
      this.closeErrorPopup()
    }, 3000);
  }

  closeErrorPopup() {
    this.errorMsg.nativeElement.style.left = '-100%';
  }

  showPassword(){
    this.passwordInput.forEach((password) => {
      let input = password.nativeElement;
      if (input.type === 'password'){
        input.type = 'text';
      } else {
        input.type = 'password';
      }

    })
  }
}
