export enum SessionStatus {
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
}

export type Session = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: SessionStatus;
}

