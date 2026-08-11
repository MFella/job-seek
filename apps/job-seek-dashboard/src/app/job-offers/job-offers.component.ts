import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JobOffer } from '../models/job-offer';
import { JobOffersService } from '../services/job-offers.service';

type LoadStatus = 'idle' | 'loading' | 'error' | 'ready';

@Component({
  selector: 'app-job-offers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './job-offers.component.html',
})
export class JobOffersComponent implements OnInit {
  private readonly jobOffersService = inject(JobOffersService);

  readonly status = signal<LoadStatus>('idle');
  readonly jobOffers = signal<JobOffer[]>([]);
  readonly searchTerm = signal('');

  readonly filteredJobOffers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.jobOffers();
    }

    return this.jobOffers().filter(
      (offer) =>
        offer.title.toLowerCase().includes(term) ||
        offer.company.toLowerCase().includes(term) ||
        offer.location.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.status.set('loading');
    this.jobOffersService.getJobOffers().subscribe({
      next: (offers) => {
        this.jobOffers.set(offers);
        this.status.set('ready');
      },
      error: () => this.status.set('error'),
    });
  }
}
