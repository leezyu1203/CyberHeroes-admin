import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard, noAuthGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
    { path: '', component: DashboardComponent, canActivate: [authGuard]},
    { path: '**', redirectTo: '/', pathMatch: 'full' },
];
