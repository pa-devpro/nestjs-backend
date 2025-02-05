import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { QuestionAnswerDto } from "./create-article.dto";
import { Type } from "class-transformer";

export class UpdateArticleDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerDto)
  questions_and_answers?: QuestionAnswerDto[];
}
