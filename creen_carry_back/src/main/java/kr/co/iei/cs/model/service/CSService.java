package kr.co.iei.cs.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.co.iei.cs.model.dao.CSDao;
import kr.co.iei.cs.model.vo.Faq;
import kr.co.iei.cs.model.vo.Qna;

@Service
public class CSService {

	@Autowired
	private CSDao csDao;
	
	public List<Faq> selectAllList(Faq faq) {
		List<Faq> list = csDao.selectAllList(faq); 
		return list;
	}

	public List<Qna> selectMyInquiry(String memberId) {
		List<Qna> list = csDao.selectMyInquiry(memberId);
		return list;
	}

	public int insertQna(Qna qna) {
		int result = csDao.insertQna(qna);
		return result;
	}

	public int deleteInquiry(Integer qnaNo) {
		int result = csDao.deleteInquiry(qnaNo);
		return result;
	}

	public int putInquiry(Qna qna) {
		int result = csDao.putInquiry(qna);
		return result;
	}


	
}
