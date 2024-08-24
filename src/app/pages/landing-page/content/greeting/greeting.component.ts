import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedFunctionsService } from '../../../../services/shared-functions.service';

@Component({
  selector: 'app-greeting',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './greeting.component.html',
  styleUrl: './greeting.component.scss'
})
export class GreetingComponent {
  email: string = '';
  emailDoesNotExist: boolean = false;


  constructor(
    private router: Router,
    private sharedService: SharedFunctionsService,
  ){}

  ngOnInit(): void {
    this.sharedService.updateBackgroundImage('img/greet.jpeg');

  }

  navigateToSignUp(){
    if (this.email){
      this.router.navigate(['welcome/signup'], { queryParams: { email: this.email } });
    } else {
      this.router.navigate(['welcome/signup']);
    }
  }
}
