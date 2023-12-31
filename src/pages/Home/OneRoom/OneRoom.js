//
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"; // Link
import React, { useState, useEffect, useRef, forwardRef } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  MarkerClusterer,
  ZoomControl,
  MarkerWithCustomOverlayStyle,
} from "react-kakao-maps-sdk"; // ZoomControl
import Loading from "../../commons/Loading";

//
// import { markerdata } from "./data/markerData"; // 마커 데이터 가져오기

//
import $ from "jquery";
import axios from "axios";

//
import List from "./List/List";
import Info from "./Info/Info";

// 이미지
import exam_icon from "./assets/exam_icon.png";
import search from "./assets/search.png";
import subway from "./assets/subway.png";
import school from "./assets/school.png";
import all_str from "./assets/all_str.png";
import open_str from "./assets/open_str.png";
import separation_str from "./assets/separation_str.png";
import duplex_str from "./assets/duplex_str.png";

//
import style from "./OneRoom.module.css";
import "./SliderToggle.css";
import "./RangeSlider.css";

function OneRoom() {
  const [loading, setLoading] = React.useState(true);
  const [loadingTwo, setLoadingTwo] = React.useState(true);
  const [mapRendered, setMapRendered] = useState(false);
  const [defaultDataRendered, setDefaultDataRendered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [zoomLevelRanded, setZoomLevelRanded] = useState(true);

  const [mapList, setMapList] = useState([{}]);
  const [filterMapList, setFilterMapList] = useState(mapList);

  const [subwayList, setSubwayList] = useState([{}]);
  const [subwayDefaultList, setSubwayDefaultList] = useState([{}]);

  const [schoolList, setSchoolList] = useState([{}]);
  const [schoolDefaultList, setSchoolDefaultList] = useState([{}]);

  const [listReady, setlistReady] = useState(false);

  const [randData, setRandData] = useState([{}]);

  const [mapCenterDefaultState, setMapCenterDefaultState] = useState({
    center: { lat: 36.84142696925057, lng: 127.14542099214732 },
    isPanto: true,
  });

  const [mapCenterState, setMapCenterState] = useState({
    center: { lat: 36.84142696925057, lng: 127.14542099214732 },
    isPanto: true,
  });

  // const [markersInBounds, setMarkersInBounds] = useState([]);
  // const [positions, setPositions] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const searchListBoxRef = useRef(null);

  const navigate = useNavigate();

  // NPM INSTALL 하면서 받은 카카오 정보들이
  // 로컬에 저장되어 있기 때문에 불러옴
  const { kakao } = window;
  const location = useLocation();
  const stateFromPreviousPage = location.state;

  useEffect(() => {
    if (stateFromPreviousPage != null) {
      setMapCenterState((prevMapCenterState) => {
        if (stateFromPreviousPage.latitude && stateFromPreviousPage.longitude) {
          // 이전 상태를 기반으로 새로운 상태를 생성합니다.
          const newCenter = {
            lat: stateFromPreviousPage.latitude,
            lng: stateFromPreviousPage.longitude,
          };
          setZoomLevel(3);
          return {
            ...prevMapCenterState, // 이전 상태의 나머지 속성을 그대로 유지합니다.
            center: newCenter, // 변경된 center 값을 적용합니다.
          };
        } else {
          return {
            ...prevMapCenterState, // 이전 상태의 나머지 속성을 그대로 유지합니다.
          };
        }
      });
    } else {
      return;
    }
  }, []);

  // 1. 로딩 될때 매물 데이터 받음
  // 2. 전부 받고 맵 리스트에 저장하면 랜더링 완료 처리
  useEffect(() => {
    axios
      .get(`/api/map/getAll`)
      .then((resp) => {
        setMapList(resp.data);
        setMapRendered(true);
      })
      .catch((err) => {
        console.log("API 호출 오류:", err);
      });
  }, []);

  // 로딩 될때 학교랑 지하철 데이터 받음
  useEffect(() => {
    axios
      .get(`/api/map/getAllDefaultMaker`)
      .then((resp) => {
        setSubwayDefaultList(resp.data.subwayList);
        setSchoolDefaultList(resp.data.schoolList);
        setDefaultDataRendered(true);
        setLoading(false);
      })
      .catch((err) => {
        console.log("API 호출 오류:", err);
      });
  }, []);

  useEffect(() => {
    // setFilterMapList를 비동기로 처리
    const fetchData = async () => {
      setFilterMapList(mapList);
      setlistReady(true);
    };

    fetchData();
  }, [mapRendered, mapList, mapCenterState]);

  // 지도 객체의 줌 레벨 변경
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setLevel(zoomLevel);
    }
  }, [zoomLevel, stateFromPreviousPage]);

  useEffect(() => {
    // setFilterMapList를 비동기로 처리
    const fetchData = async () => {
      handleDragEnd();
    };
    {
      /* 바로가기 */
    }
    fetchData();
  }, [filterMapList]);

  // 줌 최대 크기 9까지 밖에 못 하게 설정
  useEffect(() => {
    if (zoomLevel <= 9) {
      setZoomLevelRanded(true);
    } else {
      setZoomLevelRanded(false);
    }
  }, [zoomLevel]);

  // 지도 업데이트 바로가기
  const handleMapCenter = (map) => {};

  const handleMapBounds = (map) => {};

  // 페이지 로딩 시 사용할 기본 경계 반환
  const getDefaultBounds = () => {
    return new kakao.maps.LatLngBounds(
      new kakao.maps.LatLng(36, 127),
      new kakao.maps.LatLng(37, 128)
    );
  };

  // 페이지 로딩 시 사용할 기본 경계 반환
  const getNewDefaultBounds = () => {
    if (mapRef.current) {
      return mapRef.current.getBounds();
    } else {
      // mapRef.current가 유효하지 않은 경우, 기본 경계 반환
      return getDefaultBounds();
    }
  };

  const mapRef = useRef(null);

  function handleMapLoad(map) {
    if (!mapRef) {
      mapRef.current = map;
    }
  }

  // 지도에서 마우스 드레그 이벤트 발생시 마커 새로 불러오기
  const handleDragEnd = (map) => {
    // map 인자가 받지 못한건 처음 페이지 켤때니까
    // get Bouns에 기본 바운스를 넣어줌 안 그럼 맵이 없어서 값이 없음

    if (!map) {
      map = {
        getBounds: () => getNewDefaultBounds(),
      };
    }

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = filterMapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 이벤트가 발생하면 페이지 이동하면서 바뀐 경계 (현재 화면) 값을 넘김
    navigate(`/home/oneroom/list`, { state: { markersInBounds, zoomLevel } });
  };

  // 두번째 로딩 테스트
  const handleMarkerLoad = (map) => {
    setLoadingTwo(false);
  };

  // 지도에서 휠을 활용한 줌 이벤트 발생시 마커 새로 불러오기
  const handleZoomChanged = (map) => {
    if (!map) {
      map = {
        getBounds: () => getNewDefaultBounds(),
      };
    }

    // Zoom level이 변경되면 페이지 이동
    setZoomLevel(map.getLevel());

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = filterMapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 이벤트가 발생하면 페이지 이동하면서 바뀐 경계 (현재 화면) 값을 넘김
    navigate(`/home/oneroom/list?zoom=${map.getLevel()}`, {
      state: { markersInBounds, zoomLevel: map.getLevel() },
    });
  };

  // 마커를 클릭할때 해당 정보를 들고 info(정보)로 이동
  const handleMarkerClick = (marker) => {
    navigate("/home/oneroom/info", { state: marker });
    // 로컬 스토리지에서 현재 감시 중인 속성 가져오기
    const storedData = localStorage.getItem("watch");
    const watchedProperties = storedData ? JSON.parse(storedData) : [];

    // 새로운 마커의 estateId를 감시 중인 속성에 추가
    const updatedWatchedProperties = [
      ...new Set([marker.estateId, ...watchedProperties]),
    ];
    // 감시 중인 속성을 최대 10개로 제한
    if (updatedWatchedProperties.length > 10) {
      updatedWatchedProperties.splice(10);
    }
    // 갱신된 감시 중인 속성을 로컬 스토리지에 저장
    localStorage.setItem("watch", JSON.stringify(updatedWatchedProperties));
  };

  // 부드러운 지도 이동
  const moveToLocation = (moveData, map) => {
    // 얘보다 한층 위에 display none해야함
    const searchListBox = searchListBoxRef.current;
    searchListBox.innerHTML = "";
    searchListBox.style.display = "none";

    setSearchValue("");

    setZoomLevel(4);
    mapRef.current.setLevel(4);

    mapRef.current.setCenter(
      new kakao.maps.LatLng(moveData.latitude, moveData.longitude)
    );

    if (!map) {
      map = {
        getBounds: () => getNewDefaultBounds(),
      };
    }

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = filterMapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 이벤트가 발생하면 페이지 이동하면서 바뀐 경계 (현재 화면) 값을 넘김
    navigate(`/home/oneroom/list`, { state: { markersInBounds, zoomLevel } });
  };

  // 부드러운 지도 이동
  const moveToMarker = (marker, map) => {
    setSearchValue("");

    setZoomLevel(4);
    mapRef.current.setLevel(4);

    mapRef.current.setCenter(
      new kakao.maps.LatLng(marker.latitude, marker.longitude)
    );

    if (!map) {
      map = {
        getBounds: () => getNewDefaultBounds(),
      };
    }

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = filterMapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 이벤트가 발생하면 페이지 이동하면서 바뀐 경계 (현재 화면) 값을 넘김
    navigate(`/home/oneroom/list`, { state: { markersInBounds, zoomLevel } });
  };

  // 검색창 사용
  const handleInputChange = (event) => {
    // 받은 데이터의 길이 (2글자 이상인지 체크하기 위한거임)
    const inputValue = event.target.value;
    setSearchValue(inputValue);

    // 리스트 박스를 찾기 위해서 쓰는 Ref
    const searchListBox = searchListBoxRef.current;

    // 2글자 이상일 때 active 클래스를 추가하고, display를 block으로 설정
    if (inputValue.length >= 2) {
      // 숨겨놨던 리스트 Div를 풀어줌
      searchListBox.classList.add(style.active);
      searchListBox.style.display = "block";

      axios
        .get(`/api/map/getKeywordSearch`, {
          params: {
            keyword: inputValue, // inputValue를 'keyword'라는 이름으로 전달
          },
        })
        .then((resp) => {
          // resp.data를 순회하며 각 지역의 시군구 정보를 <div>에 추가
          searchListBox.innerHTML = ""; // 기존 내용을 초기화

          // 검색된 데이터가 없을때
          if (
            resp.data.regionList.length === 0 &&
            resp.data.subwayList.length === 0 &&
            resp.data.schoolList.length === 0
          ) {
            // NULL 값일때 List에 넣을 CSS를 사용하기 위해 만드는 마크업
            const nullRegionSpan = document.createElement("span");
            nullRegionSpan.style.fontWeight = "normal";
            nullRegionSpan.style.marginBottom = "0";

            const nullRegionDiv = document.createElement("div");
            nullRegionDiv.style.height = "32px";
            nullRegionDiv.style.padding = "9px";
            nullRegionDiv.style.pointerEvents = "none";

            nullRegionSpan.textContent = `검색 결과가 없습니다.`;
            nullRegionDiv.appendChild(nullRegionSpan);
            searchListBox.appendChild(nullRegionDiv);
          }

          // 각 지역에 대한 검색
          // region에는 각 지역 정보가 들어 있음
          resp.data.regionList.forEach((region) => {
            // List에 넣을 CSS를 사용하기 위해 만드는 마크업
            const regionSpan = document.createElement("span");
            const regionDiv = document.createElement("div");

            // 리에 대한 검색
            if (region.re) {
              // 메인 상단 대표 검색된 키워드
              regionSpan.textContent = `${region.re}`;

              // 상세 주소
              const regionText = document.createTextNode(
                `${region.sido} ${region.sigungu} ${region.eup_myeon_re_dong} ${region.re}`
              );

              // Span 태그(메인 상단 키워드), 일반 Text (상세 주소) Div에 추가
              // 이후 List에 만들어진 Div 추가
              regionDiv.appendChild(regionSpan);
              regionDiv.appendChild(regionText);
              searchListBox.appendChild(regionDiv);

              // 읍면리동에 대한 검색
            } else if (region.eup_myeon_re_dong && !region.re) {
              regionSpan.textContent = `${region.eup_myeon_re_dong}`;

              const regionText = document.createTextNode(
                `${region.sido} ${region.sigungu} ${region.eup_myeon_re_dong}`
              );

              regionDiv.appendChild(regionSpan);
              regionDiv.appendChild(regionText);
              searchListBox.appendChild(regionDiv);

              // 읍면동구에 대한 검색
            } else if (
              region.eup_myeon_dong_gu &&
              !region.eup_myeon_re_dong &&
              !region.re
            ) {
              regionSpan.textContent = `${region.eup_myeon_dong_gu}`;

              const regionText = document.createTextNode(
                `${region.sido} ${region.sigungu}`
              );

              regionDiv.appendChild(regionSpan);
              regionDiv.appendChild(regionText);
              searchListBox.appendChild(regionDiv);
            }

            // 시군구에 대한 검색
            else if (
              region.sigungu &&
              !region.eup_myeon_dong_gu &&
              !region.eup_myeon_re_dong &&
              !region.re
            ) {
              regionSpan.textContent = `${region.sigungu}`;

              const regionText = document.createTextNode(
                `${region.sido} ${region.sigungu}`
              );

              regionDiv.appendChild(regionSpan);
              regionDiv.appendChild(regionText);
              searchListBox.appendChild(regionDiv);
            }

            // 시도에 대한 검색
            else if (
              region.sido &&
              !region.sigungu &&
              !region.eup_myeon_dong_gu &&
              !region.eup_myeon_re_dong &&
              !region.re
            ) {
              regionSpan.textContent = `${region.sido}`;

              const regionText = document.createTextNode(`${region.sido}`);

              regionDiv.appendChild(regionSpan);
              regionDiv.appendChild(regionText);
              searchListBox.appendChild(regionDiv);
            }

            // 클릭 이벤트 리스너 추가
            regionDiv.addEventListener("click", () => {
              moveToLocation(region);
            });
          });

          // 지하철역에 대한 검색
          // subway 각 지역 정보가 들어 있음
          // 지도 이동 이벤트
          resp.data.subwayList.forEach((subway) => {
            const subwaySpan = document.createElement("span");
            const subwayDiv = document.createElement("div");

            subwaySpan.textContent = subway.name;
            const subwayText = document.createTextNode(subway.address);

            subwayDiv.appendChild(subwaySpan);
            subwayDiv.appendChild(subwayText);
            searchListBox.appendChild(subwayDiv);

            // 클릭 이벤트 리스너 추가
            subwayDiv.addEventListener("click", () => {
              moveToLocation(subway);
            });
          });

          // 대학교에 대한 검색
          // subway 각 지역 정보가 들어 있음
          resp.data.schoolList.forEach((school) => {
            // List에 넣을 CSS를 사용하기 위해 만드는 마크업
            const subwaySpan = document.createElement("span");
            const subwayDiv = document.createElement("div");

            // 메인 상단 대표 검색된 키워드
            subwaySpan.textContent = `${school.name}`;

            // 상세 주소
            const subwayText = document.createTextNode(`${school.address}`);

            // Span 태그(메인 상단 키워드), 일반 Text (상세 주소) Div에 추가
            // 이후 List에 만들어진 Div 추가
            subwayDiv.appendChild(subwaySpan);
            subwayDiv.appendChild(subwayText);
            searchListBox.appendChild(subwayDiv);

            // 클릭 이벤트 리스너 추가
            subwayDiv.addEventListener("click", () => {
              moveToLocation(school);
            });
          });
        })
        .catch((err) => {
          console.log("API 호출 오류:", err);
        });
    } else if (inputValue.length === 0) {
      // 2글자 미만일 때 active 클래스를 제거하고, display를 none으로 설정
      searchListBox.classList.remove(style.active);
      searchListBox.style.display = "none";
    }
  };

  // 토글이벤트 - 관리비
  const [isChecked, setChecked] = useState(false);

  const handleToggle = () => {
    setChecked(!isChecked);
  };

  // 토글이벤트 - 주차
  const [isToggled, setIsToggled] = useState(false);

  const handleCheckboxChange = () => {
    setIsToggled(!isToggled);
  };

  // 토글이벤트 - 단기임대
  const [isChecked2, setChecked2] = useState(false);

  const handleToggle2 = () => {
    setChecked2(!isChecked2);
  };

  // 양쪽 범위 슬라이더 - 보증금
  const [range, setRange] = useState({ left: 0, right: 100 });
  const [afterRange, setAfterRange] = useState({
    start: 0,
    end: 0,
  });
  const [isDraggingLeft, setDraggingLeft] = useState(false);
  const [isDraggingRight, setDraggingRight] = useState(false);
  const sliderRef = useRef(null);

  // 드레그 바
  useEffect(() => {
    // 설정

    // 0만원부터 ~ [50 ~ 500만원]까지 전부
    if (range.left === 0 && range.right <= 99.9) {
      const returnNum = Math.floor(range.right / 3.3);
      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum === 1) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 500000 }));
      } else if (returnNum === 2) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1000000 }));
      } else if (returnNum === 3) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 2000000 }));
      } else if (returnNum === 4) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 3000000 }));
      } else if (returnNum === 5) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 5000000 }));
      } else if (returnNum === 6) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 10000000 }));
      } else if (returnNum === 7) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 20000000 }));
      } else if (returnNum === 8) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 30000000 }));
      } else if (returnNum === 9) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 40000000 }));
      } else if (returnNum === 10) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 50000000 }));
      } else if (returnNum === 11) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 60000000 }));
      } else if (returnNum === 12) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 70000000 }));
      } else if (returnNum === 13) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 80000000 }));
      } else if (returnNum === 14) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 90000000 }));
      } else if (returnNum === 15) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 100000000 }));
      } else if (returnNum === 16) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 200000000 }));
      } else if (returnNum === 17) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 150000000 }));
      } else if (returnNum === 18) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 170000000 }));
      } else if (returnNum === 19) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 200000000 }));
      } else if (returnNum === 20) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 250000000 }));
      } else if (returnNum === 21) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 300000000 }));
      } else if (returnNum === 22) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 350000000 }));
      } else if (returnNum === 23) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 400000000 }));
      } else if (returnNum === 24) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 500000000 }));
      } else if (returnNum === 25) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 700000000 }));
      } else if (returnNum === 26) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1000000000 }));
      } else if (returnNum === 27) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1200000000 }));
      } else if (returnNum === 28) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1500000000 }));
      } else if (returnNum === 29) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 2000000000 }));
      } else if (returnNum > 29) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 0 }));
      }

      // [0 ~ 500만원]부터 ~ 0만원 까지
    } else if (range.left >= 0.01 && range.right === 100) {
      const returnNum = Math.floor(range.left / 3.3);

      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum === 1) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 500000 }));
      } else if (returnNum === 2) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1000000 }));
      } else if (returnNum === 3) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 2000000 }));
      } else if (returnNum === 4) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 3000000 }));
      } else if (returnNum === 5) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 5000000 }));
      } else if (returnNum === 6) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 10000000 }));
      } else if (returnNum === 7) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 20000000 }));
      } else if (returnNum === 8) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 30000000 }));
      } else if (returnNum === 9) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 40000000 }));
      } else if (returnNum === 10) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 50000000 }));
      } else if (returnNum === 11) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 60000000 }));
      } else if (returnNum === 12) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 70000000 }));
      } else if (returnNum === 13) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 80000000 }));
      } else if (returnNum === 14) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 90000000 }));
      } else if (returnNum === 15) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 100000000 }));
      } else if (returnNum === 16) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 200000000 }));
      } else if (returnNum === 17) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 150000000 }));
      } else if (returnNum === 18) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 170000000 }));
      } else if (returnNum === 19) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 200000000 }));
      } else if (returnNum === 20) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 250000000 }));
      } else if (returnNum === 21) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 300000000 }));
      } else if (returnNum === 22) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 350000000 }));
      } else if (returnNum === 23) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 400000000 }));
      } else if (returnNum === 24) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 500000000 }));
      } else if (returnNum === 25) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 700000000 }));
      } else if (returnNum === 26) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1000000000 }));
      } else if (returnNum === 27) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1200000000 }));
      } else if (returnNum === 28) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1500000000 }));
      } else if (returnNum === 29) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 2000000000 }));
      } else {
        setAfterRange((prevValues) => ({ ...prevValues, start: 0 }));
      }

      // [0 ~ 20억]부터 ~ [0 ~ 20억]까지 // 설정
    } else if (range.left >= 0.01 && range.right <= 99.9) {
      // [0 ~ 20억]부터에 사용할 상수
      const returnNum = Math.floor(range.right / 3.3);

      // [0 ~ 20억]까지에 사용할 상수
      const returnNum2 = Math.floor(range.left / 3.3);

      if (returnNum === 1) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 500000 }));
      } else if (returnNum === 2) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1000000 }));
      } else if (returnNum === 3) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 2000000 }));
      } else if (returnNum === 4) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 3000000 }));
      } else if (returnNum === 5) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 5000000 }));
      } else if (returnNum === 6) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 10000000 }));
      } else if (returnNum === 7) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 20000000 }));
      } else if (returnNum === 8) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 30000000 }));
      } else if (returnNum === 9) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 40000000 }));
      } else if (returnNum === 10) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 50000000 }));
      } else if (returnNum === 11) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 60000000 }));
      } else if (returnNum === 12) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 70000000 }));
      } else if (returnNum === 13) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 80000000 }));
      } else if (returnNum === 14) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 90000000 }));
      } else if (returnNum === 15) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 100000000 }));
      } else if (returnNum === 16) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 200000000 }));
      } else if (returnNum === 17) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 150000000 }));
      } else if (returnNum === 18) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 170000000 }));
      } else if (returnNum === 19) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 200000000 }));
      } else if (returnNum === 20) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 250000000 }));
      } else if (returnNum === 21) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 300000000 }));
      } else if (returnNum === 22) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 350000000 }));
      } else if (returnNum === 23) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 400000000 }));
      } else if (returnNum === 24) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 500000000 }));
      } else if (returnNum === 25) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 700000000 }));
      } else if (returnNum === 26) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1000000000 }));
      } else if (returnNum === 27) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1200000000 }));
      } else if (returnNum === 28) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 1500000000 }));
      } else if (returnNum === 29) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 2000000000 }));
      } else if (returnNum > 29) {
        setAfterRange((prevValues) => ({ ...prevValues, end: 0 }));
      }

      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum2 === 1) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 500000 }));
      } else if (returnNum2 === 2) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1000000 }));
      } else if (returnNum2 === 3) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 2000000 }));
      } else if (returnNum2 === 4) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 3000000 }));
      } else if (returnNum2 === 5) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 5000000 }));
      } else if (returnNum2 === 6) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 10000000 }));
      } else if (returnNum2 === 7) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 20000000 }));
      } else if (returnNum2 === 8) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 30000000 }));
      } else if (returnNum2 === 9) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 40000000 }));
      } else if (returnNum2 === 10) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 50000000 }));
      } else if (returnNum2 === 11) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 60000000 }));
      } else if (returnNum2 === 12) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 70000000 }));
      } else if (returnNum2 === 13) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 80000000 }));
      } else if (returnNum2 === 14) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 90000000 }));
      } else if (returnNum2 === 15) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 100000000 }));
      } else if (returnNum2 === 16) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 200000000 }));
      } else if (returnNum2 === 17) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 150000000 }));
      } else if (returnNum2 === 18) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 170000000 }));
      } else if (returnNum2 === 19) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 200000000 }));
      } else if (returnNum2 === 20) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 250000000 }));
      } else if (returnNum2 === 21) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 300000000 }));
      } else if (returnNum2 === 22) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 350000000 }));
      } else if (returnNum2 === 23) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 400000000 }));
      } else if (returnNum2 === 24) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 500000000 }));
      } else if (returnNum2 === 25) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 700000000 }));
      } else if (returnNum2 === 26) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1000000000 }));
      } else if (returnNum2 === 27) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1200000000 }));
      } else if (returnNum2 === 28) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 1500000000 }));
      } else if (returnNum2 === 29) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 2000000000 }));
      } else if (returnNum2 === 0) {
        setAfterRange((prevValues) => ({ ...prevValues, start: 0 }));
      }
    }
    // 만약 양쪽 끝 값이 다 최대로 들어가 있다면 0만원부터 0만원까지
    // 즉 전체로 다시 설정
    else if (range.left === 0 && range.right === 100) {
      setAfterRange({ start: 0, end: 0 });
    }
  }, [range]);

  // 드레그 바
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft || isDraggingRight) {
        const { left: sliderLeft, width: sliderWidth } =
          sliderRef.current.getBoundingClientRect();
        let position = (e.clientX - sliderLeft) / sliderWidth;

        // Limit position to be within 0% and 100%
        position = Math.min(1, Math.max(0, position));

        const minGap = 3; // 최소 간격

        if (isDraggingLeft) {
          setRange((prevRange) => ({
            ...prevRange,
            left: Math.min(position * 100, prevRange.right - minGap), // 최소 간격 유지
          }));
        } else {
          setRange((prevRange) => ({
            ...prevRange,
            right: Math.max(position * 100, prevRange.left + minGap), // 최소 간격 유지
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingLeft(false);
      setDraggingRight(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  // 드레그 바
  const handleMouseDownLeft = () => {
    setDraggingLeft(true);
  };

  // 드레그 바
  const handleMouseDownRight = () => {
    setDraggingRight(true);
  };

  // 양쪽 범위 슬라이더 - 월세
  const [rangeValues, setRangeValues] = useState({ start: 0, end: 100 });
  const [afterRangeValues, setAfterRangeValues] = useState({
    start: 0,
    end: 0,
  });
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const sliderRef_month = useRef(null);

  // 드레그 바 값 설정
  // useEffect(() => {
  //   // 설정
  //   // 0만원부터 ~ [0 ~ 5만원]까지
  //   if (rangeValues.start === 0 && rangeValues.end === 0) {
  //     setAfterRangeValues((prevValues) => ({
  //       ...prevValues,
  //       end: 50000,
  //     }));

  //     // 0만원부터 ~ [5 ~ 500만원]까지
  //   } else if (rangeValues.start === 0 && rangeValues.end <= 99.9) {
  //     const returnNum = Math.floor(rangeValues.end / 5) + 1;

  //     // 0만원부터 ~ [5 ~ 40만원]까지
  //     if (1 < returnNum && returnNum <= 9) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 100000,
  //       }));
  //     }

  //     // 0만원부터 ~ [40 ~ 70만원]까지
  //     else if (9 < returnNum && returnNum <= 12) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 40 + (returnNum - 9) * 10000,
  //       }));
  //     }

  //     // 0만원부터 ~ [70 ~ 100만원]까지
  //     else if (12 < returnNum && returnNum <= 13) {
  //       setAfterRangeValues((prevValues) => ({ ...prevValues, end: 100 }));
  //     }

  //     // 0만원부터 ~ [150 ~ 300만원]까지
  //     else if (12 < returnNum && returnNum <= 17) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 50 + (returnNum - 12) * 500000,
  //       }));
  //     }

  //     // 0만원부터 ~ [300 ~ 500만원]까지
  //     else if (17 < returnNum && returnNum <= 19) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 300 + (returnNum - 17) * 1000000,
  //       }));
  //     }

  //     // [0 ~ 500만원]부터 ~ 0만원 까지
  //   } else if (rangeValues.start >= 3 && rangeValues.end === 100) {
  //     const returnNum = Math.floor((rangeValues.start + 3) / 5);

  //     // [5만원]부터 ~ 0만원 까지
  //     if (returnNum === 0) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 50000,
  //       }));
  //     }

  //     // [10 ~ 40만원]부터 ~ 0만원 까지
  //     else if (1 <= returnNum && returnNum <= 9) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: returnNum * 50000,
  //       }));
  //     }

  //     // [40 ~ 70만원]부터 ~ 0만원 까지
  //     else if (9 < returnNum && returnNum <= 12) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 40 + (returnNum - 9) * 100000,
  //       }));
  //     }

  //     // [70 ~ 100만원]부터 ~ 0만원 까지
  //     else if (12 < returnNum && returnNum <= 13) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 1000000,
  //       }));
  //     }

  //     // [150 ~ 300만원]부터 ~ 0만원 까지
  //     else if (13 < returnNum && returnNum <= 17) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 100 + (returnNum - 13) * 500000,
  //       }));
  //     }

  //     // [300 ~ 500만원]부터 ~ 0만원 까지
  //     else if (17 < returnNum && returnNum <= 19) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 300 + (returnNum - 17) * 1000000,
  //       }));
  //     }

  //     // [0 ~ 500만원]부터 ~ [0 ~ 500만원]까지 // 설정
  //   } else if (rangeValues.start >= 0.01 && rangeValues.end <= 99.9) {
  //     // 0만원부터 ~ [0 ~ 500만원] 까지에 사용할 상수
  //     const returnNum = Math.floor(rangeValues.end / 5) + 1;

  //     // 0만원부터 ~ [5 ~ 40만원]까지
  //     if (1 < returnNum && returnNum <= 9) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: (returnNum - 1) * 50000,
  //       }));
  //     }

  //     // 0만원부터 ~ [40 ~ 70만원]까지
  //     else if (9 < returnNum && returnNum <= 12) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 40 + (returnNum - 9) * 100000,
  //       }));
  //     }

  //     // 0만원부터 ~ [300 ~ 500만원]까지
  //     else if (12 < returnNum && returnNum <= 13) {
  //       setAfterRangeValues((prevValues) => ({ ...prevValues, end: 100 }));
  //     }

  //     // [150 ~ 300만원]부터 ~ 0만원 까지
  //     else if (12 < returnNum && returnNum <= 17) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 50 + (returnNum - 12) * 500000,
  //       }));
  //     }

  //     // 0만원부터 ~ [300 ~ 500만원]까지
  //     else if (17 < returnNum && returnNum <= 19) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 300 + (returnNum - 17) * 1000000,
  //       }));
  //     }

  //     // 만약 끝에 값을 다시 끝으로 땅기면 0으로 되돌려서 초기값 설정
  //     else {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         end: 0,
  //       }));
  //     }

  //     // [0 ~ 500만원]부터 ~ 0만원까지에 사용할 상수
  //     const returnNum2 = Math.floor((rangeValues.start + 3) / 5);

  //     // 만약 끝에 값을 다시 끝으로 땅기면 0으로 되돌려서 초기값 설정
  //     if (returnNum2 === 0) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 0,
  //       }));
  //     }

  //     // [5 ~ 40만원]부터 0만원까지
  //     else if (1 <= returnNum2 && returnNum2 <= 9) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: returnNum2 * 5,
  //       }));
  //     }

  //     // [40 ~ 70만원]부터 0만원까지
  //     else if (9 < returnNum2 && returnNum2 <= 12) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 40 + (returnNum2 - 9) * 10,
  //       }));
  //     }

  //     // [70 ~ 100만원]부터 0만원까지
  //     else if (12 < returnNum2 && returnNum2 <= 13) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 100,
  //       }));
  //     }

  //     // [100 ~ 300만원]부터 0만원까지
  //     else if (13 < returnNum2 && returnNum2 <= 17) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 100 + (returnNum2 - 13) * 50,
  //       }));
  //     }

  //     // [300 ~ 500만원]부터 0만원까지
  //     else if (17 < returnNum2 && returnNum2 <= 19) {
  //       setAfterRangeValues((prevValues) => ({
  //         ...prevValues,
  //         start: 300 + (returnNum2 - 17) * 100,
  //       }));
  //     }
  //   }

  //   // 만약 양쪽 끝 값이 다 최대로 들어가 있다면 0만원부터 0만원까지
  //   // 즉 전체로 다시 설정
  //   else if (rangeValues.start === 0 && rangeValues.end === 100) {
  //     setAfterRangeValues({ start: 0, end: 0 });
  //   }
  // }, [rangeValues]);
  useEffect(() => {
    // 설정

    // 0만원부터 ~ [50 ~ 500만원]까지 전부
    if (rangeValues.start === 0 && rangeValues.end <= 99.9) {
      const returnNum = Math.floor(rangeValues.end / 5);
      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum === 1) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 50000 }));
      } else if (returnNum === 2) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 100000 }));
      } else if (returnNum === 3) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 150000 }));
      } else if (returnNum === 4) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 200000 }));
      } else if (returnNum === 5) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 250000 }));
      } else if (returnNum === 6) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 300000 }));
      } else if (returnNum === 7) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 350000 }));
      } else if (returnNum === 8) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 400000 }));
      } else if (returnNum === 9) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 500000 }));
      } else if (returnNum === 10) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 600000 }));
      } else if (returnNum === 11) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 700000 }));
      } else if (returnNum === 12) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 1000000 }));
      } else if (returnNum === 13) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 1500000 }));
      } else if (returnNum === 14) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 2000000 }));
      } else if (returnNum === 15) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 2500000 }));
      } else if (returnNum === 16) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 3000000 }));
      } else if (returnNum === 17) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 4000000 }));
      } else if (returnNum === 18) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 5000000 }));
      }
      // [0 ~ 500만원]부터 ~ 0만원 까지
    } else if (rangeValues.start >= 0.01 && rangeValues.end === 100) {
      const returnNum = Math.floor(rangeValues.start / 5);

      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum === 1) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 50000 }));
      } else if (returnNum === 2) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 100000 }));
      } else if (returnNum === 3) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 150000 }));
      } else if (returnNum === 4) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 200000 }));
      } else if (returnNum === 5) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 250000 }));
      } else if (returnNum === 6) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 300000 }));
      } else if (returnNum === 7) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 350000 }));
      } else if (returnNum === 8) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 400000 }));
      } else if (returnNum === 9) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 500000 }));
      } else if (returnNum === 10) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 600000 }));
      } else if (returnNum === 11) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 700000 }));
      } else if (returnNum === 12) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 1000000,
        }));
      } else if (returnNum === 13) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 1500000,
        }));
      } else if (returnNum === 14) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 2000000,
        }));
      } else if (returnNum === 15) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 2500000,
        }));
      } else if (returnNum === 16) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 3000000,
        }));
      } else if (returnNum === 17) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 4000000,
        }));
      } else if (returnNum === 18) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 5000000,
        }));
      } else if (returnNum <= 0) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 0,
        }));
      }

      // [0 ~ 20억]부터 ~ [0 ~ 20억]까지 // 설정
    } else if (rangeValues.start >= 0.01 && rangeValues.end <= 99.9) {
      // [0 ~ 20억]부터에 사용할 상수
      const returnNum = Math.floor(rangeValues.end / 5);

      // [0 ~ 20억]까지에 사용할 상수
      const returnNum2 = Math.floor(rangeValues.start / 5);

      if (returnNum === 1) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 50000 }));
      } else if (returnNum === 2) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 100000 }));
      } else if (returnNum === 3) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 150000 }));
      } else if (returnNum === 4) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 200000 }));
      } else if (returnNum === 5) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 250000 }));
      } else if (returnNum === 6) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 300000 }));
      } else if (returnNum === 7) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 350000 }));
      } else if (returnNum === 8) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 400000 }));
      } else if (returnNum === 9) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 500000 }));
      } else if (returnNum === 10) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 600000 }));
      } else if (returnNum === 11) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 700000 }));
      } else if (returnNum === 12) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 1000000 }));
      } else if (returnNum === 13) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 1500000 }));
      } else if (returnNum === 14) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 2000000 }));
      } else if (returnNum === 15) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 2500000 }));
      } else if (returnNum === 16) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 3000000 }));
      } else if (returnNum === 17) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 4000000 }));
      } else if (returnNum === 18) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, end: 5000000 }));
      }

      // 0만원부터 ~ [50 ~ 100만원]까지
      if (returnNum2 === 2) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 50000 }));
      } else if (returnNum2 === 2) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 100000 }));
      } else if (returnNum2 === 3) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 150000 }));
      } else if (returnNum2 === 4) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 200000 }));
      } else if (returnNum2 === 5) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 250000 }));
      } else if (returnNum2 === 6) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 300000 }));
      } else if (returnNum2 === 7) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 350000 }));
      } else if (returnNum2 === 8) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 400000 }));
      } else if (returnNum2 === 9) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 500000 }));
      } else if (returnNum2 === 10) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 600000 }));
      } else if (returnNum2 === 11) {
        setAfterRangeValues((prevValues) => ({ ...prevValues, start: 700000 }));
      } else if (returnNum2 === 12) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 1000000,
        }));
      } else if (returnNum2 === 13) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 1500000,
        }));
      } else if (returnNum2 === 14) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 2000000,
        }));
      } else if (returnNum2 === 15) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 2500000,
        }));
      } else if (returnNum2 === 16) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 3000000,
        }));
      } else if (returnNum2 === 17) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 4000000,
        }));
      } else if (returnNum2 === 18) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 5000000,
        }));
      } else if (returnNum2 <= 0) {
        setAfterRangeValues((prevValues) => ({
          ...prevValues,
          start: 0,
        }));
      }
    }
    // 만약 양쪽 끝 값이 다 최대로 들어가 있다면 0만원부터 0만원까지
    // 즉 전체로 다시 설정
    else if (rangeValues.start === 0 && rangeValues.end === 100) {
      setAfterRangeValues({ start: 0, end: 0 });
    }
  }, [rangeValues]);

  // 여기냐

  // 드레그 바
  useEffect(() => {
    const minGap = 3; // 핸들 간 최소 간격 설정 (예: 10%)
    const handleMouseMove = (e) => {
      if (isDraggingStart || isDraggingEnd) {
        const { left: sliderLeft, width: sliderWidth } =
          sliderRef_month.current.getBoundingClientRect();
        let position = (e.clientX - sliderLeft) / sliderWidth;
        position = Math.min(1, Math.max(0, position));

        if (isDraggingStart) {
          setRangeValues((prevValues) => ({
            ...prevValues,
            start: Math.min(position * 100, prevValues.end - minGap),
          }));
        } else {
          setRangeValues((prevValues) => ({
            ...prevValues,
            end: Math.max(position * 100, prevValues.start + minGap),
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingStart, isDraggingEnd]);

  const handleMouseDownStart = () => {
    setIsDraggingStart(true);
  };

  const handleMouseDownEnd = () => {
    setIsDraggingEnd(true);
  };

  // 양쪽 범위 슬라이더 - 전세
  const [sliderValues, setSliderValues] = useState({ left: 0, right: 100 });
  const [isLeftHandleDragging, setIsLeftHandleDragging] = useState(false);
  const [isRightHandleDragging, setIsRightHandleDragging] = useState(false);
  const sliderCustomRef = useRef(null);

  // 드레그 바
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isLeftHandleDragging || isRightHandleDragging) {
        const { left: sliderLeft, width: sliderWidth } =
          sliderRef.current.getBoundingClientRect();
        let position = (e.clientX - sliderLeft) / sliderWidth;
        position = Math.min(1, Math.max(0, position));

        if (isLeftHandleDragging) {
          setSliderValues((prevValues) => ({
            ...prevValues,
            left: position * 100,
          }));
        } else {
          setSliderValues((prevValues) => ({
            ...prevValues,
            right: position * 100,
          }));
        }
      }
    };

    const handleMouseUp = () => {
      setIsLeftHandleDragging(false);
      setIsRightHandleDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isLeftHandleDragging, isRightHandleDragging]);

  const handleMouseDownLeftHandle = () => {
    setIsLeftHandleDragging(true);
  };

  const handleMouseDownRightHandle = () => {
    setIsRightHandleDragging(true);
  };

  // 드레그 바 가격 포맷팅
  function formatDragCost(number) {
    // number 값이 유효한 숫자인지 검증
    if (typeof number !== "number" || isNaN(number)) {
      return ""; // 또는 적절한 기본값 설정
    }

    const billion = Math.floor(number / 100000000);
    const millionRaw = (number % 100000000) / 10000;
    const million = millionRaw.toLocaleString("ko-KR");

    let result = "";
    if (billion > 0) {
      result += `${billion}억`;
    }
    if (millionRaw > 0) {
      if (billion > 0) {
        result += " ";
      }
      result += `${million}만원`;
    } else if (billion > 0) {
      result += "원";
    } else {
      result = `${number.toLocaleString("ko-KR")}원`;
    }

    return result;
  }

  const [selectedOption, setSelectedOption] = useState(null);

  // 필터 옵션 박스 설정
  const handleOptionClick = (option) => {
    // 클릭된 옵션이 현재 선택된 옵션과 동일한 경우
    if (selectedOption === option) {
      // 선택된 옵션을 해제하여 해당 옵션 박스를 숨김
      setSelectedOption(null);
    } else {
      // 아닌 경우, 선택된 옵션을 업데이트하여 해당 옵션 박스를 보여줌
      setSelectedOption(option);
    }
  };

  const [selectedDealType, setSelectedDealType] = useState("전체");
  const [showDealTypeRange, setShowDealTypeRange] = useState(false);

  // 거래 유형 필터
  const filterMapListByDealType = (item) => {
    if (selectedDealType === "전체") {
      return true; // 전체를 선택한 경우 모든 항목을 보여줍니다.
    } else if (selectedDealType === "월세") {
      return item.dealType === "월세";
    } else if (selectedDealType === "전세") {
      return item.dealType === "전세";
    }
  };

  // 거래 유형 설정
  const handleDealTypeClick = (dealType) => {
    setSelectedDealType(dealType);

    // 선택된 거래 유형에 따라서 값을 설정
    if (dealType === "전체") {
      setRange({ left: 0, right: 100 }); // 보증금 리셋
      setAfterRange({ left: 0, right: 100 }); // 보증금 드레그 바 리셋
      setRangeValues({ start: 0, end: 100 }); // 월세 리셋
      setAfterRangeValues({ start: 0, end: 100 }); // 월세 드레그 바
      setShowDealTypeRange(true); // 전체인 경우에는 보증금, 월세 모두 보여줌
      setChecked2(false); // 단기임대 설정
    } else if (dealType === "월세") {
      setRange({ left: 0, right: 100 });
      setAfterRange({ left: 0, right: 100 });
      setRangeValues({ start: 0, end: 100 });
      setAfterRangeValues({ start: 0, end: 100 });
      setShowDealTypeRange(true); // 월세인 경우에는 보증금, 월세 모두 보여줌
    } else if (dealType === "전세") {
      setRange({ left: 0, right: 100 }); // 보증금 리셋
      setAfterRange({ left: 0, right: 100 }); // 보증금 드레그 바 리셋
      setShowDealTypeRange(false); // 전세인 경우에는 보증금만 보여줌
      setChecked2(false); // 단기임대 설정
    }
  };

  // 구조 선택하기
  const [selectedStructure, setSelectedStructure] = useState("전체");

  const handleStructureSelect = (structure) => {
    setSelectedStructure(structure);
  };

  // 층수 옵션
  const [selectedFloor, setSelectedFloor] = useState("전체");

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
  };

  // 전용 면적 선택하기
  const [selectedArea, setSelectedArea] = useState("전체");

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
  };

  // 옵션 (에어컨, 냉장고 등등) 선택하고 리스트에 남기기
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionSelect = (option) => {
    // 클릭한 옵션이 이미 선택되어 있는지 확인
    const isSelected = selectedOptions.includes(option);

    // 선택되어 있으면 배열에서 제거, 아니면 배열에 추가
    const updatedOptions = isSelected
      ? selectedOptions.filter((selectedOption) => selectedOption !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updatedOptions);
  };

  // 필터 상태가 변경될 때마다 filterMapList 호출
  useEffect(() => {
    async function fetchData() {
      await applyFilters();
      handleDragEnd();
    }

    fetchData();
  }, [
    selectedDealType,
    selectedStructure,
    selectedFloor,
    selectedArea,
    selectedOptions,
    rangeValues,
    range,
    isToggled,
    isChecked2,
    isChecked,
  ]);

  const setFilterReset = () => {
    if (window.confirm("필터를 초기화하시겠습니까?")) {
      setSelectedDealType("전체");
      setSelectedStructure("전체");
      setSelectedFloor("전체");
      setSelectedArea("전체");
      setSelectedOptions([]); // 빈 배열로 초기화
      setRangeValues({ start: 0, end: 100 });
      setRange({ left: 0, right: 100 });
      setIsToggled(false);
      setChecked2(false);
      setChecked(false);
    }
  };

  // MapList에서 데이터를 필터링하여 filterMapList에 저장하는 함수
  const applyFilters = () => {
    // 필터링 조건에 따라 mapList 업데이트
    const price = afterRange.start * 10000;
    let newString = selectedStructure + " 원룸";

    // 거래 유형(전월세)
    let filtered =
      selectedDealType === "전체"
        ? mapList
        : mapList.filter(
            (item) => item.transaction.transactionType === selectedDealType
          );

    // 구조
    if (selectedStructure !== "전체") {
      filtered = filtered.filter(
        (item) => item.structure.structureType === newString
      );
    }

    // 전용 면적
    if (selectedArea === "전체") {
      // "전체"가 선택되었을 때는 필터링 조건을 적용하지 않음
      filtered = filtered; // 필요에 따라 이 줄은 생략할 수도 있습니다.
    } else if (selectedArea === "10평 이하") {
      filtered = filtered.filter((item) => item.area <= 9);
    } else if (selectedArea === "10평대") {
      filtered = filtered.filter((item) => item.area >= 10 && item.area <= 19);
    } else if (selectedArea === "20평대") {
      filtered = filtered.filter((item) => item.area >= 20 && item.area <= 29);
    } else if (selectedArea === "30평대") {
      filtered = filtered.filter((item) => item.area >= 30 && item.area <= 39);
    } else if (selectedArea === "40평대") {
      filtered = filtered.filter((item) => item.area >= 40 && item.area <= 49);
    } else if (selectedArea === "50평대") {
      filtered = filtered.filter((item) => item.area >= 50 && item.area <= 59);
    } else if (selectedArea === "60평 이상") {
      filtered = filtered.filter((item) => item.area >= 60);
    }

    // 주차만 가능
    if (isToggled) {
      filtered = filtered.filter((item) => {
        const hasParking = item.optionList.some((option) => {
          const isParking = option.optionTitle.optionName === "주차장";
          if (isParking) {
          }
          return isParking;
        });

        return item.optionList.length > 0 && hasParking;
      });
    }

    // 옵션 선택
    if (selectedOptions.length > 0) {
      // selectedOptions 배열에 항목이 있는 경우 필터링 적용
      filtered = filtered.filter((item) => {
        // item의 optionList에 selectedOptions의 모든 항목이 포함되어 있는지 확인
        return selectedOptions.every((option) =>
          item.optionList.some(
            (itemOption) => itemOption.optionTitle.optionName === option
          )
        );
      });
    }

    // 층수 선택
    if (selectedFloor !== "전체") {
      if (selectedFloor === "지상층") {
        filtered = filtered.filter((item) => item.roomFloors >= 1);
      } else if (selectedFloor === "반지하") {
        filtered = filtered.filter((item) => item.roomFloors == -1);
      } else if (selectedFloor === "옥탑") {
        filtered = filtered.filter((item) => item.roomFloors == 0);
      }
    }

    // 단기가능 옵션만 가능
    if (isChecked2) {
      filtered = filtered.filter((item) => {
        const hasShortTermOption = item.optionList.some((option) => {
          return option.optionTitle.optionName === "단기가능";
        });

        return hasShortTermOption;
      });
    }
    // isChecked
    // 전세 혹은 보증금 필터링
    if (range.left !== 0 || range.right !== 100) {
      // ~부터
      if (range.left !== 0 && range.right === 100) {
        filtered = filtered.filter((item) => {
          if (
            item.transaction.transactionType === "월세" &&
            item.deposit !== 0
          ) {
            return item.deposit >= afterRange.start / 10000;
          } else if (item.transaction.transactionType === "전세") {
            return item.price >= afterRange.start / 10000;
          }
          return true;
        });
        // ~까지
      } else if (range.left === 0 && range.right !== 100) {
        filtered = filtered.filter((item) => {
          if (
            item.transaction.transactionType === "월세" &&
            item.deposit !== 0
          ) {
            return item.deposit <= afterRange.end / 10000;
          } else if (item.transaction.transactionType === "전세") {
            return item.price <= afterRange.end / 10000;
          }
          return true;
        });
        // ~부터 ~까지
      } else if (range.left !== 0 && range.right !== 100) {
        filtered = filtered.filter((item) => {
          if (
            item.transaction.transactionType === "월세" &&
            item.deposit !== 0
          ) {
            return (
              item.deposit >= afterRange.start / 10000 &&
              item.deposit <= afterRange.end / 10000
            );
          } else if (item.transaction.transactionType === "전세") {
            return (
              item.price >= afterRange.start / 10000 &&
              item.price <= afterRange.end / 10000
            );
          }
          return true;
        });
      }
    }

    // 월세 필터링
    if (rangeValues.start !== 0 || rangeValues.end !== 100) {
      // ~부터 ~까지
      if (rangeValues.start !== 0 && rangeValues.end !== 100) {
        filtered = filtered.filter((item) => {
          if (item.transaction.transactionType === "월세") {
            const totalCost = isChecked
              ? item.price + item.maintenanceCost / 10000
              : item.price;
            return (
              totalCost >= afterRangeValues.start / 10000 &&
              totalCost <= afterRangeValues.end / 10000
            );
          }
          return true;
        });
      } else if (rangeValues.start === 0 && rangeValues.end !== 100) {
        // ~까지
        filtered = filtered.filter((item) => {
          if (item.transaction.transactionType === "월세") {
            const totalCost = isChecked
              ? item.price + item.maintenanceCost / 10000
              : item.price;
            return totalCost <= afterRangeValues.end / 10000;
          }
          return true;
        });
      } else if (rangeValues.start !== 0 && rangeValues.end === 100) {
        // ~부터
        filtered = filtered.filter((item) => {
          if (item.transaction.transactionType === "월세") {
            const totalCost = isChecked
              ? item.price + item.maintenanceCost / 10000
              : item.price;
            return totalCost >= afterRangeValues.start / 10000;
          }
          return true;
        });
      }
    }

    // 최종 필터링된 데이터를 상태에 업데이트
    setFilterMapList(filtered);
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className={style.all}>
          {/* {" "} */}
          {/* className="container"*/}
          <div className={style.home_top}>
            <div>방 찾기</div>
            {/*<div>찜한 매물</div>
        <div>방 내놓기(전월세만)</div> */}
          </div>
          <div className={style.main_box}>
            <div className={style.home_body_map}>
              {loadingTwo ? (
                ""
              ) : (
                <div className={style.loading_marker}>
                  <Loading></Loading>
                </div>
              )}
              <div className={style.home_body_map_main}>
                {mapRendered && (
                  <Map
                    onCreate={handleMapLoad}
                    center={mapCenterState.center}
                    isPanto={mapCenterState.isPanto}
                    style={{ width: "100%", height: "100%" }}
                    level={zoomLevel}
                    onDragEnd={handleDragEnd}
                    onZoomChanged={handleZoomChanged}
                    onBoundsChanged={handleMapBounds}
                    onCenterChanged={handleMapCenter}
                    ref={mapRef}
                    maxLevel={13}
                    onTileLoaded={handleMapLoad}
                  >
                    {zoomLevelRanded && (
                      <MarkerClusterer
                        averageCenter={true}
                        minLevel={1}
                        calculator={[5, 10, 15]}
                        styles={[
                          {
                            // calculator 각 사이 값 마다 적용될 스타일을 지정한다
                            width: "42px",
                            height: "42px",
                            background: "rgba(50, 108, 249, .8)",
                            borderRadius: "21px",
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                          },
                          {
                            width: "48px",
                            height: "48px",
                            background: "rgba(50, 108, 249, .8)",
                            borderRadius: "24px",
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            lineHeight: "41px",
                            fontSize: "17px",
                          },
                          {
                            width: "68px",
                            height: "68px",
                            background: "rgba(50, 108, 249, .8)",
                            borderRadius: "34px",
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            lineHeight: "51px",
                            fontSize: "19px",
                          },
                          {
                            width: "84px",
                            height: "84px",
                            background: "rgba(50, 108, 249, .8)",
                            borderRadius: "42px",
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            lineHeight: "51px",
                            fontSize: "19px",
                          },
                        ]}
                      >
                        {filterMapList.map((marker, index) => (
                          <MapMarker
                            key={index}
                            position={{
                              lat: marker.latitude,
                              lng: marker.longitude,
                            }}
                            options={{ title: marker.title }}
                            onClick={() => handleMarkerClick(marker)}
                          />
                        ))}
                      </MarkerClusterer>
                    )}
                    {defaultDataRendered &&
                      zoomLevel <= 6 &&
                      subwayDefaultList.map(
                        (marker, index) =>
                          marker.latitude &&
                          marker.longitude && (
                            <React.Fragment key={index}>
                              <MapMarker
                                position={{
                                  lat: marker.latitude,
                                  lng: marker.longitude,
                                }}
                                image={{
                                  src: subway,
                                  size: {
                                    width: 40,
                                    height: 40,
                                  },
                                }}
                                onClick={() => moveToMarker(marker)}
                              />
                              <CustomOverlayMap // 커스텀 오버레이를 표시할 Container
                                // 커스텀 오버레이가 표시될 위치입니다
                                position={{
                                  lat: marker.latitude,
                                  lng: marker.longitude,
                                }}
                              >
                                {/* 커스텀 오버레이에 표시할 내용입니다 */}
                                <div
                                  className="label"
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    padding: "2px 6px 1px 6px",
                                    fontSize: "11px",
                                  }}
                                >
                                  <span className="left"></span>
                                  <span className="center">{marker.name}</span>
                                  <span className="right"></span>
                                </div>
                              </CustomOverlayMap>
                            </React.Fragment>
                          )
                      )}
                    {defaultDataRendered &&
                      zoomLevel <= 6 &&
                      schoolDefaultList.map(
                        (marker, index) =>
                          marker.latitude &&
                          marker.longitude && (
                            <React.Fragment key={index}>
                              <MapMarker
                                position={{
                                  lat: marker.latitude,
                                  lng: marker.longitude,
                                }}
                                image={{
                                  src: school,
                                  size: {
                                    width: 40,
                                    height: 40,
                                  },
                                }}
                                onClick={() => moveToMarker(marker)}
                              />
                              <CustomOverlayMap // 커스텀 오버레이를 표시할 Container
                                // 커스텀 오버레이가 표시될 위치입니다
                                position={{
                                  lat: marker.latitude,
                                  lng: marker.longitude,
                                }}
                              >
                                {/* 커스텀 오버레이에 표시할 내용입니다 */}
                                <div
                                  className="label"
                                  style={{
                                    color: "white",
                                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                                    padding: "2px 6px 1px 6px",
                                    fontSize: "11px",
                                  }}
                                >
                                  <span className="left"></span>
                                  <span className="center">{marker.name}</span>
                                  <span className="right"></span>
                                </div>
                              </CustomOverlayMap>
                            </React.Fragment>
                          )
                      )}
                  </Map>
                )}
              </div>
              {/* 검색창 */}
              <div className={style.home_body_map_search}>
                <div className={style.search_box}>
                  {/* 검색 텍스트 입력 */}
                  <input
                    type="text"
                    placeholder="지역, 지하철역, 학교 검색"
                    value={searchValue}
                    onChange={handleInputChange}
                  ></input>

                  {/* 검색창 리스트 X 아이콘 위치 설정 (display:none) */}
                  <button>X</button>

                  {/* 아이콘 */}
                  <div className={style.search_icon}>
                    <img
                      style={{ maxHeight: "17px" }}
                      src={search}
                      alt="exam icon"
                    />
                  </div>
                </div>

                {/* 검색 옵션 선택 */}
                <div className={style.search_option}>
                  <div onClick={() => handleOptionClick("전월세")}>
                    전 ･ 월세
                  </div>
                  <div onClick={() => handleOptionClick("구조 ･ 면적")}>
                    구조 ･ 면적
                  </div>
                  <div onClick={() => handleOptionClick("옵션")}>옵션</div>
                  {/* <div>ㅇ</div> */}
                </div>
              </div>

              {/* 검색창 옵션 박스 위치 설정 (display:none / 이게 block 처리 되어야 밑에 box_1,2,3 이 나타남 )*/}
              <div
                className={`${style.search_option_box}`}
                style={{ display: selectedOption ? "block" : "none" }}
              >
                {/* 전월세 선택시 */}
                {selectedOption === "전월세" && (
                  <div
                    className={`${style.option_box_1}`}
                    style={{ display: "block" }}
                  >
                    {/* 내용 */}
                    <div>
                      <span>거래유형</span>
                      <div className={style.deal_type}>
                        <div
                          className={
                            selectedDealType === "전체"
                              ? style.deal_type_on
                              : ""
                          }
                          onClick={() => handleDealTypeClick("전체")}
                        >
                          전체
                        </div>
                        <div
                          className={
                            selectedDealType === "전세"
                              ? style.deal_type_on
                              : ""
                          }
                          onClick={() => handleDealTypeClick("전세")}
                        >
                          전세
                        </div>
                        <div
                          className={
                            selectedDealType === "월세"
                              ? style.deal_type_on
                              : ""
                          }
                          style={{ margin: "0px" }}
                          onClick={() => handleDealTypeClick("월세")}
                        >
                          월세
                        </div>
                      </div>
                    </div>

                    {/* 월세 조건 선택했을 시 표출하는 단기임대 토글버튼 (display : none) */}
                    <div
                      style={{
                        marginTop: "30px",
                        position: "relative",
                        display: selectedDealType === "월세" ? "block" : "none",
                      }}
                    >
                      <span>단기 임대만 보기</span>
                      <div
                        className={`slider-toggle ${
                          isChecked2 ? "checked" : ""
                        }`}
                      >
                        <label className="switch" htmlFor="activeSwitch">
                          <input
                            type="checkbox"
                            id="activeSwitch"
                            checked={isChecked2}
                            onChange={handleToggle2}
                          />
                          <span className="slider"></span>
                        </label>
                        {/* <p>{isChecked ? 'The switch is ON' : 'The switch is OFF'}</p> */}
                      </div>
                    </div>

                    {/* 보증금 범위 슬라이더 */}
                    <div style={{ marginTop: "30px", display: "block" }}>
                      <div className={style.silderTop}>
                        <span>
                          {selectedDealType === "전세" ? "전세금" : "보증금"}
                        </span>
                        <span className="value_box">
                          {afterRange.start === 0 && afterRange.end === 0
                            ? "전체"
                            : afterRange.start === 0
                            ? `${formatDragCost(afterRange.end)}까지`
                            : afterRange.end === 0
                            ? `${formatDragCost(afterRange.start)}부터`
                            : `${formatDragCost(
                                afterRange.start
                              )}부터 ~ ${formatDragCost(afterRange.end)}까지`}
                        </span>
                      </div>

                      <div className={style.option_range}>
                        <div className="range-slider" ref={sliderRef}>
                          <div className="range-bar-base-line"></div>

                          <div
                            className="range-bar"
                            style={{
                              left: range.left + "%",
                              width: range.right - range.left + "%",
                            }}
                          ></div>
                          <div
                            className="range-handle left"
                            style={{ left: range.left + "%" }}
                            onMouseDown={handleMouseDownLeft}
                          ></div>
                          <div
                            className="range-handle right"
                            style={{ left: range.right + "%" }}
                            onMouseDown={handleMouseDownRight}
                          ></div>
                        </div>

                        <div className="range_info_bar">
                          <div
                            style={{ borderLeft: "1px solid #b3b3b3" }}
                          ></div>
                          <div
                            style={{
                              borderLeft: "1px solid #b3b3b3",
                              borderRight: "1px solid #b3b3b3",
                            }}
                          ></div>
                          <div
                            style={{ borderRight: "1px solid #b3b3b3" }}
                          ></div>
                        </div>
                        <div className="range_info">
                          <div>최소</div>
                          <div style={{ marginLeft: "72px" }}>5천만</div>
                          <div style={{ marginLeft: "70px" }}>2.5억</div>
                          <div style={{ marginLeft: "70px" }}>최대</div>
                        </div>
                      </div>
                    </div>

                    {/* 월세 범위 슬라이더 */}
                    <div
                      style={{
                        marginTop: "0px",
                        display: selectedDealType !== "전세" ? "block" : "none",
                      }}
                    >
                      <div className={style.silderTop}>
                        <span>월세</span>
                        <span className="value_box">
                          {afterRangeValues.start === 0 &&
                          afterRangeValues.end === 0
                            ? "전체"
                            : afterRangeValues.start === 0
                            ? `${formatDragCost(afterRangeValues.end)}까지`
                            : afterRangeValues.end === 0
                            ? `${formatDragCost(afterRangeValues.start)}부터`
                            : `${formatDragCost(
                                afterRangeValues.start
                              )}부터 ~ ${formatDragCost(
                                afterRangeValues.end
                              )}까지`}
                        </span>
                      </div>

                      <div className={style.option_range}>
                        <div
                          className="custom-range-slider"
                          ref={sliderRef_month}
                        >
                          <div className="range-bar-base-line"></div>

                          <div
                            className="range-bar"
                            style={{
                              left: rangeValues.start + "%",
                              width: rangeValues.end - rangeValues.start + "%",
                            }}
                          >
                            {/* 바로가기 */}
                          </div>
                          <div
                            className="range-handle start"
                            style={{ left: rangeValues.start + "%" }}
                            onMouseDown={handleMouseDownStart}
                          ></div>
                          <div
                            className="range-handle end"
                            style={{ left: rangeValues.end + "%" }}
                            onMouseDown={handleMouseDownEnd}
                          ></div>
                        </div>

                        <div className="range_info_bar">
                          <div
                            style={{ borderLeft: "1px solid #b3b3b3" }}
                          ></div>
                          <div
                            style={{
                              borderLeft: "1px solid #b3b3b3",
                              borderRight: "1px solid #b3b3b3",
                            }}
                          ></div>
                          <div
                            style={{ borderRight: "1px solid #b3b3b3" }}
                          ></div>
                        </div>
                        <div className="range_info">
                          <div>최소</div>
                          <div style={{ marginLeft: "75px" }}>35만</div>
                          <div style={{ marginLeft: "73px" }}>150만</div>
                          <div style={{ marginLeft: "65px" }}>최대</div>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: "10px",
                        position: "relative",
                        display:
                          selectedDealType === "전체" ||
                          selectedDealType === "월세"
                            ? "block"
                            : "none",
                      }}
                    >
                      <span>관리비 포함하여 찾기</span>
                      <div
                        style={{
                          opacity:
                            afterRangeValues.start != 0 ||
                            afterRangeValues.end != 0
                              ? 1
                              : 0.2,
                          pointerEvents:
                            afterRangeValues.start != 0 ||
                            afterRangeValues.end != 0
                              ? "auto"
                              : "none",
                        }}
                        className={`slider-toggle ${
                          isChecked ? "checked" : ""
                        }`}
                      >
                        <label className="switch" htmlFor="toggleSwitch">
                          <input
                            type="checkbox"
                            id="toggleSwitch"
                            checked={isChecked}
                            onChange={handleToggle}
                          />
                          <span className="slider"></span>
                        </label>
                        {/* <p>{isChecked ? 'The switch is ON' : 'The switch is OFF'}</p> */}
                      </div>
                    </div>
                  </div>
                )}

                {/* 구조면적 선택시 */}
                {selectedOption === "구조 ･ 면적" && (
                  <div
                    className={`${style.option_box_2}`}
                    style={{ display: "block" }}
                  >
                    {/* 구조 */}
                    <div>
                      <span>구조</span>
                      <div className={style.structure_box}>
                        <div
                          className={style.structure_select}
                          style={{
                            borderWidth:
                              selectedStructure === "전체" ? "1.4px" : "1px",
                            borderColor:
                              selectedStructure === "전체"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedStructure === "전체" ? "bold" : "normal",
                          }}
                          onClick={() => handleStructureSelect("전체")}
                        >
                          <div>
                            <img
                              style={{ maxHeight: "24px", marginBottom: "12px" }}
                              src={all_str}
                            />
                          </div>
                          <div>전체</div>
                        </div>

                        <div
                          className={style.structure_select}
                          style={{
                            borderWidth:
                              selectedStructure === "오픈형" ? "1.4px" : "1px",
                            borderColor:
                              selectedStructure === "오픈형"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedStructure === "오픈형"
                                ? "bold"
                                : "normal",
                          }}
                          onClick={() => handleStructureSelect("오픈형")}
                        >
                          <div>
                            <img style={{ maxHeight: "24px", marginBottom: "12px" }} src={open_str} />
                          </div>
                          <div>오픈형(방1)</div>
                        </div>

                        <div
                          className={style.structure_select}
                          style={{
                            borderWidth:
                              selectedStructure === "분리형" ? "1.4px" : "1px",
                            borderColor:
                              selectedStructure === "분리형"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedStructure === "분리형"
                                ? "bold"
                                : "normal",
                          }}
                          onClick={() => handleStructureSelect("분리형")}
                        >
                          <div>
                            <img
                              style={{ maxHeight: "24px", marginBottom: "12px" }}
                              src={separation_str}
                            />
                          </div>
                          <div>분리형(방1,거실1)</div>
                        </div>

                        <div
                          className={style.structure_select}
                          style={{
                            borderWidth:
                              selectedStructure === "복층형" ? "1.4px" : "1px",
                            borderColor:
                              selectedStructure === "복층형"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedStructure === "분리형"
                                ? "bold"
                                : "normal",
                          }}
                          onClick={() => handleStructureSelect("복층형")}
                        >
                          <div>
                            <img
                              style={{ maxHeight: "24px", marginBottom: "12px" }}
                              src={duplex_str}
                            />
                          </div>
                          <div>복층형</div>
                        </div>
                      </div>
                    </div>

                    {/* 층 수 옵션 */}
                    <div style={{ marginTop: "30px" }}>
                      <span>층 수 옵션</span>
                      <div className={style.floor_box}>
                        <div
                          style={{
                            borderWidth:
                              selectedFloor === "전체" ? "1.4px" : "1px",
                            borderColor:
                              selectedFloor === "전체"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedFloor === "전체" ? "bold" : "normal",
                          }}
                          onClick={() => handleFloorSelect("전체")}
                        >
                          전체
                        </div>

                        <div
                          style={{
                            borderWidth:
                              selectedFloor === "지상층" ? "1.4px" : "1px",
                            borderColor:
                              selectedFloor === "지상층"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedFloor === "지상층" ? "bold" : "normal",
                          }}
                          onClick={() => handleFloorSelect("지상층")}
                        >
                          지상층
                        </div>

                        <div
                          style={{
                            borderWidth:
                              selectedFloor === "반지하" ? "1.4px" : "1px",
                            borderColor:
                              selectedFloor === "반지하"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedFloor === "반지하" ? "bold" : "normal",
                          }}
                          onClick={() => handleFloorSelect("반지하")}
                        >
                          반지하
                        </div>

                        <div
                          style={{
                            borderWidth:
                              selectedFloor === "옥탑" ? "1.4px" : "1px",
                            borderColor:
                              selectedFloor === "옥탑"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedFloor === "옥탑" ? "bold" : "normal",
                          }}
                          onClick={() => handleFloorSelect("옥탑")}
                        >
                          옥탑
                        </div>
                      </div>
                    </div>

                    {/* 전용 면적 */}
                    <div style={{ marginTop: "30px" }}>
                      <span>전용 면적</span>
                      <div className={style.area_box}>
                        <div
                          style={{
                            borderTopLeftRadius: "4px",
                            borderWidth:
                              selectedArea === "전체" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "전체"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "전체" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "전체"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "전체"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("전체")}
                        >
                          전체
                        </div>

                        <div
                          style={{
                            borderWidth:
                              selectedArea === "10평 이하" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "10평 이하"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "10평 이하" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "10평 이하"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "10평 이하"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("10평 이하")}
                        >
                          10평 이하
                        </div>

                        <div
                          style={{
                            borderWidth:
                              selectedArea === "10평대" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "10평대"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "10평대" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "10평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "10평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("10평대")}
                        >
                          10평대
                        </div>

                        <div
                          style={{
                            borderRight: "none",
                            borderTopRightRadius: "4px",
                            borderWidth:
                              selectedArea === "20평대" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "20평대"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "20평대" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "20평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "20평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderRight:
                              selectedArea === "20평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("20평대")}
                        >
                          20평대
                        </div>

                        <div
                          style={{
                            borderBottom: "none",
                            borderBottomLeftRadius: "4px",
                            borderWidth:
                              selectedArea === "30평대" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "30평대"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "30평대" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "30평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "30평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderRight:
                              selectedArea === "30평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderBottom:
                              selectedArea === "30평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("30평대")}
                        >
                          30평대
                        </div>

                        <div
                          style={{
                            borderBottom: "none",
                            borderWidth:
                              selectedArea === "40평대" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "40평대"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "40평대" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "40평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "40평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderRight:
                              selectedArea === "40평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderBottom:
                              selectedArea === "40평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("40평대")}
                        >
                          40평대
                        </div>

                        <div
                          style={{
                            borderBottom: "none",
                            borderWidth:
                              selectedArea === "50평대" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "50평대"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "50평대" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "50평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "50평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderRight:
                              selectedArea === "50평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderBottom:
                              selectedArea === "50평대"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("50평대")}
                        >
                          50평대
                        </div>

                        <div
                          style={{
                            borderRight: "none",
                            borderBottom: "none",
                            borderBottomRightRadius: "4px",
                            borderWidth:
                              selectedArea === "60평 이상" ? "1.4px" : "1px",
                            borderColor:
                              selectedArea === "60평 이상"
                                ? "black"
                                : "rgb(230, 230, 230)",
                            fontWeight:
                              selectedArea === "60평 이상" ? "bold" : "normal",
                            borderLeft:
                              selectedArea === "60평 이상"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderTop:
                              selectedArea === "60평 이상"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderRight:
                              selectedArea === "60평 이상"
                                ? "1.4px solid black"
                                : "none", // 추가
                            borderBottom:
                              selectedArea === "60평 이상"
                                ? "1.4px solid black"
                                : "none", // 추가
                          }}
                          onClick={() => handleAreaSelect("60평 이상")}
                        >
                          60평 이상
                        </div>
                      </div>
                    </div>

                    {/* 주차 가능 */}
                    <div style={{ marginTop: "30px", position: "relative" }}>
                      <span>주차 가능만 보기</span>
                      <div
                        className={`slider-toggle ${
                          isToggled ? "checked" : ""
                        }`}
                      >
                        <label className="switch" htmlFor="toggleSwitch_car">
                          <input
                            type="checkbox"
                            id="toggleSwitch_car"
                            checked={isToggled}
                            onChange={handleCheckboxChange}
                          />
                          <span className="slider"></span>
                        </label>
                        {/* <p>{isChecked ? 'The switch is ON' : 'The switch is OFF'}</p> */}
                      </div>
                    </div>
                  </div>
                )}

                {/* 옵션 선택시 */}
                {selectedOption === "옵션" && (
                  <div
                    className={`${style.option_box_3}`}
                    style={{ display: "block" }}
                  >
                    <div>
                      <span>매물 옵션</span>
                      <div className={style.item_box}>
                        <div
                          className={`${style.structure_select} ${
                            selectedOptions.includes("에어컨")
                              ? style.selected
                              : ""
                          }`}
                          onClick={() => handleOptionSelect("에어컨")}
                          style={{
                            borderWidth: selectedOptions.includes("에어컨")
                              ? "1.4px"
                              : "1px",
                            borderColor: selectedOptions.includes("에어컨")
                              ? "black"
                              : "rgb(230, 230, 230)",
                            fontWeight: selectedOptions.includes("에어컨")
                              ? "bold"
                              : "normal",
                          }}
                        >
                          에어컨
                        </div>

                        <div
                          className={`${style.structure_select} ${
                            selectedOptions.includes("냉장고")
                              ? style.selected
                              : ""
                          }`}
                          onClick={() => handleOptionSelect("냉장고")}
                          style={{
                            borderWidth: selectedOptions.includes("냉장고")
                              ? "1.4px"
                              : "1px",
                            borderColor: selectedOptions.includes("냉장고")
                              ? "black"
                              : "rgb(230, 230, 230)",
                            fontWeight: selectedOptions.includes("냉장고")
                              ? "bold"
                              : "normal",
                          }}
                        >
                          냉장고
                        </div>

                        <div
                          className={`${style.structure_select} ${
                            selectedOptions.includes("세탁기")
                              ? style.selected
                              : ""
                          }`}
                          onClick={() => handleOptionSelect("세탁기")}
                          style={{
                            borderWidth: selectedOptions.includes("세탁기")
                              ? "1.4px"
                              : "1px",
                            borderColor: selectedOptions.includes("세탁기")
                              ? "black"
                              : "rgb(230, 230, 230)",
                            fontWeight: selectedOptions.includes("세탁기")
                              ? "bold"
                              : "normal",
                          }}
                        >
                          세탁기
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 초기화, 확인 버튼 부분*/}
                <div className={style.option_btn_box}>
                  {mapRendered && (
                    <div
                      className={style.option_reset}
                      onClick={setFilterReset}
                    >
                      초기화
                    </div>
                  )}
                  <div
                    className={style.option_check}
                    onClick={() => setSelectedOption(null)}
                  >
                    확인
                  </div>
                </div>
              </div>

              {/* 검색창 리스트 박스 위치 설정 (display:none) */}
              <div className={style.search_list_box} ref={searchListBoxRef}>
                {/* 검색창 리스트 세부박스 아래와 같이 세팅할것 */}
              </div>
            </div>
            {/* 여기 */}
            <div className={style.home_body_side}>
              <Routes>
                <Route
                  path="list/*"
                  element={
                    <List filterMapList={filterMapList} listReady={listReady} />
                  }
                />
                <Route path="info/*" element={<Info />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OneRoom;
