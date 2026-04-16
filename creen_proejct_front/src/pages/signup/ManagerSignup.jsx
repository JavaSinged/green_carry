import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import Swal from "sweetalert2";
import useEcoEffects from "../../hooks/useEcoEffects";
import styles from "./UserSignup.module.css";

const ManagerSignup = () => {
  // ?뙚 leafData(?섎춪???④낵) 異붽?
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
    memberPhone: "",
    memberEmail: "",
    //storeName: "",
    //storeOwnerNo: "",
    //openingDate: "",
  });
  const [store, setStore] = useState({
    storeName: "",
    memberId: "",
    storeOwner: "",
  });
  const [memberPwRe, setMemberPwRe] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkId, setCheckId] = useState(0);
  const [mailAuth, setMailAuth] = useState(0);
  //const [checkStoreOwnerNo, setCheckStoreOwnerNo] = useState(0);
  const [mailAuthCode, setMailAuthCode] = useState(null);
  const [mailAuthInput, setMailAuthInput] = useState("");
  const [time, setTime] = useState(180);
  const [timeout, setTimeout] = useState(null);
  const [checkEmail, setCheckEmail] = useState(0);

  const idRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const pwRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const inputMember = (e) => {
    const { name, value } = e.target;

    // 1. ?대???踰덊샇 ?먮룞 ?섏씠??
    if (name === "memberPhone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedPhone = "";
      if (onlyNums.length < 4) formattedPhone = onlyNums;
      else if (onlyNums.length < 8)
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedPhone = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;

      setMember({ ...member, memberPhone: formattedPhone });
      return;
    }

    // 2. ?곗씠??遺꾨같 濡쒖쭅
    if (name === "memberId") {
      // memberId???묒そ ???낅뜲?댄듃
      setMember((prev) => ({ ...prev, memberId: value }));
      setStore((prev) => ({ ...prev, memberId: value }));
      setCheckId(0);
    } else if (name === "memberName") {
      // memberName???ㅼ뼱?ㅻ㈃ member?먮뒗 ?깅챸?쇰줈, store?먮뒗 ??쒖옄紐낆쑝濡????
      setMember((prev) => ({ ...prev, memberName: value }));
      setStore((prev) => ({ ...prev, storeOwner: value }));
    } else if (name === "storeName") {
      // ?곹샇紐낆? store ?곹깭?먮쭔 ???
      setStore((prev) => ({ ...prev, storeName: value }));
    } else {
      // ?섎㉧吏(PW, Email ????member ?곹깭?먮쭔 ???
      setMember((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "memberEmail") setMailAuth(0);

    // 2. ?ъ뾽??踰덊샇 ?먮룞 ?섏씠??
    /*
    if (name === "storeOwnerNo") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      let formattedStoreNo = "";
      if (onlyNums.length < 4) formattedStoreNo = onlyNums;
      else if (onlyNums.length < 6)
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
      else
        formattedStoreNo = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 5)}-${onlyNums.slice(5, 10)}`;
      setMember({ ...member, [name]: formattedStoreNo });
      setCheckStoreOwnerNo(0);
      return;
    }
    */
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
    if (timeout) window.clearInterval(timeout);
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
        setTimeout(intervalId);
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
      window.clearInterval(timeout);
      setTimeout(null);
    } else {
      Swal.fire({
        icon: "error",
        text: "?몄쬆踰덊샇媛 ?쇱튂?섏? ?딆뒿?덈떎. ?ㅼ떆 ?뺤씤?댁＜?몄슂.",
      });
    }
  };

  useEffect(() => {
    if (time === 0) {
      window.clearInterval(timeout);
      setMailAuthCode(null);
      setTimeout(null);
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
  /*
  const handleStoreOwnerNoCheck = () => {
    if (member.storeOwnerNo.length < 12) {
      Swal.fire({
        icon: "warning",
        text: "?ъ뾽?먮쾲??10?먮━瑜?紐⑤몢 ?낅젰?댁＜?몄슂.",
      });
      return;
    }
    storeDupCheck();
  };

  const storeDupCheck = () => {
    axios
      .get(
        `${import.meta.env.VITE_BACKSERVER}/member/storeDupCheck?storeOwnerNo=${member.storeOwnerNo}`,
      )
      .then((res) => {
        if (res.data === null || res.data === "") {
          Swal.fire({ icon: "success", text: "媛??媛?ν븳 ?ъ뾽?먮쾲?몄엯?덈떎!" });
          setCheckStoreOwnerNo(2);
        } else {
          Swal.fire({ icon: "error", text: "以묐났???ъ뾽??踰덊샇 ?낅땲??" });
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "?ъ뾽??踰덊샇 以묐났 ?뺤씤 以??쒕쾭 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.",
        });
      });
  };
*/

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
  /*
  const getStoreOwnerNoMessage = () => {
    if (!member.storeOwnerNo.trim())
      return {
        text: isSubmitted ? "?ъ뾽?먮쾲?몃? ?낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    if (member.storeOwnerNo.length < 12)
      return { text: "?ъ뾽?먮쾲??10?먮━瑜?紐⑤몢 ?낅젰?댁＜?몄슂.", isError: true };
    if (checkStoreOwnerNo !== 2)
      return { text: "?ъ뾽?먮쾲??以묐났 ?뺤씤???뚮윭二쇱꽭??", isError: true };
    return { text: "媛??媛?ν븳 ?ъ뾽??踰덊샇?낅땲??", isError: false };
  };
  */
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
  const getStoreNameMessage = () => {
    if (!store.storeName.trim())
      return {
        text: isSubmitted ? "?곹샇紐낆쓣 ?낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  const getMemberNameMessage = () => {
    if (!member.memberName.trim())
      return {
        text: isSubmitted ? "??쒖옄?깅챸???낅젰?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  /*
  const getOpeningDateMessage = () => {
    if (!member.openingDate.trim())
      return {
        text: isSubmitted ? "媛쒖뾽?쇱옄瑜??좏깮?섏꽭??" : "\u00A0",
        isError: isSubmitted,
      };
    return { text: "\u00A0", isError: false };
  };
  */
  const idStatus = getIdMessage();
  const pwStatus = getPwMessage();
  const pwReStatus = getPwReMessage();
  const emailStatus = getEmailMessage();
  const storeNameStatus = getStoreNameMessage();
  const memberNameStatus = getMemberNameMessage();
  const phoneStatus = getPhoneMessage();
  /*
  const openingDateStatus = getOpeningDateMessage();
  const storeOwnerNoStatus = getStoreOwnerNoMessage();
  */
  const joinSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    const hasEmpty =
      !member.memberId ||
      !member.memberPw ||
      !memberPwRe ||
      !member.memberEmail ||
      !member.memberPhone.trim() ||
      !store.storeName.trim() ||
      !member.memberName.trim();
    //!member.storeOwnerNo.trim() ||
    //!member.openingDate.trim();
    if (
      hasEmpty ||
      idStatus.isError ||
      pwStatus.isError ||
      pwReStatus.isError ||
      emailStatus.isError ||
      phoneStatus.isError ||
      storeNameStatus.isError ||
      memberNameStatus.isError
      //storeOwnerNoStatus.isError ||
      //openingDateStatus.isError
    ) {
      Swal.fire({
        icon: "warning",
        text: "?낅젰?섏떊 ?뺣낫瑜??ㅼ떆 ?뺤씤?댁＜?몄슂.",
      });
      return;
    }
    const submitData = {
      ...member,
      ...store,
      memberGrade: 2,
    };
    axios
      .post(
        `${import.meta.env.VITE_BACKSERVER}/member/signupManager`,
        submitData,
      )
      .then((res) => {
        Swal.fire({
          icon: "success",
          text: "?ъ뾽???뚯썝媛?낆씠 ?꾨즺?섏뿀?듬땲??",
        }).then(() => {
          navigate("/login");
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          text: "?뚯썝媛??泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.",
        });
      });
  };

  /*
  const [showCalendar, setShowCalendar] = useState(false);
  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setMember({ ...member, openingDate: `${year}-${month}-${day}` });
    setShowCalendar(false);
  };
*/
  return (
    <div
      className={styles.signupScreenContainer}
      ref={containerRef}
      style={{ backgroundImage: `url(${selectedBg})` }}
    >
      {/* ?뛽 留덉슦???섎춪???④낵 */}
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

      {/* ?ェ ?먯퐫 踰꾨툝 */}
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

        {/* ?뙚 ?곸꽭?쇱씠誘濡??ㅽ겕濡?吏??移대뱶 ?곸슜 */}
        <div className={`${styles.signupCard} ${styles.signupCardScroll}`}>
          <h2 className={styles.signupTitle}>사업자 회원가입</h2>

          <form className={styles.signupForm} onSubmit={joinSubmit}>
            {/* ?꾩씠??*/}
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

            {/* 鍮꾨?踰덊샇 */}
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

            {/* 鍮꾨?踰덊샇 ?뺤씤 */}
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

            {/* ?대찓??*/}
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

            {/* ?대???踰덊샇 */}
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

            {/* 
            ?ъ뾽??踰덊샇 
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>?ъ뾽??踰덊샇</label>
              <div className={styles.signupInputArea}>
                <div className={styles.signupInputInner}>
                  <input
                    type="text"
                    name="storeOwnerNo"
                    value={member.storeOwnerNo}
                    onChange={inputMember}
                    className={styles.signupInputUnderline}
                    placeholder="?レ옄留??낅젰?섏꽭??
                    readOnly={checkStoreOwnerNo === 2}
                  />
                  <button
                    type="button"
                    className={styles.signupBtnOutlined}
                    onClick={handleStoreOwnerNoCheck}
                    disabled={checkStoreOwnerNo === 2}
                  >
                    以묐났 ?뺤씤
                  </button>
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${storeOwnerNoStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {storeOwnerNoStatus.text}
                </p>
              </div>
            </div>
            */}

            {/* ?곹샇紐?*/}
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>상호명</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="storeName"
                  value={store.storeName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="상호명을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${storeNameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {storeNameStatus.text}
                </p>
              </div>
            </div>

            {/* ??쒖옄?깅챸 */}
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>??쒖옄?깅챸</label>
              <div className={styles.signupInputArea}>
                <input
                  type="text"
                  name="memberName"
                  value={member.memberName}
                  onChange={inputMember}
                  className={styles.signupInputUnderline}
                  placeholder="대표자명을 입력해주세요."
                />
                <p
                  className={`${styles.signupStatusMsg} ${memberNameStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {memberNameStatus.text}
                </p>
              </div>
            </div>

            {/*
             ?뙚 媛쒖뾽?쇱옄 (?щ젰???쇱쓣 源⑥? ?딅룄濡?position ?ㅼ젙) 
            <div className={styles.signupFieldGroup}>
              <label className={styles.signupLabel}>媛쒖뾽?쇱옄</label>
              <div className={styles.signupInputArea}>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <input
                    type="text"
                    name="openingDate"
                    value={member.openingDate}
                    className={styles.signupInputUnderline}
                    placeholder="YYYY-MM-DD"
                    readOnly
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{ cursor: "pointer", paddingRight: "35px" }}
                  />
                  <CalendarMonthIcon
                    onClick={() => setShowCalendar(!showCalendar)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      cursor: "pointer",
                      color: "var(--color-brand)",
                    }}
                  />

                  
                  {showCalendar && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: "0",
                        zIndex: 50,
                        marginTop: "5px",
                        borderRadius: "15px",
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Calendar
                        onChange={handleDateChange}
                        calendarType="gregory"
                        value={
                          member.openingDate
                            ? new Date(member.openingDate)
                            : new Date()
                        }
                        formatDay={(locale, date) =>
                          date.toLocaleString("en", { day: "numeric" })
                        }
                      />
                    </div>
                  )}
                </div>
                <p
                  className={`${styles.signupStatusMsg} ${openingDateStatus.isError ? styles.signupErrorMsg : ""}`}
                >
                  {openingDateStatus.text}
                </p>
              </div>
            </div>
            */}

            {/* 媛??踰꾪듉 */}
            <button type="submit" className={styles.signupBtn}>
              사업자 회원가입
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerSignup;

