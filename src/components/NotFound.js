import React from 'react';
import { Link } from 'react-router-dom';
import imgs from '../assets/images/not-found.svg';


const NotFound =()=>{
    
   
        return(
            <div>
                <center><img 
                src={imgs} 
                style={{width: "45%", paddingTop: "5%"}}
                />
                <h1 style={{color: "white", paddingTop: "2%"}}>Page Not Found!</h1>
                <p style={{color: "white"}}>The page you are looking for was moved, removed, renamed, or might never existed.</p>
              
                <Link to="/" className="buttn"> GO TO HOME </Link></center>
            </div>
        )
    }


export default NotFound;