package com.silvercare.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.silvercare.common.Result;
import com.silvercare.entity.ServicePackage;
import com.silvercare.mapper.ServicePackageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicePackageService {

    @Autowired
    private ServicePackageMapper packageMapper;

    public Result<List<ServicePackage>> list(Integer status) {
        QueryWrapper<ServicePackage> wrapper = new QueryWrapper<>();
        if (status != null) {
            wrapper.eq("status", status);
        }
        return Result.success(packageMapper.selectList(wrapper));
    }

    public Result<ServicePackage> getById(Long id) {
        return Result.success(packageMapper.selectById(id));
    }

    public Result<ServicePackage> save(ServicePackage servicePackage) {
        servicePackage.setStatus(1);
        packageMapper.insert(servicePackage);
        return Result.success(servicePackage);
    }

    public Result<ServicePackage> update(ServicePackage servicePackage) {
        packageMapper.updateById(servicePackage);
        return Result.success(servicePackage);
    }

    public Result<Void> delete(Long id) {
        packageMapper.deleteById(id);
        return Result.success();
    }
}
