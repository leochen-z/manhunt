import { useState, useEffect } from 'react';
import '../pages/Lobby.css';

function LobbyFound({ lobbyId, lobbyName, playerId }) {
    // State variables for lobby functionality
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [heading, setHeading] = useState(0);
    const [lobbyData, setLobbyData] = useState([]);
    const [isHunter, setIsHunter] = useState(false);
    const [playerName, setPlayerName] = useState("");

    // Constants
    const API_BASE = "https://api.hankinit.work/manhunt-api";

    // Check if device orientation need user permission
    const needsPermission = typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function";
    const rotation = needsPermission ? -heading : 180 - heading;

    // Fetch lobby data
    async function getLobbyData() {
        if (!lobbyId || !playerId) return;
        try {
            const response = await fetch(`${API_BASE}/get-lobby/?lobby_id=${lobbyId}&player_id=${playerId}`);
            const data = await response.json();
            setLobbyData(data.data);

            const currentPlayer = data.data.find(p => p.id === playerId);
            if (currentPlayer) {
                setIsHunter(currentPlayer.is_hunter);
                setPlayerName(currentPlayer.name);
            }
        } catch (err) {
            console.error("Failed to fetch lobby data", err);
        }
    }

    // Update location
    async function updateLocation() {
        if (!lobbyId || !playerId) return;
        try {
            await fetch(`${API_BASE}/update-location`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lobby_id: lobbyId, player_id: playerId, latitude: latitude, longitude: longitude }),
            });
        } catch (err) {
            console.error("Failed to update location", err);
        }
    }

    // Handle switching roles
    async function handleSwitchRole() {
        if (!lobbyId || !playerId) return;
        try {
            const response = await fetch(`${API_BASE}/update-player`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lobby_id: lobbyId, player_id: playerId, is_hunter: true }),
            });

            if (!response.ok) {
                throw new Error("Failed to switch role");
            }
            setIsHunter(true);
            // Refetch lobby data to update the UI with the new role
            await getLobbyData();

        } catch (err) {
            console.error("Error switching role:", err);
        }
    }

    // Location functions
    function showPosition(position) {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        updateLocation();
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
    }

    // Compass functions
    async function startCompass() {
        if (needsPermission) {
            const result = await DeviceOrientationEvent.requestPermission();
            if (result === "granted") {
                window.addEventListener("deviceorientation", handleCompass);
            }
        } else if ("AbsoluteOrientationSensor" in window) {
            try {
                const sensor = new AbsoluteOrientationSensor({ frequency: 10 });
                sensor.addEventListener("reading", () => handleCompassAndroid(sensor.quaternion));
                sensor.addEventListener("error", e => console.error(e.error));
                sensor.start();
            } catch (err) {
                console.error("AbsoluteOrientationSensor error:", err);
            }
        } else {
            window.addEventListener("deviceorientationabsolute", handleCompass, true);
        }
    }

    function handleCompass(event) {
        const compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);
        setHeading(compass);
    }

    function handleCompassAndroid(q) {
        const [x, y, z, w] = q;
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        let yaw = Math.atan2(siny_cosp, cosy_cosp) * (180 / Math.PI);
        if (yaw < 0) yaw += 360;
        setHeading(yaw);
    }

    // Effects
    useEffect(() => {
        getLocation();
        const intervalId = setInterval(getLocation, 2000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!playerId) return;
        const intervalId = setInterval(() => {
            getLobbyData();
        }, 2000);
        return () => clearInterval(intervalId);
    }, [lobbyId, playerId]);

    return (
        <>
            <button onClick={handleSwitchRole} style={{ marginBottom: '20px' }}>
                Switch Role
            </button>
            <h1>{lobbyName}</h1>
            <h3>Lobby Id: {lobbyId}</h3>
            <p>Your Name: {playerName}</p>
            <p>Your Role: {isHunter ? 'Hunter' : 'Hunted'}</p>

            {isHunter && (
                <>
                    <hr />
                    <h2>Hunter Tools</h2>
                    <button onClick={startCompass}>Start Compass</button>
                    <h3>Heading: {Math.round(heading)}°</h3>
                    <div className="compass">
                        <img
                            src="/arrow.png"
                            alt="Compass Arrow"
                            className="arrow"
                            style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                        />
                    </div>
                    <div>
                        <label>
                            Track a player:
                            <select>
                                {lobbyData
                                    .filter(player => !player.is_hunter)
                                    .map((player) => (
                                        <option key={player.id}>
                                            {player.name}
                                        </option>
                                    ))}
                            </select>
                        </label>
                    </div>
                </>
            )}
        </>
    );
}

export default LobbyFound;
