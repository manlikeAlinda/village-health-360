import subcountyData from "./subcountyData.json";
import districtCentroidData from "./districtCentroids.json";

// Region -> Subregion -> Districts. Fixed two pre-existing data bugs found while
// sourcing real subcounty data (see DATA_SOURCES.md):
//   - "Kasanda" was listed as a district separate from "Kassanda" (Buganda North) -
//     they're the same place; kept the "Kassanda" spelling (matches the official
//     gazette and Wikipedia's canonical title) and dropped the duplicate.
//   - "Bunyangabu" (Tooro) was missing from this list entirely despite being a
//     real district since 2019 - added.
export const DISTRICTS_DATA: Record<string, Record<string, string[]>> = {
  "Central": {
    "Kampala": ["Kampala City"],
    "Buganda South": ["Bukomansimbi", "Butambala", "Gomba", "Kalangala", "Kalungu", "Kyotera", "Lwengo", "Lyantonde", "Masaka", "Masaka City", "Mpigi", "Rakai", "Sembabule", "Wakiso"],
    "Buganda North": ["Buikwe", "Buvuma", "Kassanda", "Kayunga", "Kiboga", "Kyankwanzi", "Luweero", "Mityana", "Mubende", "Mukono", "Nakaseke", "Nakasongola"]
  },
  "Eastern": {
    "Busoga": ["Bugiri", "Bugweri", "Buyende", "Iganga", "Jinja", "Jinja City", "Kaliro", "Kamuli", "Luuka", "Mayuge", "Namayingo", "Namutumba"],
    "Bukedi": ["Budaka", "Busia", "Butaleja", "Butebo", "Kibuku", "Pallisa", "Tororo"],
    "Elgon": ["Bududa", "Bukwo", "Bulambuli", "Kapchorwa", "Kween", "Manafwa", "Mbale", "Mbale City", "Namisindwa", "Sironko"],
    "Teso": ["Amuria", "Bukedea", "Kaberamaido", "Kalaki", "Kapelebyong", "Katakwi", "Kumi", "Ngora", "Serere", "Soroti", "Soroti City"]
  },
  "Northern": {
    "Karamoja": ["Abim", "Amudat", "Kaabong", "Karenga", "Kotido", "Moroto", "Nabilatuk", "Nakapiripirit", "Napak"],
    "Lango": ["Alebtong", "Amolatar", "Apac", "Dokolo", "Kole", "Kwania", "Lira", "Lira City", "Otuke", "Oyam"],
    "Acholi": ["Agago", "Amuru", "Gulu", "Gulu City", "Kitgum", "Lamwo", "Nwoya", "Omoro", "Pader"],
    "West Nile": ["Adjumani", "Arua", "Arua City", "Koboko", "Madi-Okollo", "Maracha", "Moyo", "Nebbi", "Obongi", "Pakwach", "Terego", "Yumbe", "Zombo"]
  },
  "Western": {
    "Bunyoro": ["Buliisa", "Hoima", "Hoima City", "Kagadi", "Kakumiro", "Kibaale", "Kikuube", "Kiryandongo", "Masindi"],
    "Tooro": ["Bundibugyo", "Bunyangabu", "Kabarole", "Kamwenge", "Kitagwenda", "Kyegegwa", "Kyenjojo", "Ntoroko", "Kasese"],
    "Ankole": ["Buhweju", "Bushenyi", "Ibanda", "Isingiro", "Kazo", "Kiruhura", "Mbarara", "Mbarara City", "Mitooma", "Ntungamo", "Rubirizi", "Rwampara", "Sheema"],
    "Kigezi": ["Kabale", "Kanungu", "Kisoro", "Rubanda", "Rukiga", "Rukungiri"]
  }
};

// Real gazetted subcounties per district, sourced from the HDX Uganda COD-AB
// admin4 boundary dataset (with two documented exceptions - see DATA_SOURCES.md).
export const SUBCOUNTIES_BY_DISTRICT: Record<string, string[]> = subcountyData;

export function getAllDistricts(): string[] {
  const districts: string[] = [];
  Object.values(DISTRICTS_DATA).forEach((region) => {
    Object.values(region).forEach((subRegionDistricts) => {
      districts.push(...subRegionDistricts);
    });
  });
  return districts.sort();
}

export function getSubcounties(district: string | null): string[] {
  if (!district) return [];
  return SUBCOUNTIES_BY_DISTRICT[district] || [];
}

// Real district centroids [lat, lng], sourced from the same HDX dataset as
// SUBCOUNTIES_BY_DISTRICT (see DATA_SOURCES.md). Used to center the location
// picker map on the selected district instead of defaulting to all of Uganda.
export const DISTRICT_CENTROIDS: Record<string, [number, number]> = districtCentroidData as unknown as Record<string, [number, number]>;

const UGANDA_CENTER: [number, number] = [1.3733, 32.2903];

export function getDistrictCenter(district: string | null): [number, number] {
  if (!district) return UGANDA_CENTER;
  return DISTRICT_CENTROIDS[district] || UGANDA_CENTER;
}
