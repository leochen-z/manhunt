import { useState } from 'react';
import { updatePlayerRole, API_RESPONSE_STATUS } from '../utils/api.js';

function RoleSwitcher({ isSeeker, playerId, lobbyId, playerToken, onRoleUpdate, onError })
{
    const [isLoading, setIsLoading] = useState(false);

    // Handle role change
    async function handleRoleChange(newIsSeeker)
    {
        // Don't do anything if clicking the already selected role
        if (newIsSeeker === isSeeker)
        {
            return;
        }

        setIsLoading(true);

        try
        {
            // Use the centralized API function
            await updatePlayerRole(lobbyId, playerToken, newIsSeeker);
            
            // Update parent component
            onRoleUpdate(newIsSeeker);
        }
        catch (err)
        {
            console.error('Error updating role:', err);
            
            // Handle API errors - kick user to error page
            if (err.status === API_RESPONSE_STATUS.LOBBY_NOT_FOUND || 
                err.status === API_RESPONSE_STATUS.INVALID_PLAYER_TOKEN ||
                err.status === API_RESPONSE_STATUS.HTTP_ERROR ||
                err.status === API_RESPONSE_STATUS.NETWORK_ERROR) {
                onError(err.status);
            }
            // For other errors, just log and do nothing
        }
        finally
        {
            setIsLoading(false);
        }
    }

        return (
        <div className="role-switcher">
            <div className={`role-controls ${isSeeker ? 'seeker-active' : 'hider-active'}`}>
                {/* Seeker Button */}
                <button
                    onClick={() => handleRoleChange(true)}
                    disabled={isLoading}
                    className={`role-btn seeker ${isSeeker ? 'active' : ''}`}
                >
                    Seeker
                </button>

                {/* Hider Button */}
                <button
                    onClick={() => handleRoleChange(false)}
                    disabled={isLoading}
                    className={`role-btn hider ${!isSeeker ? 'active' : ''}`}
                >
                    Hider
                </button>
            </div>
        </div>
    );
}

export default RoleSwitcher;

