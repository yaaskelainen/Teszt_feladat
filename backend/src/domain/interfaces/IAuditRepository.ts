export interface IAuditRepository {
    save(entry: {
        action: string;
        userId?: string;
        metadata?: string;
    }): Promise<void>;
}
