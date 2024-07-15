import { React, useState, useEffect } from 'react'
import { fetchBatchData,fetchStudentsData } from './data';
import axios from 'axios';
import { isAdminAuth, isStudentAuth,Alert,closeAlert,isUserFound } from './dashboard';
import { date_time } from './dashboard-header';
import { useNavigate } from 'react-router-dom';
import { sendStdAlert } from './student-info';
import * as XLSX from 'xlsx';

const AddStudent = () => {
    const history = useNavigate();
    const [studentsData, setStudentsData] = useState([]);
    const [batchesData, setbatchesData] = useState([]);
    const [isExcel, setIsExcel] = useState(false);
    const lg_User = sessionStorage.getItem('UserLogout') || 'False';
    const ModifyData = sessionStorage.getItem('updateStdForm');
    const stdClass = JSON.parse(sessionStorage.getItem('Selected_Class'));

    const getStudents = async () => {
        const student_Data = await fetchStudentsData();
        setStudentsData(student_Data);
    };
    const getBatches = async () => {
        const batches_Data = await fetchBatchData();
        setbatchesData(batches_Data);
    };

    useEffect(() => {
        getStudents();
        getBatches();
        isUserFound();
      }, []);


    useEffect(()=>{
        isUserFound();
    },[])

if ((isAdminAuth() && !isStudentAuth()) || (!isAdminAuth() && isStudentAuth())) {

    if (lg_User.split('&')[0] === 'True'){
        history('/login');
    }

    if ((isAdminAuth() && !isStudentAuth()) && ((!studentsData) || (!batchesData))){
        sessionStorage.setItem('SomethingWrong','True');
        history('/dashboard');
    }else if((!isAdminAuth() && isStudentAuth()) && ((!studentsData) || (!batchesData))){
        sessionStorage.setItem('SomethingWrong','True');
        history('/studentinfo');
    }else if(isAdminAuth() && !isStudentAuth() && ModifyData === 'False' && (stdClass.length === 0 || stdClass === 'All')){
        sessionStorage.setItem('Tried_Form','True')
        history('/dashboard');
    }else{
    if ((isAdminAuth() && !isStudentAuth()) || (!isAdminAuth() && isStudentAuth() && sessionStorage.getItem('Std_Authenticated') === 'True')){

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
        const imageElement = document.querySelector('.std-image-input');
        const resumeELement = document.querySelector('.std-resume');
        const wantToUpdateData = JSON.parse(sessionStorage.getItem('Selected_Student')) || "";
        const gitEle = document.querySelector('.git-url');
        const linkedinEle = document.querySelector('.linkedin-url');
        const iD = wantToUpdateData.id;

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
                resumeELement.value = wantToUpdateData.Resume
                imageElement.value = wantToUpdateData.Image
                document.querySelector('.std-Image').setAttribute('src', (wantToUpdateData.Image !== null) ? wantToUpdateData.Image : 'images/Empty-Profile.png');
                gitEle.value = wantToUpdateData.Github
                linkedinEle.value = wantToUpdateData.Linkedin
            };
        };

        const studentForm = async (event) => {
            const pgElement = pg_Element.value || 'N/A';
            const pgBranchElement = pg_BranchElement.value || 'N/A';
            const pgCGPAElement = pg_CGPAElement.value || 'N/A';
            const pgYearElement = pg_YearElement.value || 'N/A';
            const date = date_time().split(' ');
            const day = date[0];
            const month = date[1];
            const year = date[2];
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
                    Inter_Branch : interBranchElement.value,
                    Inter_CGPA : interCGPAElement.value,
                    Inter_Year : interYearElement.value,
                    SSC_CGPA : schoolCGPAElement.value,
                    SSC_Year : schoolYearElement.value,
                    Classes : wantToUpdateData.Classes,
                    CaseStudies : wantToUpdateData.CaseStudies,
                    MockTests : wantToUpdateData.MockTests,
                    Interviews : wantToUpdateData.Interviews,
                    Project : projectElement.value,
                    Status : wantToUpdateData.Status,
                    Resume : resumeELement.value || null,
                    Image : imageElement.value || null,
                    Github : gitEle.value || null,
                    Linkedin : linkedinEle.value || null,
                    Class : wantToUpdateData.Class,
                    Access : wantToUpdateData.Access
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
                        if (!isAdminAuth() && isStudentAuth()){
                            sendStdAlert(stdFormData.Email,'Std_Details_Update_Alert');
                        }
                    }
                } catch (error){
                    Alert('error', 'Unfortunately, the student details update was unsuccessful.<br/>Please check & try again !');
                }
                setTimeout(()=>{
                    history('/studentinfo');
                },3000)
            }else{
                const isStdFound = studentsData.some(data=>data.Phone === mobileElement.value || data.Email === emailElement.value);
                if (isStdFound){
                    Alert('error','Student already exists !');
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
                        Degree : degreeElement.value || 'N/A',
                        Degree_Branch : degreeBranchElement.value || 'N/A',
                        Degree_CGPA : degreeCGPAElement.value || 'N/A',
                        Degree_Year : degreeYearElement.value || 'N/A',
                        Inter_Branch : interBranchElement.value || 'N/A',
                        Inter_CGPA : interCGPAElement.value || 'N/A',
                        Inter_Year : interYearElement.value || 'N/A',
                        SSC_CGPA : schoolCGPAElement.value || 'N/A',
                        SSC_Year : schoolYearElement.value || 'N/A',
                        Project : projectElement.value || 'N/A',
                        Resume : resumeELement.value || null,
                        Image : imageElement.value || null,
                        Github : gitEle.value || null,
                        Linkedin : linkedinEle.value || null,
                        Class : stdClass,
                        Access : 'Granted'
                    };
                    try {
                        let res = await axios.post('http://127.0.0.1:8000/students/', JSON.stringify(stdFormData), {
                        headers: {
                            'Content-Type': 'application/json',
                            },
                        });
                        if (res.status === 200 || res.status === 201){
                            Alert('success',`Student : ${nameElement.value} - Batch : ${batchElement.value}. Added Successfully.`);
                        }
                    } catch (error){
                        Alert('error', 'Unfortunately, the student addition was unsuccessful.<br/>Please check & try again !');
                    };
                    setTimeout(()=>{
                        history('/dashboard')
                    },3000)
                };
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
            if (isAdminAuth() && !isStudentAuth()){
                if (ModifyData === 'True'){
                    sessionStorage.setItem('updateStdForm','False')
                    history('/studentinfo');
                }else{
                    history('/dashboard');
                };
            }else{
                history('/studentinfo');
            };
        };

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
                studentForm(event);
                formsubmitBtn.classList.remove('btn-rotate');
                formsubmitBtn.style.width = '30%';
                formsubmitBtn.style.height = '40px';
                formsubmitBtn.innerHTML = 'Submit';
                formsubmitBtn.style.borderRadius = '5px';
                formsubmitBtn.style.background = '#616bf1';
                formsubmitBtn.style.border = 'solid 1px #616bf1';
            },3000);
        };

        const isBatchFoundExcel = (stdF_Data) => {
            const foundArr = [];
            batchesData.forEach((bData,index)=>{
                stdF_Data.forEach(data=>{
                    if (data.BatchName === bData.BatchName)foundArr.push(data.BatchName === bData.BatchName);
                });
            });
            return (foundArr.length === stdF_Data.length);
        };

        const isStdFoundExcel = (stdF_Data) =>{
            let isFound = false;
            stdF_Data.forEach(ex_data=>{
                studentsData.forEach(data=>{
                    if (parseInt(data.Phone) === ex_data.Phone || data.Email === ex_data.Email){
                        isFound = true;
                        return
                    };
                });
                if (isFound){
                    return
                };
            });
            if (isFound){
                return true;
            }else{
                return false;
            }
        };

        const updateStudentFiles = async() => {
            const file = document.querySelector('.excelfile').files[0];
            if (file){
                if (file.name.includes('.xlxs') || file.name.includes('.xls')){
                    checkExcelStd();
                }else{
                Alert('error','Only excel files are allowed !');
                };
            }else{
                Alert('error','Insert Excel file to upload student details !');
            };
        };

        const checkExcelStd = () => {
            const submitBtn = document.querySelector('.excel-upload-btn');
            const reader = new FileReader();
            const file = document.querySelector('.excelfile').files[0];
            reader.onload = (e) => {
              const binaryStr = e.target.result;
              const workbook = XLSX.read(binaryStr, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(sheet);
              if (jsonData && jsonData.length > 0){
                submitBtn.innerHTML = "";
                submitBtn.style.background = '#fff';
                submitBtn.style.borderRadius = '50%';
                submitBtn.style.width = '35px';
                submitBtn.style.height = '35px';
                submitBtn.style.border = 'solid 5px #1967d2';
                submitBtn.style.borderRight = 'solid 5px #fff';
                submitBtn.classList.add('btn-rotate');
                setTimeout(()=>{
                    if(isBatchFoundExcel(jsonData)){
                        if (!isStdFoundExcel(jsonData)){
                            jsonData.forEach((data,index)=>{
                                data['Class'] = stdClass;
                                (index === jsonData.length - 1) ? addStdDetilsByExcel(data) : addStdDetilsByExcel(data,true);
                            });
                        }else{
                            Alert('error','Student with Mobile or Email exists !');
                        };
                    }else{
                        Alert('error',"New student's batch not found !");
                    };
                    submitBtn.innerHTML = "Upload";
                    submitBtn.style.background = '#1967d2';
                    submitBtn.style.borderRadius = '5px';
                    submitBtn.style.width = '200px';
                    submitBtn.style.height = '30px';
                    submitBtn.style.border = 'none';
                    submitBtn.classList.remove('btn-rotate');
                    setTimeout(()=>{
                        if(isExcel)history('/dashboard');
                    },3000);
                },3000);
            }else{
                Alert('error','No data found or error finding data !')
            };
            };
            reader.readAsBinaryString(file);
        };
        


        const addStdDetilsByExcel = async(data,end=false) => {
            try {
                let res = await axios.post('http://127.0.0.1:8000/students/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    },
                });
                if (end){
                    if (res.status === 200 || res.status === 201){
                        setIsExcel(true);
                        Alert('success','Student details Uploaded successfully !');
                        setTimeout(()=>{
                            history('/dashboard');
                        },3000);
                    }else if (res.status === 302){
                        Alert('error','Students with Mobile or Email exists !');
                    };    
                };
            } catch (error){
                if (end){
                    setIsExcel(false);
                    Alert('error', 'Unfortunately, the student addition was unsuccessful.<br/>Please check & try again !');
                };
            };
        };

        const checkURL = (e,type) => {
            if (type === 'Image'){
                document.querySelector('.std-Image').setAttribute('src',e.target.value);
                if (e.target.value <= 1){
                    document.querySelector('.std-Image').setAttribute('src','images/Empty-Profile.png');
                }
            };
            if (e.target.value.length >= 255){
                Alert('error','URL length do not exceed more than 255 characters !');
                if (type === 'Image'){
                    document.querySelector('.std-Image').setAttribute('src','images/Empty-Profile.png');
                };
                e.target.value = "";
            };
        };

        const isValidUrl = (e) => {
            e.preventDefault();
            const expression = /^(https):\/\/[^ "]+(\.[^ "]+)+$/;
            const newUrlEles = []
            const urlEles = [imageElement.value, resumeELement.value, gitEle.value, linkedinEle.value]
            urlEles.forEach(ele=>{
                if (ele.length > 0){
                    newUrlEles.push(ele)
                };
            });
            if (newUrlEles.length > 0){
                const isUrlValid = newUrlEles.every(ele=>expression.test(ele));
                if (!isUrlValid){
                    Alert('error','Enter a valid URL !');
                };
                return isUrlValid;
            }else{
                return true
            };
        };

        const backToDashboard = () =>{
            if (isAdminAuth() && !isStudentAuth()){
                sessionStorage.setItem('updateStdForm','False');
                history('/dashboard');
            };
        };

    return (
        <div>
        <img className="screen-error-img" src="images/screen-size-error.png" width="100%" alt=""/>
            <div className="Main-Page-Container">
                <center className="student-register-form-center">
                <label style={{visibility : ModifyData === 'True' ? 'hidden' : 'visible'}} className='excel-upload'>Upload by Excel sheet : <input type='file' className='excelfile' /><button className='excel-upload-btn' onClick={updateStudentFiles}>Upload</button></label>
                <form onSubmit={(event)=>{isValidUrl(event) && btnRotate(event)}} action="" className="student-registration-form">
                    <h1>Student Register Form</h1>
                    <img src="images/V-CUBE-Logo.png" className="form-logo" alt="" onClick={backToDashboard} />
                    <span className="student-form-X-icon" onClick={xIconlocate}>&times;</span>
                    <label for="batch" className="batch-label"><h2>Select Batch : </h2>
                    <select name="batch" className="batch-select" style={{height : '35px', fontSize : '20px'}} disabled={(!isAdminAuth() && isStudentAuth()) ? true : false}>
                        {batchesData.map(data=>{
                            if((ModifyData === 'True' && wantToUpdateData.Class === data.Class) || (ModifyData !== 'True' && stdClass === data.Class)){
                            return(
                            <option value={data.BatchName} style={{fontSize : '25px'}}>{data.BatchName}</option>
                            )}
                        })};
                    </select>
                    </label>
                    <div className='image-upload-div'>
                        <img className='std-Image' src="images/Empty-Profile.png" />
                        <input type='text' className='std-image-input' placeholder='Profile Image URL' onChange={(e) =>checkURL(e,'Image')} />
                    </div>

                    <div className="std-personal-details-div">
                        <h3>Student &nbsp; S.No : &nbsp;<span className="std-ID" style={{fontWeight : 'lighter'}}>1</span></h3>
                        <label>Name : <input type="text" className="std-name" required disabled={(!isAdminAuth() && isStudentAuth()) ? true : false} /></label>
                        <label>Phone : <input type="number" className="std-phone" required disabled={(!isAdminAuth() && isStudentAuth()) ? true : false} /></label>
                        <label>Email : <input type="email" className="std-mail" required disabled={(!isAdminAuth() && isStudentAuth()) ? true : false} /></label>
                    </div>
                    <div className='pg-project-container'>
                        <label className="completed-pg" >Completed PostGraduate : &nbsp; 
                            <select className="pg-completion" onChange={pgCompleted}>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </label>
                        <label for="project" className="project-label">Project : &nbsp;
                            <select className="std-project">
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </label>
                    </div>
                    <div className="std-form-education-details-div">
                        <label>PG : <input type="text" className="std-pg" disabled /></label>
                        <label>PG Branch : <input type="text" className="std-pg-branch" disabled /></label>
                        <label>PG CGPA : <input type="number" className="std-pg-cgpa" step="0.01" disabled /></label>
                        <label>PG Passed Year : <input type="number" className="std-pg-year" disabled /></label>
                        <label>Degree : <input type="text" className="std-degree" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Degree Branch : <input type="text" className="std-degree-branch" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Degree CGPA : <input type="number" className="std-degree-cgpa" step="0.01" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Degree Passed Year : <input type="number" className="std-degree-year" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Inter : <span>12th</span></label>
                        <label>Inter Branch : <input type="text" className="std-inter-branch" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Inter CGPA : <input type="number" className="std-inter-cgpa" step="0.01" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>Inter Passed Year<input type="number" className="std-inter-year" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>School : <span>10th</span></label>
                        <label>School Branch : <span>N/A</span></label>
                        <label>School CGPA : <input type="number" className="std-school-cgpa" step="0.01" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                        <label>School Passed Year : <input type="number" className="std-school-year" required = {(!isAdminAuth() && isStudentAuth()) === 'True' ? true : false} /></label>
                    </div>
                    <div className='upload-div'>
                        <label className="resume-label">Resume link : <input className='std-resume' onChange={(e)=>checkURL(e,'Resume')} type='text' placeholder='Resume URL' /></label>
                        <label className='git-label'>Github : <input type='text' placeholder='Github link' className='git-url' onChange={(e)=>checkURL(e,'Github')} /></label>
                        <label className='linkedin-label'>Linkedin : <input type='text' placeholder='Linkedin link' className='linkedin-url' onChange={(e)=>checkURL(e,'Linkedin')} /></label>
                    </div>
                    <input className="form-submit-btn" type="submit" value="Submit" />
                    <a href='https://imgbb.com/' target='main' style={{fontSize : '18px', color : 'red', margin : '8px 20px 0 0'}}>Don't have resume or image link ?</a>
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
    }else{
        sessionStorage.setItem('Std_Tried','True');
        history('/studentinfo');
    };
    };
}else{
    sessionStorage.setItem('Tried','True');
    history('/login');
};
};

export default AddStudent;
