import { Body, Controller, Post } from '@nestjs/common';
import { IsIn, IsString } from 'class-validator';
import { StorageService } from './storage.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';

class SignUploadDto {
  @IsIn(['avatars', 'nurse-docs', 'receipts'])
  bucket!: 'avatars' | 'nurse-docs' | 'receipts';

  @IsString()
  filename!: string;
}

@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  /** Client asks for a signed URL, then uploads the file directly to Storage. */
  @Post('sign-upload')
  signUpload(@CurrentUser() user: AuthUser, @Body() dto: SignUploadDto) {
    const path = `${user.id}/${Date.now()}-${dto.filename}`;
    return this.storage.createSignedUploadUrl(dto.bucket, path);
  }
}
