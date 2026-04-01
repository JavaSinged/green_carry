package kr.co.iei.cs.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.cs.model.dao.CSDao;
import kr.co.iei.cs.model.vo.Faq;

@Service
public class CSService {

	@Autowired
	private CSDao csDao;
	
	public List<Faq> selectAllList(int faqCategory) {
		List<Faq> list = csDao.selectAllList(faqCategory); 
		return list;
	}

	
}
