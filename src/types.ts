export interface User {
  name: string;
  username: string;
  email: string;
  mobile: string;
}

export interface Category {
  id: string;
  name: string;
  label: string;
  emoji: string;
  color: string;
  bgClass?: string;
  borderClass?: string;
  image?: string;
}

export interface Movie {
  title: string;
  year: string;
  rating: string;
  duration: string;
  plot: string;
  director: string;
  actors: string;
  posterUrl: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  city: string;
  iconDescription: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  summary: string;
  publishedAt: string;
  imageUrl: string;
}

export type AppStep = "registration" | "categories" | "dashboard" | "movies";
