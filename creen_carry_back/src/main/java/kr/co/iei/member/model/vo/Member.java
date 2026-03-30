package kr.co.iei.member.model.vo;

import java.sql.Date;

import org.apache.ibatis.type.Alias;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Alias(value="member")
public class Member {
 private String memberId;
 private String memberPw;
 private String memberName;
 private String memberPhone;
 private String memberThumb;
 private String memberEmail;
 private String memberAddrCode;
 private String memberAddr;
 private String memberDetailAddr;
 private Integer memberGrade;
 private Integer memberPoint;
 private String enrollDate;
 private Integer storeOwnerNo;
 private String storeName;
 private String openingDate;
 private Integer memberStatus;
 
}
