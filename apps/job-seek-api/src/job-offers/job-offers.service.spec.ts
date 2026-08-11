import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { JobOffersService } from './job-offers.service';

describe('JobOffersService', () => {
  let service: JobOffersService;
  const prismaMock = {
    jobOffer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOffersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(JobOffersService);
    jest.clearAllMocks();
  });

  it('lists job offers ordered by postedAt desc', async () => {
    prismaMock.jobOffer.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prismaMock.jobOffer.findMany).toHaveBeenCalledWith({
      orderBy: { postedAt: 'desc' },
    });
  });

  it('throws NotFoundException when the job offer does not exist', async () => {
    prismaMock.jobOffer.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
