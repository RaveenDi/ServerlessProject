import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { useSelector } from "react-redux";
import { Table, Button, Modal, message } from "antd";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Header from "../components/Header";
import Layout from "../components/Layout";
import axios from "axios";
import { awsData } from "../AwsData";
const { confirm } = Modal;

function Appointments() {
    const { user } = useSelector((state) => state.user);
    const userId = user.UserAttributes[0].Value
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const api_gateway_key = awsData.API_GATEWAY_KEY;
    const api_gateway_endpoint = awsData.API_GATEWAY_ENDPOINT;

    const getAppointmentsData = async () => {
        try {
            dispatch(showLoading());
            // make the get appointments API call
            const response = await axios.get(
                "https://"+api_gateway_endpoint+"/dev/appointment/"+userId,
                {
                    headers: {
                        'x-api-key': api_gateway_key,
                    },
                }
            );
            dispatch(hideLoading());
            if (response.data.success) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            dispatch(hideLoading());
        }
    };

    const handleDeleteAppointment = (record) => {
        confirm({
            title: 'Do you want to delete this appointment?',
            async onOk() {
                try {
                    dispatch(showLoading());
                    console.log("+++++", record)
                    // make the get appointments API call
                    const response = await axios.delete(
                        "https://"+api_gateway_endpoint+"/dev/appointment",
                        {
                            headers: {
                                'x-api-key': api_gateway_key,
                            },
                            data: {
                                doctorId: record.doctorId,
                                sessionDateTime: record.sessionDateTime,
                                userId: userId,
                            },
                        }
                    );
                    dispatch(hideLoading());
                    if (response.data.success) {
                        toast.success(response.data.message);
                        window.location.reload();
                    }
                } catch (error) {
                    toast.error("Error deleting appointment");
                    dispatch(hideLoading());
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const columns = [
        {
            title: "DoctorId",
            dataIndex: "doctorId",
        },
        {
            title: "Doctor",
            dataIndex: "name",
            render: (text, record) => (
                <span>
                    {record.name}
                </span>
            ),
        },
        {
            title: "Speciality",
            dataIndex: "speciality",
            render: (text, record) => (
                <span>
                    {record.speciality}
                </span>
            ),
        },
        {
            title: "Date & Time",
            dataIndex: "date",
            render: (text, record) => (
                <span>
                    {moment(record.sessionDateTime).format("DD-MM-YYYY")} {moment(record.sessionDateTime).format("HH:mm")}
                </span>
            ),
        },
        {
            title: "Number",
            dataIndex: "count",
            render: (text, record) => (
                <span>
                    {record.count}
                </span>
            ),
        },
        {
            title: "Estimted Time",
            dataIndex: "estimatedTime",
            render: (text, record) => (
                <span>
                    {moment(record.estimatedTime).format("DD-MM-YYYY")} {moment(record.estimatedTime).format("HH:mm")}
                </span>
            ),
        },
        {
            title: "Actions",
            render: (text, record) => (
                <span>
                    <Button type="link" onClick={() => handleDeleteAppointment(record)}>
                        Delete
                    </Button>
                </span>
            ),
        },
    ];
    useEffect(() => {
        getAppointmentsData();
    }, []);
    return (
        <Layout>
            <Header title={'Appointments'} />
            <Table columns={columns} dataSource={appointments} />
        </Layout>
    );
}

export default Appointments;
