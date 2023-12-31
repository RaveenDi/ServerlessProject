import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertsSlice";
import Layout from "../components/Layout";
import Doctor from "../components/Doctor";
import Header from "../components/Header";
import { awsData } from "../AwsData";
import axios from "axios";

function Home() {
  const [doctors, setDoctors] = useState([]);
  const dispatch = useDispatch();
  const api_gateway_endpoint = awsData.API_GATEWAY_ENDPOINT;
  const api_gateway_key = awsData.API_GATEWAY_KEY;

  const getData = async () => {
    try {
      dispatch(showLoading());
      // make the get doctor details API call
      const response = await axios.get(
        "https://"+api_gateway_endpoint+"/dev/doctor",
        {
          headers: {
            "x-api-key": api_gateway_key,
          },
        }
      );
      dispatch(hideLoading());
      console.log(response);
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
    }
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <Layout>
      <Header title={"Available Doctors"} />
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
