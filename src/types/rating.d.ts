/**
 * TypeScript Type Definitions for Rating and Top-Rated Documents System
 */

export interface RateChatMessageDto {
  isHelpful: boolean;
}

export interface ChatRatingResponse {
  id: string;
  messageId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface RateDocumentDto {
  isHelpful: boolean;
}

export interface RateDocumentResponse {
  success: boolean;
}

export interface TopRatedDocumentItem {
  id: string;
  title: string;
  fileName: string;
  ownerPublicName: string;
  ownerAvatarUrl: string | null;
  downloadCount: number;
  helpfulRating: number;
  totalRatings: number;
  ratingCount: number;
  relevanceScore: number;
  createdAt: string;
}

export interface TopRatedDocumentsMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TopRatedDocumentsResponse {
  items: TopRatedDocumentItem[];
  meta: TopRatedDocumentsMeta;
}

export interface TopRatedDocumentsParams {
  page?: number;
  limit?: number;
  sortBy?: "rating" | "downloadCount";
}
