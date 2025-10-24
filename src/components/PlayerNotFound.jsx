import { useNavigate } from 'react-router-dom';

function PlayerNotFound() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Player Session Invalid</h1>
            <p>Your player session has expired or is invalid.</p>
            <button onClick={() => navigate('/')}>Go to Home Page</button>
        </div>
    );
}

export default PlayerNotFound;

