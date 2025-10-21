import { useState } from 'react';

function PlayerNameEditor({ currentName, playerId, lobbyId, playerToken, onNameUpdate })
{
    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState(currentName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = "https://api.hankinit.work/manhunt-api";
    const MAX_NAME_LENGTH = 30;

    // Start editing mode
    function handleEditClick()
    {
        setNameInput(currentName || '');
        setIsEditing(true);
        setError('');
    }

    // Cancel editing
    function handleCancel()
    {
        setIsEditing(false);
        setNameInput(currentName || '');
        setError('');
    }

    // Save the new name
    async function handleSave()
    {
        // Validate name
        const trimmedName = nameInput.trim();
        
        if (!trimmedName)
        {
            setError('Name cannot be empty');
            return;
        }

        if (trimmedName.length > MAX_NAME_LENGTH)
        {
            setError(`Name must be ${MAX_NAME_LENGTH} characters or less`);
            return;
        }

        if (trimmedName === currentName)
        {
            setIsEditing(false);
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
                    name: trimmedName
                })
            });

            if (!response.ok)
            {
                throw new Error('Failed to update name');
            }

            // Update parent component
            onNameUpdate(trimmedName);
            setIsEditing(false);
        }
        catch (err)
        {
            console.error('Error updating name:', err);
            setError('Failed to update name. Please try again.');
        }
        finally
        {
            setIsLoading(false);
        }
    }

    // Handle Enter key to save
    function handleKeyDown(e)
    {
        if (e.key === 'Enter')
        {
            handleSave();
        }
        else if (e.key === 'Escape')
        {
            handleCancel();
        }
    }

    if (isEditing)
    {
        return (
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    <strong>Your Name:</strong>
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={MAX_NAME_LENGTH}
                        disabled={isLoading}
                        autoFocus
                        style={{
                            padding: '5px 10px',
                            fontSize: '16px',
                            border: error ? '2px solid red' : '1px solid #ccc',
                            borderRadius: '4px',
                            flex: '1'
                        }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        style={{
                            padding: '5px 15px',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        style={{
                            padding: '5px 15px',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
                {error && (
                    <p style={{ color: 'red', margin: '5px 0 0 0', fontSize: '14px' }}>
                        {error}
                    </p>
                )}
                <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '12px' }}>
                    {nameInput.length}/{MAX_NAME_LENGTH} characters
                </p>
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '20px' }}>
            <p>
                <strong>Your Name:</strong> {currentName || 'Not set'}
                {' '}
                <button
                    onClick={handleEditClick}
                    style={{
                        marginLeft: '10px',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Edit
                </button>
            </p>
        </div>
    );
}

export default PlayerNameEditor;
