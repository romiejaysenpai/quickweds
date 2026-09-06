'use client';

import React from 'react';
import { motion } from 'framer-motion';

import {
    BioSection,
    CountdownTimer,
    DetailsSection,
    GallerySection,
    GiftSection,
    SafeWeddingImage,
    TimelineSection,
    VideoSection,
    TemplateMonogram,
    TemplateSectionDivider,
    TemplateBackgroundVector,
} from '@/components/wedding';
import type { TemplateProps, Wedding } from '@/types/wedding';

import { SharedNewSections } from './shared';

type PremiumLayout = 'invitation' | 'split' | 'cinematic' | 'editorial' | 'poster' | 'bento' | 'arch';

type PremiumTheme = {
    eyebrow: string;
    mood: string;
    primary: string;
    secondary: string;
    surface: string;
    ink: string;
    layout: PremiumLayout;
    baseTemplate: string;
    ornament: 'botanical' | 'arch' | 'ribbon' | 'star' | 'sun' | 'grid' | 'tile' | 'disco' | 'filmstrip' | 'aura' | 'washi' | 'bauhaus' | 'stamp' | 'floral-corner' | 'wavy' | 'mizuhiki' | 'neumorphic' | 'mist';
    dividerStyle?: string;
    backgroundPattern?: string;
    galleryLayout?: 'bento' | 'horizontal' | 'vertical' | 'grid';
    sectionOrder?: Array<'video' | 'bio' | 'details' | 'countdown' | 'timeline' | 'gallery' | 'gift' | 'additional'>;
};

