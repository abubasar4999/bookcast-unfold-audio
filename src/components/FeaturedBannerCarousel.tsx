import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface FeaturedBannerCarouselProps {
  className?: string;
}

const FeaturedBannerCarousel = ({ className = '' }: FeaturedBannerCarouselProps) => {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch featured books
  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('is_trending', true)
          .eq('status', 'active')
          .order('popularity_score', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching featured books:', error);
          return;
        }

        const mappedBooks = (data || []).map(book => ({
          ...book,
          cover: book.cover_url,
        }));

        setFeaturedBooks(mappedBooks);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const handleAddToLibrary = async (book: Book) => {
    if (!user) {
      toast.error('Please sign in to add books to your library');
      navigate('/auth', { state: { returnTo: '/' } });
      return;
    }

    try {
      // Check if already in library
      const { data: existing } = await supabase
        .from('book_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .maybeSingle();

      if (existing) {
        toast.info('Book is already in your library');
        return;
      }

      // Add to library
      const { error } = await supabase
        .from('book_likes')
        .insert({
          user_id: user.id,
          book_id: book.id
        });

      if (error) {
        console.error('Error adding to library:', error);
        toast.error('Failed to add book to library');
        return;
      }

      toast.success('Book added to your library!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  };

  const handleStartListening = (bookId: string) => {
    navigate(`/player/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-80 md:h-96 bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!featuredBooks.length) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative group">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          className="featured-carousel"
        >
          {featuredBooks.map((book) => (
            <SwiperSlide key={book.id}>
              <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden group/card">
                {/* Background Image with improved contrast */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-105"
                  style={{
                    backgroundImage: `url(${book.cover || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'})`,
                  }}
                />
                
                {/* Enhanced Multi-layer Gradient Overlay for maximum text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                
                {/* Content with improved positioning and spacing for pagination dots */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pb-12">
                  <div className="space-y-3 max-w-2xl">
                    {/* Genre Badge with better contrast and smaller text */}
                    <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-semibold rounded-full border border-white/30 shadow-lg max-w-fit">
                      <span className="truncate block max-w-32 md:max-w-48">{book.genre}</span>
                    </span>
                    
                    {/* Title with enhanced visibility and proper line height */}
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-h-28 md:max-h-32 overflow-hidden drop-shadow-2xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)]">
                      <span className="block leading-[1.1] line-clamp-2">
                        {book.title}
                      </span>
                    </h3>
                    
                    {/* Author with better contrast */}
                    <p className="text-gray-100 text-base md:text-lg lg:text-xl font-medium drop-shadow-lg [text-shadow:_1px_1px_4px_rgb(0_0_0_/_60%)]">
                      by {book.author}
                    </p>
                    
                    {/* Duration with improved visibility */}
                    {book.duration && (
                      <p className="text-gray-200 text-sm md:text-base drop-shadow-md [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)]">
                        {book.duration}
                      </p>
                    )}
                    
                    {/* Action Buttons with improved styling */}
                    <div className="flex flex-wrap gap-3 pt-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartListening(book.id);
                        }}
                        className="bg-white text-black hover:bg-gray-100 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white/20 backdrop-blur-sm text-sm md:text-base lg:text-lg"
                      >
                        <Play size={16} className="mr-2 md:mr-3 fill-current" />
                        Start Listening
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToLibrary(book);
                        }}
                        variant="outline"
                        className="bg-black/40 text-white border-white/40 hover:bg-black/60 hover:border-white/60 hover:text-white font-semibold px-4 md:px-6 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-md shadow-xl text-sm md:text-base lg:text-lg"
                      >
                        Add to Library
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Enhanced Custom Styles - Reduced spacing and improved positioning */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .featured-carousel .swiper-pagination {
            bottom: 4px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            display: flex !important;
            justify-content: center !important;
            gap: 6px !important;
          }
          
          .swiper-pagination-bullet-custom {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50% !important;
            margin: 0 !important;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: inline-block;
            opacity: 1;
          }
          
          .swiper-pagination-bullet-active-custom {
            background: white !important;
            transform: scale(1.3);
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
};

export default FeaturedBannerCarousel;
