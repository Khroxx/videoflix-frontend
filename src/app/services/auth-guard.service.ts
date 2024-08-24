import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  canActivate(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      if (this.authService.isLoggedIn()) {
        return true;
      } else {
        this.router.navigate(['welcome/login']);
        return false;
      }
    }
    return false;
  }
}
