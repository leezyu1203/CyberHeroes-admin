import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard, firstTimeLoginGuard, noAuthGuard, verificationGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { PhishOrFakeComponent } from './pages/phish-or-fake/phish-or-fake.component';
import { PasswordRushComponent } from './pages/password-rush/password-rush.component';
import { FilterForceComponent } from './pages/filter-force/filter-force.component';
import { AdminManagementComponent } from './pages/admin-management/admin-management.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { QuizQuestionsComponent } from './pages/quiz/quiz-questions/quiz-questions.component';
import { FirstTimeLoginComponent } from './pages/first-time-login/first-time-login.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
    { path: 'first-time-login', component: FirstTimeLoginComponent, canActivate: [firstTimeLoginGuard] },
    { path: 'verify-email', component: VerifyEmailComponent, canActivate: [verificationGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [noAuthGuard] },
    { 
        path: '', 
        component: LayoutComponent, 
        canActivate: [authGuard],
        children: [
            { path: '', component: DashboardComponent },
            { path: 'phish-or-fake', component: PhishOrFakeComponent },
            { path: 'password-rush', component: PasswordRushComponent },
            { path: 'filter-force', component: FilterForceComponent },
            { path: 'quiz', component: QuizComponent },
            { path: 'quiz/:id', component: QuizQuestionsComponent }, 
            { path: 'admin-management', component: AdminManagementComponent },
        ],
    },
    { path: '**', redirectTo: '/', pathMatch: 'full' },
];
