import { Link } from 'react-router-dom';
import '../styles/home.css'
export default function Navbar() {


  return (

    <>
      <div className="hero-section">
        <h1 className="hero-title">ProctorInterview
          <span className="logoIdel"
          >{"</>"}</span>
        </h1>
        <div
          style={{
            gap: '1rem',
            display: 'flex'
          }}
        >

          <Link 
  to="/" 
  className="icon-link"  // New class
  style={{ textDecoration: 'none', color: 'inherit' }}
>
  <div className='icons'>
    🏠
  </div>
</Link>


<Link 
  to="/dashboard" 
  className="icon-link"  // New class
  style={{ textDecoration: 'none', color: 'inherit' }}
>
  <div className='icons'>
    👤
  </div>
</Link>

         
        </div>

      </div>
    </>

  )
}