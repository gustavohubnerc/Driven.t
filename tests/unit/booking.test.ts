import { bookingsRepository, enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingsService } from "@/services";
import { Address, Enrollment, TicketType, Ticket, TicketStatus } from "@prisma/client";
import faker from "@faker-js/faker";

beforeEach(async () => {
  jest.clearAllMocks();
});

const mockEnrollmentWithAddress: Enrollment & { Address: Address[] } = {
  id : 1,
  name: faker.name.firstName(),
  cpf: faker.datatype.string(11),
  birthday: faker.date.past(),
  phone: faker.phone.phoneNumber(),
  userId: 1,
  createdAt: faker.date.past(),
  updatedAt: new Date(),
  Address: [
    {
      id: 1,
      cep: faker.datatype.string(8),
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.state(),
      number: faker.address.buildingNumber(),
      neighborhood: faker.address.county(),
      addressDetail: faker.address.secondaryAddress() || null,
      enrollmentId: 1,
      createdAt: faker.date.past(),
      updatedAt: new Date(),
    }
  ],
};

const mockRemoteTicket: Ticket & { TicketType: TicketType } = {
  id: 1,
  ticketTypeId: 1,
  enrollmentId: mockEnrollmentWithAddress.id,
  status: TicketStatus.PAID,
  createdAt: faker.date.past(),
  updatedAt: new Date(),
  TicketType: {
    id: 1,
    name: faker.name.jobDescriptor(),
    price: faker.datatype.number(),
    isRemote: false,
    includesHotel: false,
    createdAt: faker.date.past(),
    updatedAt: new Date(),
  }
};

describe('GET /booking', () => {
  it('should respond with status 404 if user does not have a booking', async () => {
    jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);

    const result = bookingsService.getBooking(1);

    expect(result).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 403 if user ticket does not include hotel', async () => {
    jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(mockEnrollmentWithAddress);
    jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockRemoteTicket);

    const result = bookingsService.createBooking(1, 1);

    expect(result).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'User is not allowed to perform this action.',
    });
  });
});

describe('PUT /booking', () => {
  it('should throw notFoundError if booking does not exist', async () => {
    jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);

    const result = bookingsService.getBooking(1);

    expect(result).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });

  it('should throw forbiddenError if user does not have a booking', async () => {
    jest.spyOn(bookingsRepository, 'getBooking').mockResolvedValueOnce(null);

    const result = bookingsService.updateBooking(1, 1, 1);

    expect(result).toEqual({
      name: 'ForbiddenError',
      message: 'User is not allowed to perform this action.',
    });
  });
});