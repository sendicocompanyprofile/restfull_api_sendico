import { getPrismaClient } from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';
import { ResponseError } from '../utils/errors.js';
import type { RegisterUserRequest, LoginUserRequest, UpdateUserRequest } from '../validators/user.validator.js';
import type { UserResponse } from '../types/index.js';

export class UserService {
  private get prisma() {
    return getPrismaClient();
  }
  async register(request: RegisterUserRequest): Promise<UserResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { username: request.username },
      });

      if (existingUser) {
        logger.warn('Registration failed - username already exists', {
          username: request.username,
        });
        throw new ResponseError(400, 'Username already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(request.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          username: request.username,
          password: hashedPassword,
          name: request.name,
          is_admin: request.is_admin ?? false,
        },
      });

      logger.info('User registered successfully', {
        username: user.username,
      });

      return {
        username: user.username,
        name: user.name,
      };
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      logger.error('Register operation failed', {
        username: request.username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to register user');
    }
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { username: request.username },
      });

      if (!user) {
        logger.warn('Login failed - user not found', {
          username: request.username,
        });
        throw new ResponseError(401, 'Username or password is incorrect');
      }

      // Compare password
      logger.debug('Comparing passwords', {
        username: request.username,
        providedPasswordLength: request.password.length,
        storedPasswordLength: user.password.length,
      });
      const isPasswordValid = await comparePassword(request.password, user.password);

      if (!isPasswordValid) {
        logger.warn('Login failed - invalid password', {
          username: request.username,
        });
        throw new ResponseError(401, 'Username or password is incorrect');
      }

      // Generate JWT token with is_admin flag
      const token = generateToken(user.username, user.is_admin);

      logger.info('User logged in successfully', {
        username: user.username,
        is_admin: user.is_admin,
      });

      return {
        username: user.username,
        name: user.name,
        token,
      };
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      logger.error('Login operation failed', {
        username: request.username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to login');
    }
  }

  async getCurrentUser(username: string): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        logger.warn('Get current user failed - user not found', {
          username,
        });
        throw new ResponseError(404, 'User not found');
      }

      logger.debug('Get current user successful', {
        username: user.username,
      });

      return {
        username: user.username,
        name: user.name,
        is_admin: user.is_admin,
        ...(user.token && { token: user.token }),
      };
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      logger.error('Get current user operation failed', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to get user');
    }
  }

  async updateUser(username: string, request: UpdateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        logger.warn('Update user failed - user not found', {
          username,
        });
        throw new ResponseError(404, 'User not found');
      }

      const updateData: any = {};

      if (request.name) {
        updateData.name = request.name;
      }

      if (request.password) {
        updateData.password = await hashPassword(request.password);
      }

      const updatedUser = await this.prisma.user.update({
        where: { username },
        data: updateData,
      });

      logger.info('User updated successfully', {
        username: updatedUser.username,
        updatedFields: Object.keys(updateData),
      });

      return {
        username: updatedUser.username,
        name: updatedUser.name,
        ...(updatedUser.token && { token: updatedUser.token }),
      };
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      logger.error('Update user operation failed', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to update user');
    }
  }

  async logout(username: string): Promise<void> {
    try {
      // JWT tokens are stateless, no database update needed
      // Client should discard the token on their end
      logger.info('User logged out successfully', {
        username,
      });
    } catch (error) {
      logger.error('Logout operation failed', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to logout');
    }
  }

  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          username: true,
          name: true,
        },
      });

      logger.info(`Found ${users.length} users`);
      return users;
    } catch (error) {
      logger.error('Get all users operation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to get all users');
    }
  }

  async deleteUser(username: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        logger.warn('Delete user failed - user not found', {
          username,
        });
        throw new ResponseError(404, 'User not found');
      }

      await this.prisma.user.delete({
        where: { username },
      });

      logger.info('User deleted successfully', {
        username,
      });
    } catch (error) {
      if (error instanceof ResponseError) {
        throw error;
      }
      logger.error('Delete user operation failed', {
        username,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ResponseError(500, 'Failed to delete user');
    }
  }
}

export const userService = new UserService();
