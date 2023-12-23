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

    const getDoctorSessions = async () => {
        try {
            dispatch(showLoading());
            // make the doctor data API call
            // const response = await axios.post(
            //     "/appointment/sessions",
            //     {
            //       doctorId: params.doctorId,
            //     },
            //     {
            //       headers: {
            //         Authorization: `Bearer ${localStorage.getItem("token")}`,
            //       },
            //     }
            //   );

            const response = {
                data: {
                    success: true,
                    data: {
                        sessions:
                            [{
                                _id: '000001',
                                sessionDateTime: '2023-12-20T17:00:00',
                                date: '2023-12-20',
                                count: 2,
                                estimatedTime: '2023-12-20T17:20:00'
                            },
                            {
                                _id: '000001',
                                sessionDateTime: '2023-12-21T17:00:00',
                                date: '2023-12-21',
                                count: 0,
                                estimatedTime: '2023-12-21T17:00:00'
                            },
                            {
                                _id: '000001',
                                sessionDateTime: '2023-12-22T17:00:00',
                                date: '2023-12-22',
                                count: 7,
                                estimatedTime: '2023-12-22T18:10:00'
                            }
                            ],
                        doctor: {
                            _id: '000001',
                            name: 'Thisun Dayarathna',
                            speciality: 'Dental'
                        }
                    }
                }
            };

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
            // make the create appointment API call

            // const response = await axios.post(
            //     "/appointment",
            //     {
            //         doctorId: session._id,
            //         sessionDateTime: session.sessionDateTime,
            //         date: session.date,
            //         userId: user._id, // Assuming you have a function to get the current user ID
            //     },
            //     {
            //         headers: {
            //             Authorization: `Bearer ${localStorage.getItem("token")}`,
            //         },
            //     }
            // );

            const response = {
                data: {
                    success: true,
                    message: "Success"
                }
            }

            dispatch(hideLoading());
            if (response.data.success) {
                toast.success(response.data.message);
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
                                    <List.Item key={session._id}>
                                        <Card title={moment(session.sessionDateTime).format("DD-MM-YYYY HH:mm")}>
                                            <p>Date: {session.date}</p>
                                            <p>Available Slot Number: {session.count + 1}</p>
                                            <p>Estimated Time: {moment(session.estimatedTime).format("DD-MM-YYYY HH:mm")}</p>
                                            <Button
                                                className="primary-button mt-3 full-width-button"
                                                onClick={() => createAppointment(session)}
                                            >
                                                Book Now
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