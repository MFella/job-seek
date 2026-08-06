import { Component } from '@angular/core';
import { JobOffersComponent } from './job-offers/job-offers.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JobOffersComponent],
  template: `<app-job-offers />`,
})
export class AppComponent {}
