import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import style from "../../css/WriteBoard/WriteBoard.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useRef,useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const FreeBoardWrite = ({loginId}) => {
    
    const navi = useNavigate();

    const quillRef = useRef();
    const [formData, setFormData] = useState({
        title: "",
        contents: "",
        files: {}
    });
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, files: { ...prev.files, [e.target.name]: e.target.files[0] } }));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    const [sysNameList, setSysNameList] = useState([]);

    const imageHandler = (file) => {
        // 이미지 선택 창 나타나게 하기
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("multiple", "true");
        input.setAttribute("accept", "image/*");
        input.click();

        const editor = quillRef.current.getEditor();
        // 이미지 선택 시 동작
        input.addEventListener("change", async () => {
            const files = input.files;
            const formImg = new FormData();
            for (let i = 0; i < files.length; i++) {
                formImg.append("files", files[i]);
            }
            try {
                const imgUrl = await axios.post("/api/file/upload", formImg);
                console.log(imgUrl)
                const range = editor.getSelection();

                for (let i = 0; i < imgUrl.data.length; i++) {
                    setSysNameList(prev => [...prev, imgUrl.data[i].split("/uploads/board/")[1]]);
                    editor.insertEmbed(range.index, 'image', imgUrl.data[i]);
                }

            } catch (error) {
                console.log(error);
            }
        })
    }

    let existImgSearch = (contents) => { // 게시글 내용에 존재하는 태그 뽑아내기 ( sysName )
        const imgSrcRegex = /<img[^>]*src=["']\/uploads\/board\/([^"']+)["'][^>]*>/g;
        let existImgList = [];
        let match;
        while ((match = imgSrcRegex.exec(contents)) !== null) {
            existImgList.push(match[1]);
        }
        return existImgList;
    }

    let submitImgSearch = (uploadList, sysNameList) => { // 삭제된 이미지 태그 뽑아내기
        let exist = false;
        let delImgList = [];
        for (let i = 0; i < sysNameList.length; i++) {
            for (let j = 0; j < uploadList.length; j++) {
                if (sysNameList[i] === uploadList[j]) {
                    exist = true;
                    break;
                }
            }
            exist ? exist = false : delImgList.push(sysNameList[i]);
        }
        return delImgList;
    }


    const handleAdd = () => {
        if(loginId===null){
            alert("로그인해주세요");
            navi("/login");
            return;
        }
        let existImgList = existImgSearch(formData.contents);
        let delImgList = submitImgSearch(existImgList, sysNameList);
        console.log(delImgList);

        if (formData.title === "") {
            alert("제목을 입력해주세요");
            return;
        }

        if (formData.title.length > 50) {
            alert("제목은 최대 50글자 입니다");
            return;
        }

        if (formData.contents === "") {
            alert("내용을 입력해주세요");
            return;
        }

        if (formData.contents.length > 5000) {
            alert("내용은 최대 5000글자 입니다");
            return;
        }

        const submitFormData = new FormData();
        submitFormData.append("boardTitle", "자유게시판");
        submitFormData.append("title", formData.title);
        submitFormData.append("contents", formData.contents);
        submitFormData.append("delImgList", delImgList);

        let fileList = Object.values(formData.files);

        fileList.forEach((e) => {
            if (e !== "" && e instanceof File) {
                submitFormData.append("files", e);
            }
        });
        axios.post("/api/board", submitFormData).then(resp => {
            alert("게시글 등록에 성공하였습니다");
            navi("/board/toFreeBoardList");
        }).catch(err => {
            alert("게시글 등록에 실패하였습니다");
            console.log(err);
        })
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                ["header", "bold", "italic", "underline", "strike", "blockquote",
                    { list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" },
                    "bullet", "indent", "link", "image",
                    { align: [] }, { color: [] }, { background: [] },
                    "clean"]
            ],
            handlers: { image: imageHandler, },
        }
    }), []);

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "align",
        "color",
        "background",
        "link",
        "image",
    ];

    return (
        <>
            <div className={style.boardTitle}>자유게시판 글 작성</div>
            <hr></hr>
            <div className={style.titleBox}>
                <div>제목<span>*</span></div>
                <div>
                    <input placeholder="&nbsp;제목을 입력해주세요" name="title" onChange={handleChange} maxLength="50"/>
                </div>
            </div>
            <div className={style.fileBox}>
                <div>파일첨부</div>
                <div className={style.fileInputDiv}>
                    <div>
                        <input type="file" onChange={handleFileChange} name="files0" />
                        <span><FontAwesomeIcon icon={faXmark} size="lg" /></span>
                    </div>
                    <div>
                        <input type="file" onChange={handleFileChange} name="files1" />
                        <span><FontAwesomeIcon icon={faXmark} size="lg" /></span>
                    </div>
                    <div>
                        <input type="file" onChange={handleFileChange} name="files2" />
                        <span><FontAwesomeIcon icon={faXmark} size="lg" /></span>
                    </div>
                    <div>
                        <input type="file" onChange={handleFileChange} name="files3" />
                        <span><FontAwesomeIcon icon={faXmark} size="lg" /></span>
                    </div>
                    <div>
                        <input type="file" onChange={handleFileChange} name="files4" />
                        <span><FontAwesomeIcon icon={faXmark} size="lg" /></span>
                    </div>
                </div>
            </div>
            <div>
                <div className={style.contents}>내용<span>*</span></div>
                <div>
                    <ReactQuill modules={modules} formats={formats} className={style.reactQuill} ref={quillRef}
                        value={formData.contents}
                        onChange={(value) => {
                            if (value.length > 5000) {
                                alert("최대 5000자까지 작성 가능합니다");
                            } else {
                                setFormData(prev => ({ ...prev, contents: value.slice(0, 5000) }));
                            }
                        }} />
                </div>
            </div>

            <div className={style.btns}>
                <Link to="/board/toFreeBoardList"><button>작성 취소</button></Link>
                <button onClick={handleAdd}>작성 완료</button>
            </div>
        </>
    );
}

export default FreeBoardWrite;