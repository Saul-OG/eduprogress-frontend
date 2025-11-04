import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

describe('AuthInterceptor', () => {
  let interceptor: AuthInterceptor;
  let mockAuthService: Partial<AuthService>;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    // Mock de AuthService
    mockAuthService = {
      getToken: () => 'fake-token'
    };

// Mock de Router
mockRouter = {
  navigate: (commands: any[], extras?: any) => Promise.resolve(true)
};

    // Ahora pasamos ambos al constructor
    interceptor = new AuthInterceptor(
      mockAuthService as AuthService,
      mockRouter as Router
    );
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
