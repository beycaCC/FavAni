import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER,
    tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
    res.send("pong");
});


// "add your endpoints below this line"
// ************************ Fetching data from local MySQL database ************************
// get Profile information of authenticated user
app.get("/me", requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;

    const user = await prisma.user.findUnique({
        where: {
        auth0Id,
        },
    });

    res.json(user);
});

// this endpoint is used by the client to verify the user status and to make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {
    const auth0Id = req.auth.payload.sub;
    const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}email`];
    const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}name`];

    console.log("____________________");
    console.log(req.auth.payload);
    console.log(auth0Id, email, name);
    console.log("____________________");

    const user = await prisma.user.findUnique({
        where: {
          auth0Id,
        },
    });

    if (user) {
        res.json(user);
    } else {
        const newUser = await prisma.user.create({
        data: {
            email,
            auth0Id,
            name,
          },
        });

        res.json(newUser);
    }
});


// ================ handle adding anime to the watching list db table ================ 
app.post("/api/watchingList", requireAuth, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const { animeName, coverImage } = req.body;

        const user = await prisma.user.findUnique({
        where: {
            auth0Id,
        },
        });

        // Check if the user exists
        if (!user) {
        return res.status(404).json({ error: "User not found" });
        }

        // Check if the anime already exists in the watching list for the user
        const existingAnime = await prisma.animeWaitingForWatch.findFirst({
            where: {
            userId: user.id,
            animeName,
            },
        });
  
        if (existingAnime) {
            return res.status(400).json({ error: "Anime already in watching list" });
        }

        const newAnime = await prisma.animeWaitingForWatch.create({
        data: {
            animeName,
            coverImage,
            userId: user.id,
        },
        });

        res.json(newAnime);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    }
});


// ================  Add anime to the favorite list ================ 
app.post("/api/favoriteList", requireAuth, async (req, res) => {
    try {
        const auth0Id = req.auth.payload.sub;
        const { animeTitle, coverImage } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                auth0Id,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the anime already exists in the favorite list for the user
        const existingAnime = await prisma.savedAnimeItem.findFirst({
            where: {
                userId: user.id,
                animeTitle,
            },
        });

        if (existingAnime) {
            return res.status(400).json({ error: "Anime already in favorite list" });
        }

        const newAnime = await prisma.savedAnimeItem.create({
            data: {
                animeTitle,
                coverImage,
                userId: user.id,
            },
        });

        res.json(newAnime);
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ error: "An error occurred" });
        }
});


// ================  Fetch watching list ================ 
app.get("/api/watchingList", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        animesWaitingForWatch: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.animesWaitingForWatch);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});


// ================  Fetch favorite list ================ 
app.get("/api/favoriteList", requireAuth, async (req, res) => {
  try {
    const auth0Id = req.auth.payload.sub;

    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
      include: {
        animes: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.animes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});



// ************************ Fetching data from external APIs ************************
// ================ get 20 most recent animes ================
app.get('/api/recentAnime', async (req, res) => {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 20) {
          media(sort: START_DATE_DESC, type: ANIME) {
            id
            title {
              romaji
              english
            }
            type
            coverImage {
              large
            }
            episodes
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const animeList = data.data.Page.media;
    res.json(animeList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

 
// ================ get 10 most top animes ================
app.get('/api/topAnime', async (req, res) => {
  try {
    const query = `
      query {
        Page(page: 1, perPage: 10) {
          media(sort: FAVOURITES_DESC, type: ANIME) {
            id
            title {
              romaji
              english
            }
            type
            coverImage {
              large
            }
            episodes
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const animeList = data.data.Page.media;
    res.json(animeList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// ================ Get detailed infos for each specific anime id ================
app.get('/api/anime/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;

    const query = `
      query ($id: Int) {
        Media(id: $id) {
          id
          title {
            romaji
            english
          }
          type
          status
          season
          trailer {
            site
          }
          trailer {
            thumbnail
          }
          coverImage {
            large
          }
          bannerImage
          episodes
          description(asHtml: true)
        }
      }
    `;

    const variables = { id: parseInt(animeId) }; // Convert animeId to integer

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    const animeDetails = data.data.Media;
    res.json(animeDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// ================  Search anime ================ 
app.get('/api/search', async (req, res) => {
  try {
    const searchTerm = req.query.term;

    // Construct GraphQL query to search for anime titles that exactly match the search term
    const query = `
      query ($searchTerm: String) {
        Page(page: 1, perPage: 20) {
          media(search: $searchTerm, type: ANIME) {
            id
            title {
              romaji
              english
            }
            type
            coverImage {
              large
            }
            episodes
          }
        }
      }
    `;

    const variables = { searchTerm };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    const animeList = data.data.Page.media;

    res.json(animeList);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// ================ fetch the trialer for each anime on youtube ================ 
const API_KEY = ''; // assign youtube api key here

app.get("/youtubeTrailer/:animeName", (req, res) => {

    const {animeName} = req.params;
    const query = `${animeName} trailer`;
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&type=video&q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                res.json({ videoId });
            } else {
                res.status(404).json({ error: "No video found" });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});


// Set server running portal
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});



// app.listen(8000, () => {
//   console.log("Server running on http://localhost:8000 🎉 🚀");
// });