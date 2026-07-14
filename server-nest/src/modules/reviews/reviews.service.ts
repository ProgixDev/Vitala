import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { CreateReviewDto, NurseResponseDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly supabase: SupabaseService) {}

  /** A patient reviews a completed appointment; recomputes the nurse's rating. */
  async create(user: AuthUser, dto: CreateReviewDto) {
    const admin = this.supabase.admin();
    const { data: appt } = await admin
      .from('appointments')
      .select('id, patient_id, nurse_id, status')
      .eq('id', dto.appointment_id)
      .maybeSingle();
    if (!appt) throw new NotFoundException('Appointment not found');
    if (appt.patient_id !== user.id) throw new ForbiddenException('Not your appointment');
    if (appt.status !== 'completed') throw new BadRequestException('Appointment not completed');
    if (!appt.nurse_id) throw new BadRequestException('Appointment had no nurse');

    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('reviews')
      .insert({
        appointment_id: dto.appointment_id,
        patient_id: user.id,
        nurse_id: appt.nurse_id,
        rating: dto.rating,
        comment: dto.comment ?? null,
        professionalism: dto.professionalism ?? null,
        punctuality: dto.punctuality ?? null,
        communication: dto.communication ?? null,
        care_quality: dto.care_quality ?? null,
      })
      .select()
      .single();
    if (error) {
      if (error.code === '23505') throw new BadRequestException('Already reviewed');
      throw error;
    }

    await this.recomputeNurseRating(appt.nurse_id);
    return data;
  }

  async listForNurse(nurseId: string) {
    const { data, error } = await this.supabase
      .admin()
      .from('reviews')
      .select('*, patient:profiles!reviews_patient_id_fkey(full_name, avatar_url)')
      .eq('nurse_id', nurseId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async respond(user: AuthUser, id: string, dto: NurseResponseDto) {
    const { data, error } = await this.supabase
      .forUser(user.token)
      .from('reviews')
      .update({
        nurse_response: dto.nurse_response,
        nurse_responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('nurse_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('Review not found');
    return data;
  }

  private async recomputeNurseRating(nurseId: string) {
    const admin = this.supabase.admin();
    const { data } = await admin
      .from('reviews')
      .select('rating')
      .eq('nurse_id', nurseId)
      .eq('is_hidden', false);
    const ratings = data ?? [];
    const avg = ratings.length
      ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length
      : 0;
    await admin
      .from('nurse_profiles')
      .update({ rating: Math.round(avg * 100) / 100, total_reviews: ratings.length })
      .eq('profile_id', nurseId);
  }
}
