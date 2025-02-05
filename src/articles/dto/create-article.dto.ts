import { Type } from "class-transformer";
import {
  IsString,
  IsArray,
  IsUrl,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class CreateArticleDto {
  @IsString()
  @IsOptional()
  author: string = "";

  @IsString()
  title: string = "";

  @IsString()
  subtitle: string = "";

  @IsUrl()
  featured_image: string = "";

  @IsDateString()
  date: string = "";

  @IsString()
  body_raw: string = "";

  @IsString()
  type: string = "";

  @IsArray()
  topics: string[] = [];

  @IsString()
  urlsegment: string = "";

  @IsUrl()
  original_url: string = "";

  @IsString()
  generated_ai_content: string = "";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  questions_and_answers: QuestionAnswerDto[] = [];

  @IsString()
  user_id: string = "";
}

export class QuestionAnswerDto {
  @IsString()
  question: string = "";

  @IsString()
  answer: string = "";
}

export class getArticleDto extends CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
