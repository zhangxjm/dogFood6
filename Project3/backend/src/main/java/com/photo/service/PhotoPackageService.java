package com.photo.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.photo.entity.PhotoPackage;
import com.photo.mapper.PhotoPackageMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PhotoPackageService extends ServiceImpl<PhotoPackageMapper, PhotoPackage> {

    public List<PhotoPackage> getPackageList() {
        return this.list(new LambdaQueryWrapper<PhotoPackage>()
                .eq(PhotoPackage::getStatus, 1)
                .orderByAsc(PhotoPackage::getSort));
    }

    public PhotoPackage getPackageDetail(Long id) {
        return this.getById(id);
    }

    public boolean addPackage(PhotoPackage photoPackage) {
        photoPackage.setCreateTime(LocalDateTime.now());
        photoPackage.setUpdateTime(LocalDateTime.now());
        photoPackage.setStatus(1);
        return this.save(photoPackage);
    }

    public boolean updatePackage(PhotoPackage photoPackage) {
        photoPackage.setUpdateTime(LocalDateTime.now());
        return this.updateById(photoPackage);
    }

    public boolean deletePackage(Long id) {
        return this.removeById(id);
    }
}
