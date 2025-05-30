import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { ISuccessfulOperationResponse } from '@common/base/application/interface/successful-operation-response.interface';

import { ConfirmPasswordDto } from '@iam/authentication/application/dto/confirm-password.dto';
import { ConfirmUserDto } from '@iam/authentication/application/dto/confirm-user.dto';
import { ForgotPasswordDto } from '@iam/authentication/application/dto/forgot-password.dto';
import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { RefreshSessionDto } from '@iam/authentication/application/dto/refresh-session.dto';
import { ResendConfirmationCodeDto } from '@iam/authentication/application/dto/resend-confirmation-code.dto';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';
import { SignInDto } from '@iam/authentication/application/dto/sign-in.dto';
import { SignUpDto } from '@iam/authentication/application/dto/sign-up.dto';
import { AuthenticationService } from '@iam/authentication/application/service/authentication.service';
import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';
import { UserResponseDto } from '@iam/user/application/dto/user-response.dto';

@Controller('auth')
@ApiTags('auth')
@Auth(AuthType.None)
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('sign-up')
  async handleSignUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    return this.authenticationService.handleSignUp(signUpDto);
  }

  @Post('/admin/sign-up')
  async handleAdminSignUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<OneSerializedResponseDto<UserResponseDto>> {
    return this.authenticationService.handleAdminSignUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async handleSignIn(
    @Body() signInDto: SignInDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    return this.authenticationService.handleSignIn(signInDto);
  }

  @Post('admin/sign-in')
  @HttpCode(HttpStatus.OK)
  async handleAdminSignIn(
    @Body() signInDto: SignInDto,
  ): Promise<OneSerializedResponseDto<ISignInResponse>> {
    return this.authenticationService.handleAdminSignIn(signInDto);
  }

  @Post('confirm-user')
  @HttpCode(HttpStatus.OK)
  async handleConfirmUser(
    @Body() confirmUserDto: ConfirmUserDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleConfirmUser(confirmUserDto);
  }

  @Post('admin/confirm-user')
  @HttpCode(HttpStatus.OK)
  async handleConfirmAdminUser(
    @Body() confirmUserDto: ConfirmUserDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleConfirmAdminUser(confirmUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async handleForgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleForgotPassword(forgotPasswordDto);
  }

  @Post('admin/forgot-password')
  @HttpCode(HttpStatus.OK)
  async handleForgotAdminPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleForgotAdminPassword(
      forgotPasswordDto,
    );
  }

  @Post('confirm-password')
  @HttpCode(HttpStatus.OK)
  async handleConfirmPassword(
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleConfirmPassword(confirmPasswordDto);
  }

  @Post('admin/confirm-password')
  @HttpCode(HttpStatus.OK)
  async handleConfirmAdminPassword(
    @Body() confirmPasswordDto: ConfirmPasswordDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleConfirmAdminPassword(
      confirmPasswordDto,
    );
  }

  @Post('resend-confirmation-code')
  @HttpCode(HttpStatus.OK)
  async handleResendConfirmationCode(
    @Body() resendConfirmationCode: ResendConfirmationCodeDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleResendConfirmationCode(
      resendConfirmationCode,
    );
  }

  @Post('admin/resend-confirmation-code')
  @HttpCode(HttpStatus.OK)
  async handleResendAdminConfirmationCode(
    @Body() resendConfirmationCode: ResendConfirmationCodeDto,
  ): Promise<OneSerializedResponseDto<ISuccessfulOperationResponse>> {
    return this.authenticationService.handleResendAdminConfirmationCode(
      resendConfirmationCode,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async handleRefreshSession(
    @Body() refreshSessionDto: RefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    return this.authenticationService.handleRefreshSession(refreshSessionDto);
  }

  @Post('admin/refresh')
  @HttpCode(HttpStatus.OK)
  async handleRefreshAdminSession(
    @Body() refreshSessionDto: RefreshSessionDto,
  ): Promise<OneSerializedResponseDto<IRefreshSessionResponse>> {
    return this.authenticationService.handleRefreshAdminSession(
      refreshSessionDto,
    );
  }
}
