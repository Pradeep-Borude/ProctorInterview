import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/forms.css';


export default function JoinRoom() {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const roomId = e.target.roomId.value;

    try {
      const response = await axios.post(
        'http://localhost:3000/api/session/verify-room',
        { roomId },
        { withCredentials: true }
      );

      const { roomId: verifiedRoomId, role } = response.data;
      navigate(`/interview/${verifiedRoomId}`, {
        state: { role }
      });

    } catch (error) {
      alert("invalid room id")
      console.error(error);

      if (error.response?.status === 403) {
        alert("You are not allowed to join this room");
      } else if (error.response?.status === 404) {
        alert("Invalid room ID");
      } else {
        alert("Network error");
      }
    }
  };

  return (
    <> 
     <div className="form-container">
      <div className="form-wrapper">
        <div className="form-card">
          <div className="form-header">
            <span className="form-logo">ProctorInterview</span>
            <p className="form-subtitle">Enter a room ID to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="roomId">
                Room ID
              </label>
              <input
                id="roomId"
                name="roomId"
                type="text"
                className="form-input"
                placeholder="CPSB-XXXXXXXX"
              />
              <span className="form-error">Please enter valid Room ID</span>
            </div>

           
            <button type="submit" className="submit-btn">
              Join Room
            </button>
          </form>

        </div>
      </div>
    </div>
    </>
  );
}
