import { React, useState, useEffect } from 'react'
import { fetchBatchData,fetchStudentsData } from './data';
import { Alert, closeAlert } from './dashboard';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStudent = () => {
    const history = useNavigate();
    const [studentsData, setStudentsData] = useState([]);
    const [batchesData, setbatchesData] = useState([]);
    const loginned = localStorage.getItem('Login') || 'False';

    const getStudents = async () => {
        const student_Data = await fetchStudentsData();
        setStudentsData(student_Data);
    };
    const getBatches = async () => {
        const batches_Data = await fetchBatchData();
        setbatchesData(batches_Data);
    };

    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();

    if (loginned === 'False' || !loginned.includes(`True ${day} ${month} ${year}`)){
        history('/login');
    };

    useEffect(() => {
        getStudents();
        getBatches();
      }, []);

    const batchElement = document.querySelector('.batch-select');
    const nameElement = document.querySelector('.std-name');
    const mobileElement = document.querySelector('.std-phone');
    const emailElement = document.querySelector('.std-mail');
    const pg_Element = document.querySelector('.std-pg');
    const pg_BranchElement = document.querySelector('.std-pg-branch');
    const pg_CGPAElement = document.querySelector('.std-pg-cgpa');
    const pg_YearElement = document.querySelector('.std-pg-year');
    const degreeElement = document.querySelector('.std-degree');
    const degreeBranchElement = document.querySelector('.std-degree-branch');
    const degreeCGPAElement = document.querySelector('.std-degree-cgpa');
    const degreeYearElement = document.querySelector('.std-degree-year');
    const interBranchElement = document.querySelector('.std-inter-branch');
    const interCGPAElement = document.querySelector('.std-inter-cgpa');
    const interYearElement = document.querySelector('.std-inter-year');
    const schoolCGPAElement = document.querySelector('.std-school-cgpa');
    const schoolYearElement = document.querySelector('.std-school-year');
    const projectElement = document.querySelector('.std-project');
    const pg_Completed = document.querySelector('.pg-completion');
    const idElement = document.querySelector('.std-ID');
    const wantToUpdateData = JSON.parse(sessionStorage.getItem('SelectedStudent')) || "";
    const iD = wantToUpdateData.id;
    const ModifyData = sessionStorage.getItem('updateStdForm');

    if (ModifyData === 'True'){
        if (projectElement){
            idElement.innerHTML = iD
            batchElement.value = wantToUpdateData.BatchName
            nameElement.value = wantToUpdateData.Name
            mobileElement.value = wantToUpdateData.Phone
            emailElement.value = wantToUpdateData.Email
            if (wantToUpdateData.PG === 'N/A'){
                pg_Completed.value = 'No';
            }else{
                pg_Completed.value = 'Yes';
                pg_Element.value = wantToUpdateData.PG
                pg_BranchElement.value = wantToUpdateData.PG_Branch
                pg_CGPAElement.value = wantToUpdateData.PG_CGPA
                pg_YearElement.value = wantToUpdateData.PG_Year
            };
            degreeElement.value = wantToUpdateData.Degree
            degreeBranchElement.value = wantToUpdateData.Degree_Branch
            degreeCGPAElement.value = wantToUpdateData.Degree_CGPA
            degreeYearElement.value = wantToUpdateData.Degree_Year
            interBranchElement.value = wantToUpdateData.Inter_Branch
            interCGPAElement.value = wantToUpdateData.Inter_CGPA
            interYearElement.value = wantToUpdateData.Inter_Year
            schoolCGPAElement.value = wantToUpdateData.SSC_CGPA
            schoolYearElement.value = wantToUpdateData.SSC_Year
            projectElement.value = wantToUpdateData.Project   
        }else{

        }
    };

    const studentForm = async (event) => {
        const pgElement = pg_Element.value || 'N/A';
        const pgBranchElement = pg_BranchElement.value || 'N/A';
        const pgCGPAElement = pg_CGPAElement.value || 'N/A';
        const pgYearElement = pg_YearElement.value || 'N/A';
        const today = new Date();
        const day = today.getDate();
        const options = { month: 'long' };
        const month = today.toLocaleDateString('en-US', options);
        const year = today.getFullYear();
        event.preventDefault();
        if (ModifyData === 'True'){
            const stdFormData = {
                id : wantToUpdateData.id,
                BatchName : batchElement.value,
                JoiningDate : wantToUpdateData.JoiningDate,
                Name : nameElement.value,
                Phone : mobileElement.value,
                Email : emailElement.value,
                PG : pgElement,
                PG_Branch : pgBranchElement,
                PG_CGPA : pgCGPAElement,
                PG_Year : pgYearElement,
                Degree : degreeElement.value,
                Degree_Branch : degreeBranchElement.value,
                Degree_CGPA : degreeCGPAElement.value,
                Degree_Year : degreeYearElement.value,
                Inter : '12th',
                Inter_Branch : interBranchElement.value,
                Inter_CGPA : interCGPAElement.value,
                Inter_Year : interYearElement.value,
                SSC : '10th',
                SSC_Branch : 'N/A',
                SSC_CGPA : schoolCGPAElement.value,
                SSC_Year : schoolYearElement.value,
                Classes : wantToUpdateData.Classes,
                CaseStudies : wantToUpdateData.CaseStudies,
                MockTests : wantToUpdateData.MockTests,
                Interviews : wantToUpdateData.Interviews,
                Project : projectElement.value,
                Feedback : wantToUpdateData.Feedback,
                Status : wantToUpdateData.Status,
                StudentFeedback : wantToUpdateData.StudentFeedback,
            };
            try {
                let res = await axios.put('http://127.0.0.1:8000/students/', JSON.stringify(stdFormData), {
                  headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',`Student : ${nameElement.value} details updated successfully !`);
                    sessionStorage.setItem('SelectedStudent',JSON.stringify(stdFormData));
                    setTimeout(()=>{
                        history('/studentinfo');
                    },3000)
                }
              } catch (error){
                Alert('error', 'Unfortunately, the student details update was unsuccessful.<br/>Please check & try again !');
              }
        }else{
            const stdFormData = {
                BatchName : batchElement.value,
                JoiningDate : `${day} ${month} ${year}`,
                Name : nameElement.value,
                Phone : mobileElement.value,
                Email : emailElement.value,
                PG : pgElement,
                PG_Branch : pgBranchElement,
                PG_CGPA : pgCGPAElement,
                PG_Year : pgYearElement,
                Degree : degreeElement.value,
                Degree_Branch : degreeBranchElement.value,
                Degree_CGPA : degreeCGPAElement.value,
                Degree_Year : degreeYearElement.value,
                Inter : '12th',
                Inter_Branch : interBranchElement.value,
                Inter_CGPA : interCGPAElement.value,
                Inter_Year : interYearElement.value,
                SSC : '10th',
                SSC_Branch : 'N/A',
                SSC_CGPA : schoolCGPAElement.value,
                SSC_Year : schoolYearElement.value,
                Classes : 0,
                CaseStudies : 0,
                MockTests : 0,
                Interviews : 0,
                Project : projectElement.value,
                Feedback : 'N/A',
                Status : 'Active',
                StudentFeedback : 'N/A',
            };
            try {
                let res = await axios.post('http://127.0.0.1:8000/students/', JSON.stringify(stdFormData), {
                  headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (res.status === 200 || res.status === 201){
                    Alert('success',`Student : ${nameElement.value} - Batch : ${batchElement.value}. Added Successfully.`);
                    setTimeout(()=>{
                        history('/dashboard')
                    },3000)
                }
              } catch (error){
                Alert('error', 'Unfortunately, the student addition was unsuccessful.<br/>Please check & try again !');
              }
        };
    };

    const pgCompleted = () => {
        const pgArray = [pg_Element,pg_BranchElement,pg_CGPAElement,pg_YearElement]
        if (pg_Completed.value === 'Yes'){
            pgArray.forEach(ele=>{
                ele.disabled = false;
            });
        }else{
            pgArray.forEach(ele=>{
                ele.disabled = true;
            });
        }
    };
    if (pg_Completed){
        pgCompleted();
    }
    
    const xIconlocate = () => {
        if (ModifyData === 'True'){
            history('/studentinfo')
        }else{
            history('/dashboard');
        }
    }

    const btnRotate = (event) => {
        event.preventDefault();
        const formsubmitBtn = document.querySelector('.form-submit-btn');
        formsubmitBtn.style.width = '40px';
        formsubmitBtn.style.height = '40px';
        formsubmitBtn.innerHTML = "";
        setTimeout(()=>{
            formsubmitBtn.classList.add('btn-rotate');
            formsubmitBtn.style.borderRadius = '50%';
            formsubmitBtn.style.background = 'transparent';
            formsubmitBtn.style.border = 'solid 5px #616bf1';
            formsubmitBtn.style.borderRight = 'solid 5px transparent';
        },500);
        setTimeout(()=>{
            studentForm(event)
        },3000);
    }
  return (
    <div>
    <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
        <div className="Main-Page-Container">
            <center className="student-register-form-center">
            <form onSubmit={(event)=>btnRotate(event)} action="" className="student-registration-form">
                <h1>Student Register Form</h1>
                <img src="images/V-CUBE-Logo.png" alt="" onClick={()=>history('/dashboard')}/>
                <span className="student-form-X-icon" onClick={xIconlocate}>&times;</span>
                <label for="batch" className="batch-label"><h2>Select Batch : </h2>
                <select name="batch" className="batch-select">
                    {batchesData.map(data=>{
                        return(
                        <option value={data.BatchName}>{data.BatchName}</option>
                        )
                    })};
                </select>
                </label>
                <div className="std-personal-details-div">
                    <h3>Student &nbsp; S.No : &nbsp;<span className="std-ID" style={{fontWeight : 'lighter'}}>1</span></h3>
                    <label>Name : <input type="text" className="std-name" required /></label>
                    <label>Phone : <input type="number" className="std-phone" required /></label>
                    <label>Email : <input type="email" className="std-mail" required /></label>
                </div>
                <label className="completed-pg" >Completed PostGraduate : &nbsp; 
                    <select className="pg-completion" onChange={pgCompleted}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </label>
                <div className="std-form-education-details-div">
                    <label>PG : <input type="text" className="std-pg" disabled /></label>
                    <label>PG Branch : <input type="text" className="std-pg-branch" disabled /></label>
                    <label>PG CGPA : <input type="number" className="std-pg-cgpa" step="0.01" disabled /></label>
                    <label>PG Passed Year : <input type="number" className="std-pg-year" disabled /></label>
                    <label>Degree : <input type="text" className="std-degree" required /></label>
                    <label>Degree Branch : <input type="text" className="std-degree-branch" required /></label>
                    <label>Degree CGPA : <input type="number" className="std-degree-cgpa" step="0.01" required /></label>
                    <label>Degree Passed Year : <input type="number" className="std-degree-year" required /></label>
                    <label>Inter : <span>12th</span></label>
                    <label>Inter Branch : <input type="text" className="std-inter-branch" required /></label>
                    <label>Inter CGPA : <input type="number" className="std-inter-cgpa" step="0.01" required /></label>
                    <label>Inter Passed Year<input type="number" className="std-inter-year" required /></label>
                    <label>School : <span>10th</span></label>
                    <label>School Branch : <span>N/A</span></label>
                    <label>School CGPA : <input type="number" className="std-school-cgpa" step="0.01" required /></label>
                    <label>School Passed Year : <input type="number" className="std-school-year" required /></label>
                </div>
                <label for="project" className="project-label">Project : &nbsp;
                    <select className="std-project">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </label>
                <input className="form-submit-btn" type="submit" value="Submit" />
            </form>
            <div className="alert-div">
                <img className="alert-div-img" src="" alt="" width="40px"/>
                <p></p>
                <span className="X" onClick={closeAlert}>&times;</span>
                <div className="alert-timer-line"></div>
            </div>
        </center>
        </div>
    </div>
  )
}

export default AddStudent;
