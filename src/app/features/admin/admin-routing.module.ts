import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { ContentManagementComponent } from './content-management/content-management.component';
import { StudentsListComponent } from './students-list/students-list.component';
import { ReportsComponent } from './reports/reports.component';
import { ChartModalComponent } from './chart-modal/chart-modal.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPanelComponent,   // <-- Layout base admin
    children: [
      { path: '', component: ContentManagementComponent },
      { path: 'content', component: ContentManagementComponent },
      { path: 'students', component: StudentsListComponent },
      { path: 'reports', component: ReportsComponent },
       { path: 'charts', component: ChartModalComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

