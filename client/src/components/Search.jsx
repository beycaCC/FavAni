import NavBar from '../utils/NavBar';
import React, { useState, useEffect } from 'react';

export default function Search() {

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await fetch(`https://assignment-03-assignment3-yiyang.onrender.com/api/search?term=${encodeURIComponent(searchTerm)}`);
            const responseData = await response.text();
            // console.log(responseData);
            const searchData = JSON.parse(responseData);
            setSearchResults(searchData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const renderSearchResults = () => {
        if (loading) {
            return <p>Loading...</p>;
        }

        if (searchResults.length === 0) {
            return <p>No results found</p>;
        }

        return (
            <ul>
                {searchResults.map((anime) => (
                    <li key={anime.id}>
                        <a href={`/details/${anime.id}`}>{anime.title.english || anime.title.romaji}</a>
                    </li>
                ))}
            </ul>
        );
    };


    return (
        <div className='search_page'>
            <NavBar />

            <div className='search_container'>
                <div>
                    <input
                        type='text'
                        value={searchTerm}
                        placeholder="Type Here"
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <div className='search_results'>
                    {renderSearchResults()}
                </div>
            </div>
        </div>
    );
};