import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/login';
import Dashboard from './components/dashboard';
import AddStudent from './components/add-student';
import StudentInfo from './components/student-info';
import PageNotFound from './components/not-found';
import Settings from './components/settings';
import { Helmet } from 'react-helmet';

const App = () => {
  window.addEventListener('beforeunload',(event)=>{
    event.preventDefault();
  });

  return(
    <Router>
      <div>
      <Helmet>
          <title>VCUBE - Student Management System</title>
        </Helmet>
        <Routes>
          <Route path="/login" exact element={<Login />}/>
          <Route path="/dashboard" exact element={<Dashboard/>}/>
          <Route path="/studentform" exact element={<AddStudent />}/>
          <Route path="/studentinfo" exact element={<StudentInfo />}/>
          <Route path="/settings" exact element={<Settings />}/>
          <Route path="*" exact element={<PageNotFound />}/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
