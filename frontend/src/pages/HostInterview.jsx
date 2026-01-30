import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";


export default function HostInterview() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const handleHostInterview = async (event) => {
    event.preventDefault();
    const date = event.target.date.value;
    const from = event.target.from.value;
    const to = event.target.to.value;

    try {

      const response = await axios.post(
        "http://localhost:3000/api/auth/session/create",
        { roomId, date, from, to },
        { withCredentials: true }
      );
      console.log("Interview session created:", response.data);
    } catch (error) {
      console.error("Error hosting interview:", error);
      return;
    }
  }

  useEffect(() => {
    const roomId = "CPSB-" + uuidv4().slice(0, 8);
    setRoomId(roomId);
    console.log(roomId);
  }, [])

  return (
    <>
      <div className="form-container">
        <div className="form-wrapper">
          <div className="form-card">
            <div className="form-header">
              <span className="form-logo">Schedule Interview</span>

            </div>

            <form onSubmit={handleHostInterview}>
              <div className="form-group">
                <label className="form-label" htmlFor="date">
                  Date
                </label>

                <input
                  name="date"
                  id="date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="form-input placeholder-look"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  onFocus={(e) => e.target.classList.remove("placeholder-look")}
                  onChange={(e) => e.target.classList.remove("placeholder-look")}
                />

              </div>





              <div className="form-group">
                <label className="form-label" htmlFor="from">
                  From
                </label>

                <input
                  name="from"
                  id="from"
                  type="time"
                  className="form-input"
                  min={new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',

                  })}
                  placeholder=''
                  defaultValue={new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />

                <span className="form-error">error</span>
              </div>


              <div className="form-group">
                <label className="form-label" htmlFor="to">
                  To
                </label>

                <input
                  name="to"
                  id="to"
                  type="time"
                  className="form-input"
                  placeholder=''
                  defaultValue={new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />

                <span className="form-error">invalid time</span>
              </div>
              <label className="form-label" htmlFor="to">
                Room ID
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px 5px'
                }}
              >

                <h2>{roomId}</h2>
                <span>cpy📃</span>
              </div>

              <button type="submit" className="submit-btn">
                Host Interview
              </button>

            </form>


          </div>
        </div>
      </div>
    </>
  );
}
