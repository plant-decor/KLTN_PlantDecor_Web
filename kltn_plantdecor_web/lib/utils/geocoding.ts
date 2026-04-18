/**
 * Reverse geocoding utility using OpenStreetMap Nominatim API
 * Converts latitude and longitude to address
 */

interface NominatimResponse {
  address?: {
    road?: string;
    house_number?: string;
    village?: string;
    town?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  display_name?: string;
}

interface NominatimSearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface AddressSuggestion {
  display_name: string;
  latitude: number;
  longitude: number;
}

export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return '';
    }

    if (latitude === 0 && longitude === 0) {
      return '';
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'Accept-Language': 'vi,en',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return '';
    }

    const data: NominatimResponse = await response.json();

    if (!data.display_name) {
      return '';
    }

    // Return the full display name from Nominatim
    return data.display_name;
  } catch (error) {
    console.error('Error fetching address from coordinates:', error);
    return '';
  }
}

/**
 * Forward geocoding - converts address text to coordinates
 * Fetches address suggestions from OpenStreetMap Nominatim API
 */
export async function searchAddressSuggestions(
  addressText: string
): Promise<AddressSuggestion[]> {
  try {
    if (!addressText || addressText.trim().length < 3) {
      return [];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        addressText
      )}&limit=10`,
      {
        headers: {
          'Accept-Language': 'vi,en',
        },
      }
    );

    if (!response.ok) {
      console.error('Search API error:', response.status);
      return [];
    }

    const data: NominatimSearchResult[] = await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item: NominatimSearchResult) =>
          item.display_name &&
          typeof item.lat === 'string' &&
          typeof item.lon === 'string'
      )
      .map((item: NominatimSearchResult) => ({
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
  } catch (error) {
    console.error('Error searching address suggestions:', error);
    return [];
  }
}
