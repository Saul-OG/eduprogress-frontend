import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  private sub = new Subscription();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // aplicar tema inicial
    this.applyThemeByUrl(this.router.url);

    // cambiar tema según la ruta
    const s = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.applyThemeByUrl(e.urlAfterRedirects));
    this.sub.add(s);
  }

  private applyThemeByUrl(url: string): void {
    const path = url.startsWith('/') ? url : `/${url}`;
    document.body.classList.remove('admin-theme', 'student-theme');

    if (path.startsWith('/admin')) {
      document.body.classList.add('admin-theme');
    } else if (path.startsWith('/student')) {
      document.body.classList.add('student-theme');
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
