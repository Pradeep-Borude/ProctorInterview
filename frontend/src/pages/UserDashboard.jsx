import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';


import "../styles/InterviewerDashboard.css";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function InterviewerDashboard() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/auth/user/getUserData/`,
        { withCredentials: true }
      );

      const user = response.data?.user ;

      setUserData(user);
    } catch (err) {
      console.error(err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
 
      fetchUserData();
    
  }, []);

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading dashboard...</p>;
  }

  if (error) {
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  }


async function logout() {
   try {
      const response = await axios.get(
        `http://localhost:3000/api/auth/user/logout`,
        { withCredentials: true }
      );
      alert(response.data.message)
navigate(`/`);
    } catch (err) {
      console.log(err)
    }
}



  return (
  <>
  <Navbar/>
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1> Dashboard</h1>

        <div>
          <p>{userData?.email}</p>
          <button className="logout-btn" onClick={logout} >Logout</button>
        </div>
      </header>

      {/* Profile Section */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-header"></div>

          <div className="profile-info">
            <h2>👋 Welcome, {userData?.fullName}</h2>
            <p className="business-type">{userData?.role}</p>
           
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-primary">Host an interview</button>
          <button className="btn-primary">Join a meeting</button>
        </div>
      </section>

      {/* Interviews Section */}
      <section className="products-section">
        <div className="products-header">
          <h3>Past Interviews</h3>
        </div>

        <div className="no-products">
          <p>No interviews yet.</p>
        </div>
      </section>
    </div>

    </>
  );
}
