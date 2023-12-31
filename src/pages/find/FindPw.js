import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import style from './FindPw.module.css';
import axios from 'axios';
// import Swal from 'sweetalert2'

function FindPw() {
  const [findPw, setfindPw] = useState({ id: "", email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setfindPw(prev => ({ ...prev, [name]: value }));
   
  }
  const handlekeyup = (e) => {
    if (e.code === 'Enter') {
      if (findPw.id !== "" && findPw.email !== "") {
       
          const formData = new FormData();
          formData.append("id", findPw.id);
          formData.append("email", findPw.email);
          axios.post("/api/mail/findPw", formData).then(resp => {
            if (resp.data === 0) {
              alert("일치하는 정보가 없습니다");
            } else {
              alert("입력하신 이메일로 임시 비밀번호가 전송되었습니다");
            }
            setfindPw({ id: "", email: "" });
          })
       
      } else {
        alert("모든 항목을 입력해주세요");
      }
    }
  };
  const handlesubmit = () => {
    if (findPw.id !== "" && findPw.email !== "") {
        const formData = new FormData();
        formData.append("id", findPw.id);
        formData.append("email", findPw.email);
        axios.post("/api/mail/findPw", formData).then(resp => {
          if (resp.data === 0) {
            alert("일치하는 정보가 없습니다");
          } else {
            alert("입력하신 이메일로 임시 비밀번호가 전송되었습니다");
          }
          setfindPw({ id: "", email: "" });
        })
    } else {
      alert("모든 항목을 입력해주세요");
    }
  }


  return (
    <div className="container">

      <div className={style.container}>
        <div className={style.findPwBox}>
          <div className={style.logo}>DAEBBANG</div>
          <div className={style.inputFindPwBox}>
            <div className={style.inputFindPw}>
              <div className={style.loginFont}>아이디</div>
              <input type="text" name="id" placeholder="아이디를 입력해주세요" onChange={handleChange} onKeyUp={handlekeyup} value={findPw.id} className={style.inputInfo}></input>
              <div className={style.blank}></div>
              <div className={style.loginFont}>이메일</div>
              <input type="text" name="email" placeholder="이메일을 입력해주세요" onChange={handleChange} onKeyUp={handlekeyup} value={findPw.email} className={style.inputInfo}></input><br></br>
            </div>
          </div>
          <div className={style.btnBox}>
          <button className={style.loginBtn} onClick={handlesubmit}>작성완료</button>
          </div>
          <div className={style.findBox}>
            <Link to="/login" className={style.findPw}>로그인</Link>
            <Link to="/signUp" className={style.findPw}>회원가입</Link>
            <Link className={style.findPw} to="/find/findId">아이디 찾기</Link>
          </div>
        </div>
      </div>


    </div>
  )
}
export default FindPw;