import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { RegisterComponent } from './features/auth/register/register.component';

const routes: Routes = [
  // Auth públicas
  { path: 'register', component: RegisterComponent },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Student (lazy + guard)
  {
    path: 'student',
    loadChildren: () => import('./features/student/student.module').then(m => m.StudentModule),
    canActivate: [AuthGuard]
  },

  // Admin (lazy + guards)
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Default
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Catch-all
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // vuelve al tope al navegar
    anchorScrolling: 'enabled',           // soporta #anchors
    onSameUrlNavigation: 'reload',        // recarga si navegas a la misma URL
    preloadingStrategy: PreloadAllModules // precarga módulos lazy (más fluidez)
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
