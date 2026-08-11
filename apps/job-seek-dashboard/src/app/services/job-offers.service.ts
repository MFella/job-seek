import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JobOffer } from '../models/job-offer';

@Injectable({ providedIn: 'root' })
export class JobOffersService {
  private readonly http = inject(HttpClient);

  getJobOffers(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${environment.apiUrl}/job-offers`);
  }
}
