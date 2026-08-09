import { NextResponse } from 'next/server';
import { getReviewsWithCache } from '@/lib/reviewsCache';

export async function GET() {
  try {
    const reviews = await getReviewsWithCache();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json([
      {
        author_name: "Ergün Baysal",
        profile_photo_url: null,
        rating: 5,
        text: "Almanya'dan Fethiye'ye geldim ve arabam arıza verdi. İbrahim ustaya gittim ve sorunum çözüldü. Gerçek bir usta.",
        relative_time_description: "1 ay önce"
      }
    ]);
  }
}
