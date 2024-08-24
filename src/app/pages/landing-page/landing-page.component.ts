import { ChangeDetectorRef, Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { SharedFunctionsService } from '../../services/shared-functions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  backgroundImg: string = 'img/greet.jpeg';
  private imgSubscription!: Subscription;

  constructor(
    private sharedService: SharedFunctionsService,
    private changeDetectorRef: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.imgSubscription = this.sharedService.currentBackgroundImage.subscribe(img => {
      this.backgroundImg = img;
      this.changeDetectorRef.detectChanges();
    });

  }

  ngOnDestroy(): void {
    this.imgSubscription.unsubscribe();
  }


}
