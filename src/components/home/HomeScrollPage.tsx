'use client';

/**
 * HomeScrollPage — Editorial sections that appear BELOW the rotating slots.
 * Each section reveals with a fade-up animation as you scroll down.
 *
 * @module components/home/HomeScrollPage
 */

import type { HomePage } from '@/models';
import HomeHeroGrid from './HomeHeroGrid';
import HomeFeaturedDuo from './HomeFeaturedDuo';
import HomeAboutPreview from './HomeAboutPreview';
import HomeCenteredImage from './HomeCenteredImage';
import HomeEditorialGift from './HomeEditorialGift';
import HomeBottomHero from './HomeBottomHero';

/** Vertical gap between sections (px) */
const SECTION_GAP = 100;

interface Props {
  data: HomePage;
}

export default function HomeScrollPage({ data }: Props) {
  return (
    <div
      style={{
        background: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      {/* Contenedor que agrupa todas las secciones nuevas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: `${SECTION_GAP}px`,
          paddingTop: `${SECTION_GAP}px`,
          paddingBottom: '120px',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        }}
      >
        {/* Sección 1: Hero Grid — 3 fotos individuales */}
        {data.hero_image_1 && data.hero_image_2 && data.hero_image_3 && (
          <HomeHeroGrid
            image1={data.hero_image_1}
            image2={data.hero_image_2}
            image3={data.hero_image_3}
          />
        )}

        {/* Sección 2: Featured Duo — 2 fotos grandes */}
        {data.featured_image_left && data.featured_image_right && (
          <HomeFeaturedDuo
            imageLeft={data.featured_image_left}
            imageRight={data.featured_image_right}
          />
        )}

        {/* Sección 3: About Preview — imagen + texto */}
        {data.about_image && data.about_text && (
          <HomeAboutPreview image={data.about_image} text={data.about_text} />
        )}

        {/* Sección 4: Imagen centrada */}
        {data.centered_image && (
          <HomeCenteredImage image={data.centered_image} />
        )}

        {/* Sección 5: Editorial + Gif/Video */}
        {data.editorial_text && data.gift_media && (
          <HomeEditorialGift
            text={data.editorial_text}
            media={data.gift_media}
          />
        )}

        {/* Sección 6: Bottom Hero — imagen grande */}
        {data.bottom_hero_image && (
          <HomeBottomHero image={data.bottom_hero_image} />
        )}
      </div>
    </div>
  );
}
