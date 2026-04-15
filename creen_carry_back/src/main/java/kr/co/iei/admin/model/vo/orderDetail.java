package kr.co.iei.admin.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class orderDetail {
    private String menuName;   // 메뉴 이름
    private String menuImage;  // 메뉴 이미지 경로
    private int quantity;      // 수량
    private int price;         // 단가 (또는 합계용)
    private String options;    // 옵션 정보
}