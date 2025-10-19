import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function Home()
{
    const API_BASE = "https://api.hankinit.work/manhunt-api";

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
            // Requests lobby creation given lobby name. Returns lobby ID
            const createResponse = await fetch(`${API_BASE}/create-lobby`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lobby_name: newLobbyName }),
            });
            const { lobby_id } = await createResponse.json();
            alert(`Lobby created with ID: ${lobby_id}`);

            // Navigates to the lobby page and passes the necessary lobby information.
            navigate(`/lobby/${lobby_id}`);
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
        <>
            <h1>Welcome to Manhunt!</h1>
            <input
                type="text"
                placeholder="Enter in a lobby name"
                onChange={(e) => setNewLobbyName(e.target.value)}
            />
            <button onClick={createLobbyClick}>Create Lobby</button>
            <br/>
            <input
                type="text"
                placeholder="Enter in a lobby id"
                onChange={(e) => setJoinLobbyId(e.target.value)}
            />
            <button onClick={joinLobbyClick}>Join Lobby</button>
        </>
    )
}

export default Home;