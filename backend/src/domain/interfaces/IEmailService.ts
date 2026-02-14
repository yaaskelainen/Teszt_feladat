/**
 * IEmailService Port
 * Interface for sending transactional emails (e.g., password reset).
 */
export interface IEmailService {
  /** Sends an email to a recipient with subject and body */
  send(to: string, subject: string, body: string): Promise<void>;
}
