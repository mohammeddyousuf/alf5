interface ProductMediaProps {
  images: string[] | null;
  videoUrls?: string[];
  productName: string;
  getYouTubeVideoId: (url: string) => string | null;
  salePrice: number | null;
  discountPrice: number | null;
  price: number;
  customLabel?: string | null;
}