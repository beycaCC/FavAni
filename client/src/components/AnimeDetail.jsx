import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from '../utils/NavBar';


function parseParagraph(paragraph) {
    const cleanText = paragraph.replace(/<[^>]*>/g, '');
    const trimmedText = cleanText.trim();
    const withoutSource = trimmedText.replace(/\(Source: MAL Rewrite\)/g, '');
    return withoutSource;
}



function AnimeDetail() {
    const { animeId } = useParams();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [bannerHeight, setBannerHeight] = useState(0);
    const [bannerZoom, setBannerZoom] = useState(1);
    const [videoId, setVideoId] = useState(null);
    const [animeName, setAnimeName] = useState("");
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();


    // get cooresponding detailed info for current anime
    useEffect(() => {
        fetch(`https://assignment-03-assignment3-yiyang.onrender.com/api/anime/${animeId}`)
            .then(response => response.json())
            .then(data => {
                data.description = parseParagraph(data.description);
                if (data.episodes == null) {
                    data.episodes = "unknown";
                }
                if (data.bannerImage == null) {
                    data.bannerImage = "https://t4.ftcdn.net/jpg/05/28/90/43/360_F_528904357_wRur2TnRmUKXgRnbrSF8CYewb6aNgZ9S.jpg";
                }
                if (data.title.english == null) {
                    data.title.english = data.title.romaji;
                }
                setAnimeName(data.title.english);
                setAnimeDetails(data);
            })
            .catch(error => console.error('Error:', error));
    }, [animeId]);


    // get banner's height to help setting the cover image position later
    useEffect(() => {
        const bannerImg = document.getElementById('banner-img');
        if (bannerImg) {
            setBannerHeight(bannerImg.clientHeight);
        }
    }, [animeDetails]);


    // handle scroll motivation
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const newZoom = 1 + scrollY * 0.001; 
            setBannerZoom(newZoom);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);


    // Fetch the trailer video ID from the backend
    useEffect(() => {
        if (animeDetails) {
            fetch(`https://assignment-03-assignment3-yiyang.onrender.com/youtubeTrailer/${encodeURIComponent(animeDetails.title.romaji)}`)
                .then(response => response.json())
                .then(data => {
                    setVideoId(data.videoId);
                })
                .catch(error => console.error('Error:', error));
        }
    }, [animeDetails]);


    // Send a request to backend to add anime to watching list
    const handleAddToWatchingList = async () => {
        try {

            if (!isAuthenticated) {
                return alert("Login required");
            }

            const token = await getAccessTokenSilently();
            const response = await fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/watchingList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    animeName,
                    coverImage: animeDetails.coverImage.large,
                })
            });

            if (response.ok) {
                console.log('Anime added to watching list successfully');
            } else {
                console.error('Failed to add anime to watching list');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Send a request to backend to add anime to favorite list
    const handleAddToFavList = async () => {
        try {

            if (!isAuthenticated) {
                return alert("Login required");
            }

            const token = await getAccessTokenSilently();
            const response = await fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/favoriteList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    animeTitle: animeName,
                    coverImage: animeDetails.coverImage.large,
                })
            });

            if (response.ok) {
                console.log('Anime added to favorite list successfully');
            } else {
                console.error('Failed to add anime to favorite list');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };



    if (!animeDetails) {
        return <div>Loading...</div>;
    }


    return (
        <div className='animeDetail'>

            {/* <div className="banner-container">
                <NavBar />
            </div> */}

            <img className='bannerImg' src={animeDetails.bannerImage} alt="banner image" style={{ transform: `scaleX(${bannerZoom})` }} />
            
            <div className='anime_detail_container'>
                <img className='coverImg' 
                    src={animeDetails.coverImage.large} 
                    alt={animeDetails.title.romaji} 
                    style={{ top: bannerHeight / 2 }}
                />
            </div>

            <div className='details_container'>


                <div className='details'>

                    <h1>{animeDetails.title.english}</h1>
                    <div className='button_container'>
                        <button onClick={handleAddToWatchingList}>Add to Watching List 💌</button>
                        <button onClick={handleAddToFavList}>Add to Favorite List 📮</button>
                    </div>
                    <p>{animeDetails.description}</p>
                
                    <div className='infos'>
                        <h2>Basic Info:</h2>
                        <p>Romaji Name: {animeDetails.title.romaji}</p>
                        <p>Type: {animeDetails.type}</p>
                        <p>Total Episodes: {animeDetails.episodes}</p>
                    </div>

                    {videoId && (
                        <div className="video-container">
                            <iframe
                                title="Anime Trailer"
                                width="560"
                                height="315"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                frameBorder="0"
                                allowFullScreen
                            ></iframe>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AnimeDetail;