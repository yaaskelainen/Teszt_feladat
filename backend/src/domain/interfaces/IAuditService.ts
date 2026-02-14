export interface IAuditService {
    log(action: string, userId?: string, metadata?: any): Promise<void>;
}
