import {
  IsString,
  IsArray,
  IsUrl,
  IsDateString,
  IsNotEmpty,
} from "class-validator";

export class CreateArticleDto {
  @IsString()
  author: string = "";

  @IsString()
  title: string = "";

  @IsString()
  subtitle: string = "";

  @IsUrl()
  url: string = "";

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
  generatedAiContent: string = "";

  @IsArray()
  questionsAndAnswers: { question: string; answer: string }[] = [];

  @IsString()
  user_id: string = "";
}

export class getArticleDto extends CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
