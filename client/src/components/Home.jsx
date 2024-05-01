import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../utils/NavBar';
import '../index.css';

export default function Home() {

    const [recntAnimeList, setRecentAnimeList] = useState([]);
    const [topAnimeList, setToptAnimeList] = useState([]);

    // most recent anime
    useEffect(() => {
        fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/recentAnime')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const filteredAnimeList = data.filter(anime => anime.title.romaji !== "(Title to be Announced)");

            const first10Animes = filteredAnimeList.slice(0, 10);

            setRecentAnimeList(first10Animes);
        })
        .catch(error => console.error('Error:', error));
    }, []);


    // top ranked anime
    useEffect(() => {
        fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/topAnime')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const filteredAnimeList = data.filter(anime => anime.title.romaji !== "(Title to be Announced)");

            const first10Animes = filteredAnimeList.slice(0, 10);

            setToptAnimeList(first10Animes);
        })
        .catch(error => console.error('Error:', error));
    }, []);


    return (
        <div className='home'>
            <div className="Home-Page">
                <NavBar />
                {/* <div className="Home-text">Welcome to FavAni!</div> */}
                
                <div className="content">
                    <h1>New Announced Animes</h1>
                    <ul className="anime-grid">
                        {recntAnimeList.map(anime => (
                            <Link to={`/details/${anime.id}`}>
                                <img src={anime.coverImage.large} alt={anime.title.romaji} />
                                <p>{anime.title.romaji}</p>
                            </Link>
                        ))}
                    </ul>
                    <hr/>
                    <h1>Top Ranked Animes</h1>
                    <ul className="anime-grid">
                        {topAnimeList.map(anime => (
                            <Link to={`/details/${anime.id}`}>
                                <img src={anime.coverImage.large} alt={anime.title.romaji} />
                                <p>{anime.title.english}</p>
                            </Link>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
