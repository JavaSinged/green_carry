import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDaumPostcodePopup } from "react-daum-postcode";
import axios from "axios";
import Swal from "sweetalert2";
import useEcoEffects from "../../hooks/useEcoEffects";
import styles from "./UserSignup.module.css";

const UserSignup = () => {
  const {
    containerRef,
    bubblesRef,
    selectedBg,
    bubbleData,
    leafData,
    fireflyData,
  } = useEcoEffects();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    memberId: "",
    memberPw: "",
    memberName: "",
    memberEmail: "",
    memberPhone: "",
    memberAddrcode: "",
    memberAddr: "",
    memberDetailAddr: "",
    latitude: 0,
    longitude: 0,
  });

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const [checkId, setCheckId] = useState(0);
  const [checkEmail, setCheckEmail] = useState(0);
  const [memberPwRe, setMemberPwRe] = useState("");
  const [mailAuth, setMailAuth] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const [time, setTime] = useState(180);
  const [timeoutId, setTimeoutId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inputMember = (e) => {
    const { name, value } = e.target;
    if (name === "memberPhone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedPhone = "";
      if (onlyNums.length < 4) formattedPhone = onlyNums;
      else if (onlyNums.length < 8)
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
      setMember({ ...member, [name]: formattedPhone });
      return;
    }
    setMember({ ...member, [name]: value });
    if (name === "memberId") setCheckId(0);
    if (name === "memberEmail") {
      setMailAuth(0);
      setCheckEmail(0);
    }
  };

  const handleIdCheck = () => {
    if (!idRegex.test(member.memberId)) {
      Swal.fire({ icon: "warning", text: "?꾩씠???뺤떇??癒쇱? 留욎떠二쇱꽭??" });
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/member/exists?memberId=${member.memberId}`,
      )
      .then((res) => {
        if (res.data) {
          Swal.fire({ icon: "success", text: "?ъ슜 媛?ν븳 ?꾩씠?붿엯?덈떎." });
          setCheckId(2);
        } else {
          Swal.fire({ icon: "error", text: "?대? ?ъ슜以묒씤 ?꾩씠?붿엯?덈떎!" });
          setCheckId(1);
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "?쒕쾭? ?듭떊 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.",
        });
      });
  };

  const handleSendMail = async () => {
    if (!emailRegex.test(member.memberEmail)) {
      Swal.fire({
        icon: "warning",
        text: "?щ컮瑜??대찓???뺤떇??癒쇱? ?낅젰?댁＜?몄슂.",
      });
      return;
    }
    if (checkEmail === 0) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKSERVER}/member/emailDupCheck?memberEmail=${member.memberEmail}`,
        );
        if (res.data) setCheckEmail(2);
        else {
          Swal.fire({ icon: "error", text: "?대? ?ъ슜以묒씤 ?대찓?쇱엯?덈떎." });
          setCheckEmail(1);
          return;
        }
      } catch (err) {
        return;
      }
    }
    setTime(180);
    if (timeoutId) window.clearInterval(timeoutId);
    setMailAuth(1);
    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/email-verification`, {
        memberEmail: member.memberEmail,
      })
      .then((res) => {
        setMailAuthCode(res.data);
        setMailAuth(2);
        const intervalId = window.setInterval(() => {
          setTime((prev) => prev - 1);
        }, 1000);
        setTimeoutId(intervalId);
      })
      .catch((err) => {
        Swal.fire({ icon: "error", text: "硫붿씪 諛쒖넚 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎." });
      });
  };

  const handleVerifyMail = () => {
    if (mailAuth !== 2) {
      Swal.fire({
        icon: "warning",
        text: "癒쇱? ?몄쬆 ?대찓???꾩넚 踰꾪듉???뚮윭二쇱꽭??",
      });
      return;
    }
    if (String(mailAuthCode) === mailAuthInput) {
      Swal.fire({ icon: "success", text: "?대찓???몄쬆???꾨즺?섏뿀?듬땲??" });
      setMailAuth(3);
      window.clearInterval(timeoutId);
      setTimeoutId(null);
    } else {
      Swal.fire({
        icon: "error",
        text: "?몄쬆踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎. ?ㅼ떆 ?뺤씤?댁＜?몄슂.",
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeoutId);
      setMailAuthCode(null);
      setTimeoutId(null);
      Swal.fire({
        icon: "error",
        text: "?몄쬆 ?쒓컙??留뚮즺?섏뿀?듬땲?? ?ㅼ떆 ?쒕룄?댁＜?몄슂.",
      });
      setMailAuth(0);
    }
  }, [time]);

  const showTime = () => {
    const min = Math.floor(time / 60);
    const sec = String(time % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  const openPostcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
  );

  const handleCompletePostcode = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "")
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    // ?ㅼ씠踰?Geocoding API濡??꾧꼍??蹂??
    if (window.naver && naver.maps.Service) {
      naver.maps.Service.geocode({ query: fullAddress }, (status, response) => {
        if (status === naver.maps.Service.Status.OK) {
          const result = response.v2.addresses[0];
          setMember((prev) => ({
            ...prev,
            memberAddrcode: data.zonecode,
            memberAddr: fullAddress,
            latitude: parseFloat(result.y),
            longitude: parseFloat(result.x),
          }));
        } else {
          console.error("醫뚰몴 蹂???ㅽ뙣");
          setMember((prev) => ({
            ...prev,
            memberAddrcode: data.zonecode,
            memberAddr: fullAddress,
          }));
        }
      });
    } else {
      setMember((prev) => ({
        ...prev,
        memberAddrcode: data.zonecode,
        memberAddr: fullAddress,
      }));
    }
  };

  const handleSearchAddress = () => {
    openPostcode({ onComplete: handleCompletePostcode });
  };

  const getIdMessage = () => {
    if (!member.memberId)
      return {
        text: isSubmitted ? "?꾩씠?붾? ?낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (!idRegex.test(member.memberId))
      return { text: "?곷Ц, ?レ옄 議고빀 8???댁긽 ?낅젰?댁＜?몄슂.", isError: true };
    if (checkId !== 2)
      return { text: "以묐났 ?뺤씤 踰꾪듉???뚮윭二쇱꽭??", isError: true };
    return { text: "?ъ슜 媛?ν븳 ?꾩씠?붿엯?덈떎.", isError: false };
  };

  const getPwMessage = () => {
    if (!member.memberPw)
      return {
        text: isSubmitted ? "鍮꾨?踰덊샇瑜??낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (!pwRegex.test(member.memberPw))
      return {
        text: "?곷Ц ?/?뚮Ц?? ?レ옄, ?뱀닔湲고샇 ?ы븿 10???댁긽 ?낅젰?댁＜?몄슂.",
        isError: true,
      };
    return { text: "?ъ슜 媛?ν븳 鍮꾨?踰덊샇?낅땲??", isError: false };
  };

  const getPwReMessage = () => {
    if (!memberPwRe)
      return {
        text: isSubmitted ? "鍮꾨?踰덊샇 ?뺤씤???낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPw !== memberPwRe)
      return { text: "鍮꾨?踰덊샇? ?쇱튂?섏? ?딆뒿?덈떎.", isError: true };
    return { text: "鍮꾨?踰덊샇? ?쇱튂?⑸땲??", isError: false };
  };

  const getEmailMessage = () => {
    if (!member.memberEmail)
      return {
        text: isSubmitted ? "?대찓?쇱쓣 ?낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (!emailRegex.test(member.memberEmail))
      return { text: "?щ컮瑜??대찓???뺤떇???낅젰?댁＜?몄슂.", isError: true };
    if (mailAuth === 0)
      return { text: "?몄쬆 ?대찓?쇱쓣 ?꾩넚?댁＜?몄슂.", isError: true };
    if (mailAuth === 2)
      return {
        text: `?몄쬆踰덊샇瑜??낅젰?섏꽭?? (?⑥? ?쒓컙: ${showTime()})`,
        isError: true,
      };
    if (mailAuth === 3)
      return { text: "?대찓???몄쬆???꾨즺?섏뿀?듬땲??", isError: false };
    return { text: "\u00A0", isError: false };
  };

  const getNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "?대쫫???낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const getPhoneMessage = () => {
    if (!member.memberPhone.trim())
      return {
        text: isSubmitted ? "?대???踰덊샇瑜??낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (member.memberPhone.length < 13)
      return { text: "?곕씫泥?11?먮━瑜?紐⑤몢 ?낅젰?댁＜?몄슂.", isError: true };
    return { text: "\u00A0", isError: false };
  };

  const getAddrMessage = () => {
    if (!member.memberAddrcode || !member.memberDetailAddr.trim())
      return {
        text: isSubmitted ? "二쇱냼 諛??곸꽭 二쇱냼瑜?紐⑤몢 ?낅젰?댁＜?몄슂." : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };

  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const nameStatus = getNameMessage();
  const addrStatus = getAddrMessage();
  const phoneStatus = getPhoneMessage();

  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberName.trim() ||
      !member.memberPhone.trim() ||
      !member.memberAddrcode ||
      !member.memberDetailAddr.trim();

    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      nameStatus.isError ||
      phoneStatus.isError ||
      addrStatus.isError
    ) {
      Swal.fire({
        icon: "warning",
        text: "?낅젰?섏떊 ?뺣낫瑜??ㅼ떆 ?뺤씤?댁＜?몄슂.",
      });
      return;
    }

    axios
      .post(`${import.meta.env.VITE_BACKSERVER}/member/userSignup`, member)
      .then((res) => {
        Swal.fire({
          icon: "success",
          text: "?뚯썝媛?낆씠 ?꾨즺?먯뒿?덈떎. 濡쒓렇?명럹?댁?濡??대룞?⑸땲??",
        }).then(() => {
          navigate("/login");
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className={styles.signupScreenContainer}
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {leafData &&
        leafData.map((leaf) => (
          <div
            key={leaf.id}
            className={styles.particleLeaf}
            style={{ left: leaf.x, top: leaf.y }}
          />
        ))}
      {fireflyData &&
        fireflyData.map((style, i) => (
          <div
            key={`firefly-${i}`}
            className={styles.firefly}
            style={{
              left: style.left,
              top: style.top,
              animationDuration: style.animationDuration,
              animationDelay: style.animationDelay,
            }}
          />
        ))}

      {bubbleData.map((style, i) => (
        <div
          key={i}
          className={styles.ecoBubble}
          ref={(el) => (bubblesRef.current[i] = el)}
          style={{
            left: style.left,
            top: style.top,
            width: style.size,
            height: style.size,
            animationDelay: style.delay,
          }}
        />
      ))}

      <div className={styles.signupMainContent}>
        <header>
          <h1 className={styles.signupLogo} onClick={() => navigate("/")}>
            GreenCarry
          </h1>
        </header>

        <div className={`${styles.signupCard} ${styles.signupCardScroll}`}>
          <h2 className={styles.signupTitle}>개인 회원가입</h2>

          <form className={styles.signupForm} onSubmit={joinSubmit}>
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>아이디</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    name="memberId"
                    value={member.memberId}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="?곷Ц, ?レ옄 議고빀 8???댁긽"
                    readOnly={checkId === 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleIdCheck}
                    disabled={checkId === 2}
                  >
                    以묐났 ?뺤씤
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${idStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {idStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>鍮꾨?踰덊샇</label>
              <div className={styles.signupInputArea}>
                <input
                  type="password"
                  name="memberPw"
                  value={member.memberPw}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="?곷Ц ?/?뚮Ц?? ?レ옄, ?뱀닔湲고샇 ?ы븿 10???댁긽"
                />
                <p
                  className={`${styles.signupStatusMsg} ${pwStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {pwStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>鍮꾨?踰덊샇 ?뺤씤</label>
              <div className={styles.signupInputArea}>
                <input
                  type="password"
                  name="memberPwRe"
                  value={memberPwRe}
                  onChange={(e) => setMemberPwRe(e.target.value)}
                  className={styles.signupInputUnderline}
                  placeholder="비밀번호를 다시 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${pwReStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {pwReStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>?대쫫</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberName"
                  value={member.memberName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="이름을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${nameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {nameStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>이메일</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="email"
                    name="memberEmail"
                    value={member.memberEmail}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="example@greencarry.com"
                    readOnly={mailAuth === 3}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleSendMail}
                    disabled={mailAuth === 1 || mailAuth === 3}
                  >
                    {mailAuth === 0 ? "인증 메일 발송" : "재전송"}
                  </button>
                </div>
                <div className={`${styles.signupInputInner} ${styles.signupMt10}`}>
                  <input
                    type="text"
                    className={styles.signupInputUnderline}
                    placeholder="?몄쬆踰덊샇"
                    value={mailAuthInput}
                    onChange={(e) => setMailAuthInput(e.target.value)}
                    disabled={mailAuth !== 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnFilled}
                    onClick={handleVerifyMail}
                    disabled={mailAuth !== 2}
                  >
                    ?몄쬆踰덊샇 ?뺤씤
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${emailStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {emailStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>?대???踰덊샇</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberPhone"
                  value={member.memberPhone}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="숫자만 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${phoneStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {phoneStatus.text}
                </p>
              </div>
            </div>

            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>二쇱냼</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    placeholder="?고렪踰덊샇"
                    name="memberAddrcode"
                    value={member.memberAddrcode}
                    className={styles.signupInputUnderline}
                    readOnly
                  />
                  <button
                    type="button"
                    className={styles.signupBtnFilled}
                    onClick={handleSearchAddress}
                  >
                    ?고렪踰덊샇 寃??
                  </button>
                </div>
                <div className={`${styles.signupInputInner} ${styles.signupMt10}`}>
                  <input
                    type="text"
                    placeholder="二쇱냼"
                    name="memberAddr"
                    value={member.memberAddr}
                    className={styles.signupInputUnderline}
                    readOnly
                  />
                </div>
                <div className={`${styles.signupInputInner} ${styles.signupMt10}`}>
                  <input
                    type="text"
                    placeholder="?곸꽭二쇱냼"
                    name="memberDetailAddr"
                    value={member.memberDetailAddr}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                  />
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${!member.memberAddrcode && isSubmitted ? styles.signupErrorMsg : ""}`}
                >
                  {!member.memberAddrcode && isSubmitted
                    ? "二쇱냼瑜??낅젰?댁＜?몄슂."
                    : "\u00A0"}
                </p>
              </div>
            </div>

            <button type="submit" className={styles.signupBtn}>
              가입하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;

