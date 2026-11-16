export type SampleCook = {
  id: string;
  name: string;
  cuisine: string;
  specialty: string;
  zone: string;
  rating: number;
  dish: string;
  priceEur: number;
  photo: string;
};

export type SampleReview = {
  id: string;
  cookId: string;
  author: string;
  rating: number;
  comment: string;
};

export const sampleCooks: SampleCook[] = [
  {
    id: "camille",
    name: "Camille Laurent",
    cuisine: "French",
    specialty: "Seasonal French cooking",
    zone: "Paris 11th",
    rating: 5,
    dish: "Herb roast chicken",
    priceEur: 85,
    photo: "/samples/camille-chicken.jpg",
  },
  {
    id: "marco",
    name: "Marco Bellini",
    cuisine: "Italian",
    specialty: "Handmade pasta",
    zone: "Paris 6th",
    rating: 4.5,
    dish: "Tagliatelle al ragù",
    priceEur: 72,
    photo: "/samples/marco-pasta.jpg",
  },
  {
    id: "aiko",
    name: "Aiko Tanaka",
    cuisine: "Japanese",
    specialty: "Home-style Japanese",
    zone: "Paris 3rd",
    rating: 5,
    dish: "Miso glazed salmon",
    priceEur: 90,
    photo: "/samples/aiko-salmon.jpg",
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    cuisine: "Mexican",
    specialty: "Family Mexican cooking",
    zone: "Paris 18th",
    rating: 4.5,
    dish: "Slow-cooked pork tacos",
    priceEur: 68,
    photo: "/samples/sofia-tacos.jpg",
  },
];

export const sampleReviews: SampleReview[] = [
  {
    id: "emma-camille",
    cookId: "camille",
    author: "Emma",
    rating: 5,
    comment:
      "Camille cooked for my parents' anniversary. The chicken was perfect, and she left the kitchen tidy.",
  },
  {
    id: "noah-camille",
    cookId: "camille",
    author: "Noah",
    rating: 5,
    comment: "Calm and precise. The herbs tasted like the market that morning.",
  },
  {
    id: "james-marco",
    cookId: "marco",
    author: "James",
    rating: 5,
    comment: "The pasta tasted like Sunday lunch at his family's table. Our guests asked for the recipe.",
  },
  {
    id: "claire-marco",
    cookId: "marco",
    author: "Claire",
    rating: 4,
    comment: "Generous portions and a relaxed evening. I would book him again on a weeknight.",
  },
  {
    id: "priya-aiko",
    cookId: "aiko",
    author: "Priya",
    rating: 5,
    comment: "The salmon was delicate and the table felt considered. A quiet, beautiful meal.",
  },
  {
    id: "hugo-aiko",
    cookId: "aiko",
    author: "Hugo",
    rating: 5,
    comment: "Aiko worked in our small kitchen without any fuss. Every plate was balanced.",
  },
  {
    id: "lucas-sofia",
    cookId: "sofia",
    author: "Lucas",
    rating: 5,
    comment: "The tacos were the center of the night. Sofia made the room feel like a celebration.",
  },
  {
    id: "maya-sofia",
    cookId: "sofia",
    author: "Maya",
    rating: 4,
    comment: "Bright, homemade food and a warm presence. Easy to share with friends at home.",
  },
];

export function reviewsForCook(cookId: string) {
  return sampleReviews.filter((review) => review.cookId === cookId);
}
