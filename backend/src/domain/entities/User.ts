/**
 * User Domain Entity
 * Represents a registered user in the system.
 */
export class User {
  constructor(
    /** Unique identifier for the user */
    public readonly id: string,
    /** User's email address (used for login) */
    public readonly email: string,
    /** Hashed version of the user's password */
    public readonly passwordHash: string,
    /** List of roles assigned to the user (e.g., 'USER', 'ADMIN') */
    public readonly roles: string[],
    /** Secret used for TOTP Multi-Factor Authentication (optional) */
    public readonly mfaSecret?: string,
    /** Whether MFA is currently enabled for this user */
    public readonly mfaEnabled: boolean = false,
    /** Temporary MFA code for email-based 2FA */
    public readonly mfaCode?: string,
    /** Expiration date for the current mfaCode */
    public readonly mfaCodeExpires?: Date,
    /** Timestamp of when the user record was created */
    public readonly createdAt: Date = new Date(),
    /** Timestamp of the last update to the user record */
    public readonly updatedAt: Date = new Date(),
  ) { }
}
