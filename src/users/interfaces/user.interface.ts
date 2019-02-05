export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserPayload {
  name: string;
  email: string;
  password: string;
}
