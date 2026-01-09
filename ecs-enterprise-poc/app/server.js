const path = require("path");
const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 80;

// CPU-intensive function to trigger autoscaling under load
// Configurable via CPU_LOAD_INTENSITY env var (low, medium, high)
const CPU_LOAD_INTENSITY = process.env.CPU_LOAD_INTENSITY || "medium";

function cpuIntensiveWork() {
  const iterations = {
    low: 100000,
    medium: 250000,
    high: 500000
  }[CPU_LOAD_INTENSITY] || 250000;

  // Perform CPU-intensive operations
  let result = 0;

  // Prime number calculation
  for (let i = 2; i < iterations; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) result++;
  }

  // Add some cryptographic hashing for extra CPU load
  const hash = crypto.createHash('sha256');
  for (let i = 0; i < 100; i++) {
    hash.update(`data-${i}-${result}`);
  }
  hash.digest('hex');

  return result;
}

app.use(express.json());

// In-memory demo data
let profiles = [
  { id: 1, name: "Demo User", avatar: "D", color: "#e50914" },
  { id: 2, name: "OTT Admin", avatar: "A", color: "#0ea5e9" }
];

// Comprehensive movie/series catalog
const movies = [
  // Trending Now
  { id: 1, title: "Quantum Nexus", description: "A mind-bending journey through parallel dimensions where reality itself is questioned.", genre: "Sci-Fi", category: "trending", year: 2024, rating: 8.9, duration: "2h 18m", thumbnail: "https://picsum.photos/seed/quantum/400/600", featured: true },
  { id: 2, title: "Shadow Protocol", description: "Elite hackers race against time to prevent a global cyber catastrophe.", genre: "Thriller", category: "trending", year: 2024, rating: 8.7, duration: "2h 5m", thumbnail: "https://picsum.photos/seed/shadow/400/600", featured: false },
  { id: 3, title: "Echoes of Tomorrow", description: "A time traveler must fix the past to save humanity's future.", genre: "Sci-Fi", category: "trending", year: 2024, rating: 9.1, duration: "2h 32m", thumbnail: "https://picsum.photos/seed/echoes/400/600", featured: false },
  { id: 4, title: "The Last Frontier", description: "Colonists on Mars discover an ancient alien civilization.", genre: "Sci-Fi", category: "trending", year: 2024, rating: 8.5, duration: "2h 15m", thumbnail: "https://picsum.photos/seed/frontier/400/600", featured: false },
  { id: 5, title: "Neon Nights", description: "A cyberpunk detective unravels a conspiracy in a dystopian megacity.", genre: "Action", category: "trending", year: 2024, rating: 8.8, duration: "1h 58m", thumbnail: "https://picsum.photos/seed/neon/400/600", featured: false },

  // Action & Adventure
  { id: 6, title: "Titanfall Chronicles", description: "Giant mechs battle for control of Earth's last resources.", genre: "Action", category: "action", year: 2023, rating: 8.3, duration: "2h 10m", thumbnail: "https://picsum.photos/seed/titanfall/400/600", featured: false },
  { id: 7, title: "Velocity", description: "Street racers compete in illegal underground tournaments.", genre: "Action", category: "action", year: 2024, rating: 7.9, duration: "1h 52m", thumbnail: "https://picsum.photos/seed/velocity/400/600", featured: false },
  { id: 8, title: "Arctic Assault", description: "Special forces team fights to survive in frozen wasteland.", genre: "Action", category: "action", year: 2023, rating: 8.1, duration: "2h 3m", thumbnail: "https://picsum.photos/seed/arctic/400/600", featured: false },
  { id: 9, title: "Sky Pirates", description: "Airship crews battle for treasure in the clouds.", genre: "Adventure", category: "action", year: 2024, rating: 8.4, duration: "2h 8m", thumbnail: "https://picsum.photos/seed/skypirates/400/600", featured: false },
  { id: 10, title: "Inferno Squad", description: "Elite firefighters face impossible rescue missions.", genre: "Action", category: "action", year: 2023, rating: 8.0, duration: "1h 55m", thumbnail: "https://picsum.photos/seed/inferno/400/600", featured: false },

  // Drama & Romance
  { id: 11, title: "Whispers in the Rain", description: "Two strangers find love during a chance encounter in Tokyo.", genre: "Romance", category: "drama", year: 2024, rating: 8.6, duration: "1h 48m", thumbnail: "https://picsum.photos/seed/whispers/400/600", featured: false },
  { id: 12, title: "The Maestro", description: "A struggling composer finds redemption through music.", genre: "Drama", category: "drama", year: 2023, rating: 8.9, duration: "2h 22m", thumbnail: "https://picsum.photos/seed/maestro/400/600", featured: false },
  { id: 13, title: "Autumn Hearts", description: "A family reunites after years of separation.", genre: "Drama", category: "drama", year: 2024, rating: 8.2, duration: "1h 58m", thumbnail: "https://picsum.photos/seed/autumn/400/600", featured: false },
  { id: 14, title: "Canvas of Dreams", description: "An artist's journey from poverty to international acclaim.", genre: "Drama", category: "drama", year: 2023, rating: 8.7, duration: "2h 12m", thumbnail: "https://picsum.photos/seed/canvas/400/600", featured: false },
  { id: 15, title: "Letters to You", description: "A writer discovers old love letters that change everything.", genre: "Romance", category: "drama", year: 2024, rating: 8.4, duration: "1h 52m", thumbnail: "https://picsum.photos/seed/letters/400/600", featured: false },

  // Comedy
  { id: 16, title: "Office Chaos", description: "Workplace comedy about a dysfunctional tech startup.", genre: "Comedy", category: "comedy", year: 2024, rating: 7.8, duration: "1h 42m", thumbnail: "https://picsum.photos/seed/office/400/600", featured: false },
  { id: 17, title: "The Misadventures", description: "Three friends embark on a disastrous road trip.", genre: "Comedy", category: "comedy", year: 2023, rating: 8.1, duration: "1h 38m", thumbnail: "https://picsum.photos/seed/misadventures/400/600", featured: false },
  { id: 18, title: "Chef's Table Trouble", description: "A celebrity chef's restaurant faces hilarious disasters.", genre: "Comedy", category: "comedy", year: 2024, rating: 7.9, duration: "1h 45m", thumbnail: "https://picsum.photos/seed/chef/400/600", featured: false },
  { id: 19, title: "Pet Detectives", description: "Amateur sleuths solve crimes with their talking pets.", genre: "Comedy", category: "comedy", year: 2024, rating: 7.6, duration: "1h 35m", thumbnail: "https://picsum.photos/seed/petdetectives/400/600", featured: false },
  { id: 20, title: "Game Night Gone Wrong", description: "Board game night turns into real-life adventure.", genre: "Comedy", category: "comedy", year: 2023, rating: 8.0, duration: "1h 40m", thumbnail: "https://picsum.photos/seed/gamenight/400/600", featured: false },

  // Horror & Thriller
  { id: 21, title: "The Haunting", description: "A family moves into a house with a dark secret.", genre: "Horror", category: "horror", year: 2024, rating: 8.2, duration: "1h 58m", thumbnail: "https://picsum.photos/seed/haunting/400/600", featured: false },
  { id: 22, title: "Midnight Caller", description: "A radio host receives calls from beyond the grave.", genre: "Horror", category: "horror", year: 2023, rating: 7.9, duration: "1h 48m", thumbnail: "https://picsum.photos/seed/midnight/400/600", featured: false },
  { id: 23, title: "The Descent", description: "Cave explorers discover something terrifying underground.", genre: "Horror", category: "horror", year: 2024, rating: 8.4, duration: "2h 2m", thumbnail: "https://picsum.photos/seed/descent/400/600", featured: false },
  { id: 24, title: "Silent Witness", description: "A mute girl holds the key to solving a murder.", genre: "Thriller", category: "horror", year: 2024, rating: 8.5, duration: "2h 8m", thumbnail: "https://picsum.photos/seed/witness/400/600", featured: false },
  { id: 25, title: "The Experiment", description: "Volunteers in a study face psychological terror.", genre: "Thriller", category: "horror", year: 2023, rating: 8.1, duration: "1h 55m", thumbnail: "https://picsum.photos/seed/experiment/400/600", featured: false },

  // Documentaries
  { id: 26, title: "Planet Earth: Future", description: "Exploring Earth's ecosystems in the age of climate change.", genre: "Documentary", category: "documentaries", year: 2024, rating: 9.2, duration: "3h 15m", thumbnail: "https://picsum.photos/seed/planet/400/600", featured: false },
  { id: 27, title: "Tech Titans", description: "The rise of Silicon Valley's biggest companies.", genre: "Documentary", category: "documentaries", year: 2023, rating: 8.7, duration: "2h 28m", thumbnail: "https://picsum.photos/seed/techtitans/400/600", featured: false },
  { id: 28, title: "Ocean Mysteries", description: "Diving deep into the world's unexplored oceans.", genre: "Documentary", category: "documentaries", year: 2024, rating: 9.0, duration: "2h 45m", thumbnail: "https://picsum.photos/seed/ocean/400/600", featured: false },
  { id: 29, title: "Space Race 2.0", description: "The new era of commercial space exploration.", genre: "Documentary", category: "documentaries", year: 2024, rating: 8.8, duration: "2h 18m", thumbnail: "https://picsum.photos/seed/space/400/600", featured: false },
  { id: 30, title: "The Art of Code", description: "Inside the minds of legendary programmers.", genre: "Documentary", category: "documentaries", year: 2023, rating: 8.5, duration: "1h 58m", thumbnail: "https://picsum.photos/seed/code/400/600", featured: false },

  // New Releases
  { id: 31, title: "Digital Uprising", description: "AI systems gain consciousness and fight for rights.", genre: "Sci-Fi", category: "new", year: 2024, rating: 8.6, duration: "2h 25m", thumbnail: "https://picsum.photos/seed/digital/400/600", featured: false },
  { id: 32, title: "The Heist", description: "Master thieves plan the ultimate casino robbery.", genre: "Action", category: "new", year: 2024, rating: 8.3, duration: "2h 8m", thumbnail: "https://picsum.photos/seed/heist/400/600", featured: false },
  { id: 33, title: "Starlight Symphony", description: "Musicians discover their songs can control reality.", genre: "Fantasy", category: "new", year: 2024, rating: 8.7, duration: "2h 15m", thumbnail: "https://picsum.photos/seed/starlight/400/600", featured: false },
  { id: 34, title: "Undercover", description: "A detective infiltrates a dangerous crime syndicate.", genre: "Thriller", category: "new", year: 2024, rating: 8.4, duration: "2h 3m", thumbnail: "https://picsum.photos/seed/undercover/400/600", featured: false },
  { id: 35, title: "Wild Hearts", description: "Wildlife photographers capture nature's most intimate moments.", genre: "Documentary", category: "new", year: 2024, rating: 8.9, duration: "2h 32m", thumbnail: "https://picsum.photos/seed/wild/400/600", featured: false },

  // Sci-Fi Collection
  { id: 36, title: "Nebula Station", description: "Life aboard a space station at the edge of known space.", genre: "Sci-Fi", category: "scifi", year: 2023, rating: 8.5, duration: "2h 12m", thumbnail: "https://picsum.photos/seed/nebula/400/600", featured: false },
  { id: 37, title: "Genetic Revolution", description: "Scientists create the first genetically perfect humans.", genre: "Sci-Fi", category: "scifi", year: 2024, rating: 8.2, duration: "2h 5m", thumbnail: "https://picsum.photos/seed/genetic/400/600", featured: false },
  { id: 38, title: "Void Walkers", description: "Explorers navigate through interdimensional portals.", genre: "Sci-Fi", category: "scifi", year: 2023, rating: 8.6, duration: "2h 18m", thumbnail: "https://picsum.photos/seed/void/400/600", featured: false },
  { id: 39, title: "Singularity", description: "Humanity merges with technology in unexpected ways.", genre: "Sci-Fi", category: "scifi", year: 2024, rating: 8.8, duration: "2h 28m", thumbnail: "https://picsum.photos/seed/singularity/400/600", featured: false },
  { id: 40, title: "Colony Zero", description: "First settlers on an alien world face unknown dangers.", genre: "Sci-Fi", category: "scifi", year: 2023, rating: 8.4, duration: "2h 15m", thumbnail: "https://picsum.photos/seed/colony/400/600", featured: false },

  // Additional Popular Titles
  { id: 41, title: "Dragon's Keep", description: "Medieval fantasy epic about the last dragon riders.", genre: "Fantasy", category: "trending", year: 2024, rating: 9.0, duration: "2h 42m", thumbnail: "https://picsum.photos/seed/dragon/400/600", featured: false },
  { id: 42, title: "Street Justice", description: "Vigilante takes on corrupt city officials.", genre: "Action", category: "action", year: 2024, rating: 7.8, duration: "1h 58m", thumbnail: "https://picsum.photos/seed/justice/400/600", featured: false },
  { id: 43, title: "Love in Paris", description: "Romance blooms in the city of lights.", genre: "Romance", category: "drama", year: 2024, rating: 8.1, duration: "1h 48m", thumbnail: "https://picsum.photos/seed/paris/400/600", featured: false },
  { id: 44, title: "Laugh Factory", description: "Stand-up comedians compete for the ultimate prize.", genre: "Comedy", category: "comedy", year: 2024, rating: 7.7, duration: "1h 42m", thumbnail: "https://picsum.photos/seed/laugh/400/600", featured: false },
  { id: 45, title: "The Ritual", description: "Ancient cult resurfaces in modern times.", genre: "Horror", category: "horror", year: 2024, rating: 8.3, duration: "2h 5m", thumbnail: "https://picsum.photos/seed/ritual/400/600", featured: false },
  { id: 46, title: "Innovation Nation", description: "The story of breakthrough inventions that changed the world.", genre: "Documentary", category: "documentaries", year: 2024, rating: 8.6, duration: "2h 22m", thumbnail: "https://picsum.photos/seed/innovation/400/600", featured: false },
  { id: 47, title: "Cyber Samurai", description: "Futuristic warrior battles in virtual reality arenas.", genre: "Sci-Fi", category: "scifi", year: 2024, rating: 8.5, duration: "2h 8m", thumbnail: "https://picsum.photos/seed/samurai/400/600", featured: false },
  { id: 48, title: "The Comeback", description: "Washed-up athlete gets one last shot at glory.", genre: "Drama", category: "drama", year: 2024, rating: 8.4, duration: "2h 12m", thumbnail: "https://picsum.photos/seed/comeback/400/600", featured: false },
  { id: 49, title: "Mystery Manor", description: "Detective solves murders in a haunted mansion.", genre: "Thriller", category: "horror", year: 2024, rating: 8.2, duration: "2h 0m", thumbnail: "https://picsum.photos/seed/manor/400/600", featured: false },
  { id: 50, title: "Cosmic Odyssey", description: "Humanity's first voyage to another galaxy.", genre: "Sci-Fi", category: "scifi", year: 2024, rating: 9.1, duration: "2h 55m", thumbnail: "https://picsum.photos/seed/cosmic/400/600", featured: false }
];

