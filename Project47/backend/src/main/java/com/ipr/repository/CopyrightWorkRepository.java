package com.ipr.repository;

import com.ipr.entity.CopyrightWork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CopyrightWorkRepository extends JpaRepository<CopyrightWork, Long> {
    List<CopyrightWork> findByStatus(CopyrightWork.WorkStatus status);
    
    List<CopyrightWork> findByWorkType(String workType);
    
    List<CopyrightWork> findByOwner(String owner);
}
