import { useState, useRef, useEffect } from 'react';
import { updatePlayerName } from '../utils/api';

function PlayerNameEditor({ currentName, playerId, lobbyId, playerToken, onNameUpdate, onError })
{
    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState(currentName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const MAX_NAME_LENGTH = 30;

    // Start editing mode
    function handleEditClick()
    {
        setNameInput(currentName || '');
        setIsEditing(true);
        setError('');
    }

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

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
            await updatePlayerName(lobbyId, playerToken, trimmedName);
            
            // Update parent component
            onNameUpdate(trimmedName);
            setIsEditing(false);
        }
        catch (err)
        {
            // Check for specific API error statuses
            if (err.status === 'lobby_not_found' || err.status === 'invalid_player_token' || err.status === 'http_error')
            {
                onError(err.status);
                return;
            }
            
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
        if (e.key === 'Enter' && isEditing)
        {
            handleSave();
        }
        else if (e.key === 'Escape' && isEditing)
        {
            handleCancel();
        }
    }

    return (
        <div className="name-editor">
            <div className={`name-editor-controls ${error ? 'error' : ''}`}>
                <input
                    ref={inputRef}
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_NAME_LENGTH}
                    disabled={!isEditing || isLoading}
                    className={`name-input ${!isEditing ? 'readonly' : ''}`}
                />
                <div className="name-editor-buttons">
                    {!isEditing ? (
                        <button
                            onClick={handleEditClick}
                            className="name-edit-btn"
                        >
                            Edit
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="name-save-btn"
                            >
                                {isLoading ? '...' : 'Save'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="name-cancel-btn"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
            {error && (
                <p className="name-error">
                    {error}
                </p>
            )}
            {isEditing && (
                <p className="name-counter">
                    {nameInput.length}/{MAX_NAME_LENGTH} characters
                </p>
            )}
        </div>
    );
}

export default PlayerNameEditor;
