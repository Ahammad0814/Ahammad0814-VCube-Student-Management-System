import React, { useEffect, useState } from "react";
import { fetchBatchData, fetchLoginData } from "./data";
import axios from "axios";

export const date_time = () => {
    const today = new Date();
    const day = today.getDate();
    const options = { month: 'long' };
    const month = today.toLocaleDateString('en-US', options);
    const year = today.getFullYear();
    const hour = today.getHours();
    const min = today.getMinutes();
    const sec = today.getSeconds();

    return `${day} ${month} ${year} ${hour} ${min} ${sec}`;
};

const DashboardHeader = ({selectBatch, studentData, todayDate, Alert, selected_Cls, class_Data, user, login_Data, update_Data}) => {
    const [batchData,setBatchData] = useState([]);

    const getBatches = async () => {
        const batches_Data = await fetchBatchData();
        setBatchData(batches_Data);
    };

    useEffect(() => {
        getBatches();
    }, []);

    let batch_Data = true;
    if (!Array.isArray(batchData)){
        batch_Data = false;
    };

    let stdLength = 0;
    if (studentData){
        studentData.forEach(data=>{
            if ((selectBatch === 'All' || data.BatchName === selectBatch) && (data.Class === selected_Cls || selected_Cls === "All")){
                stdLength++;
            };
        });
    };

    let classes = 0;
    let mockTests = 0;
    let caseStudies = 0;
    let interviews = 0;
    if (batch_Data){
        batchData.forEach((batch,index)=> {
            if ((selectBatch === 'All' || batch.BatchName === selectBatch) && (batch.Class === selected_Cls || selected_Cls === 'All')) {
                classes += parseInt(batch.Classes.split(' ')[0]);
                mockTests += parseInt(batch.MockTests.split(' ')[0]);
                caseStudies += parseInt(batch.CaseStudies.split(' ')[0]);
                interviews += parseInt(batch.Interviews.split(' ')[0]);
            };
        });
    };

    const setProgress = (percent,idx) => {
        const percentage = (percent === 0) ? 1 : percent;
        let progressBar = "";
        let progressText = "";
        progressBar = document.querySelector(`.progress-bar-${idx}`);
        progressText = document.querySelector(`.progress-text-${idx}`);
            if(progressBar){
                const radius = progressBar.r.baseVal.value;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                progressBar.style.strokeDashoffset = offset;
                progressText.textContent = percent < 10 ? `0${percent}%` : `${percent}%`;
            };
    };

    const updatePeformance = () => {
        let stdClassCnt = 0;
        let stdMockCnt = 0;
        let stdStudyCnt = 0;
        let stdInterviewCnt = 0;
            studentData.forEach((data,index)=>{
          if ((selectBatch === 'All' || data.BatchName === selectBatch) && (data.Class === selected_Cls || selected_Cls === "All")){
            stdClassCnt += parseInt(data.Classes.split(' ')[0]);
            stdMockCnt += parseInt(data.MockTests.split(' ')[0]);
            stdStudyCnt += parseInt(data.CaseStudies.split(' ')[0]);
            stdInterviewCnt += parseInt(data.Interviews.split(' ')[0]);
          }
        });

        let class_Score = (stdClassCnt / (classes * stdLength)) * 100;
        if (class_Score === Infinity || class_Score <= 0 || !class_Score){
            class_Score = 0;
        }
        setProgress(Math.floor(class_Score),2);

        let mock_Score = (stdMockCnt / (mockTests * stdLength)) * 100;
        if (mock_Score === Infinity || mock_Score <= 0 || !mock_Score){
            mock_Score = 0;
        }
        setProgress(Math.floor(mock_Score),3);
        
        let study_Score = (stdStudyCnt / (caseStudies * stdLength)) * 100;
        if (study_Score === Infinity || study_Score <= 0 || !study_Score){
            study_Score = 0;
        }
        setProgress(Math.floor(study_Score),4);

        let interview_Score = (stdInterviewCnt / (interviews * stdLength)) * 100;
        if (interview_Score === Infinity || interview_Score <= 0 || !interview_Score){
            interview_Score = 0;
        }
        setProgress(Math.floor(interview_Score),5);

        let overAllScore = ((class_Score * 0.25) || 0) + ((mock_Score * 0.25) || 0) + ((study_Score * 0.25) || 0 ) + ((interview_Score * 0.25) || 0)
        if (overAllScore === Infinity || overAllScore <= 0 || !overAllScore){
            overAllScore = 0;
        }
        setProgress(Math.floor(overAllScore),1);
    };
    updatePeformance();

    const setClassesProgress = (percent,idx) => {
        const percentage = (percent === 0) ? 1 : percent;
        let progressBar;
        let progressText;
        progressBar = document.querySelector(`.class-progress-bar-${idx}`);
        progressText = document.querySelector(`.class-progress-bar-txt-${idx}`);
            if(progressBar){
                const radius = progressBar.r.baseVal.value;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (percentage / 100) * circumference;
                progressBar.style.strokeDashoffset = offset;
                progressText.textContent = percent < 10 ? `0${percent}%` : `${percent}%`;
                // if (percent <= 35){
                //     progressBar.style.stroke = 'red';
                // }else if (percent > 35 && percent <= 50){
                //     progressBar.style.stroke = 'gold';
                // }else if (percent > 50 && percent <= 75){
                //     progressBar.style.stroke = 'orange';
                // }else if (percent > 75){
                //     progressBar.style.stroke = 'green';
                // }
            };
    };

    const updateClassPerformance = (cls) => {
        const batchDataArray = [];
        let totalCalc = 0;
        let classCnt = 0;
        let mockCnt = 0;
        let studyCnt = 0;
        let interviewCnt = 0;
        let stdClassCnt = 0;
        let stdMockCnt = 0;
        let stdStudyCnt = 0;
        let stdInterviewCnt = 0;
        let stdCnt = 0;
        let batchCnt = 0;
        batchData.forEach((bthData)=>{
            if (cls === bthData.Class){
                classCnt += parseInt(bthData.Classes.split(' ')[0]);
                mockCnt += parseInt(bthData.MockTests.split(' ')[0]);
                studyCnt += parseInt(bthData.CaseStudies.split(' ')[0]);
                interviewCnt += parseInt(bthData.Interviews.split(' ')[0]);
                studentData.forEach(data=>{
                    if (cls === data.Class && bthData.BatchName === data.BatchName){
                        stdCnt++
                        stdClassCnt += parseInt(data.Classes.split(' ')[0]);
                        stdMockCnt += parseInt(data.MockTests.split(' ')[0]);
                        stdStudyCnt += parseInt(data.CaseStudies.split(' ')[0]);
                        stdInterviewCnt += parseInt(data.Interviews.split(' ')[0]);
                    }
                });

                const stdTotal = stdClassCnt + stdStudyCnt + stdMockCnt + stdInterviewCnt;
                const batchTotal = classCnt + mockCnt + studyCnt + interviewCnt;
                const denominator = batchTotal * stdCnt;
                const calculation = denominator !== 0 ? (stdTotal / denominator) * 100 : 0;
                batchDataArray.push({[bthData.BatchName] : Math.floor(calculation)});
                classCnt = 0;
                mockCnt = 0;
                studyCnt = 0;
                interviewCnt = 0;
                stdClassCnt = 0;
                stdMockCnt = 0;
                stdStudyCnt = 0;
                stdInterviewCnt = 0;
                stdCnt = 0;
            };
        });

    batchDataArray.forEach(data=>{
        totalCalc += parseInt(Object.values(data));
    });

    const denominator_ = batchDataArray.length * 100;
    const finalCalc = denominator_ !== 0 ? (totalCalc / denominator_) * 100 : 0;

    return Math.floor(finalCalc);
    };

    const stdAttPopUp = (name,status) => {
        if((!batchData) && (!studentData)){
            Alert('error','Something went wrong. Please try again later !')
        }else if ((batchData && batchData.length === 0) && (studentData && studentData.length === 0)){
            Alert('note','No data found to take an attendance !');
        }else{
            const mainDivEle = document.querySelector('.std-attendance-pop-up-div');
            const attStatus = document.querySelector('.att-status');
            const attStatusBtn = document.querySelector('.btn-att-status');
            const attSelectOpts = document.querySelector('.selected-opt');
            const attSubmitBtn = document.querySelector('.batch-att-btn');
            if (status === 'open'){
                mainDivEle.style.opacity = '1';
                mainDivEle.style.visibility = 'visible';
                attStatus.innerHTML = name;
                attStatusBtn.innerHTML = name;
                batchData.forEach((data,index)=>{
                    const optsImgEle = document.querySelector(`.batch-att-img-${index}`);
                    const appOptImgEle = document.querySelector('.batch-opt-last-img');
                    if (optsImgEle){
                        if (name === 'Class'){
                            data.Classes.includes(todayDate) ? optsImgEle.setAttribute('src','images/batch-P.png') : optsImgEle.setAttribute('src','images/batch-A.png');
                            batchData.every(data=>data.Classes.includes(todayDate)) ? appOptImgEle.setAttribute('src','images/batch-P.png') : appOptImgEle.setAttribute('src','images/batch-A.png'); 
                        }else if (name === 'MockTest'){
                            data.MockTests.includes(todayDate) ? optsImgEle.setAttribute('src','images/batch-P.png') : optsImgEle.setAttribute('src','images/batch-A.png');
                            batchData.every(data=>data.MockTests.includes(todayDate)) ? appOptImgEle.setAttribute('src','images/batch-P.png') : appOptImgEle.setAttribute('src','images/batch-A.png'); 
                        }else if (name === 'CaseStudy'){
                            data.CaseStudies.includes(todayDate) ? optsImgEle.setAttribute('src','images/batch-P.png') : optsImgEle.setAttribute('src','images/batch-A.png');
                            batchData.every(data=>data.CaseStudies.includes(todayDate)) ? appOptImgEle.setAttribute('src','images/batch-P.png') : appOptImgEle.setAttribute('src','images/batch-A.png'); 
                        }else if (name === 'Interview'){
                            data.Interviews.includes(todayDate) ? optsImgEle.setAttribute('src','images/batch-P.png') : optsImgEle.setAttribute('src','images/batch-A.png');
                            batchData.every(data=>data.Interviews.includes(todayDate)) ? appOptImgEle.setAttribute('src','images/batch-P.png') : appOptImgEle.setAttribute('src','images/batch-A.png'); 
                        }
                    };
                });
            }else if (status === 'close'){
                mainDivEle.style.opacity = '0';
                setTimeout(()=>{
                    mainDivEle.style.visibility = 'hidden';
                    attSelectOpts.setAttribute('data-value', "");
                    attSelectOpts.innerHTML = 'Select Batch';
                    const mainDivArrowEle = document.querySelector('#down-arrow');
                    if (mainDivArrowEle.classList.contains('downArrow-rotate')){
                        attBatchDivVisibility();
                    }                    
                },300);
            }else if (status === 'submit'){
                const selectedBatch = attSelectOpts.getAttribute('data-value');
                const attName = attStatus.innerHTML;
                if (selectedBatch){
                    attSubmitBtn.style.width = '50px';
                    attSubmitBtn.style.height = '50px';
                    attSubmitBtn.style.color = 'transparent';
                    setTimeout(()=>{
                        attSubmitBtn.style.borderRadius = '50%';
                        attSubmitBtn.style.border = 'solid 5px #616bf1';
                        attSubmitBtn.style.borderRight = 'solid 5px transparent';
                        attSubmitBtn.style.background = 'transparent';
                        attSubmitBtn.classList.add('btn-rotate');
                    setTimeout(()=>{
                        let found = "";
                        if (attName === 'Class'){
                            found = batchData.some(data=>(selectedBatch === 'All' || data.BatchName === selectedBatch) && data.Classes.includes(todayDate));
                        }else if (attName === 'MockTest'){
                            found = batchData.some(data=>(selectedBatch === 'All' || data.BatchName === selectedBatch) && data.MockTests.includes(todayDate));
                        }else if (attName === 'CaseStudy'){
                            found = batchData.some(data=>(selectedBatch === 'All' || data.BatchName === selectedBatch) && data.CaseStudies.includes(todayDate));
                        }else if (attName === 'Interview'){
                            found = batchData.some(data=>(selectedBatch === 'All' || data.BatchName === selectedBatch) && data.Interviews.includes(todayDate));
                        }
                        if (!found){
                            let isAllGood = false;
                            if (selectedBatch !== 'All'){
                                const stdFind = studentData.some(std=>std.BatchName === selectedBatch);
                                if (stdFind){
                                    isAllGood = true;
                                }else{
                                    Alert('error','Students not found in the selected batch !');
                                };
                            }else if (selectedBatch === 'All'){
                                let stdCnt = 0;
                                batchData.forEach((data,index)=>{
                                    const isFound = studentData.some(fdata=>fdata.BatchName === data.BatchName);
                                    if (isFound){
                                        stdCnt += 1;
                                    };
                                });
                                if (stdCnt === batchData.length){
                                    isAllGood = true;
                                }else{
                                    Alert('error','Some students from the selected batch were not found !');
                                }
                            };
                            if (isAllGood){
                                batchData.forEach((data,index)=>{
                                    if (selectedBatch === 'All' || selectedBatch === data.BatchName){
                                        if (attName === 'Class'){
                                            data.Classes = `${parseInt(data.Classes.split(' ')[0]) + 1} ${data.id} ${todayDate}`;
                                        }else if (attName === 'MockTest'){
                                            data.MockTests = `${parseInt(data.MockTests.split(' ')[0]) + 1} ${data.id} ${todayDate}`;
                                        }else if (attName === 'CaseStudy'){
                                            data.CaseStudies = `${parseInt(data.CaseStudies.split(' ')[0]) + 1} ${data.id} ${todayDate}`;
                                        }else if (attName === 'Interview'){
                                            data.Interviews = `${parseInt(data.Interviews.split(' ')[0]) + 1} ${data.id} ${todayDate}`;
                                        };
                                        updateBatchAtt(data,attName,selectedBatch);
                                    };
                                });
                                stdAttPopUp(null,'close');
                            };
                        }else{
                            Alert('warning','Some of selected batches have already taken attendance.<br/>Check and try again !',4000);
                        };
                        attSubmitBtn.classList.remove('btn-rotate');
                        attSubmitBtn.style.width = '90%';
                        attSubmitBtn.style.borderRadius = '5px';
                        attSubmitBtn.style.border = 'solid 1px #616bf1';
                        attSubmitBtn.style.background = '#616bf1';
                        attSubmitBtn.style.height = '50px';
                        setTimeout(()=>{
                            attSubmitBtn.style.color = '#ffff';
                            attSelectOpts.setAttribute('data-value', "");
                            attSelectOpts.innerHTML = 'Select Batch';
                        },250);
                    },3000);
                    },500);
                }else{
                    Alert('error','Error : Please Select Batch !');
                }
            };
        }
    };

    const updateBatchAtt = async (data,name,batch) => {
        try {
            let res = await axios.put('http://127.0.0.1:8000/batches/', JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.status === 200 || res.status === 201) {
                Alert('success',`${batch} ${name} Batch Attendance Updated successfully!`);
                getBatches();
                update_Data();
            }
        } catch (error) {
            Alert('error','Unfortunately, the batch Attendance addition was unsuccessful.<br/>Please check and try again!',8000);
        };
    };

    const attBatchDivVisibility = () =>{
        const divEle = document.querySelector('.opts-div');
        const mainDivArrowEle = document.querySelector('#down-arrow');
        mainDivArrowEle.classList.toggle('downArrow-rotate');
        divEle.classList.toggle('opts');
    };

    const attBatchOptSelect =(batchName) => {
        const selectedOpt = document.querySelector('.selected-opt')
        selectedOpt.innerHTML = batchName;
        if (batchName === 'All Batches'){
            selectedOpt.setAttribute('data-value','All');
        }else{
            selectedOpt.setAttribute('data-value',batchName);
        }
        attBatchDivVisibility();
    };

    const classPerformanceDiv = (status='close') => {
        if (user !== "Super Admin")return
        const divEle = document.querySelector('.all-class-performance-container');
        divEle.style.opacity = (status === 'open') ? '1' : '0';
        divEle.style.visibility = (status === 'open') ? 'visible' : 'hidden';
        setTimeout(()=>{
            class_Data.forEach((data,index)=>{
                (status === 'open') ? setClassesProgress(updateClassPerformance(data.Class),index) : setClassesProgress(0,index);
            });
        },((status === 'open')) ? 250 : 500);
    };

  return (
    <div>
        <div className="dashboard-header">
            <div className="header-students-div header-div" onDoubleClick={()=>(user === "Super Admin") && classPerformanceDiv('open')}>
                <div className="progress-circle progress-circle-3">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle className="progress-bar progress-bar-1" style={{stroke : '#0110eb'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                    </svg>
                    <span className="header-span-img"><img src="images/header-student-img.png" width="40%" alt=""/></span>
                    <div className="msg-div" style={{background : '#0110eb'}}>
                        <p className="show-percent progress-text-1"></p>
                        <div id="v" style={{borderTop : 'solid 10px #0110eb'}}></div>
                    </div>
                </div>
            <div className="inner-students-div inner-students-div-1">
                <h3>Total Students</h3>
                <h3>{stdLength < 10 ? `0${stdLength}` : stdLength}</h3>
            </div>
            </div>
            <div className="header-no-of-class-div header-div" onClick={()=>stdAttPopUp('Class','open')}>
                <div className="progress-circle progress-circle-3">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle className="progress-bar progress-bar-2" style={{stroke : '#4b04b2'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                    </svg>
                    <span className="header-span-img"><img src="images/header-class-img.png" width="50%" alt=""/></span>
                    <div className="msg-div" style={{background : '#4b04b2'}}>
                        <p className="show-percent progress-text-2"></p>
                        <div id="v" style={{borderTop : 'solid 10px #4b04b2'}}></div>
                    </div>
                </div>
                <div className="inner-students-div inner-students-div-2">
                    <h3>Classes</h3>
                    <h3>{classes < 10 ? `0${classes}` : classes}</h3>
                </div>
            </div>
            <div className="header-mock-tests-div header-div" onClick={()=>stdAttPopUp('MockTest','open')}>
                <div className="progress-circle progress-circle-3">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle className="progress-bar progress-bar-3" style={{stroke : 'orange'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                    </svg>
                    <span className="header-span-img"><img src="images/header-mock-test-img.png" width="50%" alt=""/></span>
                    <div className="msg-div" style={{background : 'orange'}}>
                        <span className="show-percent progress-text-3"></span>
                        <div id="v" style={{borderTop : 'solid 10px orange'}}></div>
                    </div>
                </div>
                <div className="inner-students-div inner-students-div-3">
                    <h3>Mock Tests</h3>
                    <h3>{mockTests < 10 ? `0${mockTests}`: mockTests}</h3>
                </div>
            </div>
            <div className="header-case-study-div header-div" onClick={()=>stdAttPopUp('CaseStudy','open')}>
                <div className="progress-circle progress-circle-3">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle className="progress-bar progress-bar-4" style={{stroke : 'red'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                    </svg>
                    <span className="header-span-img"><img src="images/header-case-study-img.png" width="50%" alt=""/></span>
                    <div className="msg-div" style={{background : 'red'}}>
                        <p className="show-percent progress-text-4"></p>
                        <div id="v" style={{borderTop : 'solid 10px red'}}></div>
                    </div>
                </div>
                <div className="inner-students-div inner-students-div-4">
                    <h3>Case Studies</h3>
                    <h3>{caseStudies < 10 ? `0${caseStudies}` : caseStudies}</h3>
                </div>
            </div>
            <div className="header-interview-div header-div" onClick={()=>stdAttPopUp('Interview','open')}>
                <div className="progress-circle progress-circle-3">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                        <circle className="progress-bar progress-bar-5" style={{stroke : 'green'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                    </svg>
                    <span className="header-span-img"><img src="images/header-interview-img.png" width="50%" alt=""/></span>
                    <div className="msg-div" style={{background : 'green'}}>
                        <p className="show-percent progress-text-5"></p>
                        <div id="v" style={{borderTop : 'solid 10px green'}}></div>
                    </div>
                </div>
                <div className="inner-students-div inner-students-div-5">
                    <h3>Interviews</h3>
                    <h3>{interviews < 10 ? `0${interviews}` : interviews}</h3>
                </div>
            </div>
        </div>
        <div className="std-attendance-pop-up-div">
        <div className="std-attendance-pop-up-inner-div">
            <h1><span className="att-status">Classes</span> <span> Attendance</span></h1>
            <h2>Date : <span style={{color: '#616bf1'}}>{todayDate}</span></h2>
            <h2>Total Students : <span style={{color: '#616bf1'}}>{stdLength < 10 ? `0${stdLength}` : stdLength}</span></h2>
            <div className="att-opts-container">
                <div className="main-opt-div" onClick={attBatchDivVisibility}>
                    <p className="selected-opt" data-value="">Select Batch</p>
                    <img id="down-arrow" src="images/down-arrow.png" alt=""/>
                </div>
                <div className="opts-div" style={{top : '50px'}}>
                {Array.isArray(batchData) && batchData.map((data,index)=>{
                    if (selected_Cls === 'All' || data.Class === selected_Cls){
                        return(
                            <li className={`batch-opt-${index} batch-opt`} onClick={()=>attBatchOptSelect(data.BatchName)}><span>{data.BatchName}</span><img className={`batch-att-img-${index}`} src="" width="40px" alt=""/></li>
                        )
                    }
                    })}
                    <li className="batch-opt-last batch-opt" onClick={()=>attBatchOptSelect('All Batches')}><span>All Batches</span><img className="batch-opt-last-img" src="" width="40px" alt=""/></li>
                </div>
            </div>
         <button className="batch-att-btn" onClick={()=>stdAttPopUp(null,'submit')}>Take Today <span className="btn-att-status"></span> Attendance</button>
            <span id="X-times-span" onClick={()=>stdAttPopUp(null,'close')}>&times;</span>
        </div>
    </div>
        <div className="all-class-performance-container">
            <img src="images/V-CUBE-Logo.png" className="main-logo"/>
            <span className="close-container" onClick={classPerformanceDiv}>&times;</span>
            <h1 style={{marginTop : '120px'}}>Class Performance</h1>
            <div className="perfromance-circles-div" style={{overflowY : (login_Data && login_Data.length >= 6) ? 'scroll' : 'auto'}}>
                {class_Data.map((data,index)=>(
                    <div style={{width : '100%',height : '270px',display : 'flex',flexDirection : 'column', alignItems : 'center', justifyContent:'center'}}>
                    <div className="progress-circle" style={{position : 'relative',boxShadow : '0 0 10px rgba(0,0,0,0.5)',background : 'linear-gradient( #2cd4ee, #9654f2)',height : '150px', width : '150px'}}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle className="progress-bg" cx="50" cy="50" r="45" style={{stroke : '#edf0f6'}}></circle>
                            <circle className={`progress-bar class-progress-bar-${index}`} style={{stroke : '#2cd8ef'}} cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset="282.6"></circle>
                        </svg>
                        <span className={`header-span-circle-txt class-progress-bar-txt-${index}`} style={{color : '#fff',fontWeight : 'bold'}}>00%</span>
                    </div>
                    <h1 style={{color : '#543cc8'}}>{data.Class}</h1>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
};

export default DashboardHeader;
