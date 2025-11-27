export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phone?: string;
}