import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ArticlesService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = new SupabaseClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');
  }

  async create(createArticleDto: CreateArticleDto) {
    const { data, error } = await this.supabase
      .from('save_news')
      .insert([createArticleDto]);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto) {
    const { data, error } = await this.supabase
      .from('save_news')
      .update(updateArticleDto)
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async delete(id: string) {
    const { data, error } = await this.supabase
      .from('save_news')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}