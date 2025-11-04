// src/app/features/student/student.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StudentRoutingModule } from './student-routing.module';


import { DashboardComponent } from './dashboard/dashboard.component';
import { SubjectDetailComponent } from './subject-detail/subject-detail.component';
import { TheoryComponent } from './theory/theory.component';
import { PracticeComponent } from './practice/practice.component';

@NgModule({
  declarations: [
    DashboardComponent,
    SubjectDetailComponent,
    TheoryComponent,
    PracticeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StudentRoutingModule,

  ]
})
export class StudentModule { }