import React from "react";
import { useNavigate } from "react-router-dom";

function Doctor({ doctor }) {
  const navigate = useNavigate();
  return (
    <div
      className="card p-2 cursor-pointer"
      onClick={() => navigate(`/book-appointment/${doctor.ID}`)}
    >
      <h1 className="card-title">
        {doctor.name}
      </h1>
      <hr />
      <p>
        <b>Speciality : </b>
        {doctor.speciality}
      </p>
    </div>
  );
}

export default Doctor;