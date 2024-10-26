export interface MangaChapter {
  id: number;
  order: number;
  number: string;
  name: string | null;
  views_count: number;
  comments_count: number;
  status: string;
  previous_chapter_id: number;
  previous_chapter_number: string;
  previous_chapter_name: any;
  next_chapter_id?: number;
  next_chapter_number: string;
  next_chapter_name: any;
  created_at: string;
  updated_at: string;
  manga: Manga;
  team: Team;
  pages: string[];
}

export interface Manga {
  id: number;
  name: string;
  description: string;
  cover_url: string;
  panorama_url: string;
  marginless: boolean;
  is_region_limited: boolean;
  direction: string;
  is_nsfw: boolean;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  facebook_address: string;
  is_ads: boolean;
  translations_count: number;
  mangas_count: number;
}

export interface Page {
  id: number;
  order: number;
  width: number;
  height: number;
  status: string;
  image_url: string;
  image_path: string;
  image_url_size: number;
  drm_data: string;
}
