import React from "react";
import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Map } from "react-kakao-maps-sdk";

import List from "./List/List";
import Info from "./Info/Info";

import style from "./OneRoom.module.css";

function OneRoom() {
  return (
    <div className="container">
      <Helmet>

      </Helmet>
      <div className={style.home_top}>
        <ul>
          <li>방 찾기</li>
          <li>찜한 매물</li>
          <li>방 내놓기(전월세만)</li>
        </ul>
      </div>

      <div className={style.main_box}>
        <div className={style.home_body_map}>
          <Map
            center={{ lat: 33.5563, lng: 126.79581 }} // 지도의 중심 좌표
            style={{ width: "100%", height: "100%" }} // 지도 크기
            level={3} // 지도 확대 레벨
          ></Map>
        </div>
        <div className={style.home_body_info}>
          <Routes>
            <Route path="list" element={<List />} />
            <Route path="info" element={<Info />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default OneRoom;
