import { Router } from 'express';
import { ticketsController } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', ticketsController.getTicketTypes)
    .get('/', ticketsController.getTicketFromUser)
    .post('/', ticketsController.createTicket);

export { ticketsRouter };