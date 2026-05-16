import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  private dataSource: AuthRemoteDataSource;

  constructor(dataSource: AuthRemoteDataSource) {
    this.dataSource = dataSource;
  }

  async login(email: string, password: string): Promise<void> {
    return this.dataSource.login(email, password);
  }

  async signup(email: string, password: string): Promise<void> {
    return this.dataSource.signUp(email, password);
  }

  async logout(): Promise<void> {
    return this.dataSource.logOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const valid = await this.dataSource.verifyToken();
    return valid ? { email: '', password: '' } : null;
  }

  async forgotPassword(email: string): Promise<void> {
    return this.dataSource.forgotPassword(email);
  }

  async validate(email: string, validationCode: string): Promise<void> {
    return this.dataSource.validate(email, validationCode);
  }
}
