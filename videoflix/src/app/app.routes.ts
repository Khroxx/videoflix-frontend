import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { VideoOffersComponent } from './pages/video-offers/video-offers.component';
import { GreetingComponent } from './pages/landing-page/content/greeting/greeting.component';
import { LoginComponent } from './pages/landing-page/content/login/login.component';
import { SignupComponent } from './pages/landing-page/content/signup/signup.component';
import { ForgotPasswordComponent } from './pages/landing-page/content/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/landing-page/content/reset-password/reset-password.component';
import { VideoplayerComponent } from './pages/videoplayer/videoplayer.component';

export const routes: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: LandingPageComponent, 
        children: [
            // { path: '', redirectTo: 'greet', pathMatch: 'full'},
            { path: '', component: GreetingComponent },
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent },
        ]
    },
    { path: 'videos', component: VideoOffersComponent, children: [
        { path: 'watching', component: VideoplayerComponent }
    ] },

];