const PREMIUM_THEMES: Record<string, PremiumTheme> = {
    heirloom: { eyebrow: 'A painted invitation', mood: 'Gather with us for a day in bloom', primary: '#6A7D54', secondary: '#DDE7CC', surface: '#FFFCF5', ink: '#293327', layout: 'invitation', baseTemplate: 'garden', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    estate: { eyebrow: 'A country-house celebration', mood: 'A weekend of fine company', primary: '#7D705B', secondary: '#E5DED0', surface: '#FAF8F1', ink: '#322C23', layout: 'split', baseTemplate: 'elegance', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'bento' },
    moonlit: { eyebrow: 'After dark', mood: 'A love story under the moon', primary: '#D8C494', secondary: '#293048', surface: '#0D101B', ink: '#FBF7EA', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'horizontal' },
    saffron: { eyebrow: 'A heritage celebration', mood: 'Joy, color, and a house full of love', primary: '#B65B2A', secondary: '#F5D79E', surface: '#FFF5E5', ink: '#542712', layout: 'poster', baseTemplate: 'traditional', ornament: 'sun', dividerStyle: 'wave', backgroundPattern: 'none', galleryLayout: 'grid' },
    'cinema-noir': { eyebrow: 'Love on film', mood: 'One night. Forever remembered.', primary: '#C78A63', secondary: '#422D2B', surface: '#0D0C0C', ink: '#FFF8F0', layout: 'cinematic', baseTemplate: 'cinematic', ornament: 'ribbon', dividerStyle: 'film', backgroundPattern: 'film-sprockets', galleryLayout: 'horizontal' },
    'modern-vow': { eyebrow: 'A contemporary union', mood: 'Save the date for the good stuff', primary: '#437E70', secondary: '#DCEEE8', surface: '#F7FCF9', ink: '#193C34', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    atelier: { eyebrow: 'The wedding edit', mood: 'A celebration in our own words', primary: '#332B2B', secondary: '#E9E4DF', surface: '#FCFBFA', ink: '#201A1A', layout: 'editorial', baseTemplate: 'editorial', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'bento' },
    wildflower: { eyebrow: 'Free-spirited love', mood: 'Long tables, wild blooms, open skies', primary: '#B46C52', secondary: '#F2D8C7', surface: '#FFF8F2', ink: '#553326', layout: 'invitation', baseTemplate: 'boho', ornament: 'botanical', dividerStyle: 'rustic', backgroundPattern: 'botanical-sprig', galleryLayout: 'vertical' },
    regency: { eyebrow: 'A black-tie affair', mood: 'By candlelight and with great joy', primary: '#C8A962', secondary: '#242430', surface: '#0C0D12', ink: '#FCF7E8', layout: 'poster', baseTemplate: 'royal', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'grid' },
    lovescript: { eyebrow: 'Written with love', mood: 'A small story with a very happy ending', primary: '#B76883', secondary: '#F3DFE7', surface: '#FFF9FB', ink: '#4E2334', layout: 'invitation', baseTemplate: 'romantic', ornament: 'ribbon', dividerStyle: 'classic', backgroundPattern: 'none', galleryLayout: 'vertical' },
    'coastal-vow': { eyebrow: 'By the sea', mood: 'Salt air, sunset vows, and our favorite people', primary: '#2C7891', secondary: '#CDE9EC', surface: '#F5FCFC', ink: '#123E4A', layout: 'split', baseTemplate: 'tropical', ornament: 'sun', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'bento' },
    'orchid-noir': { eyebrow: 'An evening in bloom', mood: 'A floral love story with a little drama', primary: '#8D5273', secondary: '#2E1E30', surface: '#120D13', ink: '#FFF8FC', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'botanical', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'horizontal' },
    papercut: { eyebrow: 'A modern invitation', mood: 'One beautiful day, thoughtfully made', primary: '#E06D48', secondary: '#FAE3D8', surface: '#FFF9F5', ink: '#34201A', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    celestial: { eyebrow: 'Written in the stars', mood: 'Meet us beneath a sky full of promise', primary: '#9BADE0', secondary: '#1E2748', surface: '#11162A', ink: '#F9FAFF', layout: 'poster', baseTemplate: 'midnight', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'bento' },
    'marigold-house': { eyebrow: 'A joyful gathering', mood: 'Music, color, and generations together', primary: '#C56A16', secondary: '#F8D575', surface: '#FFF6DC', ink: '#572C0A', layout: 'poster', baseTemplate: 'traditional', ornament: 'sun', dividerStyle: 'wave', backgroundPattern: 'none', galleryLayout: 'grid' },
    'the-weekend': { eyebrow: 'Our wedding weekend', mood: 'Check in, slow down, celebrate with us', primary: '#5A6C62', secondary: '#D9E0D4', surface: '#F8FAF5', ink: '#26372E', layout: 'split', baseTemplate: 'elegance', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'bento' },
    'winter-rose': { eyebrow: 'A winter celebration', mood: 'Velvet evenings and a room full of roses', primary: '#A33D4A', secondary: '#341A24', surface: '#150D11', ink: '#FFF9F5', layout: 'cinematic', baseTemplate: 'royal', ornament: 'ribbon', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'horizontal' },
    gallery: { eyebrow: 'A gallery of us', mood: 'An artful day for our favorite masterpiece', primary: '#6C5A46', secondary: '#E8E1D7', surface: '#FBFAF8', ink: '#28221D', layout: 'editorial', baseTemplate: 'editorial', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'bento' },
    'petal-note': { eyebrow: 'A note for you', mood: 'Come celebrate the little things with us', primary: '#C8889A', secondary: '#F6E2E8', surface: '#FFF9FB', ink: '#542B3A', layout: 'invitation', baseTemplate: 'romantic', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'vertical' },
    'sunset-ceremony': { eyebrow: 'Meet us at golden hour', mood: 'A destination celebration at the edge of day', primary: '#D4774F', secondary: '#F5D3A5', surface: '#FFF6EC', ink: '#59301D', layout: 'split', baseTemplate: 'boho', ornament: 'sun', dividerStyle: 'terracotta', backgroundPattern: 'terracotta-arches', galleryLayout: 'bento' },

    // 20 Trending Styles
    kinfolk: { eyebrow: 'The Minimal Atelier', mood: 'Understated elegance, quiet luxury, and timeless serenity', primary: '#8E8A82', secondary: '#F3EFEA', surface: '#FBF9F5', ink: '#1C1B19', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'none', galleryLayout: 'bento' },
    neobrutalist: { eyebrow: 'Bold & Unapologetic', mood: "We're getting hitched! High contrast, big energy, pure joy", primary: '#FF5E5B', secondary: '#FFE169', surface: '#FFFDF7', ink: '#0A0A0A', layout: 'bento', baseTemplate: 'urban', ornament: 'bauhaus', dividerStyle: 'bauhaus', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    highfashion: { eyebrow: 'Monochrome Maison', mood: 'Haute couture editorial, timeless black & white drama', primary: '#D4AF37', secondary: '#262626', surface: '#111111', ink: '#F5F5F5', layout: 'split', baseTemplate: 'vogue', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'bento' },
    glassbotanical: { eyebrow: 'The Lucent Flora', mood: 'Frosted crystal luminescence and floating botanical petals', primary: '#7FA073', secondary: '#E8F5E9', surface: '#F7FCF9', ink: '#2E382E', layout: 'invitation', baseTemplate: 'garden', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'bento' },
    cyberromantic: { eyebrow: 'Iridescent Y2K Glam', mood: 'Chrome glows, holographic dreamscapes, and future romance', primary: '#FF80BF', secondary: '#2A1B3D', surface: '#0B0C10', ink: '#F8FAFC', layout: 'cinematic', baseTemplate: 'glitch', ornament: 'aura', dividerStyle: 'glitch', backgroundPattern: 'soft-aura', galleryLayout: 'horizontal' },
    amalfi: { eyebrow: 'La Dolce Vita', mood: 'Capri lemon groves, majolica tiles, and sunlit coastal vows', primary: '#1C4E80', secondary: '#FDF3D6', surface: '#FFFDF7', ink: '#1E252B', layout: 'split', baseTemplate: 'riviera', ornament: 'tile', dividerStyle: 'tile', backgroundPattern: 'ceramic-tiles', galleryLayout: 'bento' },
    japandi: { eyebrow: 'Zen & Naturalis', mood: 'Washi textures, organic simplicity, and quiet breathing room', primary: '#8B9A82', secondary: '#EAE6DD', surface: '#F2EFE9', ink: '#282828', layout: 'editorial', baseTemplate: 'nordic', ornament: 'washi', dividerStyle: 'washi', backgroundPattern: 'washi-fibers', galleryLayout: 'bento' },
    desertmirage: { eyebrow: 'Sun-Bleached Dune', mood: 'Warm terracotta arches, desert agave, and golden hour light', primary: '#C86D51', secondary: '#F5E4D3', surface: '#FBF3E8', ink: '#3D2C28', layout: 'arch', baseTemplate: 'boho', ornament: 'sun', dividerStyle: 'terracotta', backgroundPattern: 'terracotta-arches', galleryLayout: 'bento' },
    chateau: { eyebrow: 'Toile de Jouy', mood: 'Gilded ballroom chandeliers, Sèvres blue, and Parisian romance', primary: '#335C81', secondary: '#F0E6D2', surface: '#FAF8F5', ink: '#2B2D42', layout: 'invitation', baseTemplate: 'royal', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'grid' },
    travelogue: { eyebrow: 'The Grand Voyage', mood: 'Passport stamps, vintage airmail, and a lifetime of adventures together', primary: '#C0392B', secondary: '#E6EFF5', surface: '#F8F6F0', ink: '#2C3E50', layout: 'poster', baseTemplate: 'vintage', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'horizontal' },
    gothicnoir: { eyebrow: 'Midnight Masquerade', mood: 'Deep bordeaux velvet, obsidian shadows, and candlelit romance', primary: '#9E2A2B', secondary: '#25161C', surface: '#0D0E11', ink: '#EDEDED', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'ribbon', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'horizontal' },
    discofever: { eyebrow: 'The Golden Groove', mood: '70s dancefloor warmth, spinning vinyl records, and golden sparkle', primary: '#E39B00', secondary: '#FCE7C8', surface: '#FFF8EE', ink: '#382218', layout: 'poster', baseTemplate: 'whimsical', ornament: 'disco', dividerStyle: 'disco', backgroundPattern: 'vinyl-grooves', galleryLayout: 'bento' },
    baroque: { eyebrow: 'The Gilded Dynasty', mood: 'Heritage crests, royal navy velvet, and 24-karat gold filigree', primary: '#D4AF37', secondary: '#1A2744', surface: '#FAF7F2', ink: '#0A192F', layout: 'invitation', baseTemplate: 'artdeco', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'grid' },
    lofifilm: { eyebrow: 'Film Strip Nostalgia', mood: '35mm grain, Kodak warm amber glow, and honest candid memories', primary: '#FF9F1C', secondary: '#382818', surface: '#181818', ink: '#EAEAEA', layout: 'cinematic', baseTemplate: 'film', ornament: 'filmstrip', dividerStyle: 'film', backgroundPattern: 'film-sprockets', galleryLayout: 'horizontal' },
    stargazer: { eyebrow: 'The Cosmic Union', mood: 'Zodiac constellations, lunar glow, and love written in the stardust', primary: '#F5D061', secondary: '#22193E', surface: '#0B0F19', ink: '#F8FAFC', layout: 'cinematic', baseTemplate: 'celestial', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'horizontal' },
    cottagecore: { eyebrow: 'The Herbarium Notebook', mood: 'Pressed wildflower petals, botanical gardens, and handwritten vows', primary: '#5E7153', secondary: '#EBE2DC', surface: '#FAF6F0', ink: '#3A3335', layout: 'arch', baseTemplate: 'garden', ornament: 'botanical', dividerStyle: 'rustic', backgroundPattern: 'botanical-ivy', galleryLayout: 'vertical' },
    bauhaus: { eyebrow: 'Modern Artiste', mood: 'Bauhaus geometry, bold color blocks, and structured artistic love', primary: '#1D4ED8', secondary: '#FEE2E2', surface: '#F8FAFC', ink: '#0F172A', layout: 'bento', baseTemplate: 'editorial', ornament: 'bauhaus', dividerStyle: 'bauhaus', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    nordicdrift: { eyebrow: 'Hygge Hearth', mood: 'Alpine pines, cozy fireplaces, and warm Scandinavian minimalism', primary: '#D97706', secondary: '#E2E8F0', surface: '#F7F5F0', ink: '#1A202C', layout: 'split', baseTemplate: 'nordic', ornament: 'arch', dividerStyle: 'minimal', backgroundPattern: 'washi-fibers', galleryLayout: 'bento' },
    sunsetriviera: { eyebrow: 'Golden Hour Glow', mood: 'Multi-color sunset mesh gradients, champagne toasts, and warm ocean breeze', primary: '#F43F5E', secondary: '#FFE4E6', surface: '#FFF8F6', ink: '#1E1B4B', layout: 'split', baseTemplate: 'riviera', ornament: 'aura', dividerStyle: 'wave', backgroundPattern: 'soft-aura', galleryLayout: 'horizontal' },
    storybook: { eyebrow: 'Memory Collage', mood: 'Washi tapes, keepsake polaroids, and our sweetest story chapters', primary: '#E07A5F', secondary: '#FBECE7', surface: '#F8F4EB', ink: '#2B2D42', layout: 'invitation', baseTemplate: 'romantic', ornament: 'washi', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'grid' },
    
    // Brapla-Inspired & Global Designs
    palefloral: { eyebrow: 'Botanical Keepsake', mood: 'Pale blush, sage leaves, and delicate flora', primary: '#8B9577', secondary: '#E9EDE0', surface: '#FFFDF9', ink: '#33372C', layout: 'invitation', baseTemplate: 'garden', ornament: 'floral-corner', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    classyphoto: { eyebrow: 'Refined Modernity', mood: 'Framed couple portrait with high-contrast serif typography', primary: '#8F394A', secondary: '#F7EEE9', surface: '#FFFFFF', ink: '#201A1C', layout: 'split', baseTemplate: 'classic', ornament: 'grid', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'bento' },
    mellowwave: { eyebrow: 'Fluid Retro Curves', mood: 'Undulating wave dividers, warm terracotta, and pastel warmth', primary: '#E07A5F', secondary: '#FBECE7', surface: '#FFF8F5', ink: '#3D2820', layout: 'bento', baseTemplate: 'boho', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'none', galleryLayout: 'bento' },
    mizuhiki: { eyebrow: 'Ceremonial Cord', mood: 'Crimson & gold Mizuhiki cords symbolizing eternal union', primary: '#C0392B', secondary: '#FADBD8', surface: '#FAF8F5', ink: '#2C1E21', layout: 'invitation', baseTemplate: 'traditional', ornament: 'mizuhiki', dividerStyle: 'mizuhiki', backgroundPattern: 'mizuhiki-knot', galleryLayout: 'grid' },
    neumorphism: { eyebrow: 'Tactile Modernism', mood: 'Soft embossed shadows, pill buttons, and clean architectural minimalism', primary: '#4F6D7A', secondary: '#E8ECEF', surface: '#E8ECEF', ink: '#1D2A30', layout: 'bento', baseTemplate: 'minimal', ornament: 'neumorphic', dividerStyle: 'neumorphic', backgroundPattern: 'neumorphic-glow', galleryLayout: 'bento' },
    aromabotanical: { eyebrow: 'Frosted Herbarium', mood: 'Misty veil photo overlay with pressed botanical greenery', primary: '#5B7065', secondary: '#E5ECE8', surface: '#FAFDFB', ink: '#232B27', layout: 'invitation', baseTemplate: 'garden', ornament: 'mist', dividerStyle: 'mist', backgroundPattern: 'mist-haze', galleryLayout: 'vertical' },
    magazinecover: { eyebrow: 'Haute Editorial', mood: 'Oversized Abril Fatface masthead over full-bleed portrait photography', primary: '#111111', secondary: '#EFEFEF', surface: '#FFFFFF', ink: '#111111', layout: 'editorial', baseTemplate: 'vogue', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'bento' },
    lunette: { eyebrow: 'Roman Window Arch', mood: 'Architectural arch framing, warm olive and terracotta Mediterranean tones', primary: '#B85D43', secondary: '#F3E8E2', surface: '#FFFBF7', ink: '#392019', layout: 'arch', baseTemplate: 'boho', ornament: 'arch', dividerStyle: 'terracotta', backgroundPattern: 'terracotta-arches', galleryLayout: 'grid' },
    museum: { eyebrow: 'Fine Art Curation', mood: 'Fine-art gallery exhibition, stark white borders, and museum pacing', primary: '#2B2D42', secondary: '#E8E8EC', surface: '#FAFAFC', ink: '#1A1A24', layout: 'editorial', baseTemplate: 'editorial', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    frostedglass: { eyebrow: 'Lucent Acrylic', mood: 'Translucent frosted glass cards, blurred backdrop glows, and floating badges', primary: '#457B9D', secondary: '#E1EEF6', surface: '#F4F9FC', ink: '#162834', layout: 'invitation', baseTemplate: 'minimal', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'bento' },
    astronomy: { eyebrow: 'Celestial Charts', mood: 'Deep midnight blue, golden astrolabes, and zodiac constellations', primary: '#C5A059', secondary: '#1E2748', surface: '#0B0F19', ink: '#F8FAFC', layout: 'editorial', baseTemplate: 'midnight', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'bento' },
    streamline: { eyebrow: 'Gilded Symmetry', mood: 'Continuous metallic hairline borders, Gatsby elegance, and geometric rhythm', primary: '#D4AF37', secondary: '#F4EDE2', surface: '#FAF8F5', ink: '#1F1A14', layout: 'split', baseTemplate: 'artdeco', ornament: 'grid', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'bento' },
    marble: { eyebrow: 'Italian Villa Stone', mood: 'Travertine marble stone textures, subtle gold veining, and classical poise', primary: '#A68A68', secondary: '#EDE6DC', surface: '#F9F7F4', ink: '#2A241E', layout: 'arch', baseTemplate: 'elegance', ornament: 'arch', dividerStyle: 'arch', backgroundPattern: 'terracotta-arches', galleryLayout: 'grid' },
    luxeheart: { eyebrow: 'Intertwined Monogram', mood: 'Deep bordeaux velvet, intertwined heart crests, and candlelit romance', primary: '#9E2A2B', secondary: '#F5D6D8', surface: '#FFF9FA', ink: '#38161A', layout: 'invitation', baseTemplate: 'romantic', ornament: 'ribbon', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'vertical' },
    flowerflow: { eyebrow: 'Petal Breeze', mood: 'Cascading cherry and rose petals, curved flowing cards, and spring light', primary: '#D4829A', secondary: '#FDEEF2', surface: '#FFFDFE', ink: '#3A2028', layout: 'bento', baseTemplate: 'sakura', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'cherry-petals', galleryLayout: 'bento' },
    faintblur: { eyebrow: 'Atmospheric Aura', mood: 'Diffused pastel sunset orbs, dreamy ethereal luminescence, and modern bliss', primary: '#8A6BA8', secondary: '#EEDDF8', surface: '#FAF5FD', ink: '#271933', layout: 'cinematic', baseTemplate: 'boho', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'horizontal' },
    splash: { eyebrow: 'Joyful Gouache', mood: 'Vibrant watercolor paint splatters, dynamic brush strokes, and creative energy', primary: '#E65100', secondary: '#FFE0B2', surface: '#FFFBF5', ink: '#2E1C00', layout: 'bento', baseTemplate: 'urban', ornament: 'bauhaus', dividerStyle: 'bauhaus', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    polaroid: { eyebrow: 'Instant Memories', mood: 'Cascading stacked polaroids, washi tape corners, and nostalgic handwritten dates', primary: '#4A6B82', secondary: '#DCE8F0', surface: '#F9FBFC', ink: '#1C2B36', layout: 'invitation', baseTemplate: 'film', ornament: 'washi', dividerStyle: 'film', backgroundPattern: 'film-sprockets', galleryLayout: 'horizontal' },
    kimono: { eyebrow: 'Bridal Silk & Washi', mood: 'Ceremonial kimono embroidery textures, traditional gold leaf, and timeless poise', primary: '#B71C1C', secondary: '#FBE9E7', surface: '#FFFDFB', ink: '#330A0A', layout: 'poster', baseTemplate: 'traditional', ornament: 'mizuhiki', dividerStyle: 'mizuhiki', backgroundPattern: 'washi-fibers', galleryLayout: 'vertical' },
    duotone: { eyebrow: 'Complementary Vows', mood: '50/50 dual personality split screen, interlocking initials, and modern editorial contrast', primary: '#2E4057', secondary: '#E5EBF2', surface: '#F8FAFC', ink: '#151E28', layout: 'split', baseTemplate: 'editorial', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    seigaiha: { eyebrow: 'Wave of Good Fortune', mood: 'Auspicious Japanese wave crests symbolizing calm seas and eternal peace', primary: '#1D3557', secondary: '#E0ECF8', surface: '#FAFBFD', ink: '#0D1B2A', layout: 'arch', baseTemplate: 'traditional', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'grid' },
    asanoha: { eyebrow: 'Sacred Lattice', mood: 'Traditional sacred geometric lattice lines and serene Zen poise', primary: '#5C6B73', secondary: '#E0E5E8', surface: '#F7F9FA', ink: '#1F2421', layout: 'invitation', baseTemplate: 'traditional', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'asanoha-lattice', galleryLayout: 'bento' },
    holynight: { eyebrow: 'Cathedral Starlight', mood: 'Sacred evening vows, cathedral starlight, and deep sapphire glow', primary: '#E2B653', secondary: '#1B2A4A', surface: '#080E1A', ink: '#F0F4F8', layout: 'arch', baseTemplate: 'midnight', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'vertical' },
    snowwhite: { eyebrow: 'Winter Frost', mood: 'Pure winter romance, crystalline frost textures, and serene silver poise', primary: '#708090', secondary: '#E6F0FA', surface: '#F8FBFE', ink: '#1A2530', layout: 'editorial', baseTemplate: 'elegance', ornament: 'aura', dividerStyle: 'minimal', backgroundPattern: 'soft-aura', galleryLayout: 'grid' },
    teaceremony: { eyebrow: 'Kyoto Mindfulness', mood: 'Kyoto tea ceremony minimalism, matcha tones, and bamboo tranquility', primary: '#4A5D4E', secondary: '#E3EBE4', surface: '#F5F8F5', ink: '#232B25', layout: 'arch', baseTemplate: 'nordic', ornament: 'washi', dividerStyle: 'washi', backgroundPattern: 'washi-fibers', galleryLayout: 'vertical' },
    anemone: { eyebrow: 'Parisian Florist', mood: 'Monochrome anemone blossoms, crisp paper, and delicate Parisian script', primary: '#2B2D42', secondary: '#EBEBF0', surface: '#FCFCFD', ink: '#181923', layout: 'invitation', baseTemplate: 'garden', ornament: 'floral-corner', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    camellia: { eyebrow: 'Winter Camellia', mood: 'Bold crimson winter camellia petals and deep forest greenery', primary: '#B71C1C', secondary: '#FCE4EC', surface: '#FFF8F9', ink: '#330A0A', layout: 'poster', baseTemplate: 'traditional', ornament: 'floral-corner', dividerStyle: 'luxury', backgroundPattern: 'cherry-petals', galleryLayout: 'bento' },
    hydrangea: { eyebrow: 'June Rain Poetry', mood: 'Soft watercolor lilac & sky-blue hydrangea clusters in morning mist', primary: '#6C757D', secondary: '#E2E3F0', surface: '#F9F9FD', ink: '#252538', layout: 'invitation', baseTemplate: 'sakura', ornament: 'mist', dividerStyle: 'mist', backgroundPattern: 'cherry-petals', galleryLayout: 'vertical' },
    notepaper: { eyebrow: 'Deckled Love Letter', mood: 'Handwritten love letters on deckled linen stationery with nostalgic warmth', primary: '#5D4037', secondary: '#EFEBE9', surface: '#FAF7F5', ink: '#3E2723', layout: 'invitation', baseTemplate: 'vintage', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'vertical' },
    petlove: { eyebrow: 'Furry Companions', mood: 'Whimsical paw prints, playful companion accents, and joyful family love', primary: '#E67E22', secondary: '#FDEBD0', surface: '#FEF9F3', ink: '#3E2714', layout: 'bento', baseTemplate: 'whimsical', ornament: 'ribbon', dividerStyle: 'whimsical', backgroundPattern: 'soft-aura', galleryLayout: 'bento' },
    weddingtimes: { eyebrow: 'Front Page Romance', mood: 'Vintage newspaper chronicle, editorial column layout, and nostalgic headline romance', primary: '#212529', secondary: '#E9ECEF', surface: '#FDFBF7', ink: '#1A1A1A', layout: 'editorial', baseTemplate: 'vogue', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'bento' },
    mimosa: { eyebrow: 'Golden Provençal', mood: 'Sun-drenched golden mimosa florals, botanical delicacy, and joyful warmth', primary: '#E6A100', secondary: '#FEF3C7', surface: '#FFFDF5', ink: '#362B00', layout: 'invitation', baseTemplate: 'garden', ornament: 'floral-corner', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    oceanblue: { eyebrow: 'Coastal Horizon', mood: 'Azure waves, sea-salt mist, coastal horizons, and serene marine elegance', primary: '#0077B6', secondary: '#CAF0F8', surface: '#F4FAFD', ink: '#03045E', layout: 'cinematic', baseTemplate: 'riviera', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'horizontal' },
    emerald: { eyebrow: 'Gilded Emerald', mood: 'Royal emerald velvet, geometric Gatsby borders, and 1920s luxury', primary: '#D4AF37', secondary: '#155724', surface: '#061D12', ink: '#F8F9FA', layout: 'split', baseTemplate: 'artdeco', ornament: 'grid', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'bento' },
    washipaper: { eyebrow: 'Handmade Mulberry', mood: 'Hand-crafted mulberry washi paper, natural fiber textures, and serene Zen balance', primary: '#7C6F57', secondary: '#EDE6D6', surface: '#FAF7F0', ink: '#2B261F', layout: 'invitation', baseTemplate: 'nordic', ornament: 'washi', dividerStyle: 'washi', backgroundPattern: 'washi-fibers', galleryLayout: 'grid' },
    mistveil: { eyebrow: 'Ethereal Veil', mood: 'Ethereal misty filter veil, diffused luminescence, and cinematic poetry', primary: '#6C7A89', secondary: '#E9ECEF', surface: '#F8FAFB', ink: '#212529', layout: 'cinematic', baseTemplate: 'boho', ornament: 'mist', dividerStyle: 'mist', backgroundPattern: 'mist-haze', galleryLayout: 'horizontal' },
    linea: { eyebrow: 'Architectural Line', mood: 'Continuous architectural hairline geometry, pristine gallery pacing, and modern restraint', primary: '#343A40', secondary: '#E9ECEF', surface: '#FFFFFF', ink: '#121416', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'grid' },
    planetarium: { eyebrow: 'Midnight Planetarium', mood: 'Midnight star projector domes, glowing constellations, and celestial eternity', primary: '#D4AF37', secondary: '#1A254B', surface: '#060A18', ink: '#F0F4F8', layout: 'cinematic', baseTemplate: 'celestial', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'horizontal' },
    forest: { eyebrow: 'Redwood Sanctuary', mood: 'Deep alpine redwood foliage, woodland moss, and organic mountain romance', primary: '#2D5A27', secondary: '#E0EBE1', surface: '#F7FAF7', ink: '#172E14', layout: 'arch', baseTemplate: 'rustic', ornament: 'botanical', dividerStyle: 'rustic', backgroundPattern: 'woodland-pine', galleryLayout: 'bento' },
    jazz: { eyebrow: 'Bourbon & Brass', mood: 'Candlelit speakeasy warmth, golden brass accents, and syncopated vintage rhythm', primary: '#FFB703', secondary: '#3D2817', surface: '#120D08', ink: '#FFF1D6', layout: 'split', baseTemplate: 'midnight', ornament: 'disco', dividerStyle: 'disco', backgroundPattern: 'vinyl-grooves', galleryLayout: 'horizontal' },
    heritage: { eyebrow: 'Aristocratic Crest', mood: 'Old-world wax seals, heritage family crests, and timeless aristocratic poise', primary: '#8B263E', secondary: '#F5E6E8', surface: '#FAF7F5', ink: '#2A1017', layout: 'invitation', baseTemplate: 'royal', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'grid' },
    sunflower: { eyebrow: 'Tuscan Sunshine', mood: 'Golden sunflower blooms, rustic warmth, and sunlit Tuscan countryside vows', primary: '#E5A910', secondary: '#FEF9E7', surface: '#FFFDF7', ink: '#3A2804', layout: 'invitation', baseTemplate: 'rustic', ornament: 'floral-corner', dividerStyle: 'rustic', backgroundPattern: 'botanical-sprig', galleryLayout: 'vertical' },
    mermaidbeach: { eyebrow: 'Seashell Lagoon', mood: 'Iridescent coastal seafoam, pastel seashells, and gentle island tides', primary: '#2A9D8F', secondary: '#E0F4F1', surface: '#F7FCFB', ink: '#0F3833', layout: 'cinematic', baseTemplate: 'riviera', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'bento' },
    passport: { eyebrow: 'First Class Ticket', mood: 'Boarding pass cards, passport stamps, and a lifetime journey together', primary: '#1D3557', secondary: '#E1EDF6', surface: '#F7FAFC', ink: '#0E1C2E', layout: 'bento', baseTemplate: 'vintage', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'bento' },
    enchanted: { eyebrow: 'Fairytale Magic', mood: 'Luminescent fairytale forest glades, gilded stardust, and storybook magic', primary: '#7209B7', secondary: '#240046', surface: '#0D021A', ink: '#F3E8FF', layout: 'cinematic', baseTemplate: 'celestial', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'vertical' },
    coralsea: { eyebrow: 'Reef Twilight', mood: 'Warm coral sunset hues, tropical ocean twilight, and playful beachfront love', primary: '#F26419', secondary: '#FDEAE2', surface: '#FFFBF9', ink: '#3C1605', layout: 'invitation', baseTemplate: 'tropical', ornament: 'aura', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'grid' },
    oldpaper: { eyebrow: 'Historic Vellum', mood: 'Aged vellum parchment textures, archival sepia tones, and timeless handwritten romance', primary: '#6F4E37', secondary: '#EFE6D5', surface: '#FBF8F2', ink: '#2E1E14', layout: 'arch', baseTemplate: 'vintage', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'washi-fibers', galleryLayout: 'grid' },
    lapin: { eyebrow: 'Provencal Cottage', mood: 'French cottage gardens, woodland flora, and gentle pastoral storybook warmth', primary: '#839788', secondary: '#EAEFEA', surface: '#FCFBF9', ink: '#273129', layout: 'arch', baseTemplate: 'garden', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'botanical-ivy', galleryLayout: 'grid' },
    yellowsummer: { eyebrow: 'Lemon Orchard', mood: 'Zesty lemon orchard groves, sunlit terrace celebrations, and sparkling citrus radiance', primary: '#E76F51', secondary: '#FDEBD9', surface: '#FFFDF9', ink: '#3A1E16', layout: 'split', baseTemplate: 'riviera', ornament: 'sun', dividerStyle: 'citrus', backgroundPattern: 'citrus-bloom', galleryLayout: 'grid' },
    retroflower: { eyebrow: 'Groovy Sunshine', mood: '70s retro flower power, groovy undulating waves, and joyful vintage sunshine', primary: '#D97706', secondary: '#FDECC8', surface: '#FFFBF2', ink: '#361E02', layout: 'bento', baseTemplate: 'whimsical', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'vinyl-grooves', galleryLayout: 'grid' },
    daisygarden: { eyebrow: 'Wild Daisy Lawn', mood: 'Gentle English daisy lawns, picnic blankets, and relaxed wildflower rustic elegance', primary: '#606C38', secondary: '#E9EEDC', surface: '#FCFDF8', ink: '#202413', layout: 'invitation', baseTemplate: 'rustic', ornament: 'floral-corner', dividerStyle: 'rustic', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    clearblue: { eyebrow: 'Crystal Waters', mood: 'Luminescent crystalline azure waters, transparent glass surfaces, and modern serene purity', primary: '#0096C7', secondary: '#DCF3FF', surface: '#F7FCFF', ink: '#022B3A', layout: 'split', baseTemplate: 'minimal', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'bento' },
    musicfest: { eyebrow: 'Main Stage VIP', mood: 'Rock festival lineup energy, VIP wristband vibes, and electrifying celebratory excitement', primary: '#E63946', secondary: '#2D1518', surface: '#141414', ink: '#FFFFFF', layout: 'poster', baseTemplate: 'urban', ornament: 'disco', dividerStyle: 'urban', backgroundPattern: 'vinyl-grooves', galleryLayout: 'bento' },
    botanicalgreen: { eyebrow: 'Verdant Glasshouse', mood: 'Lush tropical glasshouse foliage, eucalyptus tranquility, and deep botanical calm', primary: '#2D6A4F', secondary: '#D8EDE2', surface: '#F7FCF9', ink: '#122D21', layout: 'poster', baseTemplate: 'garden', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'woodland-pine', galleryLayout: 'bento' },
    fluidmodern: { eyebrow: 'Tokyo Modernisme', mood: 'Abstract liquid shape morphs, subtle mesh gradients, and forward-looking poise', primary: '#4361EE', secondary: '#E4E8FD', surface: '#F9FAFE', ink: '#101738', layout: 'bento', baseTemplate: 'minimal', ornament: 'neumorphic', dividerStyle: 'neumorphic', backgroundPattern: 'neumorphic-glow', galleryLayout: 'bento' },
    springrise: { eyebrow: 'Dawn Blossom', mood: 'Early morning cherry blossom petals, rosy dawn light, and poetic seasonal rebirth', primary: '#E87A90', secondary: '#FDECEF', surface: '#FFFDFE', ink: '#38161D', layout: 'invitation', baseTemplate: 'sakura', ornament: 'floral-corner', dividerStyle: 'sakura', backgroundPattern: 'cherry-petals', galleryLayout: 'grid' },
    truelove: { eyebrow: 'Black-Tie Monogram', mood: 'Formal intertwined serif monograms, crisp monochrome ivory contrast, and black-tie elegance', primary: '#1F2937', secondary: '#E5E7EB', surface: '#FAFAFA', ink: '#111827', layout: 'editorial', baseTemplate: 'classic', ornament: 'grid', dividerStyle: 'editorial', backgroundPattern: 'newspaper-columns', galleryLayout: 'grid' },
    oceanus: { eyebrow: 'Abyssal Romance', mood: 'Deep oceanic trench navy, glowing turquoise bioluminescence, and eternal romantic depth', primary: '#00B4D8', secondary: '#0B2545', surface: '#030816', ink: '#EBF4F6', layout: 'cinematic', baseTemplate: 'midnight', ornament: 'wavy', dividerStyle: 'wave', backgroundPattern: 'seigaiha-waves', galleryLayout: 'horizontal' },
    airport: { eyebrow: 'Runway Departure', mood: 'Flight departure board styling, runway lights, and international destination love', primary: '#3A86FF', secondary: '#E2EDFF', surface: '#F8FAFD', ink: '#102244', layout: 'split', baseTemplate: 'modern-vow', ornament: 'stamp', dividerStyle: 'urban', backgroundPattern: 'airmail-chevrons', galleryLayout: 'bento' },
    noweddingnolife: { eyebrow: 'High Voltage Romance', mood: 'High-voltage Tokyo poster art, bold graphic typography, and fearless energetic celebration', primary: '#FF0054', secondary: '#3B0A20', surface: '#12020A', ink: '#FFF0F5', layout: 'poster', baseTemplate: 'vogue', ornament: 'bauhaus', dividerStyle: 'urban', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    arrangeflowers: { eyebrow: 'Ikebana Atelier', mood: 'Artisan floral arrangements, pastel garden blooms, and delicate ikebana harmony', primary: '#B76E79', secondary: '#FCEEF1', surface: '#FFFDFD', ink: '#361A20', layout: 'invitation', baseTemplate: 'garden', ornament: 'floral-corner', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'grid' },
    gradientleaf: { eyebrow: 'Gilded Foliage', mood: 'Shimmering ombre eucalyptus leaves, Roman serif titling, and botanical foil luxury', primary: '#386641', secondary: '#D8EADF', surface: '#F7FCF9', ink: '#19301D', layout: 'split', baseTemplate: 'elegance', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'bento' },
    growthtale: { eyebrow: 'Fairytale Silhouette', mood: 'Art Deco line-art silhouettes, whimsical starry accents, and romantic growth chapters', primary: '#9B72CF', secondary: '#2E1C4A', surface: '#140C24', ink: '#F5EFFC', layout: 'cinematic', baseTemplate: 'celestial', ornament: 'star', dividerStyle: 'celestial', backgroundPattern: 'constellation-map', galleryLayout: 'bento' },
    innocentpetals: { eyebrow: 'Bridal Veil Petals', mood: 'Pure ivory veil translucency, gentle blush petals, and serene morning vows', primary: '#E09FAD', secondary: '#FDEFF2', surface: '#FFFDFE', ink: '#3A1E24', layout: 'split', baseTemplate: 'sakura', ornament: 'mist', dividerStyle: 'mist', backgroundPattern: 'mist-haze', galleryLayout: 'vertical' },
    deeporange: { eyebrow: 'Terracotta Sunset', mood: 'Warm Spanish terracotta tiles, burnt sienna desert glow, and sun-baked romance', primary: '#C85A32', secondary: '#FBE6DD', surface: '#FFFBF9', ink: '#3B180C', layout: 'arch', baseTemplate: 'boho', ornament: 'sun', dividerStyle: 'terracotta', backgroundPattern: 'terracotta-arches', galleryLayout: 'vertical' },
    hanaume: { eyebrow: 'Auspicious Plum', mood: 'Crimson winter plum blossoms, celebratory gold leaf, and auspicious spring arrival', primary: '#A61C1C', secondary: '#FCE4E4', surface: '#FFFDFD', ink: '#300808', layout: 'poster', baseTemplate: 'traditional', ornament: 'mizuhiki', dividerStyle: 'mizuhiki', backgroundPattern: 'cherry-petals', galleryLayout: 'bento' },
    bluebird: { eyebrow: 'Bluebird Joy', mood: 'Symbolic bluebirds of happiness, soft sky-blue gradients, and sweet uplifting vows', primary: '#4682B4', secondary: '#E3F2FD', surface: '#F8FCFE', ink: '#102A43', layout: 'invitation', baseTemplate: 'elegance', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'grid' },
    gardenwedding: { eyebrow: 'English Manor', mood: 'Historic English country estate lawns, climbing ivy, and afternoon garden tea romance', primary: '#405D27', secondary: '#E2EBDC', surface: '#F9FAF8', ink: '#1B2910', layout: 'arch', baseTemplate: 'garden', ornament: 'botanical', dividerStyle: 'botanical', backgroundPattern: 'botanical-sprig', galleryLayout: 'bento' },
    minimumstyle: { eyebrow: 'Swiss Minimalist', mood: 'Stark Swiss modernist typography, generous negative space, and architectural purity', primary: '#111827', secondary: '#E5E7EB', surface: '#FFFFFF', ink: '#0F172A', layout: 'editorial', baseTemplate: 'minimal', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    music: { eyebrow: 'Lyrical Symphony', mood: 'Classical musical stave flourishes, acoustic string quartet elegance, and harmonious vows', primary: '#4A4E69', secondary: '#E2E3EB', surface: '#FAF9FB', ink: '#1E202B', layout: 'invitation', baseTemplate: 'vintage', ornament: 'wavy', dividerStyle: 'music', backgroundPattern: 'music-staff', galleryLayout: 'grid' },
    royalblue: { eyebrow: 'Imperial Cobalt', mood: 'Deep imperial cobalt blue velvet, gilded gold leaf, and grand ballroom majesty', primary: '#0056D2', secondary: '#0B2252', surface: '#040C20', ink: '#EEF4FF', layout: 'cinematic', baseTemplate: 'royal', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'none', galleryLayout: 'horizontal' },
    letter: { eyebrow: 'Transatlantic Airmail', mood: 'Vintage airmail chevron borders, crimson wax seals, and transatlantic love letters', primary: '#B22222', secondary: '#FBE8E8', surface: '#FFFDFB', ink: '#330808', layout: 'poster', baseTemplate: 'vintage', ornament: 'stamp', dividerStyle: 'stamp', backgroundPattern: 'airmail-chevrons', galleryLayout: 'bento' },
    naturalcamper: { eyebrow: 'Wilderness Glamping', mood: 'Alpine glamping under the pines, campfire warmth, and starlit mountain love', primary: '#588157', secondary: '#E3EDE5', surface: '#F7F9F6', ink: '#1F3320', layout: 'bento', baseTemplate: 'rustic', ornament: 'botanical', dividerStyle: 'rustic', backgroundPattern: 'woodland-pine', galleryLayout: 'bento' },
    modernsquare: { eyebrow: 'Tokyo Square Gallery', mood: 'Balanced square photo tiles, Tokyo gallery curation, and precise architectural lines', primary: '#2B2D42', secondary: '#E8EAED', surface: '#FAFBFD', ink: '#131521', layout: 'bento', baseTemplate: 'editorial', ornament: 'grid', dividerStyle: 'minimal', backgroundPattern: 'bauhaus-shapes', galleryLayout: 'bento' },
    japan: { eyebrow: 'Zen Stone Garden', mood: 'Kyoto rock gardens, peaceful bamboo accents, and harmonious Zen tranquility', primary: '#52796F', secondary: '#DFE7E5', surface: '#F8FAFA', ink: '#1E312C', layout: 'arch', baseTemplate: 'traditional', ornament: 'washi', dividerStyle: 'washi', backgroundPattern: 'washi-fibers', galleryLayout: 'bento' },
    weddingcake: { eyebrow: 'Artisan Pâtisserie', mood: 'Tiered artisan wedding cakes, rich mocha cream, and sweet champagne celebration', primary: '#7F5539', secondary: '#F0E2D6', surface: '#FDFBF8', ink: '#362113', layout: 'bento', baseTemplate: 'whimsical', ornament: 'ribbon', dividerStyle: 'whimsical', backgroundPattern: 'soft-aura', galleryLayout: 'bento' },
    akamatsu: { eyebrow: 'Ancient Red Pine', mood: 'Ancient Japanese red pine branches, weathered stone lanterns, and enduring unity', primary: '#780000', secondary: '#F5E1E1', surface: '#FDFBFB', ink: '#290000', layout: 'split', baseTemplate: 'traditional', ornament: 'arch', dividerStyle: 'luxury', backgroundPattern: 'woodland-pine', galleryLayout: 'horizontal' },
    kasumi: { eyebrow: 'Morning Mountain Mist', mood: 'Ethereal sumi-e watercolor mist over mountain ridges and poetic dawn serenity', primary: '#5A5A5A', secondary: '#E6E6E6', surface: '#F9F9F9', ink: '#1F1F1F', layout: 'invitation', baseTemplate: 'sakura', ornament: 'mist', dividerStyle: 'mist', backgroundPattern: 'mist-haze', galleryLayout: 'grid' },
    konatsu: { eyebrow: 'Island Citrus Breeze', mood: 'Golden island citrus orchards, ocean breeze, and cheerful sunny celebration', primary: '#FB8500', secondary: '#FEEDD1', surface: '#FFFDF7', ink: '#3D1C00', layout: 'split', baseTemplate: 'riviera', ornament: 'sun', dividerStyle: 'citrus', backgroundPattern: 'citrus-bloom', galleryLayout: 'bento' },
    balloonrelease: { eyebrow: 'Skyward Celebration', mood: 'Floating pastel balloons rising into azure skies, joyful liberation, and festive love', primary: '#3A86FF', secondary: '#E0EEFF', surface: '#F7FAFE', ink: '#0C234D', layout: 'poster', baseTemplate: 'whimsical', ornament: 'aura', dividerStyle: 'aura', backgroundPattern: 'soft-aura', galleryLayout: 'vertical' },
};

function formatDate(date: string) {
    if (!date) return '';
    const value = new Date(date);
    return Number.isNaN(value.getTime())
        ? date
        : value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Ornament({ theme }: { theme: PremiumTheme }) {
    const color = theme.primary;

    if (theme.ornament === 'star') {
        return <div className="absolute inset-0 opacity-70" aria-hidden="true" style={{ backgroundImage: `radial-gradient(${color} 1.5px, transparent 1.5px)`, backgroundSize: '32px 32px', maskImage: 'linear-gradient(to bottom, black, transparent 70%)' }} />;
    }

    if (theme.ornament === 'grid') {
        return <div className="absolute inset-0 opacity-30" aria-hidden="true" style={{ backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`, backgroundSize: '44px 44px', maskImage: 'linear-gradient(to bottom, black, transparent 78%)' }} />;
    }

    if (theme.ornament === 'tile') {
        return <div className="absolute inset-0 opacity-25" aria-hidden="true" style={{ backgroundImage: `radial-gradient(circle, ${color} 2px, transparent 3px), linear-gradient(45deg, transparent 48%, ${color}33 49%, ${color}33 51%, transparent 52%)`, backgroundSize: '40px 40px', maskImage: 'linear-gradient(to bottom, black, transparent 85%)' }} />;
    }

    if (theme.ornament === 'aura') {
        return <>
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-40 blur-3xl animate-pulse" aria-hidden="true" style={{ backgroundColor: color }} />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full opacity-35 blur-3xl" aria-hidden="true" style={{ backgroundColor: theme.secondary }} />
        </>;
    }

    if (theme.ornament === 'disco') {
        return <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30" aria-hidden="true" style={{ background: `radial-gradient(circle, ${color} 0 15%, transparent 16% 25%, ${color} 26% 35%, transparent 36% 48%, ${color} 49% 60%, transparent 61%)` }} />;
    }

    if (theme.ornament === 'filmstrip') {
        return (
            <div className="absolute inset-x-0 top-0 flex justify-between px-4 py-2 opacity-40" aria-hidden="true">
                <div className="flex gap-3">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-3 w-4 rounded-sm border border-white/40 bg-white/20" />)}</div>
                <div className="flex gap-3">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-3 w-4 rounded-sm border border-white/40 bg-white/20" />)}</div>
            </div>
        );
    }

    if (theme.ornament === 'bauhaus') {
        return <>
            <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full opacity-30" aria-hidden="true" style={{ backgroundColor: color }} />
            <div className="absolute -right-8 top-20 h-36 w-36 rotate-12 border-4 opacity-25" aria-hidden="true" style={{ borderColor: color }} />
        </>;
    }

    if (theme.ornament === 'washi') {
        return <div className="absolute left-8 top-4 h-6 w-24 -rotate-3 rounded-sm opacity-40 shadow-sm" aria-hidden="true" style={{ backgroundColor: color }} />;
    }

    if (theme.ornament === 'stamp') {
        return <div className="absolute right-8 top-8 h-20 w-28 -rotate-6 border-2 border-dashed opacity-40" aria-hidden="true" style={{ borderColor: color }} />;
    }

    if (theme.ornament === 'arch') {
        return <div className="absolute -right-20 top-12 h-[26rem] w-[18rem] rounded-t-full border-[18px] opacity-35 sm:right-8" aria-hidden="true" style={{ borderColor: color }} />;
    }

    if (theme.ornament === 'sun') {
        return <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full opacity-30 blur-[1px]" aria-hidden="true" style={{ background: `radial-gradient(circle, ${color} 0 25%, transparent 26% 34%, ${color} 35% 36%, transparent 37% 43%, ${color} 44% 45%, transparent 46%)` }} />;
    }

    if (theme.ornament === 'ribbon') {
        return <div className="absolute -right-16 top-16 h-40 w-[34rem] -rotate-12 opacity-25" aria-hidden="true" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />;
    }

    if (theme.ornament === 'floral-corner') {
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                {/* Top-left botanical wildflower corner */}
                <div className="absolute -left-4 -top-4 h-48 w-48 opacity-45 sm:h-64 sm:w-64">
                    <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
                        <path d="M10,10 Q60,30 90,80 T160,170" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        <circle cx="35" cy="22" r="7" fill={color} opacity="0.7" />
                        <circle cx="70" cy="42" r="9" fill={theme.secondary} stroke={color} strokeWidth="1.5" />
                        <circle cx="110" cy="80" r="11" fill={color} opacity="0.6" />
                        <path d="M35,22 Q20,8 12,22 Q25,36 35,22 Z" fill={color} opacity="0.5" />
                        <path d="M70,42 Q55,24 46,38 Q60,56 70,42 Z" fill={color} opacity="0.4" />
                        <path d="M110,80 Q92,60 84,78 Q100,100 110,80 Z" fill={color} opacity="0.4" />
                        <circle cx="140" cy="130" r="8" fill={theme.secondary} opacity="0.8" />
                    </svg>
                </div>
                {/* Bottom-right botanical wildflower corner */}
                <div className="absolute -bottom-4 -right-4 h-48 w-48 rotate-180 opacity-45 sm:h-64 sm:w-64">
                    <svg viewBox="0 0 200 200" fill="none" className="h-full w-full">
                        <path d="M10,10 Q60,30 90,80 T160,170" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                        <circle cx="35" cy="22" r="7" fill={color} opacity="0.7" />
                        <circle cx="70" cy="42" r="9" fill={theme.secondary} stroke={color} strokeWidth="1.5" />
                        <circle cx="110" cy="80" r="11" fill={color} opacity="0.6" />
                        <path d="M35,22 Q20,8 12,22 Q25,36 35,22 Z" fill={color} opacity="0.5" />
                        <path d="M70,42 Q55,24 46,38 Q60,56 70,42 Z" fill={color} opacity="0.4" />
                        <path d="M110,80 Q92,60 84,78 Q100,100 110,80 Z" fill={color} opacity="0.4" />
                    </svg>
                </div>
            </div>
        );
    }

    if (theme.ornament === 'wavy') {
        return (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden opacity-30" aria-hidden="true">
                <svg viewBox="0 0 1200 100" fill="none" className="h-20 w-full">
                    <path d="M0,50 C150,90 350,10 500,50 C650,90 850,10 1000,50 C1100,75 1150,65 1200,50 L1200,0 L0,0 Z" fill={theme.secondary} opacity="0.6" />
                    <path d="M0,50 C150,90 350,10 500,50 C650,90 850,10 1000,50 C1100,75 1150,65 1200,50" stroke={color} strokeWidth="2.5" />
                </svg>
            </div>
        );
    }

    if (theme.ornament === 'mizuhiki') {
        return (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 opacity-75 sm:top-6" aria-hidden="true">
                <svg viewBox="0 0 160 70" fill="none" className="h-12 w-28 sm:h-16 sm:w-36">
                    <path d="M10,35 Q50,5 80,35 Q110,65 150,35" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M10,38 Q50,8 80,38 Q110,68 150,38" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="80" cy="35" r="13" stroke="#C0392B" strokeWidth="2" fill="none" />
                    <circle cx="80" cy="35" r="9" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
                </svg>
            </div>
        );
    }

    if (theme.ornament === 'neumorphic') {
        return (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <div className="absolute -left-16 -top-16 h-60 w-60 rounded-full opacity-60 shadow-[inset_10px_10px_20px_rgba(0,0,0,0.08),inset_-10px_-10px_20px_rgba(255,255,255,0.9)]" />
                <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full opacity-60 shadow-[8px_8px_24px_rgba(0,0,0,0.08),-8px_-8px_24px_rgba(255,255,255,0.95)]" />
            </div>
        );
    }

    if (theme.ornament === 'mist') {
        return (
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,transparent_70%)] opacity-50 backdrop-blur-[1.5px]" />
                <div className="absolute left-10 top-10 h-64 w-64 rounded-full opacity-35 blur-3xl" style={{ backgroundColor: theme.primary }} />
                <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: theme.secondary }} />
            </div>
        );
    }

    return <>
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full opacity-25 blur-3xl" aria-hidden="true" style={{ backgroundColor: color }} />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full opacity-20 blur-3xl" aria-hidden="true" style={{ backgroundColor: color }} />
    </>;
}

function PremiumHero({ wedding, theme }: { wedding: Wedding; theme: PremiumTheme }) {
    const image = wedding.hero_image || wedding.couple_photo;
    const title = <><span className="block">{wedding.bride_name}</span><span className="my-1 block text-[0.42em] italic font-light" style={{ color: theme.primary }}>&amp;</span><span className="block">{wedding.groom_name}</span></>;

    const imagePanel = image ? (
        <SafeWeddingImage
            src={image}
            alt={`${wedding.bride_name} and ${wedding.groom_name}`}
            fallbackText={wedding.logo_initials}
            className="h-full w-full object-cover"
        />
    ) : <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary}55)` }} />;

    return (
        <section className="relative isolate overflow-hidden px-5 py-5 sm:px-8 sm:py-8" style={{ backgroundColor: theme.surface, color: theme.ink }}>
            <div className={`relative mx-auto min-h-[42rem] max-w-[1440px] overflow-hidden rounded-[2rem] border border-white/30 shadow-[0_30px_100px_rgba(29,22,20,0.18)] sm:min-h-[46rem] ${theme.layout === 'bento' ? 'border-2 border-black/80 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]' : ''}`} style={{ backgroundColor: theme.surface }}>
                <Ornament theme={theme} />

                {theme.layout === 'split' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[52%] p-5 md:block">
                        <div className="h-full overflow-hidden rounded-[1.55rem]">{imagePanel}</div>
                    </div>
                )}
                {theme.layout === 'arch' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[48%] p-6 md:block">
                        <div className="h-full overflow-hidden rounded-t-full rounded-b-2xl border-4 shadow-xl" style={{ borderColor: theme.primary }}>{imagePanel}</div>
                    </div>
                )}
                {theme.layout === 'bento' && (
                    <div className="absolute inset-y-0 right-0 hidden w-[48%] p-6 md:block">
                        <div className="h-full overflow-hidden rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">{imagePanel}</div>
                    </div>
                )}
                {(theme.layout === 'cinematic' || theme.layout === 'poster') && (
                    <div className="absolute inset-0">{imagePanel}<div className="absolute inset-0 bg-black/45" /></div>
                )}
                {theme.layout === 'invitation' && image && (
                    <div className="absolute inset-0 opacity-20"><div className="h-full w-full scale-110 blur-sm">{imagePanel}</div></div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`relative z-10 flex min-h-[42rem] flex-col justify-center px-7 py-16 text-center sm:px-16 sm:py-20 ${(theme.layout === 'split' || theme.layout === 'arch' || theme.layout === 'bento') ? 'md:w-[52%] md:text-left' : ''} ${(theme.layout === 'cinematic' || theme.layout === 'poster') ? 'text-white' : ''}`}
                >
                    <p className={`text-[10px] font-bold uppercase tracking-[0.32em] opacity-75 sm:text-xs ${theme.layout === 'bento' ? 'bg-black text-white px-3 py-1 rounded-sm w-fit mx-auto md:mx-0' : ''}`}>{theme.eyebrow}</p>

                    <TemplateMonogram
                        wedding={wedding}
                        defaultShape="circle"
                        size="md"
                        color={theme.primary}
                        motifColor={theme.primary}
                        inverted={theme.layout === 'cinematic' || theme.layout === 'poster'}
                        className={`my-4 ${(theme.layout === 'split' || theme.layout === 'arch' || theme.layout === 'bento') ? 'md:justify-start justify-center' : 'justify-center'}`}
                    />

                    <div className="mx-auto my-7 h-px w-16 opacity-70 md:mx-0" style={{ backgroundColor: theme.primary }} />
                    <h1 className={`font-serif leading-[0.82] tracking-[-0.055em] ${theme.layout === 'editorial' ? 'text-5xl sm:text-7xl lg:text-[8rem]' : 'text-5xl sm:text-7xl lg:text-8xl'}`}>
                        {title}
                    </h1>

                    {wedding.quote && (
                        <blockquote className="my-6 max-w-md italic font-serif text-sm sm:text-base opacity-90 border-l-2 pl-4 md:mx-0 mx-auto" style={{ borderColor: theme.primary }}>
                            &ldquo;{wedding.quote}&rdquo;
                        </blockquote>
                    )}

                    <p className="mt-8 max-w-md text-sm leading-7 opacity-80 sm:text-base md:mx-0">{theme.mood}</p>
                    <div className={`mt-10 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-[0.25em] opacity-80 sm:text-xs ${theme.layout === 'bento' ? 'p-3 border border-black/40 rounded-lg bg-white/80 w-fit mx-auto md:mx-0' : ''}`}>
                        <span>{formatDate(wedding.wedding_date)}</span>
                        <span className="opacity-60">{wedding.venue_name}</span>
                    </div>
                    {(theme.layout === 'split' || theme.layout === 'arch' || theme.layout === 'bento') && <div className="mt-10 overflow-hidden rounded-[1.5rem] md:hidden"><div className="aspect-[4/3]">{imagePanel}</div></div>}
                </motion.div>
            </div>
        </section>
    );
}

export default function PremiumTemplate({ wedding, gallery, isExpired }: TemplateProps) {
    const theme = PREMIUM_THEMES[wedding.template] || PREMIUM_THEMES.heirloom;
    const themedWedding = {
        ...wedding,
        template: wedding.template || theme.baseTemplate,
        motif_color: wedding.motif_color || theme.primary,
    };
    const activeDividerStyle = theme.dividerStyle || theme.ornament || theme.baseTemplate;
    const activePattern = theme.backgroundPattern || 'none';
    const activeGalleryLayout = theme.galleryLayout || (theme.layout === 'editorial' || theme.layout === 'bento' ? 'bento' : theme.layout === 'cinematic' ? 'horizontal' : 'grid');
    const isDarkTheme = theme.layout === 'cinematic' || theme.layout === 'poster' || theme.surface.startsWith('#0') || theme.surface.startsWith('#1');

    const defaultSectionOrder: Array<'video' | 'bio' | 'details' | 'countdown' | 'timeline' | 'gallery' | 'gift' | 'additional'> = 
        theme.sectionOrder || (
            theme.layout === 'cinematic'
                ? ['video', 'gallery', 'bio', 'details', 'countdown', 'timeline', 'gift', 'additional']
                : theme.layout === 'editorial'
                ? ['bio', 'gallery', 'details', 'timeline', 'video', 'countdown', 'gift', 'additional']
                : theme.layout === 'poster'
                ? ['countdown', 'details', 'timeline', 'video', 'bio', 'gallery', 'gift', 'additional']
                : theme.layout === 'bento'
                ? ['details', 'countdown', 'bio', 'gallery', 'timeline', 'video', 'gift', 'additional']
                : ['video', 'bio', 'details', 'countdown', 'timeline', 'gallery', 'gift', 'additional']
        );

    const renderSection = (type: string) => {
        switch (type) {
            case 'video':
                return wedding.teaser_video ? (
                    <div key="video">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <VideoSection id="video" video={wedding.teaser_video} poster={wedding.hero_image} />
                    </div>
                ) : null;
            case 'bio':
                return (
                    <div key="bio">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <BioSection id="bio" wedding={themedWedding} />
                    </div>
                );
            case 'details':
                return (
                    <div key="details">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <DetailsSection id="details" wedding={themedWedding} />
                    </div>
                );
            case 'countdown':
                return !wedding.is_thank_you_mode ? (
                    <div key="countdown">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <CountdownTimer
                            id="countdown"
                            weddingDate={wedding.wedding_date}
                            weddingTime={wedding.wedding_time} eventTimezone={wedding.event_timezone}
                            brideName={wedding.bride_name}
                            groomName={wedding.groom_name}
                            venueName={wedding.venue_name}
                            venueAddress={wedding.venue_address}
                            template={themedWedding.template}
                            motifColor={theme.primary}
                            sectionStyles={themedWedding.section_styles}
                        />
                    </div>
                ) : null;
            case 'timeline':
                return (
                    <div key="timeline">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <TimelineSection id="timeline" timeline={wedding.program_timeline || ''} wedding={themedWedding} />
                    </div>
                );
            case 'gallery':
                return (
                    <div key="gallery">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <GallerySection
                            id="gallery"
                            gallery={gallery}
                            template={themedWedding.template}
                            motifColor={theme.primary}
                            galleryLayout={activeGalleryLayout}
                            sectionStyles={themedWedding.section_styles}
                        />
                    </div>
                );
            case 'gift':
                return (
                    <div key="gift">
                        <TemplateSectionDivider style={activeDividerStyle} motifColor={theme.primary} />
                        <GiftSection id="gift" wedding={themedWedding} />
                    </div>
                );
            case 'additional':
                return (
                    <SharedNewSections key="additional" id="additional" wedding={themedWedding} isExpired={isExpired} />
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ backgroundColor: theme.surface, color: theme.ink }}>
            <PremiumHero wedding={wedding} theme={theme} />
            <div className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.secondary}55 45%, ${theme.surface} 100%)` }}>
                <TemplateBackgroundVector pattern={activePattern} motifColor={theme.primary} isDark={isDarkTheme} />
                <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[44rem] -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${theme.primary}12` }} />
                <div className="relative z-10">
                    {defaultSectionOrder.map((sectionName) => renderSection(sectionName))}
                </div>
            </div>
        </div>
    );
}
