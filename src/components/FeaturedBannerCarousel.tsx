
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/hooks/useBooks';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
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
          .eq('is_trending', true) // Using is_trending as featured flag
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

  const handleStartListening = (book: Book) => {
    navigate(`/player/${book.id}`);
  };

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

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-64 md:h-80 bg-gray-800 rounded-xl animate-pulse" />
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
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom',
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          autoplay={{
            delay: 5500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 32,
            },
          }}
          className="featured-carousel"
        >
          {featuredBooks.map((book) => (
            <SwiperSlide key={book.id}>
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden group/card cursor-pointer">
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-105"
                  style={{
                    backgroundImage: `url(${book.cover || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'})`,
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <div className="space-y-3">
                    {/* Genre Badge */}
                    <span className="inline-block px-3 py-1 bg-purple-600/80 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                      {book.genre}
                    </span>
                    
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    
                    {/* Author */}
                    <p className="text-gray-200 text-sm md:text-base">
                      by {book.author}
                    </p>
                    
                    {/* Duration */}
                    {book.duration && (
                      <p className="text-gray-300 text-xs">
                        {book.duration}
                      </p>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartListening(book);
                        }}
                        className="bg-white text-black hover:bg-gray-100 font-semibold px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
                      >
                        <Play size={16} className="mr-2 fill-black" />
                        Start Listening
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToLibrary(book);
                        }}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus size={16} className="mr-1" />
                        Library
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows */}
        <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
          <ChevronLeft size={20} />
        </button>
        
        <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Custom Styles using global CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .featured-carousel .swiper-pagination {
            bottom: 16px !important;
          }
          
          .swiper-pagination-bullet-custom {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            margin: 0 4px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .swiper-pagination-bullet-active-custom {
            background: white;
            transform: scale(1.2);
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `
      }} />
    </div>
  );
};

export default FeaturedBannerCarousel;
