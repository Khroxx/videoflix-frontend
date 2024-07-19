import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedFunctionsService {
  private backgroundImageSource = new BehaviorSubject<string>('img/greet.jpeg');
  currentBackgroundImage = this.backgroundImageSource.asObservable();

  updateBackgroundImage(imagePath: string) {
    this.backgroundImageSource.next(imagePath);
  }
}
