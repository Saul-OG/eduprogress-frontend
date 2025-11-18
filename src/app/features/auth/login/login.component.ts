import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  activeTab: 'student' | 'admin' = 'student';
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir
    if (this.authService.isAuthenticated()) {
      this.redirectUser();
    }

    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  switchTab(tab: 'student' | 'admin'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.loginForm.reset();
  }

  onSubmit(): void {
    console.log(this.loginForm.value);

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      ...(this.activeTab === 'admin' && { code: this.loginForm.value.code })
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.redirectUser();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
      }
    });
  }

  onForgotPassword(): void {
    const email = prompt('Ingresa tu correo para recuperar la contraseña:');
    if (!email) { return; }
    this.loading = true;
    this.authService.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.loading = false;
        const token = res?.reset_token;
        if (!token) {
          alert('Si el correo existe, se envió un token (modo dev).');
          return;
        }
        const newPass = prompt('Ingresa tu nueva contraseña:');
        if (!newPass) { return; }
        const confirm = prompt('Confirma tu nueva contraseña:');
        if (newPass !== confirm) { alert('No coincide la confirmación.'); return; }
        this.loading = true;
        this.authService.resetPassword({ email, token, password: newPass, password_confirmation: confirm }).subscribe({
          next: () => { this.loading = false; alert('Contraseña restablecida. Ya puedes iniciar sesión.'); },
          error: (err) => { this.loading = false; alert(err?.error?.message || 'No se pudo restablecer la contraseña'); }
        });
      },
      error: () => { this.loading = false; alert('No se pudo iniciar el proceso'); }
    });
  }

  private redirectUser(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/student']);
    }
  }
}
