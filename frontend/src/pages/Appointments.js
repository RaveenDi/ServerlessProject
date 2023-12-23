import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { Table, Button, Modal, message } from "antd";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Header from "../components/Header";
import Layout from "../components/Layout";
import UpdateAppointmentModal from "./UpdateAppointmentModal";

const { confirm } = Modal;

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAppointmentsData = async () => {
        try {
            dispatch(showLoading());
            // make the get appointments API call
            // const response = await axios.get(
            //     "/appointment",
            //     {
            //       userId: user.userId,
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
                    message: "Succcess",
                    data: [
                        {
                            doctorId: "00001",
                            appointmentDateTime: "2023-01-01T10:00:00",
                            date: "2023-01-01",
                            name: "Thisun Dayarathne",
                            speciality: 'Dental',
                            number: 2,
                            estimatedTime: '2023-01-01T10:20:00'
                        },
                        {
                            doctorId: "00001",
                            appointmentDateTime: "2023-01-02T10:00:00",
                            date: "2023-01-02",
                            name: "Thisun Dayarathne",
                            speciality: 'Dental',
                            number: 7,
                            estimatedTime: '2023-01-02T11:10:00'
                        }
                    ]
                }
            }
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
                    // make the get appointments API call
                    // const response = await axios.delete(
                    //     "/appointment",
                    //     {
                    //       doctorId: record.doctorId,
                    //       sessionDateTime: record.sessionDateTime
                    //       userId: user.userId,
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
                            message: "succesful"
                        }
                    }
                    dispatch(hideLoading());
                    if (response.data.success) {
                        toast.success(response.data.message);
                        navigate('/appointments');
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
                    {moment(record.appointmentDateTime).format("DD-MM-YYYY")} {moment(record.appointmentDateTime).format("HH:mm")}
                </span>
            ),
        },
        {
            title: "Number",
            dataIndex: "number",
            render: (text, record) => (
                <span>
                    {record.number}
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
                    {/* <Button type="link" onClick={() => {
                        setSelectedAppointment(record);
                        setVisible(true);
                    }}>
                        Update
                    </Button> */}
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
            <UpdateAppointmentModal
                visible={visible}
                onCancel={() => setVisible(false)}
                onUpdate={(values) => {
                    try {
                        dispatch(showLoading());
                        // make the update appointment API call
                        const response = {
                            data: {
                                success: true,
                                message: "Success"
                            }
                        }
                        dispatch(hideLoading());
                        if (response.data.success) {
                            toast.success(response.data.message);
                            setVisible(false);

                            // Update the local state after successful update
                            setAppointments((prevAppointments) =>
                                prevAppointments.map((appointment) =>
                                    appointment._id === selectedAppointment._id
                                        ? { ...appointment, ...values }
                                        : appointment
                                )
                            );

                            setVisible(false);

                            // Reload the page after updating
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        }
                    } catch (error) {
                        toast.error("Error updating appointment");
                        dispatch(hideLoading());
                    }
                }}
                appointment={selectedAppointment}
            />
        </Layout>
    );
}

export default Appointments;
