import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
import { error } from 'console';

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
  wrongMsg: string = '';
  email: string = '';
  password1: string = '';
  password2: string = '';

  @ViewChild('errorMsg') errorMsg!: ElementRef;
  @ViewChildren('passwordInput') passwordInput!: QueryList<ElementRef>;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
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
    try {
      this.againError = false;
      let resp: any = await this.authService.registerUser(this.email, this.password1);
      console.log(resp)
      this.showWrongMessage('A verification email has been sent to you. Please check your inbox or junk folder')
      setTimeout(() => {
        this.router.navigate(['welcome/login'])
      }, 2000);
    } 
    catch (error){
      console.log(error)
    }
  }

  showWrongMessage(message: string) {
    this.wrongMsg = message;
    this.renderer.setStyle(this.errorMsg.nativeElement, 'display', 'flex')
    setTimeout(() => {
      this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '50px')
    }, 100);
    setTimeout(() => {
      this.closeErrorPopup()
    }, 6000);
  }

  closeErrorPopup() {
    this.renderer.setStyle(this.errorMsg.nativeElement, 'left', '-100%')
    setTimeout(() => {
      this.renderer.setStyle(this.errorMsg.nativeElement, 'display', 'flex')
    }, 100);
  }

  showPassword() {
    this.passwordInput.forEach((password) => {
      let input = password.nativeElement;
      if (input.type === 'password') {
        input.type = 'text';
      } else {
        input.type = 'password';
      }
    })
  }
}
