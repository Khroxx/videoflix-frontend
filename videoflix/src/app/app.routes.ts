import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { VideoOffersComponent } from './pages/video-offers/video-offers.component';

export const routes: Routes = [
    {path : '', redirectTo: 'welcome', pathMatch: 'full'},
    {path : 'welcome', component: LandingPageComponent},
    {path : 'videos', component: VideoOffersComponent},

];
