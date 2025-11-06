import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideRouter, CanActivateFn } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

describe('authGuard (functional)', () => {
  let mockAuth: Partial<AuthService>;

  beforeEach(() => {
    mockAuth = {
      isAuthenticated: () => true, // cambia a false para probar redirección
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
      ],
    });
  });

  const runGuard: CanActivateFn = (...params) =>
    TestBed.runInInjectionContext(() => authGuard(...params));

  it('permite el acceso si está autenticado', () => {
    mockAuth.isAuthenticated = () => true;
    const result = runGuard({} as any, {} as any);
    expect(result).toBeTrue();
  });

  it('bloquea el acceso si NO está autenticado', () => {
    mockAuth.isAuthenticated = () => false;
    const result = runGuard({} as any, {} as any);
    // Para guards síncronos devolverá false
    expect(result).toBeFalse();
  });
});
