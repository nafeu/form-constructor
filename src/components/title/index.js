import React from "react";
import "./index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit } from "@fortawesome/free-solid-svg-icons";

const Title = () => {
  return (
    <div className="page-title">
      <FontAwesomeIcon icon={faUserEdit} /> Form{" "}
      <span className="page-title-bold">Constructor</span>
    </div>
  );
};

export default Title;