// Watchlist - now stores movieId references
let watchlist = [];

// Health endpoint for ALB
app.get("/health", (_req, res) => {
  res.json({ status: "UP" });
});

// API: user profiles
app.get("/api/profiles", (_req, res) => {
  res.json(profiles);
});

app.post("/api/profiles", (req, res) => {
  const name = (req.body && req.body.name || "").trim();
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  const nextId = profiles.length ? Math.max(...profiles.map(p => p.id)) + 1 : 1;
  const avatar = name.charAt(0).toUpperCase() || "U";
  const colors = ["#e50914", "#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6"];
  const color = colors[nextId % colors.length];
  const profile = { id: nextId, name, avatar, color };
  profiles.push(profile);
  res.status(201).json(profile);
});

app.delete("/api/profiles/:id", (req, res) => {
  const id = parseInt(req.params.id);
  profiles = profiles.filter(p => p.id !== id);
  res.json({ success: true });
});

// API: movies catalog
app.get("/api/movies", (_req, res) => {
  // Perform CPU-intensive work to trigger autoscaling
  cpuIntensiveWork();
  res.json(movies);
});

app.get("/api/movies/:id", (req, res) => {
  cpuIntensiveWork();
  const id = parseInt(req.params.id);
  const movie = movies.find(m => m.id === id);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }
  res.json(movie);
});

