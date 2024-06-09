import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const history = useNavigate();
  return (
    <div>
      <center style={{background : '#ffff',position : 'absolute', width : '100%',height : '100%', display : 'flex',flexDirection : 'column', alignItems : 'center', justifyContent : 'center'}}>
          <h1 className="page-not-found-q-mark">?</h1>
          <h1 className="page-not-found-text">Page Not Found</h1>
          <p className="page-not-found-info">Oop's! We couldn't find the page that you're looking for.<br/>Please check the address and try again.</p>
          <p id="p-n-f-or">or</p>
          <p id="p-n-f-link">Got to the Login / Dashboard &nbsp;&nbsp;<span style={{color : '#616bf1',textDecoration : 'underline',cursor : 'pointer'}} onClick={()=>history('/login')}>Click here</span></p>
      </center>
    </div>
  )
};

export default PageNotFound;