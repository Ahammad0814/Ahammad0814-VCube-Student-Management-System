import React from "react";
import axios from "axios";

// let StudentsData = [];
// let BatchesData = [];
// let DatesData = [];
// let LoginData = [];

const fetchStudentsData = async () => {
    try {
        let api = await axios({
            url: "http://127.0.0.1:8000/students/",
            method: "GET",
        });
        let apiResponse = api;
            return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};

const fetchBatchData = async () => {
    try {
        let api = await axios({
            url: "http://127.0.0.1:8000/batches/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};



const fetchLoginData = async () => {
    try {
        let api = await axios({
            url: "http://127.0.0.1:8000/login/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};

const fetchDatesData = async () => {
    try {
        let api = await axios({
            url: "http://127.0.0.1:8000/dates/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};

export { fetchStudentsData, fetchBatchData, fetchLoginData, fetchDatesData }