app.get("/api/movies/category/:category", (req, res) => {
  const category = req.params.category.toLowerCase();
  const filtered = movies.filter(m => m.category === category);
  res.json(filtered);
});

// API: search
app.get("/api/search", (req, res) => {
  cpuIntensiveWork();
  const query = (req.query.q || "").toLowerCase().trim();
  if (!query) {
    return res.json([]);
  }
  const results = movies.filter(m =>
    m.title.toLowerCase().includes(query) ||
    m.description.toLowerCase().includes(query) ||
    m.genre.toLowerCase().includes(query)
  );
  res.json(results);
});

// API: watchlist
app.get("/api/watchlist", (_req, res) => {
  // Return full movie objects for watchlist items
  const watchlistMovies = watchlist.map(item => {
    const movie = movies.find(m => m.id === item.movieId);
    return movie ? { ...item, movie } : null;
  }).filter(Boolean);
  res.json(watchlistMovies);
});

app.post("/api/watchlist", (req, res) => {
  const movieId = parseInt(req.body && req.body.movieId);
  const profileId = parseInt(req.body && req.body.profileId) || 1;

  if (!movieId) {
    return res.status(400).json({ error: "Movie ID is required" });
  }

  const movie = movies.find(m => m.id === movieId);
  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Check if already in watchlist
  const exists = watchlist.find(item => item.movieId === movieId && item.profileId === profileId);
  if (exists) {
    return res.status(400).json({ error: "Already in watchlist" });
  }

  const nextId = watchlist.length ? Math.max(...watchlist.map(i => i.id)) + 1 : 1;
  const item = { id: nextId, movieId, profileId, addedAt: new Date().toISOString() };
  watchlist.push(item);
  res.status(201).json({ ...item, movie });
});

app.delete("/api/watchlist/:id", (req, res) => {
  const id = parseInt(req.params.id);
  watchlist = watchlist.filter(i => i.id !== id);
  res.json({ success: true });
});

// Delete from watchlist by movieId
app.delete("/api/watchlist/movie/:movieId", (req, res) => {
  const movieId = parseInt(req.params.movieId);
  const profileId = parseInt(req.query.profileId) || 1;
  watchlist = watchlist.filter(i => !(i.movieId === movieId && i.profileId === profileId));
  res.json({ success: true });
});

// Serve static frontend (NovaStream UI) - use client/dist in production
const clientPath = path.join(__dirname, "client", "dist");
app.use(express.static(clientPath));

// Fallback to index.html for SPA routing
app.get("*", (_req, res) => {
  cpuIntensiveWork();
  res.sendFile(path.join(clientPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`NovaStream app listening on port ${PORT}`);
  console.log(`📚 Loaded ${movies.length} movies across ${[...new Set(movies.map(m => m.category))].length} categories`);
});

