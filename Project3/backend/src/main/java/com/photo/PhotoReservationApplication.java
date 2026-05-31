package com.photo;

import com.photo.entity.PhotoDelivery;
import com.photo.entity.PhotoOrder;
import com.photo.entity.PhotoPackage;
import com.photo.entity.Reservation;
import com.photo.service.PhotoDeliveryService;
import com.photo.service.PhotoOrderService;
import com.photo.service.PhotoPackageService;
import com.photo.service.ReservationService;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@SpringBootApplication
@MapperScan("com.photo.mapper")
public class PhotoReservationApplication implements WebMvcConfigurer, ApplicationRunner {

    @Autowired
    private PhotoPackageService packageService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private PhotoOrderService orderService;

    @Autowired
    private PhotoDeliveryService deliveryService;

    public static void main(String[] args) {
        SpringApplication.run(PhotoReservationApplication.class, args);
    }

    @Override
    public void run(ApplicationArguments args) {
        System.out.println("========================================");
        System.out.println("Starting data initialization...");
        System.out.println("========================================");

        if (packageService.count() == 0) {
            System.out.println("Initializing photo packages...");
            initPackages();
            System.out.println("Photo packages initialized successfully!");
        } else {
            System.out.println("Photo packages already exist, skipping initialization.");
        }

        if (reservationService.count() == 0) {
            System.out.println("Initializing reservations...");
            initReservations();
            System.out.println("Reservations initialized successfully!");
        } else {
            System.out.println("Reservations already exist, skipping initialization.");
        }

        if (orderService.count() == 0) {
            System.out.println("Initializing orders...");
            initOrders();
            System.out.println("Orders initialized successfully!");
        } else {
            System.out.println("Orders already exist, skipping initialization.");
        }

        if (deliveryService.count() == 0) {
            System.out.println("Initializing deliveries...");
            initDeliveries();
            System.out.println("Deliveries initialized successfully!");
        } else {
            System.out.println("Deliveries already exist, skipping initialization.");
        }

        System.out.println("========================================");
        System.out.println("Data initialization completed!");
        System.out.println("========================================");
    }

    private void initPackages() {
        String[][] packages = {
            {"宝宝百天照套餐", "专业儿童摄影师全程一对一服务，提供百天宝宝专属摄影棚，记录宝宝最萌瞬间。包含多组造型和场景切换。", "999.00", "120", "室内影棚", "3套服装", "20张精修", "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800", "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800,https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", "1"},
            {"周岁成长纪念套餐", "记录宝宝周岁的美好时刻，包含生日主题场景，提供亲子合影环节，赠送精美相册一本。", "1599.00", "180", "室内+外景", "5套服装", "40张精修", "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800", "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800,https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800", "2"},
            {"亲子全家福套餐", "温馨家庭合影，包含爸妈和宝宝的多组合影，提供亲子装搭配建议，适合节假日家庭纪念。", "2299.00", "240", "室内+外景", "4组造型", "50张精修", "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800", "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800,https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800", "3"},
            {"户外自然写真套餐", "户外公园或景区拍摄，利用自然光拍摄更自然的儿童写真，适合春夏季拍摄。", "1899.00", "200", "户外公园", "4套服装", "35张精修", "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800", "https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800,https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800", "4"},
            {"新生儿上门拍套餐", "专业摄影师上门服务，提供新生儿专用道具和服装，在家中舒适环境下拍摄宝宝最初的模样。", "1299.00", "150", "上门服务", "4套造型", "25张精修", "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800", "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800,https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800", "5"},
            {"生日派对跟拍套餐", "宝宝生日派对全程跟拍，记录派对精彩瞬间，包含布置、吹蜡烛、切蛋糕等环节。", "899.00", "180", "客户指定", "不限", "60张精修", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800", "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", "6"}
        };

        for (String[] p : packages) {
            PhotoPackage pkg = new PhotoPackage();
            pkg.setName(p[0]);
            pkg.setDescription(p[1]);
            pkg.setPrice(new BigDecimal(p[2]));
            pkg.setDuration(Integer.parseInt(p[3]));
            pkg.setScene(p[4]);
            pkg.setClothingCount(p[5]);
            pkg.setPhotoCount(p[6]);
            pkg.setCoverImage(p[7]);
            pkg.setImages(p[8]);
            pkg.setSort(Integer.parseInt(p[9]));
            packageService.addPackage(pkg);
        }
    }

    private void initReservations() {
        Object[][] reservations = {
            {1L, "宝宝百天照套餐", "张小明", "13800138001", LocalDate.now().plusDays(3), LocalTime.of(10, 0), "北京市朝阳区建国路88号摄影棚", "宝宝有点怕生，希望摄影师耐心一点", 1},
            {2L, "周岁成长纪念套餐", "李朵朵", "13800138002", LocalDate.now().plusDays(5), LocalTime.of(14, 0), "北京市海淀区中关村大街1号", "需要准备生日蛋糕道具", 0},
            {3L, "亲子全家福套餐", "王梓轩", "13800138003", LocalDate.now().plusDays(7), LocalTime.of(9, 30), "北京市西城区金融街18号", "一家四口，爸妈和两个孩子", 1}
        };

        for (Object[] r : reservations) {
            Reservation res = new Reservation();
            res.setPackageId((Long) r[0]);
            res.setPackageName((String) r[1]);
            res.setCustomerName((String) r[2]);
            res.setPhone((String) r[3]);
            res.setAppointmentDate((LocalDate) r[4]);
            res.setAppointmentTime((LocalTime) r[5]);
            res.setAddress((String) r[6]);
            res.setRemark((String) r[7]);
            res.setStatus((Integer) r[8]);
            reservationService.createReservation(res);
        }
    }

    private void initOrders() {
        Object[][] orders = {
            {"ORD202401010001", 1L, 1L, "宝宝百天照套餐", "张小明", "13800138001", "999.00", 1, 2, LocalDateTime.now().minusDays(2), "已完成拍摄，正在后期处理"},
            {"ORD202401010002", 2L, 2L, "周岁成长纪念套餐", "李朵朵", "13800138002", "1599.00", 0, 0, null, "等待支付"}
        };

        for (Object[] o : orders) {
            PhotoOrder order = new PhotoOrder();
            order.setOrderNo((String) o[0]);
            order.setReservationId((Long) o[1]);
            order.setPackageId((Long) o[2]);
            order.setPackageName((String) o[3]);
            order.setCustomerName((String) o[4]);
            order.setPhone((String) o[5]);
            order.setAmount(new BigDecimal((String) o[6]));
            order.setPayStatus((Integer) o[7]);
            order.setOrderStatus((Integer) o[8]);
            order.setPayTime((LocalDateTime) o[9]);
            order.setRemark((String) o[10]);
            order.setCreateTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            orderService.save(order);
        }
    }

    private void initDeliveries() {
        PhotoDelivery delivery = new PhotoDelivery();
        delivery.setOrderId(1L);
        delivery.setOrderNo("ORD202401010001");
        delivery.setCustomerName("张小明");
        delivery.setPhone("13800138001");
        delivery.setPhotos("https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800,https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800,https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800");
        delivery.setDeliveryStatus(1);
        delivery.setDeliveryTime(LocalDateTime.now());
        delivery.setRemark("成片已交付，请查收");
        delivery.setCreateTime(LocalDateTime.now());
        delivery.setUpdateTime(LocalDateTime.now());
        deliveryService.save(delivery);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
