package kr.co.iei.store.model.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.ibatis.type.Alias;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Alias("store")
public class Store {
    private Integer storeId;
    private String memberId;
    private String storeName;
    private String storeAddress;
    private String storePhone;
    private String storeIntro;
    private String storeOwner;
    private String storeOwnerAddress;
    private String storeOriginInfo;
    private String storeOwnerNo;
    private String storeCategory;
    private Double storeRating;
    private Double LATITUDE;
    private Double LONGITUDE;
    private String storeThumb;
}
