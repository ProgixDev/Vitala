import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(includeUnavailable = false) {
    let query = this.supabase.admin().from('services').select('*').order('name');
    if (!includeUnavailable) query = query.eq('is_available', true);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .admin()
      .from('services')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Service not found');
    return data;
  }

  async create(dto: CreateServiceDto) {
    const { data, error } = await this.supabase
      .admin()
      .from('services')
      .insert(dto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateServiceDto) {
    const { data, error } = await this.supabase
      .admin()
      .from('services')
      .update(dto)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Service not found');
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.admin().from('services').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
