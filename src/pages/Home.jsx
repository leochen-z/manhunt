import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { createLobby } from '../utils/api.js';

function Home()
{
    const [newLobbyName, setNewLobbyName] = useState("");
    const [joinLobbyId, setJoinLobbyId] = useState(""); /* Pre-existing lobby id for joining the lobby*/
    const navigate = useNavigate();

    async function createLobbyClick()
    {
        if (!newLobbyName.trim())
        {
            alert("Please enter a lobby name first!");
        }
        else
        {
            try {
                // Use the centralized API function
                const data = await createLobby(newLobbyName);
                const { lobby_id } = data;

                // Navigates to the lobby page and passes the necessary lobby information.
                navigate(`/lobby/${lobby_id}`);
            } catch (error) {
                console.error('Error creating lobby:', error);
                alert('Failed to create lobby. Please try again.');
            }
        }
    }

    async function joinLobbyClick()
    {
        if (!joinLobbyId.trim())
        {
            alert("Please enter a lobby ID first!");
        }
        else
        { 
            navigate(`/lobby/${joinLobbyId}`);
        }
    }

    return (
        <div className="home-container">
            <h1>Welcome to Manhunt!</h1>
            <div className="home-form">
                <div className="form-section">
                    <h2>Create New Lobby</h2>
                    <input
                        type="text"
                        placeholder="Enter lobby name"
                        value={newLobbyName}
                        onChange={(e) => setNewLobbyName(e.target.value)}
                        className="form-input"
                    />
                    <button onClick={createLobbyClick} className="form-button primary">
                        Create Lobby
                    </button>
                </div>
                
                <div className="form-divider">
                    <span>OR</span>
                </div>
                
                <div className="form-section">
                    <h2>Join Existing Lobby</h2>
                    <input
                        type="text"
                        placeholder="Enter lobby ID"
                        value={joinLobbyId}
                        onChange={(e) => setJoinLobbyId(e.target.value)}
                        className="form-input"
                    />
                    <button onClick={joinLobbyClick} className="form-button secondary">
                        Join Lobby
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home;