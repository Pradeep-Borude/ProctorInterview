import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../styles/InterviewerDashboard.css';
export default function FoodPartnerDashboardUI() {
   const { role, userId } = useParams();
  const [userRole, setUserRole] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (role) {
      setUserRole(role);
    }

    console.log(role)
   if(role === "candidate"){
    console.log("going to redirect to candidate page")
   }
  }, [role]);
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Interviewer Dashboard</h1>
        <button className="logout-btn">
          Logout
        </button>
      </header>

      {/* Profile Section */}
      <section className="profile-section">
          
        <div className="profile-card">
          <div className="profile-header">
          

         
          </div>
           <div className="profile-info">
              <h2>👋 welcome, Name</h2>
              <p className="business-type">Interviewer</p>
            </div>

          
        </div>
        <div className="profile-actions">
<button className="btn-primary">
            Host a interview
          </button>          
          <button className="btn-primary">
           Join a meeting
          </button>
          </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="products-header">
          <h3>past interviews</h3>
          
        </div>

        {/* Empty State */}
        <div className="no-products">
          <p>No Interview yet.</p>
         
        </div>

        {/* Product Card UI (static) */}
       
      </section>
    </div>
  );
}
