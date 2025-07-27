import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useHeroCarousel } from '@/hooks/useHeroCarousel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

interface FeaturedBannerCarouselProps {
  className?: string;
}

const FeaturedBannerCarousel = ({ className = '' }: FeaturedBannerCarouselProps) => {
  const { data: carouselItems = [], isLoading } = useHeroCarousel();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToLibrary = async (bookId: string) => {
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
        .eq('book_id', bookId)
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
          book_id: bookId
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

  const handleStartListening = (item: any) => {
    if (item.cta_link) {
      // Custom CTA link
      if (item.cta_link.startsWith('/')) {
        navigate(item.cta_link);
      } else {
        window.open(item.cta_link, '_blank');
      }
    } else if (item.book_id) {
      // Default to player page for linked book
      navigate(`/player/${item.book_id}`);
    } else {
      // Fallback to general player or books page
      navigate('/search');
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full h-80 md:h-96 bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!carouselItems.length) {
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
          {carouselItems.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden group/card">
                {/* Background Image with improved contrast */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/card:scale-105"
                  style={{
                    backgroundImage: `url(${item.background_image_url || item.books?.cover_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'})`,
                  }}
                />
                
                {/* Enhanced Multi-layer Gradient Overlay for maximum text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                
                {/* Content with improved positioning and increased top padding to prevent cropping */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end pb-10 pt-8 md:pt-12">
                  <div className="space-y-2.5 max-w-2xl">
                    {/* Genre/Category Badge */}
                    {item.books?.title && (
                      <span className="inline-block px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-semibold rounded-full border border-white/30 shadow-lg max-w-fit">
                        <span className="truncate block max-w-28 md:max-w-44">Book Featured</span>
                      </span>
                    )}
                    
                    {/* Title with enhanced visibility and proper line height */}
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-h-24 md:max-h-28 overflow-hidden drop-shadow-2xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)]">
                      <span className="block leading-[1.1] line-clamp-2">
                        {item.title}
                      </span>
                    </h3>
                    
                    {/* Subtitle */}
                    {item.subtitle && (
                      <p className="text-gray-100 text-base md:text-lg lg:text-xl font-medium drop-shadow-lg [text-shadow:_1px_1px_4px_rgb(0_0_0_/_60%)]">
                        {item.subtitle}
                      </p>
                    )}
                    
                    {/* Description */}
                    {item.description && (
                      <p className="text-gray-200 text-sm md:text-base drop-shadow-md [text-shadow:_1px_1px_2px_rgb(0_0_0_/_50%)] line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Action Buttons with improved styling */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartListening(item);
                        }}
                        className="bg-white text-black hover:bg-gray-100 font-bold px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl border-2 border-white/20 backdrop-blur-sm text-sm md:text-base lg:text-lg"
                      >
                        <Play size={16} className="mr-2 md:mr-3 fill-current" />
                        {item.cta_text}
                      </Button>
                      
                      {item.book_id && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToLibrary(item.book_id!);
                          }}
                          variant="outline"
                          className="bg-black/40 text-white border-white/40 hover:bg-black/60 hover:border-white/60 hover:text-white font-semibold px-4 md:px-6 py-3 md:py-4 rounded-full transition-all duration-300 transform hover:scale-105 backdrop-blur-md shadow-xl text-sm md:text-base lg:text-lg"
                        >
                          Add to Library
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Enhanced Custom Styles - Improved pagination positioning */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .featured-carousel .swiper-pagination {
            bottom: 6px !important;
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
