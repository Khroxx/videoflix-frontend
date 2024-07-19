export interface User {
    email: string,
    password: string,
    id: string,
    phone?: number,
    address?: string,
    custom?: string,
    is_active: boolean,
    is_staff: boolean,
}
