import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SubjectDetailComponent } from './subject-detail/subject-detail.component';
import { TheoryComponent } from './theory/theory.component';
import { PracticeComponent } from './practice/practice.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'subject/:id',
    component: SubjectDetailComponent
  },
  {
    path: 'theory/:subjectId/:topicId',
    component: TheoryComponent
  },
  {
    path: 'practice/:subjectId/:topicId',
    component: PracticeComponent
  },
  {
  path: 'practice/:subjectId/:topicId',
  component: PracticeComponent
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }