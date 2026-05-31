package com.bakery.config;

import com.bakery.entity.Dessert;
import com.bakery.repository.DessertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DessertRepository dessertRepository;

    @Override
    public void run(String... args) {
        if (dessertRepository.count() == 0) {
            Dessert d1 = new Dessert();
            d1.setName("经典草莓蛋糕");
            d1.setDescription("新鲜草莓搭配香浓奶油，口感绵密细腻，是生日派对的首选");
            d1.setPrice(168.0);
            d1.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20strawberry%20cake%20with%20fresh%20cream%20on%20white%20background&image_size=square_hd");
            d1.setCategory("蛋糕");
            d1.setPrepTime(120);
            d1.setCustomizable(true);
            d1.setAvailable(true);

            Dessert d2 = new Dessert();
            d2.setName("巧克力熔岩蛋糕");
            d2.setDescription("浓郁黑巧克力，外酥内软，切开流心的美味体验");
            d2.setPrice(88.0);
            d2.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20lava%20cake%20with%20melting%20center%20on%20plate&image_size=square_hd");
            d2.setCategory("蛋糕");
            d2.setPrepTime(60);
            d2.setCustomizable(true);
            d2.setAvailable(true);

            Dessert d3 = new Dessert();
            d3.setName("抹茶千层蛋糕");
            d3.setDescription("日式抹茶粉制作，层层分明，清香回甘不腻口");
            d3.setPrice(128.0);
            d3.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20matcha%20mille%20crepe%20cake%20green%20tea%20layers&image_size=square_hd");
            d3.setCategory("蛋糕");
            d3.setPrepTime(180);
            d3.setCustomizable(true);
            d3.setAvailable(true);

            Dessert d4 = new Dessert();
            d4.setName("芒果慕斯");
            d4.setDescription("新鲜芒果泥制作，入口即化的清爽口感");
            d4.setPrice(68.0);
            d4.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mango%20mousse%20dessert%20with%20fresh%20mango%20on%20top&image_size=square_hd");
            d4.setCategory("慕斯");
            d4.setPrepTime(90);
            d4.setCustomizable(true);
            d4.setAvailable(true);

            Dessert d5 = new Dessert();
            d5.setName("法式马卡龙礼盒");
            d5.setDescription("6种口味精选马卡龙，精致礼盒装，送礼佳品");
            d5.setPrice(98.0);
            d5.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=french%20macarons%20gift%20box%20assorted%20colors%20flavors&image_size=square_hd");
            d5.setCategory("西点");
            d5.setPrepTime(240);
            d5.setCustomizable(true);
            d5.setAvailable(true);

            Dessert d6 = new Dessert();
            d6.setName("提拉米苏");
            d6.setDescription("意式经典甜品，咖啡与马斯卡彭的完美融合");
            d6.setPrice(78.0);
            d6.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=italian%20tiramisu%20dessert%20with%20cocoa%20powder&image_size=square_hd");
            d6.setCategory("慕斯");
            d6.setPrepTime(150);
            d6.setCustomizable(true);
            d6.setAvailable(true);

            Dessert d7 = new Dessert();
            d7.setName("定制曲奇礼盒");
            d7.setDescription("可定制图案和口味的手工曲奇，适合各种场合");
            d7.setPrice(58.0);
            d7.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=custom%20cookies%20gift%20box%20various%20shapes%20decorated&image_size=square_hd");
            d7.setCategory("西点");
            d7.setPrepTime(90);
            d7.setCustomizable(true);
            d7.setAvailable(true);

            Dessert d8 = new Dessert();
            d8.setName("芝士蛋糕");
            d8.setDescription("纽约风格重芝士蛋糕，浓郁奶香，口感扎实");
            d8.setPrice(118.0);
            d8.setImage("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=new%20york%20style%20cheesecake%20with%20berry%20topping&image_size=square_hd");
            d8.setCategory("蛋糕");
            d8.setPrepTime(180);
            d8.setCustomizable(true);
            d8.setAvailable(true);

            dessertRepository.saveAll(Arrays.asList(d1, d2, d3, d4, d5, d6, d7, d8));
        }
    }
}
