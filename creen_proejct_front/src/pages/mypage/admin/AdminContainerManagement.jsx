import { useEffect, useRef, useState } from "react";
import styles from "./AdminContainerManagement.module.css";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../../utils/accessToken";
import Swal from "sweetalert2";

const AdminContainerManagement = () => {
  //용기
  const location = useLocation();
  const passedData = location.state?.carbonData;
  const backHost = import.meta.env.VITE_BACKSERVER;

  const [productName, setProductName] = useState(
    passedData?.productMaterial || "",
  );
  const [kgValue, setKgValue] = useState(passedData?.productEmissions || "");
  const [description, setDescription] = useState(passedData?.productDesc || "");

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);

  const [previewImg, setPreviewImg] = useState(
    passedData?.productImg
      ? `${passedData.productImg.startsWith("/") ? "" : "/"}${passedData.productImg}`
      : "",
  );

  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const finalValue = kgValue.toString().replace("g", "");
  const { productId } = useParams();

  // 버튼 누를 때 작동
  const onUploadBtnClick = () => {
    fileInput.current.click();
  };

  // 바이트 단위 변환기
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 파일 첨부 취소
  const onRemoveFile = (e) => {
    e.stopPropagation();

    if (previewImg) {
      URL.revokeObjectURL(previewImg);
    }

    setFileName("");
    setFileSize(0);
    setUploadFile(null);
    setPreviewImg("");
    if (fileInput.current) fileInput.current.value = "";
  };

  // 공통 파일 저장 로직
  const handleSaveFile = (file) => {
    if (file) {
      setFileName(file.name);
      setFileSize(file.size);
      setUploadFile(file);

      const imageUrl = URL.createObjectURL(file);
      setPreviewImg(imageUrl);
    }
  };

  const MAX_LENGTH = 240;

  const handleDescriptionChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length <= MAX_LENGTH) {
      setDescription(inputText);
    }
  };
  const handleFileChange = (e) => handleSaveFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleSaveFile(e.dataTransfer.files[0]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    setIsDragging(false);
  };
  const handleCo2Change = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (value.split(".").length > 2) return;
    setKgValue(value);
  };
  const handleSaveSubmit = async () => {
    if (!productName)
      return Swal.fire("알림", "용기 이름을 입력해주세요.", "warning");
    if (!kgValue)
      return Swal.fire("알림", "용기 탄소 배출량을 입력해주세요.", "warning");
    const formData = new FormData();
    if (productId) {
      formData.append("productId", productId);
    }
    formData.append("productName", productName);
    formData.append("productEmissions", kgValue);
    formData.append("productDesc", description);

    if (uploadFile) formData.append("uploadFile", uploadFile);

    try {
      const response = await api.post("/admin/container/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 && response.data === "SUCCESS") {
        Swal.fire("성공!", "용기 정보가 저장되었습니다.", "success").then(
          () => {
            navigate("/mypage/admin/containers");
            setProductName("");
            setKgValue("");
            setDescription("");
            setFileName("");
            setFileSize(0);
            setUploadFile(null);
          },
        );
      } else {
        Swal.fire("실패", "등록에 실패했습니다.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("에러", "서버 통신 오류", "error");
    }
  };

  return (
    <div>
      <div className={styles.main}>
        <span>용기 등록/수정</span>
      </div>
      <div
        className={`${styles.upload_box} ${isDragging ? styles.dragging : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          style={{ display: "none" }}
        />

        {fileName ? (
          <div className={styles.attached_container}>
            {previewImg && (
              <img
                src={previewImg}
                alt="미리보기"
                className={styles.preview_img}
              />
            )}
            <div className={styles.attached_left}>
              <CheckIcon className={styles.check_icon} />
              <div className={styles.attached_text}>
                <span className={styles.attached_name}>첨부 완료</span>
                <span className={styles.attached_size}>
                  {fileName} | {formatBytes(fileSize)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={styles.close_btn}
              onClick={onRemoveFile}
            >
              <CloseIcon />
            </button>
          </div>
        ) : (
          <div className={styles.upload_content}>
            <img
              src="/image/recycling.png"
              alt="업로드 아이콘"
              className={styles.upload_icon}
            />
            <p className={styles.upload_title}>
              용기 사진을 업로드하거나 드래그해서 넣으세요.
            </p>
            <p className={styles.upload_sub}>PNG, JPG, GIF (최대 5MB)</p>
            <button
              type="button"
              className={styles.upload_btn}
              onClick={onUploadBtnClick}
            >
              지금 찾아보기
            </button>
          </div>
        )}
      </div>
      <section className={styles.input_two}>
        <div className={styles.item_name_input}>
          <p>용기 이름</p>
          <input
            type="text"
            placeholder="ex) 사각 용기(소)"
            className={styles.item_name}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>
        <div className={styles.co2_value_input}>
          <p>용기 탄소 배출량 (kg)</p>
          <div className={styles.input_wrapper}>
            <input
              type="text"
              placeholder="0"
              className={styles.co2_value}
              value={kgValue}
              onChange={handleCo2Change}
            />
            {kgValue && <span className={styles.unit}>kg</span>}
          </div>
        </div>
      </section>
      <section className={styles.desc_section}>
        <div className={styles.item_content}>
          <p>용기 설명 (필요 시)</p>
          <div className={styles.textarea_wrapper}>
            <textarea
              className={styles.item_content_input}
              placeholder="용기의 설명을 작성해주세요."
              value={description}
              onChange={handleDescriptionChange}
            />
            <span className={styles.char_count}>
              {description.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>
      </section>
      <div className={styles.btn}>
        <button
          type="button"
          className={styles.cancel_btn}
          onClick={() => navigate(-1)}
        >
          취소
        </button>
        <button
          type="button"
          className={styles.save_btn}
          onClick={handleSaveSubmit}
        >
          저장
        </button>
      </div>
    </div>
  );
};

export default AdminContainerManagement;
