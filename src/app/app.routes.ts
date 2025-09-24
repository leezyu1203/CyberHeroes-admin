import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard, noAuthGuard } from './guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { PhishOrFakeComponent } from './pages/phish-or-fake/phish-or-fake.component';
import { PasswordRushComponent } from './pages/password-rush/password-rush.component';
import { FilterForceComponent } from './pages/filter-force/filter-force.component';
import { AdminManagementComponent } from './pages/admin-management/admin-management.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { QuizQuestionsComponent } from './pages/quiz/quiz-questions/quiz-questions.component';

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
            { path: 'quiz', component: QuizComponent },
            { path: 'quiz/:id', component: QuizQuestionsComponent }, 
            { path: 'admin-management', component: AdminManagementComponent },
        ],
    },
    { path: '**', redirectTo: '/', pathMatch: 'full' },
];
