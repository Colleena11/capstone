export interface ArtMetadata {
    id: string;
    creationDate: Date;
    artist: string;
    signature: string;
    certificateHash: string;
    medium: string;
    dimensions: {
        width: number;
        height: number;
        unit: 'cm' | 'inch'
    };
    lastVerifiedDate?: Date;
    title: string;
    description: string;
    category: ArtCategory;
    price: number;
    status: ArtStatus;
    verificationStatus: VerificationStatus;
}

export type ArtCategory = 
    | 'painting'
    | 'sculpture'
    | 'digital'
    | 'photography'
    | 'mixed-media'
    | 'other';

export type ArtStatus = 
    | 'draft'
    | 'pending'
    | 'listed'
    | 'sold'
    | 'removed';

export type VerificationStatus = 
    | 'pending'
    | 'verified'
    | 'rejected'
    | 'flagged';

export interface Art extends ArtMetadata {
    owner: string;
    createdAt: Date;
    updatedAt: Date;
    imageUrl: string;
    thumbnailUrl: string;
    views: number;
    likes: number;
    tags: string[];
}
