import styles from "./Header.module.css";

// tree
import ParkIcon from "@mui/icons-material/Park";

// noti
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

// info
import PersonIcon from "@mui/icons-material/Person";

// logout
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className={styles.header}>
      <div
        className={styles.logo_wrap}
        onClick={() => {
          navigate("/");
        }}
      >
        <img src="/image/logo.png" alt="GreenCarry Logo" />
        <h5 className={styles.logo_text}>GreenCarry</h5>
      </div>
      <div className={styles.center_wrap}>
        <ParkIcon />
        <h5>
          지금까지 함께 심은 나무, 총 <span className={styles.badge}>41</span>{" "}
          그루
        </h5>
      </div>
      <div className={styles.button_wrap}>
        <NotificationsNoneIcon />
        <Link to="/mypage">
          <PersonIcon />
        </Link>
        <Link to="/Login">
          <LogoutIcon />
        </Link>
      </div>
    </header>
  );
}
