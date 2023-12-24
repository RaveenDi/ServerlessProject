import { Button, Col, DatePicker, Row, TimePicker, List, Card } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import axios from "axios";

function CreateAppointments() {
    const { user } = useSelector((state) => state.user);
    const [doctor, setDoctor] = useState(null);
    const [sessions, setSessions] = useState([]);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const api_gateway_key = ''

    const getDoctorSessions = async () => {
        try {
            dispatch(showLoading());
            // make the doctor data API call
            const response = await axios.post(
                `https://hvczuacq1f.execute-api.us-east-1.amazonaws.com/dev/appointment/sessions`,
                {
                  doctorId: params.doctorId,
                //   userId: user._id
                  userId: '300'
                },
                {
                    headers: {
                        'x-api-key': `${api_gateway_key}`,
                      },
                }
              );
            dispatch(hideLoading());
            if (response.data.success) {
                setDoctor(response.data.data.doctor);
                setSessions(response.data.data.sessions);
            }
        } catch (error) {
            dispatch(hideLoading());
        }
    };

    const createAppointment = async (session) => {
        try {
            dispatch(showLoading());
            console.log(session)
            // make the create appointment API call
            const response = await axios.post(
                "https://hvczuacq1f.execute-api.us-east-1.amazonaws.com/dev/appointment",
                {
                    doctorId: session.doctorId,
                    sessionDateTime: session.sessionDateTime,
                    date: session.date,
                    userId: '300', // Assuming you have a function to get the current user ID
                },
                {
                    headers: {
                        'x-api-key': `${api_gateway_key}`,
                      },
                }
            );

            dispatch(hideLoading());
            if (response.data.success) {
                toast.success(response.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            toast.error("Error booking appointment");
            dispatch(hideLoading());
        }
    };

    useEffect(() => {
        getDoctorSessions();
    }, []);

    return (
        <Layout>
            {doctor && (
                <div>
                    <h1 className="page-title">
                        {doctor.name}
                    </h1>
                    <hr />
                    <Row gutter={20} className="mt-5" align="middle">
                        <Col span={12} sm={24} xs={24} lg={12}>
                            <h3>Available Sessions:</h3>
                            <List
                                grid={{ gutter: 16, column: 1 }}
                                dataSource={sessions}
                                renderItem={(session) => (
                                    <List.Item key={session.sessionDateTime}>
                                        <Card title={moment(session.sessionDateTime).format("DD-MM-YYYY HH:mm")}>
                                            <p>Date: {session.date}</p>
                                            <p>Available Slot Number: {session.alreadyBooked? session.count : session.count + 1}</p>
                                            <p>Estimated Time: {moment(session.estimatedTime).format("DD-MM-YYYY HH:mm")}</p>
                                            <Button
                                                className="primary-button mt-3 full-width-button"
                                                onClick={() => createAppointment(session)}
                                                disabled={session.alreadyBooked}
                                            >
                                                {session.alreadyBooked ? "Already Booked" : "Book Now"}
                                            </Button>
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </Col>
                    </Row>
                </div>
            )}
        </Layout>
    );
}

export default CreateAppointments;