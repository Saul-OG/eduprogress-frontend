import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';

import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { ContentManagementComponent } from './content-management/content-management.component';
import { StudentsListPageComponent } from './students-list/students-list.page';
import { ReportsComponent } from './reports/reports.component';
import { ChartModalComponent } from './chart-modal/chart-modal.component';

@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminSidebarComponent,
    ContentManagementComponent,
    StudentsListPageComponent,
    ReportsComponent,
    ChartModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
