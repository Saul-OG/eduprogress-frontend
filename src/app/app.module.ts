// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// ⬇️ Tu interceptor XSRF
import { XsrfInterceptor } from './core/interceptors/xsrf.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    // ❌ NO declares RegisterComponent aquí (está en AuthModule lazy-loaded)
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',   // Laravel setea esta cookie
      headerName: 'X-XSRF-TOKEN', // Angular enviará este header
    }),
  ],
  providers: [
    // ⬇️ Registra el interceptor
    { provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
