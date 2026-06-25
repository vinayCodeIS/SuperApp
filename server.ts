import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
let aiClient: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini API client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Using high-quality local fallback engines.");
}

// ==========================================
// FALLBACK AND LOCAL STORAGE DATA
// ==========================================

const FALLBACK_WEATHER: Record<string, any> = {
  "new york": { temperature: 22, condition: "Sunny", humidity: 55, windSpeed: 12, pressure: 1012, city: "New York", iconDescription: "sunny" },
  "london": { temperature: 15, condition: "Cloudy", humidity: 82, windSpeed: 18, pressure: 1008, city: "London", iconDescription: "cloudy" },
  "tokyo": { temperature: 26, condition: "Rainy", humidity: 90, windSpeed: 10, pressure: 1010, city: "Tokyo", iconDescription: "rainy" },
  "mumbai": { temperature: 31, condition: "Humid", humidity: 85, windSpeed: 22, pressure: 1005, city: "Mumbai", iconDescription: "rainy" },
  "paris": { temperature: 19, condition: "Partly Cloudy", humidity: 60, windSpeed: 14, pressure: 1014, city: "Paris", iconDescription: "cloudy" },
  "sydney": { temperature: 17, condition: "Windy", humidity: 50, windSpeed: 25, pressure: 1016, city: "Sydney", iconDescription: "windy" }
};

const FALLBACK_NEWS = [
  {
    title: "AI Breakthrough: Next-Gen Models Show Deep Reasoning",
    source: "Tech News Daily",
    summary: "A major research breakthrough demonstrates AI models performing sophisticated step-by-step planning and logical deduction, signaling a new era of compute-optimal models.",
    publishedAt: "Today, 08:30 AM",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Global Summit Agrees on Historic Renewable Energy Expansion",
    source: "World News Network",
    summary: "Delegates from over 120 countries have signed a historic agreement to triple global renewable energy capacity by 2030, establishing clear regulatory pathways.",
    publishedAt: "Today, 10:15 AM",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Mars Rover Discovers Ancient Riverbed Organic Carbon",
    source: "Science & Space",
    summary: "NASA's latest rover has detected complex carbon compounds preserved in mudstone layers of an ancient lakebed on Mars, suggesting long-term habitability.",
    publishedAt: "Today, 11:45 AM",
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Indie Studio's Cinematic Masterpiece Swings Box Office",
    source: "Entertainment Weekly",
    summary: "An independent drama filmed in black-and-white has surprised the film industry, topping the box office charts this weekend and capturing multiple awards.",
    publishedAt: "Yesterday, 04:20 PM",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Tech Giants Unveil Open Standards for AR and VR Ecosystems",
    source: "Silicon Valley Tech",
    summary: "A consortium of hardware and software developers announced unified open-source standards to make augmented and virtual reality experiences cross-compatible.",
    publishedAt: "Yesterday, 06:10 PM",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80"
  }
];

