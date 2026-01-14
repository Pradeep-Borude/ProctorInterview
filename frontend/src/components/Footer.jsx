export default function Footer(){
    return(
        <>
         <footer style={{ 
        background: "#1e293b", 
        color: "white", 
        padding: "3rem 5%", 
        textAlign: "center" 
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h3 style={{ marginBottom: "1rem" }}>ProctorInterview</h3>
          <p style={{ opacity: 0.8, marginBottom: "2rem" }}>
            Secure hiring starts here. Trusted by recruiters worldwide.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
            <a href="#" style={footerLink}>Privacy</a>
            <a href="#" style={footerLink}>Terms</a>
            <a href="#" style={footerLink}>Contact</a>
          </div>
          <p style={{ opacity: 0.6, fontSize: "0.9rem" }}>
             &copy; {new Date().getFullYear()} ProctorInterview. All rights reserved. <br />
            made with ❤️ & 🍵 in india .
          </p>
        </div>
      </footer>
        </>
    )
}


const footerLink = {
  color: "#94a3b8",
  textDecoration: "none",
  transition: "color 0.3s ease"
};
