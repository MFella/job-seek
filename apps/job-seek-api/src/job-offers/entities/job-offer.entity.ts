import type { JobOffer as JobOfferModel } from '../../../generated/prisma/client';

export class JobOfferEntity implements JobOfferModel {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
