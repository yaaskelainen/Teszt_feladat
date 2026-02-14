import { User } from '../entities/User';

/**
 * IUserRepository Port
 * Interface for User data persistence operations.
 */
export interface IUserRepository {
  /** Finds a user by their unique ID */
  findById(id: string): Promise<User | null>;
  /** Finds a user by their email address */
  findByEmail(email: string): Promise<User | null>;
  /** Persists a new user record */
  create(user: User): Promise<User>;
  /** Updates an existing user record */
  update(user: User): Promise<User>;
  /** Removes a user record by ID */
  delete(id: string): Promise<void>;
  /** Retrieves all users */
  findAll(): Promise<User[]>;
}
