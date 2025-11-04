import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss']
})
export class AdminSidebarComponent {
  constructor(private router: Router) {}

  logout() {
    // Aquí puedes inyectar AuthService y hacer logout real
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}

