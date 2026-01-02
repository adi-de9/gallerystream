import axios from 'axios';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const API_URL = 'https://api.unsplash.com';

export const unsplash = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  },
});

export const fetchImages = async (page = 1, perPage = 20) => {
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY.includes('your_unsplash')) {
    console.warn('Unsplash API Key missing. Using Mock Data.');
    return getMockImages(page, perPage);
  }

  try {
    const response = await unsplash.get('/photos', {
      params: { page, per_page: perPage, order_by: 'popular' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    return getMockImages(page, perPage);
  }
};

const getMockImages = (page, perPage) => {
  // Generate distinct mock data based on page to simulate infinite scroll
  return new Promise((resolve) => {
    setTimeout(() => {
      const images = Array.from({ length: perPage }, (_, i) => {
        const id = `mock-${page}-${i}`;
        return {
          id,
          urls: {
            regular: `https://picsum.photos/seed/${id}/600/800`,
            small: `https://picsum.photos/seed/${id}/400/600`,
            thumb: `https://picsum.photos/seed/${id}/200/300`,
          },
          user: {
            name: `Photographer ${page}-${i}`,
            profile_image: { medium: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}` }
          },
          likes: Math.floor(Math.random() * 1000),
          alt_description: `Mock image ${id}`,
        };
      });
      resolve(images);
    }, 500);
  });
};
