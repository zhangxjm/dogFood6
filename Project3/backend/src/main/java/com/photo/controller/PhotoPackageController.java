package com.photo.controller;

import com.photo.common.Result;
import com.photo.entity.PhotoPackage;
import com.photo.service.PhotoPackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/package")
public class PhotoPackageController {

    @Autowired
    private PhotoPackageService packageService;

    @GetMapping("/list")
    public Result<List<PhotoPackage>> list() {
        return Result.success(packageService.getPackageList());
    }

    @GetMapping("/{id}")
    public Result<PhotoPackage> detail(@PathVariable Long id) {
        return Result.success(packageService.getPackageDetail(id));
    }

    @PostMapping("/add")
    public Result<Void> add(@RequestBody PhotoPackage photoPackage) {
        boolean success = packageService.addPackage(photoPackage);
        return success ? Result.success() : Result.error("添加失败");
    }

    @PostMapping("/update")
    public Result<Void> update(@RequestBody PhotoPackage photoPackage) {
        boolean success = packageService.updatePackage(photoPackage);
        return success ? Result.success() : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        boolean success = packageService.deletePackage(id);
        return success ? Result.success() : Result.error("删除失败");
    }
}
