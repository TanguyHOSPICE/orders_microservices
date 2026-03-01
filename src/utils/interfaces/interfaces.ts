export interface IUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  status: string;
  isActive: boolean;
  birthdate?: Date;
  currency?: string;
  orders?: string[]; // Array of order IDs
}
