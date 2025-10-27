const API_BASE = "https://api.hankinit.work/manhunt-api";

/**
 * API response status codes
 */
export const API_RESPONSE_STATUS = {
    SUCCESS: 'success',
    LOBBY_NOT_FOUND: 'lobby_not_found',
    INVALID_PLAYER_TOKEN: 'invalid_player_token',
    HTTP_ERROR: 'http_error',
    NETWORK_ERROR: 'network_error'
};

/**
 * Base API request handler with error handling
 * @param {string} endpoint - API endpoint (e.g., '/create-lobby')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response data
 * @throws {Error} - Throws error with status if API returns error status
 */
async function apiRequest(endpoint, options = {})
{
    const url = `${API_BASE}${endpoint}`;
    
    const defaultOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        // Check for network/HTTP errors first
        if (!response.ok)
        {
            const error = new Error(`HTTP Status Code ${response.status}`);
            error.status = API_RESPONSE_STATUS.HTTP_ERROR;
            console.error(error);
            throw error;
        }
        
        // Always parse JSON response
        const data = await response.json();
        
        // Check for specific error statuses in the response body
        // The API returns 200 OK even for errors, with the actual status in data.status
        if (data.status === API_RESPONSE_STATUS.LOBBY_NOT_FOUND || 
            data.status === API_RESPONSE_STATUS.INVALID_PLAYER_TOKEN) {
            const error = new Error(data.message || 'API Error');
            error.status = data.status;
            error.data = data;
            console.error('API Error:', error);
            throw error;
        }
        
        return data;
    } catch (error) {
        // Handle network errors (including ERR_INTERNET_DISCONNECTED)
        if (error.message?.includes('Failed to fetch') || 
            error.message?.includes('NetworkError') ||
            error.message?.includes('ERR_INTERNET_DISCONNECTED') ||
            !error.status) {
            const networkError = new Error('Network error - please check your internet connection');
            networkError.status = API_RESPONSE_STATUS.NETWORK_ERROR;
            console.error('Network Error:', networkError);
            throw networkError;
        }
        // Re-throw other errors as-is
        throw error;
    }
}

/**
 * Create a new lobby
 * @param {string} lobbyName - Name of the lobby
 * @returns {Promise<object>} - { lobby_id, player_token }
 */
export async function createLobby(lobbyName)
{
    return apiRequest('/create-lobby', {
        body: JSON.stringify({ lobby_name: lobbyName })
    });
}

/**
 * Join an existing lobby
 * @param {string} lobbyId - Lobby ID to join
 * @returns {Promise<object>} - { player_token }
 */
export async function joinLobby(lobbyId)
{
    return apiRequest('/join-lobby', {
        body: JSON.stringify({ lobby_id: lobbyId })
    });
}

/**
 * Leave a lobby
 * @param {string} lobbyId - Lobby ID
 * @param {string} playerToken - Player token
 * @returns {Promise<object>}
 */
export async function leaveLobby(lobbyId, playerToken)
{
    return apiRequest('/leave-lobby', {
        body: JSON.stringify({
            lobby_id: lobbyId,
            player_token: playerToken
        })
    });
}

/**
 * Trade player data (get lobby info and other players)
 * @param {string} lobbyId - Lobby ID
 * @param {string} playerToken - Player token
 * @param {number|null} latitude - Player's latitude (optional)
 * @param {number|null} longitude - Player's longitude (optional)
 * @returns {Promise<object>} - { lobby_name, players }
 */
export async function tradePlayerData(lobbyId, playerToken, latitude = null, longitude = null)
{
    const requestBody = {
        lobby_id: lobbyId,
        player_token: playerToken
    };
    
    // Only include location data if both latitude and longitude are provided
    if (latitude !== null && longitude !== null) {
        requestBody.latitude = latitude;
        requestBody.longitude = longitude;
    }
    
    return apiRequest('/trade-player-data', {
        body: JSON.stringify(requestBody)
    });
}

/**
 * Update player information
 * @param {string} lobbyId - Lobby ID
 * @param {string} playerToken - Player token
 * @param {object} updates - Updates to apply (name, is_seeker, etc.)
 * @returns {Promise<object>}
 */
export async function updatePlayer(lobbyId, playerToken, updates)
{
    return apiRequest('/update-player', {
        body: JSON.stringify({
            lobby_id: lobbyId,
            player_token: playerToken,
            ...updates
        })
    });
}

/**
 * Update player name
 * @param {string} lobbyId - Lobby ID
 * @param {string} playerToken - Player token
 * @param {string} name - New name
 * @returns {Promise<object>}
 */
export async function updatePlayerName(lobbyId, playerToken, name)
{
    return updatePlayer(lobbyId, playerToken, { name });
}

/**
 * Update player role (seeker/hider)
 * @param {string} lobbyId - Lobby ID
 * @param {string} playerToken - Player token
 * @param {boolean} isSeeker - Whether player is a seeker
 * @returns {Promise<object>}
 */
export async function updatePlayerRole(lobbyId, playerToken, isSeeker)
{
    return updatePlayer(lobbyId, playerToken, { is_seeker: isSeeker });
}

export default {
    createLobby,
    joinLobby,
    leaveLobby,
    tradePlayerData,
    updatePlayer,
    updatePlayerName,
    updatePlayerRole,
    API_STATUS: API_RESPONSE_STATUS
};

