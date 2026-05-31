package com.ipr.service;

import com.ipr.entity.CopyrightWork;
import com.ipr.repository.CopyrightWorkRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CopyrightWorkService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CopyrightWorkService.class);

    private final CopyrightWorkRepository copyrightWorkRepository;

    public CopyrightWorkService(CopyrightWorkRepository copyrightWorkRepository) {
        this.copyrightWorkRepository = copyrightWorkRepository;
    }

    public List<CopyrightWork> getAllWorks() {
        return copyrightWorkRepository.findAll();
    }

    public CopyrightWork getWorkById(Long id) {
        return copyrightWorkRepository.findById(id).orElse(null);
    }

    public List<CopyrightWork> getWorksByStatus(CopyrightWork.WorkStatus status) {
        return copyrightWorkRepository.findByStatus(status);
    }

    public CopyrightWork addWork(CopyrightWork work) {
        work.setStatus(CopyrightWork.WorkStatus.ACTIVE);
        CopyrightWork saved = copyrightWorkRepository.save(work);
        log.info("Copyright work added: {}", saved.getWorkName());
        return saved;
    }

    public CopyrightWork updateWork(Long id, CopyrightWork work) {
        CopyrightWork existing = copyrightWorkRepository.findById(id).orElse(null);
        if (existing != null) {
            existing.setWorkName(work.getWorkName());
            existing.setWorkType(work.getWorkType());
            existing.setOwner(work.getOwner());
            existing.setRegistrationNumber(work.getRegistrationNumber());
            existing.setRegistrationDate(work.getRegistrationDate());
            existing.setDescription(work.getDescription());
            existing.setKeywords(work.getKeywords());
            existing.setImageUrls(work.getImageUrls());
            existing.setStatus(work.getStatus());
            return copyrightWorkRepository.save(existing);
        }
        return null;
    }

    public CopyrightWork updateWorkStatus(Long id, CopyrightWork.WorkStatus status) {
        CopyrightWork work = copyrightWorkRepository.findById(id).orElse(null);
        if (work != null) {
            work.setStatus(status);
            return copyrightWorkRepository.save(work);
        }
        return null;
    }

    public void deleteWork(Long id) {
        copyrightWorkRepository.deleteById(id);
    }
}
