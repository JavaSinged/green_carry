package kr.co.iei.store.model.vo;

import lombok.Data;
import org.apache.ibatis.type.Alias;
import java.util.List;

@Data
@Alias("menuSaveRequest")
public class MenuSaveRequest {
    private Long storeId;
    private Long menuId;
    private String menuName;
    private String menuInfo;
    private String menuImage;
    private Integer menuPrice;
    private String menuCategory;
    private double menuCarbon;
    private Integer menuStatus;

    // 추가 설정 데이터들
    private List<Long> optionIds;
    private List<MenuOption> newOptions;
    private List<ContainerItem> containerMap;

    @Data
    public static class ContainerItem {
        private Long productId;
        private int count;
    }
}