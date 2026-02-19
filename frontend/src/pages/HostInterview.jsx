import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSessionRefresh } from "../contexts/SessionContext";


export default function HostInterview() {
  const { triggerRefresh } = useSessionRefresh();

  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
 const copyTimeoutRef = useRef(null);
 // Copy Room ID to Clipboard
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      
      // Reset copy state after 2 seconds
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setIsCopied(true);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);   



  const handleHostInterview = async (event) => {
    event.preventDefault();
    const date = event.target.date.value;
    const from = event.target.from.value;
    const to = event.target.to.value;

    try {

      await axios.post(
        "http://localhost:3000/api/session/create",
        { roomId, date, from, to },
        { withCredentials: true }
      );
      triggerRefresh();

      navigate('/dashboard');


    } catch (error) {
      console.error("Error hosting interview:", error);
      alert(error.response.data.message)
      navigate('/dashboard');

      return;
    }

    
  }

  useEffect(() => {
    const roomId = "CPSB-" + uuidv4().slice(0, 8);
    setRoomId(roomId);
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
              <p style={{ 
                fontSize: '14px', 
                color: '#6c757d', 
                margin: '5px 0',
                textAlign: 'center'
              }}>
                Click anywhere or tap copy button to share Room ID
              </p>
               <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '15px 20px',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={copyRoomId}
              >
                <h3 style={{ 
                  margin: 0, 
                  color: '#495057',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}>
                  {roomId}
                </h3>
             
                <button
                  type="button"
                  style={{
                    backgroundColor: isCopied ? '#28a745' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyRoomId();
                  }}
                >
                  {isCopied ? '✅ Copied!' : '📋 Copy'}
                </button>
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
