import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import Layout from "../components/Layout";
import Doctor from "../components/Doctor";
import Header from "../components/Header";

function Home() {
  const [doctors, setDoctors] = useState([]);
  const dispatch = useDispatch();
  const getData = async () => {
    try {
      dispatch(showLoading())
      // make the get doctor details API call
      const response = {
        data:{
          success: true,
          data: [
            {
              _id: '000001',
              name: 'Thisun Dayarathna',
              speciality: 'Dental'
            },
            {
              _id: '000002',
              name: 'Savindu Ekanayake',
              speciality: 'Cardiology'
            },
            {
              _id: '000003',
              name: 'Yasiru Rathnayake',
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
    getData();
  }, []);
  return (
    <Layout>
      <Header title={'Available Doctors'} />
      <Row gutter={20}>
        {doctors.map((doctor) => (
          <Col span={8} xs={24} sm={24} lg={8}>
            <Doctor doctor={doctor} />
          </Col>
        ))}
      </Row>
    </Layout>
  );
}

export default Home;
