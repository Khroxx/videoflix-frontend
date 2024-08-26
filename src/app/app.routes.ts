import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { VideoOffersComponent } from './pages/video-offers/video-offers.component';
import { GreetingComponent } from './pages/landing-page/content/greeting/greeting.component';
import { LoginComponent } from './pages/landing-page/content/login/login.component';
import { SignupComponent } from './pages/landing-page/content/signup/signup.component';
import { ForgotPasswordComponent } from './pages/landing-page/content/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/landing-page/content/reset-password/reset-password.component';
import { VideoplayerComponent } from './pages/videoplayer/videoplayer.component';
import { ImprintComponent } from './shared/imprint/imprint.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
    { path: '/', redirectTo: 'welcome', pathMatch: 'full' },
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: '**', redirectTo: 'welcome' },
    { path: 'welcome', component: LandingPageComponent, 
        children: [
            { path: '', component: GreetingComponent },
            { path: 'login', component: LoginComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'reset-password/:userId', component: ResetPasswordComponent },
            { path: 'reset-password', component: ResetPasswordComponent }, // fürs testen
        ]
    },
    { path: 'videos', component: VideoOffersComponent, canActivate: [AuthGuardService], children: [
        { path: 'watching/:id', component: VideoplayerComponent }
    ] },
    { path: 'info', children:
        [
            { path: 'imprint', component: ImprintComponent },
            { path: 'privacy-policy', component: PrivacyPolicyComponent}
        ]
    }
];
