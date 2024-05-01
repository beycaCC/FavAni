import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import NavBar from '../utils/NavBar';

export default function Profile() {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [watchingList, setWatchingList] = useState([]);
  const [favList, setFavList] = useState([]);


  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = await getAccessTokenSilently();

        // Fetch watching list
        const watchingResponse = await fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/watchingList', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const watchingData = await watchingResponse.json();
        setWatchingList(watchingData);

        // Fetch favorite list
        const favResponse = await fetch('https://assignment-03-assignment3-yiyang.onrender.com/api/favoriteList', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const favData = await favResponse.json();
        setFavList(favData);
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };

    if (isAuthenticated) {
      fetchLists();
    }
  }, [isAuthenticated, getAccessTokenSilently]);


  return (
    <div className="profile_page">
      <NavBar />
      <div className="userProfile_container">
        <div className="info_container">
            <div>
                <img src={user.picture} width="100" alt="profile avatar" />
            </div>
            <div>
                <p> <b>Name:</b> {user.name}</p>
            </div>
            <div>
                <p> <b>Email 📧: </b> {user.email}</p>
            </div>
            <div>
                <p> <b>Email verified ✅ :</b> {user.email_verified?.toString()}</p>
            </div>
        </div>
        <div className="animes_container">
            <div className="Watching_List">
                <h1>Watching List</h1>
                <ul className='anime_watching_list'>
                    {watchingList.map((anime) => (
                      <li key={anime.id}>
                        <img src={anime.coverImage} alt={anime.animeName} /> 
                        <p>{anime.animeName}</p>
                    </li>
                    ))}
                </ul>
            </div>
            <br/>
            <br/>
            <hr/>
            <br/>
            <div className="Saved_List">
                <h1>Saved List</h1>
                <ul className='anime_fav_list'>
                  {favList.map((anime) => (
                      <li key={anime.id}>
                        <img src={anime.coverImage} alt={anime.animeName} /> 
                        <p>{anime.animeTitle}</p>
                    </li>
                  ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}