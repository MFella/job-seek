import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { JobOffersComponent } from './job-offers.component';

describe('JobOffersComponent', () => {
  let fixture: ComponentFixture<JobOffersComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOffersComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(JobOffersComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads and lists job offers from the API', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiUrl}/job-offers`);
    req.flush([
      {
        id: '1',
        title: 'Frontend Engineer',
        company: 'Acme',
        location: 'Remote',
        source: 'just-join-it',
        url: 'https://example.com/1',
        postedAt: new Date().toISOString(),
      },
    ]);

    expect(fixture.componentInstance.status()).toBe('ready');
    expect(fixture.componentInstance.jobOffers().length).toBe(1);
  });

  it('filters job offers by search term', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiUrl}/job-offers`);
    req.flush([
      {
        id: '1',
        title: 'Frontend Engineer',
        company: 'Acme',
        location: 'Remote',
        source: 'just-join-it',
        url: 'https://example.com/1',
        postedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Backend Engineer',
        company: 'Globex',
        location: 'Warsaw',
        source: 'no-fluff-jobs',
        url: 'https://example.com/2',
        postedAt: new Date().toISOString(),
      },
    ]);

    fixture.componentInstance.searchTerm.set('backend');

    expect(fixture.componentInstance.filteredJobOffers().length).toBe(1);
    expect(fixture.componentInstance.filteredJobOffers()[0].company).toBe(
      'Globex'
    );
  });
});
