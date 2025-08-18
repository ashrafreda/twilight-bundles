import { products } from './products';
import { categories } from './categories';
import { brands } from './brands';
import { blog_articles } from './blog_articles';
import { blog_categories } from './blog_categories';
import { pages } from './pages';
import { special_offers } from './special_offers';
import { branches } from './branches';
import { products_tags } from './products_tags';

// Export all data sources
export const dataSources: Record<string, any> = {
  products,
  categories,
  brands,
  blog_articles,
  blog_categories,
  pages,
  special_offers,
  branches,
  products_tags
};

// Helper function to get data for a specific source
export function getSourceData(source: string) {
  return dataSources[source] || {
    status: 404,
    success: false,
    source,
    data: [],
    message: `Source '${source}' not found`
  };
}
