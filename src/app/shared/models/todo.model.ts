export interface Todo {
    id?: number;
    title: string;
    description: string;
    isDone: boolean;
    user_id: number;
    mongoId: number;
    position: string;
}
