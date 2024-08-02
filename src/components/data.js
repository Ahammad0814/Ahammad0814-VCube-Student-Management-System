import React from "react";
import axios from "axios";

const fetchStudentsData = async () => {
    try {
        let api = await axios({
            url: "https://vcubeapi.pythonanywhere.com/api/student/",
            method: "GET",
        });
        let apiResponse = api;
            return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};

const fetchClassData = async () => {
    try {
        let api = await axios({
            url: "https://vcubeapi.pythonanywhere.com/api/class/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
}

const fetchBatchData = async () => {
    try {
        let api = await axios({
            url: "https://vcubeapi.pythonanywhere.com/api/batch/",
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
            url: "https://vcubeapi.pythonanywhere.com/api/login/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    }
};

const fetchMessagesData = async () => {
    try {
        let api = await axios({
            url: "https://vcubeapi.pythonanywhere.com/api/messages/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    };
};

const fetchFeedbackData = async () => {
    try {
        let api = await axios({
            url: "https://vcubeapi.pythonanywhere.com/api/feedback/",
            method: "GET",
        });
        let apiResponse = api;
        return apiResponse.data.length > 0 ? apiResponse.data : [];
    } catch (error) {
    };
};

export { fetchStudentsData, fetchBatchData, fetchLoginData, fetchMessagesData, fetchClassData, fetchFeedbackData}
