import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideRouter, CanActivateFn } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard (functional)', () => {
  let mockAuth: Partial<AuthService>;

  beforeEach(() => {
    mockAuth = {
      isAuthenticated: () => true,
      isAdmin: () => true,
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
    TestBed.runInInjectionContext(() => adminGuard(...params));

  it('permite acceso a admin autenticado', () => {
    mockAuth.isAuthenticated = () => true;
    mockAuth.isAdmin = () => true;
    const result = runGuard({} as any, {} as any);
    expect(result).toBeTrue();
  });

  it('bloquea acceso si NO es admin', () => {
    mockAuth.isAuthenticated = () => true;
    mockAuth.isAdmin = () => false;
    const result = runGuard({} as any, {} as any);
    expect(result).toBeFalse();
  });
});


