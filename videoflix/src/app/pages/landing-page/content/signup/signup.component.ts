import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../interfaces/user';
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
    private http: HttpClient,
    private authUser: AuthService
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
    this.sharedService.updateBackgroundImage('img/signup.jpeg')
  }

  createUser(){
    if (this.password1 !== '' && this.password1 === this.password2 && this.emailError === false){
      this.sentVerificationEmail();
    } if (this.password1 !== this.password2){
      this.againError = true
    }
  }

  async sentVerificationEmail(){
    this.emailError  = false;
    this.againError = false;
    this.emailSent = true;
    let resp:any = await this.authUser.registerUser(this.email, this.password1);
    console.log(resp)

    this.router.navigate(['welcome/login'])
  }

  // emailExists(): void {
  //   this.http.get<User[]>('http://127.0.0.1:8000/users/').subscribe({
  //     next: (users) => {
  //       let exists = users.some(user => user.email === this.email);
  //       if (exists) {
  //         this.emailError = true;
  //       } else {
  //         this.emailError = false;
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Fehler beim Abrufen der Benutzerdaten:', err);
  //     }
  //   });
  // }
}
