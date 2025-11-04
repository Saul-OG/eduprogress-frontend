import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { ContentManagementComponent } from './content-management/content-management.component';
import { StudentsListComponent } from './students-list/students-list.component';
import { ReportsComponent } from './reports/reports.component';
import { ChartModalComponent } from './chart-modal/chart-modal.component';

@NgModule({
  declarations: [
    AdminPanelComponent,
    ContentManagementComponent,
    StudentsListComponent,
    ReportsComponent,
    ChartModalComponent

    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,

    AdminSidebarComponent  // ← Solo aquí si es standalone
  ]
})
export class AdminModule { }
