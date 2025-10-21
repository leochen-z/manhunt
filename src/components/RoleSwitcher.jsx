import { useState } from 'react';

function RoleSwitcher({ isSeeker, playerId, lobbyId, playerToken, onRoleUpdate })
{
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = "https://api.hankinit.work/manhunt-api";

    // Handle role change
    async function handleRoleChange(newIsSeeker)
    {
        // Don't do anything if clicking the already selected role
        if (newIsSeeker === isSeeker)
        {
            return;
        }

        setIsLoading(true);
        setError('');

        try
        {
            const response = await fetch(`${API_BASE}/update-player`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lobby_id: lobbyId,
                    player_token: playerToken,
                    is_seeker: newIsSeeker
                })
            });

            if (!response.ok)
            {
                throw new Error('Failed to update role');
            }

            // Update parent component
            onRoleUpdate(newIsSeeker);
        }
        catch (err)
        {
            console.error('Error updating role:', err);
            setError('Failed to update role. Please try again.');
        }
        finally
        {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
                <strong>Your Role:</strong>
            </label>
            
            {/* Segmented Control */}
            <div style={{
                display: 'inline-flex',
                backgroundColor: '#e0e0e0',
                borderRadius: '8px',
                padding: '4px',
                gap: '4px',
                opacity: isLoading ? 0.6 : 1,
                pointerEvents: isLoading ? 'none' : 'auto'
            }}>
                {/* Seeker Button */}
                <button
                    onClick={() => handleRoleChange(true)}
                    disabled={isLoading}
                    style={{
                        padding: '8px 24px',
                        fontSize: '16px',
                        fontWeight: isSeeker ? '600' : '400',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: isSeeker ? '#ff4444' : 'transparent',
                        color: isSeeker ? 'white' : '#333',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '100px'
                    }}
                >
                    Seeker
                </button>

                {/* Hider Button */}
                <button
                    onClick={() => handleRoleChange(false)}
                    disabled={isLoading}
                    style={{
                        padding: '8px 24px',
                        fontSize: '16px',
                        fontWeight: !isSeeker ? '600' : '400',
                        border: 'none',
                        borderRadius: '6px',
                        backgroundColor: !isSeeker ? '#4CAF50' : 'transparent',
                        color: !isSeeker ? 'white' : '#333',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '100px'
                    }}
                >
                    Hider
                </button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '14px' }}>
                    Updating role...
                </p>
            )}

            {/* Error message */}
            {error && (
                <p style={{ color: 'red', margin: '8px 0 0 0', fontSize: '14px' }}>
                    {error}
                </p>
            )}
        </div>
    );
}

export default RoleSwitcher;

