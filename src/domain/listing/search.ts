import { ListingData } from './service';
import { ListingType } from './validation';

export function filterByType(listings: ListingData[], type: ListingType): ListingData[] {
  return listings.filter((l) => l.type === type);
}

export function sortByNewest(listings: ListingData[]): ListingData[] {
  return [...listings].reverse();
}