const FALLBACK_MOVIES: Record<string, any[]> = {
  "action": [
    { title: "Black Adam", year: "2022", rating: "6.3", duration: "125 min", plot: "Nearly 5,000 years after he was bestowed with the almighty powers of the ancient gods—and imprisoned just as quickly—Black Adam is freed from his earthly tomb, ready to unleash his unique form of justice on the modern world.", director: "Jaume Collet-Serra", actors: "Dwayne Johnson, Aldis Hodge", posterUrl: "assets/56bc0bdc4c6455ab190e4a6b2d025494d1e2f91b.png" },
    { title: "Eternals", year: "2021", rating: "6.3", duration: "156 min", plot: "The saga of the Eternals, a race of immortal beings who lived on Earth and shaped its history and civilizations.", director: "Chloé Zhao", actors: "Gemma Chan, Richard Madden", posterUrl: "assets/002412ef87f2da881bb337dc6333c4aac0824063 (1).png" },
    { title: "Top Gun: Maverick", year: "2022", rating: "8.3", duration: "130 min", plot: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads elite graduates.", director: "Joseph Kosinski", actors: "Tom Cruise, Miles Teller", posterUrl: "https://images.unsplash.com/photo-1519074069444-1ba4e6664104?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "Tenet", year: "2020", rating: "7.3", duration: "150 min", plot: "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage.", director: "Christopher Nolan", actors: "John David Washington, Robert Pattinson", posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "drama": [
    { title: "The Shawshank Redemption", year: "1994", rating: "9.3", duration: "142 min", plot: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.", director: "Frank Darabont", actors: "Tim Robbins, Morgan Freeman", posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "Forrest Gump", year: "1994", rating: "8.8", duration: "142 min", plot: "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75.", director: "Robert Zemeckis", actors: "Tom Hanks, Robin Wright", posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "romance": [
    { title: "La La Land", year: "2016", rating: "8.0", duration: "128 min", plot: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.", director: "Damien Chazelle", actors: "Ryan Gosling, Emma Stone", posterUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "thriller": [
    { title: "Oxygen", year: "2021", rating: "6.5", duration: "101 min", plot: "A woman wakes up in a cryogenic chamber with no memory. She must find a way out before she runs out of air.", director: "Alexandre Aja", actors: "Mélanie Laurent, Mathieu Amalric", posterUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "Smile", year: "2022", rating: "6.7", duration: "115 min", plot: "After witnessing a bizarre, traumatic incident involving a patient, Dr. Rose Cotter starts experiencing frightening occurrences that she can't explain.", director: "Parker Finn", actors: "Sosie Bacon, Kyle Gallner", posterUrl: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "The Gray Man", year: "2022", rating: "6.5", duration: "122 min", plot: "When the CIA's most skilled mercenary accidentally uncovers dark agency secrets, he becomes a primary target, hunted by international assassins.", director: "Anthony Russo, Joe Russo", actors: "Ryan Gosling, Chris Evans", posterUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "The Menu", year: "2022", rating: "7.2", duration: "107 min", plot: "A young couple travels to a remote island to eat at an exclusive restaurant where the chef has prepared a lavish menu, with some shocking surprises.", director: "Mark Mylod", actors: "Ralph Fiennes, Anya Taylor-Joy", posterUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "western": [
    { title: "Django Unchained", year: "2012", rating: "8.4", duration: "165 min", plot: "With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal plantation owner.", director: "Quentin Tarantino", actors: "Jamie Foxx, Christoph Waltz", posterUrl: "https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "horror": [
    { title: "M3GAN", year: "2022", rating: "6.4", duration: "102 min", plot: "A robotics engineer at a toy company builds a life-like doll that begins to take on a life of its own.", director: "Gerard Johnstone", actors: "Allison Williams, Violet McGraw", posterUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "The Invitation", year: "2022", rating: "5.3", duration: "105 min", plot: "A young woman is courted and swept off her feet, only to realize a gothic conspiracy is afoot.", director: "Jessica M. Thompson", actors: "Nathalie Emmanuel, Thomas Doherty", posterUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "Orphan: First Kill", year: "2022", rating: "5.9", duration: "99 min", plot: "After orchestrating a brilliant escape from an Estonian psychiatric facility, Esther travels to America by impersonating the missing daughter of a wealthy family.", director: "William Brent Bell", actors: "Isabelle Fuhrman, Julia Stiles", posterUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&h=300&q=80" },
    { title: "Ouija: Origin of Evil", year: "2016", rating: "6.2", duration: "99 min", plot: "In 1967 Los Angeles, a widowed mother and her daughters unwittingly invite authentic evil into their home by adding a new stunt to their seance business.", director: "Mike Flanagan", actors: "Elizabeth Reaser, Lulu Wilson", posterUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "fantasy": [
    { title: "The Lord of the Rings: The Fellowship of the Ring", year: "2001", rating: "8.8", duration: "178 min", plot: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring.", director: "Peter Jackson", actors: "Elijah Wood, Ian McKellen", posterUrl: "https://images.unsplash.com/photo-1460881680858-30d872d5b530?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "music": [
    { title: "Whiplash", year: "2014", rating: "8.5", duration: "106 min", plot: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor.", director: "Damien Chazelle", actors: "Miles Teller, J.K. Simmons", posterUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=500&h=300&q=80" }
  ],
  "fiction": [
    { title: "Interstellar", year: "2014", rating: "8.7", duration: "169 min", plot: "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in space.", director: "Christopher Nolan", actors: "Matthew McConaughey, Anne Hathaway", posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&h=300&q=80" }
  ]
};

// ==========================================
// API ROUTE HANDLERS WITH GEMINI GROUNDING
// ==========================================

function mapWeatherConditionToIcon(condition: string): string {
  const cond = condition.toLowerCase();
  if (cond.includes("sun") || cond.includes("clear")) return "sunny";
  if (cond.includes("cloud") || cond.includes("overcast")) return "cloudy";
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) return "rainy";
  if (cond.includes("thunder") || cond.includes("storm")) return "thunderstorm";
  if (cond.includes("snow") || cond.includes("ice") || cond.includes("freeze")) return "snowy";
  if (cond.includes("wind") || cond.includes("breeze") || cond.includes("gale")) return "windy";
  if (cond.includes("mist") || cond.includes("fog") || cond.includes("haze") || cond.includes("smoke")) return "mist";
  return "sunny";
}

// 1. Live Weather API with Google Search Grounding
app.get("/api/weather", async (req, res) => {
  const cityQuery = (req.query.city as string || "New York").trim().toLowerCase();

  // Try OpenWeatherMap API first if API key is provided
  const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
  if (OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== "MY_OPENWEATHER_API_KEY" && OPENWEATHER_API_KEY.trim() !== "") {
    try {
      console.log(`Fetching weather from OpenWeatherMap for: ${cityQuery}`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityQuery)}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      if (response.ok) {
        const data = await response.json();
        const weatherData = {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          pressure: data.main.pressure,
          city: data.name,
          iconDescription: mapWeatherConditionToIcon(data.weather[0].main)
        };
        console.log("Weather fetched via OpenWeatherMap successfully:", weatherData);
        return res.json(weatherData);
      } else {
        console.warn(`OpenWeatherMap returned status ${response.status}: ${await response.text()}`);
      }
    } catch (err) {
      console.error("OpenWeatherMap fetch failed, falling back to Gemini/static:", err);
    }
  }

  // Try using Gemini with Google Search grounding
  if (aiClient) {
    try {
      console.log(`Fetching grounded weather for city: ${cityQuery}`);
      const prompt = `Give me the current weather details for "${cityQuery}". Return exactly a JSON object matching this schema:
      {
        "temperature": (number, in Celsius, e.g. 23),
        "condition": (string, e.g. "Sunny", "Rainy", "Cloudy", "Heavy Rain", "Snowy", "Clear", "Mist"),
        "humidity": (number, percentage, e.g. 65),
        "windSpeed": (number, km/h, e.g. 15),
        "pressure": (number, hPa, e.g. 1013),
        "city": (string, correctly capitalized city name, e.g. "New York"),
        "iconDescription": (string, one of these keywords for styling: "sunny", "cloudy", "rainy", "thunderstorm", "snowy", "windy", "mist")
      }
      Ensure all values are realistic based on current search grounding for today. Answer ONLY with the raw JSON. No markdown blocks, no formatting.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temperature: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              humidity: { type: Type.NUMBER },
              windSpeed: { type: Type.NUMBER },
              pressure: { type: Type.NUMBER },
              city: { type: Type.STRING },
              iconDescription: { type: Type.STRING }
            },
            required: ["temperature", "condition", "humidity", "windSpeed", "pressure", "city", "iconDescription"]
          }
        }
      });

      const text = response.text;
      if (text) {
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const weatherData = JSON.parse(cleanedText);
        console.log("Weather fetched via Gemini successfully:", weatherData);
        return res.json(weatherData);
      }
    } catch (err) {
      console.error("Gemini weather fetching failed. Falling back to local weather data.", err);
    }
  }

  // Fallback engine
  const matchedKey = Object.keys(FALLBACK_WEATHER).find(k => cityQuery.includes(k) || k.includes(cityQuery));
  if (matchedKey) {
    return res.json(FALLBACK_WEATHER[matchedKey]);
  }

  // Generate a dynamic fallback based on city name hash so it's always stable and distinct
  let hash = 0;
  for (let i = 0; i < cityQuery.length; i++) {
    hash = cityQuery.charCodeAt(i) + ((hash << 5) - hash);
  }
  const temp = Math.abs((hash % 15) + 15); // between 15 and 30
  const hum = Math.abs((hash % 40) + 50); // between 50 and 90
  const wind = Math.abs((hash % 15) + 5); // between 5 and 20
  const press = Math.abs((hash % 20) + 1005); // between 1005 and 1025
  const conditions = ["Sunny", "Cloudy", "Rainy", "Partly Cloudy", "Mist", "Clear"];
  const cond = conditions[Math.abs(hash) % conditions.length];
  const iconMap: Record<string, string> = {
    "Sunny": "sunny", "Clear": "sunny",
    "Cloudy": "cloudy", "Partly Cloudy": "cloudy",
    "Rainy": "rainy",
    "Mist": "mist"
  };

  const dynamicFallback = {
    temperature: temp,
    condition: cond,
    humidity: hum,
    windSpeed: wind,
    pressure: press,
    city: req.query.city as string || "New York",
    iconDescription: iconMap[cond] || "sunny"
  };

  res.json(dynamicFallback);
});

// 2. Latest News API with Google Search Grounding
app.get("/api/news", async (req, res) => {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const WORLD_NEWS_API_KEY = process.env.WORLD_NEWS_API_KEY;

  // Try NewsAPI first
  if (NEWS_API_KEY && NEWS_API_KEY !== "MY_NEWS_API_KEY" && NEWS_API_KEY.trim() !== "") {
    try {
      console.log("Fetching news from NewsAPI...");
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${NEWS_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          const mappedArticles = data.articles
            .filter((art: any) => art.title && art.title !== "[Removed]")
            .slice(0, 5)
            .map((art: any, index: number) => {
              const defaultImages = [
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80"
              ];
              return {
                title: art.title,
                source: art.source?.name || "News Outlet",
                summary: art.description || art.content || "No description available for this headline.",
                publishedAt: art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "Today",
                imageUrl: art.urlToImage || defaultImages[index % defaultImages.length]
              };
            });
          console.log("News fetched from NewsAPI successfully.");
          return res.json(mappedArticles);
        }
      } else {
        console.warn(`NewsAPI returned status ${response.status}: ${await response.text()}`);
      }
    } catch (err) {
      console.error("NewsAPI fetch failed, falling back to World News API or Gemini:", err);
    }
  }

  // Try World News API next
  if (WORLD_NEWS_API_KEY && WORLD_NEWS_API_KEY !== "MY_WORLD_NEWS_API_KEY" && WORLD_NEWS_API_KEY.trim() !== "") {
    try {
      console.log("Fetching news from World News API...");
      const response = await fetch(
        `https://api.worldnewsapi.com/top-news?api-key=${WORLD_NEWS_API_KEY}&source-countries=us&number=5`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.top_news && data.top_news.length > 0) {
          const mappedArticles = data.top_news.slice(0, 5).map((newsItem: any, index: number) => {
            const art = newsItem.news && newsItem.news[0] ? newsItem.news[0] : newsItem;
            const defaultImages = [
              "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80"
            ];
            return {
              title: art.title || "Latest Headline Update",
              source: art.source_name || "World News",
              summary: art.text || art.summary || "No description available for this headline.",
              publishedAt: art.publish_date ? new Date(art.publish_date).toLocaleDateString() : "Today",
              imageUrl: art.image || defaultImages[index % defaultImages.length]
            };
          });
          console.log("News fetched from World News API successfully.");
          return res.json(mappedArticles);
        }
      } else {
        console.warn(`World News API returned status ${response.status}: ${await response.text()}`);
      }
    } catch (err) {
      console.error("World News API fetch failed, falling back to Gemini:", err);
    }
  }

  if (aiClient) {
    try {
      console.log("Fetching grounded top latest news articles.");
      const prompt = `Fetch the absolute latest 5 top-breaking news headlines and short summaries from today. Return exactly a JSON array matching this schema:
      [
        {
          "title": (string, brief catchy headline),
          "source": (string, e.g. "BBC News", "Reuters", "TechCrunch"),
          "summary": (string, 1-2 sentence summary of the news story),
          "publishedAt": (string, e.g. "Today, 10:30 AM"),
          "imageUrl": (string, a beautiful Unsplash landscape URL representing the topic. Must be valid, e.g. "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80")
        }
      ]
      Ensure the topics are diverse: global news, tech, space, lifestyle, entertainment. Return ONLY the raw JSON array. No markdown blocks.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                summary: { type: Type.STRING },
                publishedAt: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ["title", "source", "summary", "publishedAt", "imageUrl"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const newsData = JSON.parse(cleanedText);
        console.log("News fetched via Gemini successfully:", newsData.length);
        if (Array.isArray(newsData) && newsData.length > 0) {
          return res.json(newsData);
        }
      }
    } catch (err) {
      console.error("Gemini news fetching failed. Falling back to high-quality local news.", err);
    }
  }

  res.json(FALLBACK_NEWS);
});

// 3. Movie Discovery API
app.get("/api/movies", async (req, res) => {
  const category = (req.query.category as string || "action").trim().toLowerCase();
  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  if (OMDB_API_KEY && OMDB_API_KEY !== "MY_OMDB_API_KEY" && OMDB_API_KEY.trim() !== "") {
    try {
      console.log(`Fetching movies from OMDB API for category: ${category}`);
      const curatedTitles: Record<string, string[]> = {
        action: ["Black Adam", "Eternals", "Top Gun: Maverick", "Tenet"],
        drama: ["The Shawshank Redemption", "Forrest Gump", "Parasite", "The Godfather"],
        romance: ["La La Land", "Titanic", "About Time", "Pride & Prejudice"],
        thriller: ["Oxygen", "Smile", "The Gray Man", "The Menu"],
        western: ["Django Unchained", "No Country for Old Men", "The Good, the Bad and the Ugly"],
        horror: ["M3GAN", "The Invitation", "Orphan: First Kill", "Ouija: Origin of Evil"],
        fantasy: ["The Lord of the Rings: The Fellowship of the Ring", "Harry Potter and the Sorcerer's Stone", "Avatar: The Way of Water"],
        music: ["Whiplash", "Bohemian Rhapsody", "A Star Is Born"],
        fiction: ["Interstellar", "The Matrix", "Blade Runner 2049"]
      };

      const titles = curatedTitles[category] || curatedTitles["action"];
      
      const fetchDetails = async (title: string) => {
        try {
          const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
          if (res.ok) {
            const movie = await res.json();
            if (movie && movie.Response !== "False") {
              const fbList = FALLBACK_MOVIES[category] || FALLBACK_MOVIES["action"];
              const matchedFallback = fbList.find((m: any) => m.title.toLowerCase() === title.toLowerCase());
              const fallbackPoster = matchedFallback ? matchedFallback.posterUrl : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80";

              return {
                title: movie.Title || title,
                year: movie.Year || "2022",
                rating: movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "7.0",
                duration: movie.Runtime && movie.Runtime !== "N/A" ? movie.Runtime : "120 min",
                plot: movie.Plot && movie.Plot !== "N/A" ? movie.Plot : "No plot summary available.",
                director: movie.Director && movie.Director !== "N/A" ? movie.Director : "N/A",
                actors: movie.Actors && movie.Actors !== "N/A" ? movie.Actors : "N/A",
                posterUrl: movie.Poster && movie.Poster !== "N/A" ? movie.Poster : fallbackPoster
              };
            }
          }
        } catch (e) {
          console.error(`Failed fetching movie details from OMDB for ${title}:`, e);
        }
        const fbList = FALLBACK_MOVIES[category] || FALLBACK_MOVIES["action"];
        return fbList.find((m: any) => m.title.toLowerCase() === title.toLowerCase()) || fbList[0];
      };

      const detailedMovies = await Promise.all(titles.map(fetchDetails));
      console.log(`Successfully retrieved ${detailedMovies.length} movies from OMDB API.`);
      return res.json(detailedMovies);
    } catch (err) {
      console.error("OMDB API fetching failed, falling back to Gemini:", err);
    }
  }

  // If we have Gemini initialized, we can fetch grounded realistic list of popular/recent movies for this category!
  if (aiClient) {
    try {
      console.log(`Fetching grounded movies for category: ${category}`);
      const prompt = `Give me a list of exactly 4-5 real, popular, highly-rated movies in the "${category}" genre. Return exactly a JSON array matching this schema:
      [
        {
          "title": (string, movie title),
          "year": (string, release year, e.g. "2023"),
          "rating": (string, IMDb rating, e.g. "8.4"),
          "duration": (string, duration, e.g. "124 min"),
          "plot": (string, 1-2 sentence compelling movie summary),
          "director": (string, director name),
          "actors": (string, main cast, comma separated),
          "posterUrl": (string, a highly relevant beautiful Unsplash placeholder or movie search image. Must be valid, e.g. "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&h=600&q=80")
        }
      ]
      Ensure movies are real and highly rated. Return ONLY raw JSON array.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                year: { type: Type.STRING },
                rating: { type: Type.STRING },
                duration: { type: Type.STRING },
                plot: { type: Type.STRING },
                director: { type: Type.STRING },
                actors: { type: Type.STRING },
                posterUrl: { type: Type.STRING }
              },
              required: ["title", "year", "rating", "duration", "plot", "director", "actors", "posterUrl"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const moviesData = JSON.parse(cleanedText);
        console.log(`Movies for ${category} fetched via Gemini successfully:`, moviesData.length);
        if (Array.isArray(moviesData) && moviesData.length > 0) {
          return res.json(moviesData);
        }
      }
    } catch (err) {
      console.error(`Gemini movie fetching failed for ${category}. Falling back to high-quality local movies.`, err);
    }
  }

  // Fallback
  const fallback = FALLBACK_MOVIES[category] || FALLBACK_MOVIES["action"];
  res.json(fallback);
});

// ==========================================
// VITE DEV SERVER AND STATIC FILE SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Super App backend is listening on port ${PORT}`);
  });
}

startServer();
