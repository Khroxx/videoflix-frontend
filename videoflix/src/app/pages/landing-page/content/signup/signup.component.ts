import { Component } from '@angular/core';
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

  email: string = '';
  password1: string = '';
  password2: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sharedService: SharedFunctionsService,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
    this.sharedService.updateBackgroundImage('img/signup.jpeg')
  }

  async createUser(){
    if (this.password1 !== '' && this.password1 === this.password2){
      this.authService.emailExists(this.email).then(exists => {
        if (!exists) {
          this.sendVerificationEmail();
        } else {
          this.emailError = true;
        }})
    } if (this.password1 !== this.password2){
      this.againError = true;
    }
  }



  async sendVerificationEmail(){
    this.emailError  = false;
    this.againError = false;
    this.emailSent = true;
    let resp:any = await this.authService.registerUser(this.email, this.password1);

    this.router.navigate(['welcome/login'])
  }
}
