import * as bookingService from '../booking.service';
import bookingRepository from '../../repositories/booking.repository';
import earningsRepository from '../../../earnings/repositories/earnings.repository';
import { AppError } from '../../../auth/utils/AppError';

jest.mock('../../repositories/booking.repository');
jest.mock('../../../earnings/repositories/earnings.repository');

describe('BookingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateBookingStatus', () => {
        it('should update status and delete earning if status is not completed', async () => {
            const mockBooking = { id: '1', barber_id: 'b1', status: 'pending' };
            (bookingRepository.findBookingById as jest.Mock).mockResolvedValue(mockBooking);
            (bookingRepository.updateBookingStatus as jest.Mock).mockResolvedValue({ ...mockBooking, status: 'cancelled' });

            await bookingService.updateBookingStatus('1', 'cancelled', 'b1');

            expect(bookingRepository.updateBookingStatus).toHaveBeenCalledWith('1', 'cancelled', null);
            expect(earningsRepository.deleteByBookingId).toHaveBeenCalledWith('1');
        });

        it('should update status and NOT delete earning if status is completed', async () => {
            const mockBooking = { id: '1', barber_id: 'b1', status: 'pending' };
            (bookingRepository.findBookingById as jest.Mock).mockResolvedValue(mockBooking);
            (bookingRepository.updateBookingStatus as jest.Mock).mockResolvedValue({ ...mockBooking, status: 'completed' });

            await bookingService.updateBookingStatus('1', 'completed', 'b1');

            expect(bookingRepository.updateBookingStatus).toHaveBeenCalledWith('1', 'completed', undefined);
            expect(earningsRepository.deleteByBookingId).not.toHaveBeenCalled();
        });
    });

    describe('updateBookingPrice', () => {
        it('should update price and upsert earning if completed', async () => {
            const mockBooking = { id: '1', barber_id: 'b1', status: 'completed', date: '2023-01-01' };
            (bookingRepository.findBookingById as jest.Mock).mockResolvedValue(mockBooking);
            (bookingRepository.updateBookingPrice as jest.Mock).mockResolvedValue({ ...mockBooking, price: 100 });

            await bookingService.updateBookingPrice('1', 100, 'b1');

            expect(bookingRepository.updateBookingPrice).toHaveBeenCalledWith('1', 100);
            expect(earningsRepository.upsertByBookingId).toHaveBeenCalledWith({
                barber_id: 'b1',
                booking_id: '1',
                amount: 100,
                date: '2023-01-01',
                type: 'booking'
            });
        });
    });
});
