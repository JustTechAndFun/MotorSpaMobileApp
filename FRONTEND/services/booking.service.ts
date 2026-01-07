import { apiClient } from '../config/api.client';
import {
    Booking,
    BookingListParams,
    BookingWithServices,
    CreateBookingRequest,
    UpdateBookingRequest,
} from '../types/api.types';

class BookingService {
  private readonly BASE_PATH = '/bookings';

  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response: any = await apiClient.post(this.BASE_PATH, data);
    return response.data.data || response.data;
  }

  /**
   * Get all bookings (Admin/Employee only)
   */
  async getAllBookings(params?: BookingListParams): Promise<Booking[]> {
    const response: any = await apiClient.get(this.BASE_PATH, { params });
    return response.data.data || response.data;
  }

  /**
   * Get current user's bookings
   */
  async getMyBookings(): Promise<Booking[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/my-bookings`);
    return response.data.data || response.data;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Get booking with full service details
   */
  async getBookingWithServices(id: string): Promise<BookingWithServices> {
    const response: any = await apiClient.get(
      `${this.BASE_PATH}/${id}/with-services`
    );
    return response.data.data || response.data;
  }

  /**
   * Update booking
   */
  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    const response: any = await apiClient.patch(`${this.BASE_PATH}/${id}`, data);
    return response.data.data || response.data;
  }

  /**
   * Delete booking
   */
  async deleteBooking(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}

export const bookingService = new BookingService();
