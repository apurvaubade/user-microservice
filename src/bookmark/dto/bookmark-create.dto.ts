import { Expose } from "class-transformer";
import {
  IsNotEmpty,
  IsUUID,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class BookmarkCreateDto {
  @ApiProperty({
    type: String,
    description: "User ID who is creating the favorite bookmark",
    example: "123e4567-e89b-12d3-a456-426614174000"
  })
  @Expose()
  @IsNotEmpty({ message: "User ID is required" })
  @IsUUID(undefined, { message: "User ID must be a valid UUID" })
  userId: string;

  @ApiProperty({
    type: String,
    description: "Content/Document ID to be marked as bookmark",
    example: "do_2143394843223982081867"
  })
  @Expose()
  @IsNotEmpty({ message: "Content ID (doId) is required" })
  @Matches(/^do_\d+$/, { message: "Content ID must start with 'do_' followed by numbers" })
  doId: string;

  @ApiProperty({
    type: String,
    description: "User ID who created the bookmark (auto-filled from JWT)",
    required: false
  })
  @Expose()
  createdBy?: string;

  constructor(partial: Partial<BookmarkCreateDto>) {
    Object.assign(this, partial);
  }
} 