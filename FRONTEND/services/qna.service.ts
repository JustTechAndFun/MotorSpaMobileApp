import { apiClient } from '../config/api.client';
import {
    CreateQnARequest,
    QnAMessage,
    QnAStatus,
    ReplyQnARequest,
} from '../types/api.types';

class QnAService {
  private readonly BASE_PATH = '/qna';

  /**
   * Create new message
   */
  async createMessage(data: CreateQnARequest): Promise<QnAMessage> {
    const response: any = await apiClient.post(this.BASE_PATH, data);
    return response.data.data || response.data;
  }

  /**
   * Get current user's messages
   */
  async getMyMessages(): Promise<QnAMessage[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/my-messages`);
    return response.data.data || response.data;
  }

  /**
   * Get all messages (Admin/Employee only)
   */
  async getAllMessages(): Promise<QnAMessage[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/all`);
    return response.data.data || response.data;
  }

  /**
   * Get pending messages (Admin/Employee only)
   */
  async getPendingMessages(): Promise<QnAMessage[]> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/pending`);
    return response.data.data || response.data;
  }

  /**
   * Get message by ID
   */
  async getMessageById(id: string): Promise<QnAMessage> {
    const response: any = await apiClient.get(`${this.BASE_PATH}/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Delete message
   */
  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Reply to message (Admin/Employee only)
   */
  async replyToMessage(id: string, data: ReplyQnARequest): Promise<QnAMessage> {
    const response: any = await apiClient.post(`${this.BASE_PATH}/${id}/reply`, data);
    return response.data.data || response.data;
  }

  /**
   * Update message status (Admin/Employee only)
   */
  async updateStatus(id: string, status: QnAStatus): Promise<QnAMessage> {
    const response: any = await apiClient.patch(`${this.BASE_PATH}/${id}/status/${status}`);
    return response.data.data || response.data;
  }
}

export const qnaService = new QnAService();
