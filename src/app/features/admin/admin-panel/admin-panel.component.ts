import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss'],
  standalone: false
})
export class AdminPanelComponent {
  constructor(private router: Router) {}

  navigateTo(section: string): void {
    this.router.navigate(['/admin', section]);
  }
}