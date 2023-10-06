import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createUser } from '../factories';
import { TicketStatus } from '@prisma/client';
import { createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { createBooking, createRoomWithNoVacancy } from '../factories/booking-factory';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});
  
const server = supertest(app);


describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 if user does not have a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 200 and with booking data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const booking = await createBooking(user.id, room.id);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                id: booking.id,
                Room: {
                    id: room.id,
                    name: room.name,
                    capacity: room.capacity,
                    hotelId: room.hotelId,
                    createdAt: room.createdAt.toISOString(),
                    updatedAt: room.updatedAt.toISOString(),                    
                },
            });
        });
    });    
});

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 403 if user ticket is remote', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
      
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });  

        it('should respond with status 403 when ticket is not paid ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
      
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 403 when ticket doenst include hotel', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });   
        
        it('should respond with status 403 when there is no vacancy in the room', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithNoVacancy(hotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        })

        it('should respond with status 404 if room does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 1 });

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it('should respond with status 200 and with booking data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number)
            });
        });
    });
});

describe('PUT /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.put('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 403 if user does not have a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server.put('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.FORBIDDEN);
        });
    });
});