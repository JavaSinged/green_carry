package kr.co.iei.cs.model.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.co.iei.cs.model.vo.Faq;

@Mapper
public interface CSDao {

	List<Faq> selectAllList(int faqCategory);

}
