import React, { useEffect, useState } from "react";
import { Modal, Form, DatePicker, Select } from "antd";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { Option } = Select;

const UpdateAppointmentModal = ({ visible, onCancel, onUpdate, appointment }) => {
    const [doctors, setDoctors] = useState([]);
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchDoctors = async () => {
        try {
            dispatch(showLoading());
            // make the doctor details API call
            const response = {
                data: {
                    success: true,
                    data: [
                        {
                            _id: '000001',
                            firstName: 'Thisun',
                            lastName: 'Dayarathna',
                            speciality: 'Dental'
                        },
                        {
                            _id: '000002',
                            firstName: 'Savindu',
                            lastName: 'Ekanayake',
                            speciality: 'Cardiology'
                        },
                        {
                            _id: '000003',
                            firstName: 'Yasiru',
                            lastName: 'Rathnayake',
                            speciality: 'Dermatology'
                        }
                    ]
                }
            }
            dispatch(hideLoading())
            if (response.data.success) {
                setDoctors(response.data.data);
            }
        } catch (error) {
            dispatch(hideLoading())
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        if (visible && appointment) {
            form.setFieldsValue({
                date: moment(appointment.appointmentDateTime),
                doctor: appointment.doctorInfo.name,
            });
        }
    }, [visible, appointment, form]);

    const handleUpdate = () => {
        form
            .validateFields()
            .then((values) => {
                onUpdate(values);
            })
            .catch((errorInfo) => {
                console.error("Validation Failed:", errorInfo);
            });
    };

    return (
        <Modal
            title="Update Appointment"
            visible={visible}
            onOk={handleUpdate}
            onCancel={onCancel}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="date"
                    label="Date & Time"
                    rules={[{ required: true, message: "Please select date & time" }]}
                >
                    <DatePicker showTime format="DD-MM-YYYY HH:mm" />
                </Form.Item>
                <Form.Item
                    name="doctor"
                    label="Doctor"
                    rules={[{ required: true, message: "Please select a doctor" }]}
                >
                    <Select>
                        {doctors.map((doctor) => (
                            <Option key={doctor._id} value={doctor._id}>
                                {`${doctor.firstName} ${doctor.lastName}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateAppointmentModal;
