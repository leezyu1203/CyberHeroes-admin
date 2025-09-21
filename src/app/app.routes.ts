import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard, noAuthGuard } from './auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { PhishOrFakeComponent } from './phish-or-fake/phish-or-fake.component';
import { PasswordRushComponent } from './password-rush/password-rush.component';
import { FilterForceComponent } from './filter-force/filter-force.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
    { 
        path: '', 
        component: LayoutComponent, 
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent },
            { path: 'phish-or-fake', component: PhishOrFakeComponent },
            { path: 'password-rush', component: PasswordRushComponent },
            { path: 'filter-force', component: FilterForceComponent },
            { path: 'admin-management', component: AdminManagementComponent },
        ],
    },
    { path: '**', redirectTo: '/', pathMatch: 'full' },
];
