import { Button, Col, DatePicker, Row, TimePicker } from "antd";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function CreateAppointments() {
    const [setDate] = useState();
    const [setTime] = useState();
    const [doctor, setDoctor] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getDoctorData = async () => {
        try {
            dispatch(showLoading());
            // make the doctor data API call

            const response = {
                data: {
                    success: true,
                    data:
                        [{
                            _id: '000001',
                            firstName: 'Thisun',
                            lastName: 'Dayarathna',
                            speciality: 'Dental'
                        }]
                }
            };

            dispatch(hideLoading());
            if (response.data.success) {
                setDoctor(response.data.data[0]); // Assuming you want to select the first doctor
            }
        } catch (error) {
            console.log(error);
            dispatch(hideLoading());
        }
    };

    const bookNow = async () => {
        try {
            dispatch(showLoading());
            // make the create appointment API call

            const response = {
                data: {
                    success: true,
                    message: "Success"
                }
            };

            dispatch(hideLoading());
            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/appointments');
            }
        } catch (error) {
            toast.error("Error booking appointment");
            dispatch(hideLoading());
        }
    };

    useEffect(() => {
        getDoctorData();
    }, []);

    return (
        <Layout>
            {doctor && (
                <div>
                    <h1 className="page-title">
                        {doctor.firstName} {doctor.lastName}
                    </h1>
                    <hr />
                    <Row gutter={20} className="mt-5" align="middle">
                        <Col span={8} sm={24} xs={24} lg={8}>
                            <p>
                                <b>Speciality : </b>
                                {doctor.speciality}
                            </p>
                            <div className="d-flex flex-column pt-2 mt-2">
                                <DatePicker
                                    format="DD-MM-YYYY"
                                    onChange={(value) => {
                                        setDate(moment(value).format("DD-MM-YYYY"));
                                        setTime(null);
                                    }}
                                />
                                <TimePicker
                                    format="HH:mm"
                                    className="mt-3"
                                    onChange={(value) => setTime(moment(value).format("HH:mm"))}
                                />
                                <Button
                                    className="primary-button mt-3 full-width-button"
                                    onClick={bookNow}
                                >
                                    Book Now
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
            )}
        </Layout>
    );
}

export default CreateAppointments;