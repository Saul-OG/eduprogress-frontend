import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true, // 👈 añadido
  imports: [CommonModule, FormsModule, ReactiveFormsModule], // 👈 añadido
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Completa todos los campos válidos.';
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.auth.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.loading = false;
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Error al registrar usuario';
      }
    });
  }
}
