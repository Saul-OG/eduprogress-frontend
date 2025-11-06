import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from './core/services/auth.service'; // <- importa tu servicio

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  constructor(
    private router: Router,
    private auth: AuthService,   // <- inyéctalo
  ) {}

ngOnInit(): void {
  // opción: no bloquea la navegación y no loguea nada si 401
  this.auth.restoreSession().subscribe({ next: () => {}, error: () => {} });

  this.applyThemeByUrl(this.router.url);
  const s = this.router.events
    .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    .subscribe(e => this.applyThemeByUrl(e.urlAfterRedirects));
  this.sub.add(s);
}


  private applyThemeByUrl(url: string): void {
    const path = url.startsWith('/') ? url : `/${url}`;
    document.body.classList.remove('admin-theme', 'student-theme', 'auth-theme');

    if (path.startsWith('/admin')) {
      document.body.classList.add('admin-theme');
    } else if (path.startsWith('/student')) {
      document.body.classList.add('student-theme');
    } else if (path.startsWith('/login') || path.startsWith('/register')) {
      document.body.classList.add('auth-theme');
    }
    // si quieres un default, puedes dejar student-theme por defecto:
    // else { document.body.classList.add('student-theme'); }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
