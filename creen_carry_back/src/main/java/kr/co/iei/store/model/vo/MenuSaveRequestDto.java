package kr.co.iei.store.model.vo;

import java.util.List;

import lombok.Data;

@Data
public class MenuSaveRequestDto {
    private String menuName;
    private String menuInfo;
    private String menuImage;
    private Integer menuPrice;    
    private String menuCategory;
    private Long storeId;
    private Long menuId;
    private List<Long> optionIds;         
    private List<MenuOption> newOptions;   
}
