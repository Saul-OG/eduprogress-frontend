import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

function readCookie(name: string): string | null {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1] ?? null;
}

@Injectable()
export class XsrfInterceptor implements HttpInterceptor {
  private backendOrigin = 'http://localhost:8000';

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo añade el header cuando el request va a tu backend
    if (req.url.startsWith(this.backendOrigin)) {
      const xsrf = readCookie('XSRF-TOKEN');
      if (xsrf) {
        req = req.clone({
          withCredentials: true,
          setHeaders: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': decodeURIComponent(xsrf),
          },
        });
      } else {
        // Aun así manda credenciales y X-Requested-With
        req = req.clone({
          withCredentials: true,
          setHeaders: { 'X-Requested-With': 'XMLHttpRequest' },
        });
      }
    }
    return next.handle(req);
  }
}
