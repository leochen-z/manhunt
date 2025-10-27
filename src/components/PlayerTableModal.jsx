import { useState } from 'react';
import PlayerTable from './PlayerTable';

function PlayerTableModal({ players, currentPlayer, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Players in Lobby</h2>
                    <button 
                        className="modal-close-btn"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <PlayerTable players={players} currentPlayer={currentPlayer} />
                </div>
            </div>
        </div>
    );
}

export default PlayerTableModal;
